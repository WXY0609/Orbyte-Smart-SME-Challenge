import os
from copy import deepcopy
from datetime import datetime, timedelta
from pathlib import Path
from threading import Lock
from urllib.parse import urlencode
from flask import Flask, jsonify, request
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).with_name(".env"))
except ImportError:
    pass

import copilot
from domain import (TZ, audit, changed, evaluate, initial_state, new_action,
                    new_question, now, stamp, tomorrow, uid, weather_current)
from network import json_request
from storage import Store
import validation as v


def create_app(database=None):
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 64000
    store = Store(database or os.getenv("ORBYTE_DATABASE") or Path(__file__).with_name("orbyte.sqlite3"))
    app.config["STORE"] = store
    chat_lock = Lock()

    def mode():
        return v.choice(request.headers.get("X-Workspace", "live"), ["live", "demo"], "workspace")

    def body():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            raise ValueError("Send a JSON object.")
        return data

    def find(rows, id_):
        row = next((r for r in rows if r["id"] == id_), None)
        if not row:
            raise LookupError("Record not found.")
        return row

    def snapshot(selected):
        state = store.read(selected)
        state["checks"] = evaluate(state)
        state["weather"]["stale"] = not weather_current(state)
        state["tomorrow"] = tomorrow()
        state["copilot_configured"] = bool(os.getenv("OPENROUTER_API_KEY", "").strip())
        return state

    @app.errorhandler(ValueError)
    @app.errorhandler(KeyError)
    @app.errorhandler(TypeError)
    def bad_input(error):
        return jsonify(error=str(error)), 400

    @app.errorhandler(LookupError)
    def missing(error):
        return jsonify(error=str(error)), 404

    @app.errorhandler(ConnectionError)
    def unavailable(error):
        return jsonify(error=str(error)), 503

    @app.get("/api/state")
    def get_state():
        return jsonify(snapshot(mode()))

    @app.route("/api/greeting", methods=["GET", "POST"])
    def greeting():
        data = request.get_json(silent=True) or {}
        return jsonify(status="success", greeting=f"Hello, {data.get('name', 'Guest')}! Welcome to Orbyte.")

    @app.put("/api/business")
    def save_business():
        data, selected = body(), mode()
        business, target = v.business(data["business"]), v.target(data["target"])
        if target["date"] != tomorrow():
            raise ValueError("Choose tomorrow in Asia/Kuala_Lumpur as the service date.")
        with store.edit(selected) as state:
            if state["business"]["rear_access"] != business["rear_access"] or state["target"] != target:
                state["verifications"] = []
            state["business"], state["target"] = business, target
            state["profile_confirmed"] = True
            changed(state, "Business profile or service window updated by owner.")
        return jsonify(snapshot(selected))

    def reset(selected):
        with store.edit(selected) as state:
            state.clear()
            state.update(initial_state(True))
        with store.connection() as db:
            db.execute("DELETE FROM conversations WHERE mode=?", (selected,))

    @app.post("/api/demo/reset")
    def reset_demo():
        if mode() != "demo":
            raise ValueError("Reset is available only in the demo workspace.")
        reset("demo")
        return jsonify(snapshot("demo"))

    @app.post("/api/events")
    def add_event():
        data, selected = v.event(body()), mode()
        if selected == "live" and data["source_type"] == "demo":
            raise ValueError("Use the Demo workspace for simulated events.")
        with store.edit(selected) as state:
            data.update(id=uid("evt"), updated_at=stamp())
            state["events"].append(data)
            changed(state, f"Event added: {data['title']}")
        return jsonify(snapshot(selected)), 201

    @app.delete("/api/events/<id_>")
    def delete_event(id_):
        selected = mode()
        with store.edit(selected) as state:
            event = find(state["events"], id_)
            if event["source_type"] == "forecast":
                raise ValueError("Refresh weather to update forecast events.")
            state["events"].remove(event)
            changed(state, f"Event removed: {event['title']}")
        return jsonify(snapshot(selected))

    @app.post("/api/weather/refresh")
    def refresh_weather():
        selected = mode()
        if selected != "live":
            raise ValueError("Real weather refresh is available in Live; Demo is isolated.")
        before = store.read(selected)
        b, date = before["business"], tomorrow()
        params = urlencode({"latitude": b["latitude"], "longitude": b["longitude"],
                            "hourly": "precipitation_probability,precipitation,weather_code,temperature_2m",
                            "timezone": "Asia/Kuala_Lumpur", "start_date": date, "end_date": date})
        try:
            data = json_request("https://api.open-meteo.com/v1/forecast?" + params)
            hourly = data["hourly"]
            hours = [{"time": datetime.fromisoformat(t).replace(tzinfo=TZ).isoformat(),
                      "rain_probability": hourly["precipitation_probability"][i], "precipitation": hourly["precipitation"][i],
                      "code": hourly["weather_code"][i], "temperature": hourly["temperature_2m"][i]}
                     for i, t in enumerate(hourly["time"])]
            if len(hours) < 24 or any(h["rain_probability"] is None or h["precipitation"] is None for h in hours):
                raise ValueError("Forecast coverage is incomplete.")
            with store.edit(selected) as state:
                if [state["business"]["latitude"], state["business"]["longitude"]] != [b["latitude"], b["longitude"]]:
                    raise ValueError("Store coordinates changed. Refresh the forecast again.")
                state["weather"] = {"status": "available", "fetched_at": stamp(), "date": date,
                                    "coordinates": [b["latitude"], b["longitude"]], "hours": hours,
                                    "source": "Open-Meteo", "source_url": "https://open-meteo.com/en/docs", "error": ""}
                state["events"] = [e for e in state["events"] if e["source_type"] != "forecast"]
                for h in hours:
                    if h["rain_probability"] >= 60 or h["precipitation"] > 0:
                        state["events"].append({"id": uid("evt"), "kind": "rain", "title": "Rain forecast",
                            "affected": "outdoor", "start": h["time"],
                            "end": (datetime.fromisoformat(h["time"]) + timedelta(hours=1)).isoformat(),
                            "source_type": "forecast", "source": "Open-Meteo hourly forecast",
                            "source_url": "https://open-meteo.com/en/docs", "updated_at": stamp(),
                            "notes": f"Rain probability {h['rain_probability']}%; precipitation {h['precipitation']} mm."})
                changed(state, "Tomorrow's hourly forecast refreshed.")
        except (ConnectionError, ValueError, KeyError, IndexError, TypeError) as exc:
            with store.edit(selected) as state:
                state["weather"].update(status="unavailable", error="Weather refresh failed. Cached observations are not current.")
                changed(state, "Weather unavailable; cached forecast cannot confirm conditions.")
            return jsonify(error=str(exc), state=snapshot(selected)), 503
        return jsonify(snapshot(selected))

    @app.route("/api/checks", methods=["GET", "POST"])
    def checks():
        if request.method == "POST":
            return jsonify(copilot.call_tool(store, mode(), "check_plans", body()))
        return jsonify(evaluate(store.read(mode())))

    @app.post("/api/simulations")
    def simulation():
        return jsonify(copilot.call_tool(store, mode(), "check_plans", body()))

    @app.post("/api/questions")
    def create_question():
        selected = mode()
        with store.edit(selected) as state:
            new_question(state)
        return jsonify(snapshot(selected)), 201

    def locate_question(token):
        for selected in ["live", "demo"]:
            state = store.read(selected)
            q = next((q for q in state["questions"] if q["token"] == token), None)
            if q:
                return selected, state, q
        raise LookupError("Feedback link not found. Ask the store for a current link.")

    @app.get("/api/public/questions/<token>")
    def public_question(token):
        _, state, q = locate_question(token)
        return jsonify(id=q["id"], text=q["text"], store=state["business"]["name"], target=q["target"],
                       demo=state["workspace"] == "demo", closed=question_closed(state, q))

    def question_closed(state, question):
        return question["resolved"] or question["target"] != state["target"] or question["target"]["date"] != tomorrow()

    @app.post("/api/public/questions/<token>/responses")
    def respond(token):
        selected, _, question = locate_question(token)
        data = body()
        answer = v.choice(data["answer"], ["yes", "no", "not_sure", "skip"], "answer")
        observed = datetime.fromisoformat(data["observed_at"])
        if not observed.tzinfo or observed > now() + timedelta(minutes=5) or observed < now() - timedelta(days=7):
            raise ValueError("Observation must include a timezone and be within the last seven days.")
        with store.edit(selected) as state:
            q = find(state["questions"], question["id"])
            if question_closed(state, q):
                raise ValueError("This question is closed. Ask for a current link.")
            if len(q["observations"]) >= 100:
                raise ValueError("This question has enough responses. Please contact the store.")
            q["observations"].append({"id": uid("obs"), "answer": answer,
                                      "observed_at": observed.isoformat(), "submitted_at": stamp()})
            audit(state, "customer_observation", q["id"])
        return jsonify(message="Thank you. Your observation is an unverified lead; the store will check tomorrow's conditions."), 201

    @app.post("/api/questions/<id_>/verify")
    def verify(id_):
        data, selected = body(), mode()
        value = v.choice(data["value"], ["yes", "no", "unknown"], "verified access")
        notes = v.text(data["notes"], "How the owner checked the target service window", 1000)
        with store.edit(selected) as state:
            q = find(state["questions"], id_)
            if q["target"] != state["target"] or q["target"]["date"] != tomorrow():
                raise ValueError("Question belongs to another service window. Create a new confirmation.")
            q["resolved"] = value != "unknown"
            state["verifications"].append({"id": uid("verify"), "question_id": id_, "condition": q["condition"],
                "value": value, "target": deepcopy(state["target"]), "notes": notes,
                "owner": state["business"]["owner"], "at": stamp()})
            changed(state, f"Owner verified rear access as {value} for the saved service window.")
        return jsonify(snapshot(selected))

    @app.post("/api/actions")
    def create_action():
        data, selected = v.action(body()), mode()
        with store.edit(selected) as state:
            existing = next((a for a in state["actions"] if a["status"] == "draft" and a["target"] == state["target"]
                             and all(a[k] == val for k, val in data.items())), None)
            if not existing:
                new_action(state, data)
        return jsonify(snapshot(selected)), 201

    @app.put("/api/actions/<id_>")
    def edit_action(id_):
        data, selected = v.action(body()), mode()
        with store.edit(selected) as state:
            a = find(state["actions"], id_)
            if a["status"] not in ["draft", "needs_review"]:
                raise ValueError("Only unapproved drafts or actions needing review can be edited.")
            a.update(data)
            a["target"], a["status"] = deepcopy(state["target"]), "draft"
            a["approval"] = None
            audit(state, "action_edited", id_)
        return jsonify(snapshot(selected))

    @app.post("/api/actions/<id_>/<operation>")
    def transition(id_, operation):
        selected, data = mode(), body()
        with store.edit(selected) as state:
            a = find(state["actions"], id_)
            status = a["status"]
            if operation == "approve":
                if status == "approved":
                    pass
                elif status not in ["draft", "needs_review"]:
                    raise ValueError("Only drafts and plans needing review can be approved.")
                else:
                    if a["target"] != state["target"] or a["target"]["date"] != tomorrow():
                        raise ValueError("Action belongs to an old service window. Create a new draft.")
                    plan = next((p for p in evaluate(state)["plans"] if p["id"] == a["plan_id"]), None)
                    if a["plan_id"] == "preparation" and a["kind"] != "task":
                        raise ValueError("Preparation-only actions must be internal tasks.")
                    if plan and plan["status"] != "conditions_met":
                        raise ValueError("Resolve plan conflicts and missing conditions before approving this operational action.")
                    a["approval"] = {"by": state["business"]["owner"], "at": stamp(), "revision": state["revision"],
                        "snapshot": {k: deepcopy(a[k]) for k in ["title", "content", "recipient", "owner", "cost", "target", "plan_id"]}}
                    a.setdefault("approval_history", []).append(deepcopy(a["approval"]))
                    a["status"] = "approved"
            elif operation == "execute":
                if status in ["in_progress", "waiting_reply", "completed"]:
                    pass
                else:
                    if status != "approved" or not a["approval"]:
                        raise ValueError("Owner approval is required before execution.")
                    if a["approval"]["revision"] != state["revision"] or a["target"]["date"] != tomorrow():
                        raise ValueError("Conditions or date changed. Review and approve again.")
                    if a["plan_id"] != "preparation":
                        plan = next(p for p in evaluate(state)["plans"] if p["id"] == a["plan_id"])
                        if plan["status"] != "conditions_met":
                            raise ValueError("Current conditions no longer support execution. Refresh and review the plan.")
                    a["status"] = "in_progress" if a["kind"] == "task" else "waiting_reply"
                    a["execution_at"] = stamp()
            elif operation == "complete":
                if status != "completed":
                    if status not in ["in_progress", "waiting_reply"]:
                        raise ValueError("Only executed actions can be completed.")
                    a["reply"] = v.text(data.get("reply"), "Completion note / recorded reply", 2000)
                    a["status"], a["completed_at"] = "completed", stamp()
            else:
                raise LookupError("Unknown action operation.")
            if status != a["status"]:
                audit(state, f"action_{operation}", id_)
        return jsonify(snapshot(selected))

    @app.get("/api/copilot/conversations")
    def conversations():
        return jsonify(store.conversations(mode()))

    @app.post("/api/copilot/chat")
    def chat():
        if not chat_lock.acquire(blocking=False):
            return jsonify(error="Copilot is processing a message. Please wait."), 409
        try:
            return jsonify(copilot.chat(store, mode(), body()))
        finally:
            chat_lock.release()

    @app.cli.command("reset-demo")
    def reset_demo_command():
        reset("demo")
        print("Demo reset. Live data preserved.")

    return app
