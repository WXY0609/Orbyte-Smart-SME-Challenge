"""Deterministic business checks. No model output is trusted as a condition."""
from copy import deepcopy
from datetime import datetime, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Asia/Kuala_Lumpur")
DISCLAIMER = "Checks cover known conditions only and do not guarantee a successful outcome."


def now():
    return datetime.now(TZ)


def stamp():
    return now().isoformat(timespec="seconds")


def tomorrow():
    return (now().date() + timedelta(days=1)).isoformat()


def uid(prefix):
    return f"{prefix}_{uuid4().hex[:12]}"


def at(date, time):
    return datetime.fromisoformat(f"{date}T{time}").replace(tzinfo=TZ)


def overlaps(a, b, c, d):
    return a < d and c < b


def initial_state(demo=False):
    date = tomorrow()
    state = {
        "revision": 1, "workspace": "demo" if demo else "live", "profile_confirmed": demo,
        "target": {"date": date, "start": "14:00", "end": "17:00"},
        "business": {
            "name": "Kopi & Co. • Demo" if demo else "My Restaurant",
            "owner": "Store owner", "latitude": 3.1478, "longitude": 101.7088,
            "open_time": "10:00", "close_time": "22:00",
            "indoor_capacity": 40, "outdoor_seats": 16,
            "indoor_booked": 40 if demo else 24,
            "booking_start": "14:00", "booking_end": "17:00",
            "front_access": "yes", "rear_exists": "yes", "rear_access": "unknown",
            "delivery_enabled": "yes", "delivery_start": "12:00", "delivery_end": "20:00",
            "water": "yes", "electricity": "yes",
        },
        "events": [], "weather": {"status": "not_loaded", "fetched_at": None, "hours": []},
        "questions": [], "verifications": [], "actions": [], "audit": [],
    }
    if demo:
        for kind, title, affected in [
            ("rain", "Afternoon rain forecast", "outdoor"),
            ("road_closure", "Planned road closure at front pickup point", "front"),
        ]:
            state["events"].append({
                "id": uid("evt"), "kind": kind, "title": title, "affected": affected,
                "start": at(date, "14:00").isoformat(), "end": at(date, "17:00").isoformat(),
                "source_type": "demo", "source": "Orbyte demo scenario", "source_url": "",
                "updated_at": stamp(), "notes": "Simulated event for the presentation, not a live notice.",
            })
    return state


def active_events(state):
    t = state["target"]
    start, end = at(t["date"], t["start"]), at(t["date"], t["end"])
    return [e for e in state["events"] if (e["source_type"] != "forecast" or weather_current(state)) and overlaps(
        datetime.fromisoformat(e["start"]), datetime.fromisoformat(e["end"]), start, end)]


def weather_current(state):
    w, b = state["weather"], state["business"]
    fetched = w.get("fetched_at")
    return bool(w.get("status") == "available" and fetched
                and now() - datetime.fromisoformat(fetched) < timedelta(hours=6)
                and w.get("date") == state["target"]["date"]
                and w.get("coordinates") == [b["latitude"], b["longitude"]])


