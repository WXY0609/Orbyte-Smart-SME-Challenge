"""SQLite transactions keep workflow changes and their audit records atomic."""
import json
import sqlite3
from contextlib import contextmanager
from domain import initial_state, now


class Store:
    def __init__(self, path):
        self.path = str(path)
        self.namespace = ""
        with self.connection() as db:
            db.execute("CREATE TABLE IF NOT EXISTS workspaces (mode TEXT PRIMARY KEY, body TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, mode TEXT NOT NULL, body TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS ai_usage (day TEXT NOT NULL, client TEXT NOT NULL, used INTEGER NOT NULL, PRIMARY KEY(day, client))")
            for mode in ["live", "demo"]:
                db.execute("INSERT OR IGNORE INTO workspaces VALUES (?, ?)",
                           (mode, json.dumps(initial_state(mode == "demo"))))

    def for_visitor(self, visitor):
        scoped = object.__new__(Store)
        scoped.path, scoped.namespace = self.path, visitor
        return scoped

    def mode_key(self, mode):
        return f"{self.namespace}:{mode}" if self.namespace else mode

    def ensure_workspace(self, db, mode):
        key = self.mode_key(mode)
        db.execute("INSERT OR IGNORE INTO workspaces VALUES (?, ?)",
                   (key, json.dumps(initial_state(mode == "demo"))))
        return key

    @contextmanager
    def connection(self):
        db = sqlite3.connect(self.path, timeout=15)
        db.row_factory = sqlite3.Row
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def read(self, mode):
        with self.connection() as db:
            key = self.ensure_workspace(db, mode)
            return json.loads(db.execute("SELECT body FROM workspaces WHERE mode=?", (key,)).fetchone()[0])

    @contextmanager
    def edit(self, mode):
        with self.connection() as db:
            db.execute("BEGIN IMMEDIATE")
            key = self.ensure_workspace(db, mode)
            state = json.loads(db.execute("SELECT body FROM workspaces WHERE mode=?", (key,)).fetchone()[0])
            yield state
            db.execute("UPDATE workspaces SET body=? WHERE mode=?", (json.dumps(state), key))

    def conversations(self, mode):
        with self.connection() as db:
            return [json.loads(row[0]) for row in db.execute("SELECT body FROM conversations WHERE mode=? ORDER BY rowid DESC", (self.mode_key(mode),))]

    def save_conversation(self, conversation):
        with self.connection() as db:
            db.execute("INSERT INTO conversations VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
                       (conversation["id"], self.mode_key(conversation["mode"]), json.dumps(conversation)))

    def find_question(self, token):
        with self.connection() as db:
            row = db.execute("""SELECT w.mode, w.body FROM workspaces w, json_each(w.body, '$.questions') q
                WHERE json_extract(q.value, '$.token') = ? LIMIT 1""", (token,)).fetchone()
        if not row:
            return None
        key, state = row[0], json.loads(row[1])
        if ":" in key:
            namespace, mode = key.rsplit(":", 1)
            owner_store = self.for_visitor(namespace)
        else:
            owner_store, mode = self, key
        question = next(q for q in state["questions"] if q["token"] == token)
        return owner_store, mode, state, question

    def reserve_ai_turn(self, client, per_client, global_limit):
        day = now().date().isoformat()
        with self.connection() as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM ai_usage WHERE day < ?", (day,))
            usage = dict(db.execute("SELECT client, used FROM ai_usage WHERE day=?", (day,)))
            if usage.get("global", 0) >= global_limit:
                return "The shared demo has reached today's AI limit. Please try after midnight Malaysia time."
            if usage.get(client, 0) >= per_client:
                return "Your network has reached today's demo AI limit. Please try after midnight Malaysia time."
            for key in [client, "global"]:
                db.execute("INSERT INTO ai_usage VALUES (?, ?, 1) ON CONFLICT(day, client) DO UPDATE SET used=used+1", (day, key))
        return None
