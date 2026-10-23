"""SQLite transactions keep workflow changes and their audit records atomic."""
import json
import sqlite3
from contextlib import contextmanager
from domain import initial_state


class Store:
    def __init__(self, path):
        self.path = str(path)
        with self.connection() as db:
            db.execute("CREATE TABLE IF NOT EXISTS workspaces (mode TEXT PRIMARY KEY, body TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, mode TEXT NOT NULL, body TEXT NOT NULL)")
            for mode in ["live", "demo"]:
                db.execute("INSERT OR IGNORE INTO workspaces VALUES (?, ?)",
                           (mode, json.dumps(initial_state(mode == "demo"))))

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
            return json.loads(db.execute("SELECT body FROM workspaces WHERE mode=?", (mode,)).fetchone()[0])

    @contextmanager
    def edit(self, mode):
        with self.connection() as db:
            db.execute("BEGIN IMMEDIATE")
            state = json.loads(db.execute("SELECT body FROM workspaces WHERE mode=?", (mode,)).fetchone()[0])
            yield state
            db.execute("UPDATE workspaces SET body=? WHERE mode=?", (json.dumps(state), mode))

    def conversations(self, mode):
        with self.connection() as db:
            return [json.loads(row[0]) for row in db.execute("SELECT body FROM conversations WHERE mode=? ORDER BY rowid DESC", (mode,))]

    def save_conversation(self, conversation):
        with self.connection() as db:
            db.execute("INSERT INTO conversations VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
                       (conversation["id"], conversation["mode"], json.dumps(conversation)))