def evaluate(state, assumptions=None):
    state = deepcopy(state)
    if assumptions:
        state["business"].update(assumptions)
    b, t = state["business"], state["target"]
    start, end = at(t["date"], t["start"]), at(t["date"], t["end"])
    events = active_events(state)
    relevant_hours = [h for h in state["weather"].get("hours", [])
                      if overlaps(datetime.fromisoformat(h["time"]),
                                  datetime.fromisoformat(h["time"]) + timedelta(hours=1), start, end)]
    live_rain = weather_current(state) and any(
        h.get("rain_probability", 0) >= 60 or h.get("precipitation", 0) > 0 for h in relevant_hours)
    rain = live_rain or any(e["kind"] == "rain" for e in events)
    weather_known = (weather_current(state) and bool(relevant_hours)) or state["workspace"] == "demo"
    risk = "Rain may affect outdoor seating during this service window." if rain else (
        "No rain trigger found in the available forecast for this window." if weather_known
        else "Tomorrow's weather is unavailable or out of date. Refresh the forecast.")

    def result(id_, name, checks, evidence, missing):
        conflicts = [text for ok, text in checks if not ok]
        status = "conflict" if conflicts else "insufficient_data" if missing else "conditions_met"
        return {"id": id_, "name": name, "status": status, "reasons": conflicts,
                "evidence": evidence, "missing": missing, "revision": state["revision"],
                "hypothetical": bool(assumptions), "disclaimer": DISCLAIMER}

    common_checks, common_missing = [], []
    if not state.get("profile_confirmed", state["workspace"] == "demo"):
        common_missing.append("Confirm the sample restaurant settings in Business Profile before relying on this plan.")
    if t["date"] != tomorrow():
        common_missing.append("The saved service date is no longer tomorrow. Update the service window.")
    common_checks.append((at(t["date"], b["open_time"]) <= start and
                          at(t["date"], b["close_time"]) >= end,
                          "The service window falls outside opening hours."))
    if not weather_known:
        common_missing.append("Refresh tomorrow's forecast before relying on this plan.")
    for facility in ["water", "electricity"]:
        if b[facility] == "unknown":
            common_missing.append(f"Confirm {facility} availability during the service window.")
        if b[facility] == "no" or any(e["affected"] == facility for e in events
                                                     if e["kind"] in ["water_outage", "power_outage"]):
            common_checks.append((False, f"{facility.title()} is unavailable during the service window."))
    evidence = [{"type": "event", "id": e["id"], "label": e["title"]} for e in events]
    evidence.append({"type": "business", "id": "profile", "label": "Saved business profile and service window"})
    if weather_current(state):
        evidence.append({"type": "weather", "id": "forecast", "label": "Open-Meteo hourly forecast"})
    booked = b["indoor_booked"] if overlaps(start, end, at(t["date"], b["booking_start"]),
                                           at(t["date"], b["booking_end"])) else 0
    available = b["indoor_capacity"] - booked
    plans = [result("indoor", "Move outdoor guests indoors",
                    common_checks + [(available >= b["outdoor_seats"],
                                      f"Only {available} indoor seats are free; {b['outdoor_seats']} outdoor seats need space.")],
                    evidence + [{"type": "business", "id": "profile",
                                 "label": f"{available} indoor seats free / {b['outdoor_seats']} needed"}],
                    list(common_missing))]
    for door in ["front", "rear"]:
        checks, missing = list(common_checks), list(common_missing)
        access = b[f"{door}_access"]
        if door == "rear":
            if b["rear_exists"] == "unknown":
                missing.append("Confirm a rear pickup entrance exists.")
            checks.append((b["rear_exists"] != "no", "There is no rear pickup entrance."))
            verified = [v for v in state["verifications"] if v["target"] == t and v["condition"] == "rear_access"]
            if verified:
                access = verified[-1]["value"]
            if access == "unknown":
                missing.append("Confirm rear access for tomorrow's service window; customer observations alone are unverified.")
        elif access == "unknown":
            missing.append("Confirm front access for the service window.")
        checks.append((access != "no", f"The {door} entrance is confirmed unavailable."))
        checks.append((not any(e["kind"] in ["road_closure", "construction"] and e["affected"] == door
                               for e in events), f"A closure or obstruction affects the {door} pickup point."))
        if b["delivery_enabled"] == "unknown":
            missing.append("Confirm delivery / pickup staffing and arrangements.")
        checks.append((b["delivery_enabled"] != "no", "Delivery / pickup is not arranged."))
        checks.append((at(t["date"], b["delivery_start"]) <= start and
                       at(t["date"], b["delivery_end"]) >= end,
                       "Pickup / delivery arrangements do not cover the service window."))
        door_evidence = list(evidence)
        if door == "rear" and verified:
            door_evidence.append({"type": "confirmation", "id": verified[-1]["question_id"],
                                  "label": "Owner check for the target service window"})
        plans.append(result(door, f"Use {door}-door pickup / delivery", checks, door_evidence, missing))
    return {"plans": plans, "risk": risk, "rain_trigger": rain, "weather_known": weather_known,
            "active_event_ids": [e["id"] for e in events], "target": t,
            "revision": state["revision"], "disclaimer": DISCLAIMER}


def audit(state, kind, detail):
    state["audit"].append({"id": uid("log"), "at": stamp(), "kind": kind, "detail": detail})


def changed(state, reason):
    state["revision"] += 1
    for action in state["actions"]:
        if action["status"] == "approved":
            action["status"] = "needs_review"
    audit(state, "conditions_changed", reason)


def new_question(state, text=None):
    existing = next((q for q in state["questions"] if q["target"] == state["target"]
                     and q["condition"] == "rear_access" and not q.get("resolved")), None)
    if existing:
        return existing
    question = {"id": uid("q"), "token": uuid4().hex + uuid4().hex,
                "text": text or "When you passed the rear entrance, was the passage blocked?",
                "condition": "rear_access", "target": deepcopy(state["target"]),
                "created_at": stamp(), "resolved": False, "observations": []}
    state["questions"].append(question)
    audit(state, "question_created", question["id"])
    return question


def new_action(state, data):
    action = {"id": uid("act"), "title": data["title"], "kind": data["kind"],
              "content": data["content"], "recipient": data["recipient"], "owner": data["owner"],
              "cost": data["cost"], "plan_id": data["plan_id"], "target": deepcopy(state["target"]),
              "status": "draft", "created_at": stamp(), "approval": None,
              "execution_at": None, "reply": ""}
    state["actions"].append(action)
    audit(state, "action_drafted", action["id"])
    return action
