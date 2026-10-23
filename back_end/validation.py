import math
from datetime import date, time, datetime
from urllib.parse import urlparse
from domain import at


def text(value, label, limit=1000, empty=False):
    if not isinstance(value, str) or (not empty and not value.strip()) or len(value) > limit:
        raise ValueError(f"{label} must be {'at most' if empty else '1–'}{limit} characters.")
    return value.strip()


def choice(value, choices, label):
    if value not in choices:
        raise ValueError(f"Invalid {label}.")
    return value


def number(value, label, minimum=0, maximum=1000000, integer=False):
    if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value):
        raise ValueError(f"{label} must be a finite number.")
    if not minimum <= value <= maximum or (integer and int(value) != value):
        raise ValueError(f"{label} must be between {minimum} and {maximum}.")
    return int(value) if integer else round(value, 2)


def clock(value):
    if not isinstance(value, str) or len(value) != 5:
        raise ValueError("Use HH:MM times.")
    time.fromisoformat(value)
    return value


def target(data):
    date.fromisoformat(data["date"])
    start, end = clock(data["start"]), clock(data["end"])
    if start >= end:
        raise ValueError("The service window must end after it starts, within one day.")
    return {"date": data["date"], "start": start, "end": end}


def business(data):
    result = {"name": text(data["name"], "Store name", 100), "owner": text(data["owner"], "Owner", 100)}
    # Coordinates must retain precision; money rounding is deliberately separate.
    for key, lo, hi in [("latitude", -90, 90), ("longitude", -180, 180)]:
        number(data[key], key, lo, hi)
        result[key] = data[key]
    for key in ["indoor_capacity", "outdoor_seats", "indoor_booked"]:
        result[key] = number(data[key], key, maximum=10000, integer=True)
    if result["indoor_booked"] > result["indoor_capacity"]:
        raise ValueError("Indoor bookings cannot exceed indoor capacity.")
    for first, last in [("open_time", "close_time"), ("booking_start", "booking_end"), ("delivery_start", "delivery_end")]:
        result[first], result[last] = clock(data[first]), clock(data[last])
        if result[first] >= result[last]:
            raise ValueError(f"{last} must follow {first}; overnight windows are not supported in this MVP.")
    for key in ["front_access", "rear_exists", "rear_access", "delivery_enabled", "water", "electricity"]:
        result[key] = choice(data[key], ["yes", "no", "unknown"], key)
    return result


def event(data):
    result = {"title": text(data["title"], "Event title", 160),
              "kind": choice(data["kind"], ["rain", "road_closure", "construction", "water_outage", "power_outage", "activity"], "event kind"),
              "affected": choice(data["affected"], ["outdoor", "front", "rear", "water", "electricity", "area"], "affected area"),
              "source_type": choice(data["source_type"], ["merchant", "demo"], "source type"),
              "source": text(data["source"], "Source", 200),
              "source_url": text(data.get("source_url", ""), "Source URL", 1000, empty=True),
              "notes": text(data.get("notes", ""), "Notes", 2000, empty=True)}
    if result["source_url"] and urlparse(result["source_url"]).scheme not in ["http", "https"]:
        raise ValueError("Source links must use http or https.")
    for key in ["start", "end"]:
        value = datetime.fromisoformat(data[key])
        if not value.tzinfo:
            raise ValueError("Event timestamps must include their timezone.")
        result[key] = value.isoformat()
    if datetime.fromisoformat(result["start"]) >= datetime.fromisoformat(result["end"]):
        raise ValueError("Event end must follow its start.")
    expected = {"rain": "outdoor", "water_outage": "water", "power_outage": "electricity"}
    if result["kind"] in expected and result["affected"] != expected[result["kind"]]:
        raise ValueError("This event's affected facility does not match its type.")
    if result["kind"] in ["road_closure", "construction"] and result["affected"] not in ["front", "rear"]:
        raise ValueError("Assign the closure to the affected front or rear pickup entrance.")
    return result


def action(data):
    result = {k: text(data[k], k, limit) for k, limit in [
        ("title", 160), ("content", 3000), ("recipient", 160), ("owner", 100)]}
    result["kind"] = choice(data["kind"], ["task", "customer_notice", "supplier_inquiry"], "action kind")
    result["plan_id"] = choice(data["plan_id"], ["indoor", "front", "rear", "preparation"], "plan")
    result["cost"] = number(data.get("cost", 0), "Estimated cost (RM)")
    return result
