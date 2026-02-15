from googleapiclient.discovery import build
from datetime import datetime, timedelta
import traceback


def log_debug(msg):
    import datetime as dt
    with open("backend_debug.log", "a", encoding="utf-8") as f:
        f.write(f"[{dt.datetime.now()}] [CALENDAR] {msg}\n")


def fetch_events(credentials, time_min: str = None, time_max: str = None, max_results: int = 50) -> list[dict]:
    """
    Fetch calendar events from Google Calendar using the user's OAuth credentials.
    time_min and time_max should be ISO 8601 strings (e.g., '2026-02-01T00:00:00Z').
    Returns a list of event dicts: {id, title, start, end, description, location, color}
    """
    service = build("calendar", "v3", credentials=credentials)

    # Default: current month
    if not time_min:
        now = datetime.utcnow()
        time_min = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
    if not time_max:
        now = datetime.utcnow()
        # End of current month
        if now.month == 12:
            time_max = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
        else:
            time_max = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"

    try:
        log_debug(f"🔍 Fetching events from ALL calendars (min={time_min}, max={time_max})...")

        # 1. List all calendars (primary, holidays, etc.)
        calendar_list_result = service.calendarList().list().execute()
        calendars = calendar_list_result.get("items", [])
        log_debug(f"found {len(calendars)} calendars: {[c.get('summary') for c in calendars]}")

        all_events = []

        # 2. Fetch events from each calendar
        for cal in calendars:
            cal_id = cal.get("id")
            cal_summary = cal.get("summary", "Unknown")
            is_primary = cal.get("primary", False)
            
            # Skip contact birthdays if desired, or keep them. Often they clutter.
            # if "contacts" in cal_id: continue 

            log_debug(f"  Fetching from: {cal_summary} ({cal_id})")
            
            try:
                events_result = service.events().list(
                    calendarId=cal_id,
                    timeMin=time_min,
                    timeMax=time_max,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                ).execute()

                items = events_result.get("items", [])
                
                for item in items:
                    start = item.get("start", {})
                    end = item.get("end", {})
                    
                    # Use calendar color if event has no color
                    color_id = item.get("colorId") or cal.get("backgroundColor")

                    all_events.append({
                        "id": item.get("id", ""),
                        "title": item.get("summary", "(No Title)"),
                        "start": start.get("dateTime", start.get("date", "")),
                        "end": end.get("dateTime", end.get("date", "")),
                        "description": item.get("description", ""),
                        "location": item.get("location", ""),
                        "all_day": "date" in start and "dateTime" not in start,
                        "color": color_id,
                        "source_calendar": cal_summary, # Useful for UI
                        "is_primary": is_primary
                    })
            except Exception as e:
                log_debug(f"  Failed to fetch from {cal_summary}: {e}")
                continue

        log_debug(f"📅 Total events found: {len(all_events)}")
        
        # 3. Sort by start time
        all_events.sort(key=lambda x: x["start"])

        return all_events

    except Exception as e:
        log_debug(f"❌ Calendar API failed: {e}")
        traceback.print_exc()
        return []
