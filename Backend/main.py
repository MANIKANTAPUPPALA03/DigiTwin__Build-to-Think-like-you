import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

import auth
import gmail_service
import calendar_service
import ai_engine
import task_manager

# ─── App ────────────────────────────────────────────────────────────────────

app = FastAPI(title="DigiTwin Backend", version="3.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth Helper ─────────────────────────────────────────────────────────────

def get_current_user(request: Request) -> dict | None:
    """Extract and verify Firebase ID token from Authorization header."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.replace("Bearer ", "")
    return auth.verify_firebase_token(token)


def get_google_token(request: Request) -> str | None:
    """Extract the Google access token from X-Google-Token header."""
    return request.headers.get("x-google-token")


# ─── Request Models ─────────────────────────────────────────────────────────

class CreateTaskRequest(BaseModel):
    title: str
    description: str = ""
    date: str = ""
    priority: str = "medium"
    category: str = "General"


class UpdatePriorityRequest(BaseModel):
    title: str
    priority: str


class ChatRequest(BaseModel):
    message: str


# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "version": "3.0.0",
        "service": "DigiTwin Backend",
        "auth": "firebase",
    }


# ─── Email Routes ────────────────────────────────────────────────────────────

@app.get("/emails")
async def get_emails(request: Request):
    """Fetch emails from Gmail using the Google access token."""
    user = get_current_user(request)
    if not user:
        print("⚠️ No authenticated user for /emails")
        return []

    google_token = get_google_token(request)
    if not google_token:
        print("⚠️ No Google access token in request headers")
        return []
    
    print(f"✅ Received Google token (len={len(google_token)}) for user {user['email']}")

    try:
        credentials = auth.get_gmail_credentials(google_token)
        emails = gmail_service.fetch_emails(credentials, max_results=10)
        print(f"✅ Fetched {len(emails)} emails for {user['email']}")
        return emails
    except Exception as e:
        print(f"❌ Email fetch error: {e}")
        traceback.print_exc()
        return []


# ─── Task Routes ─────────────────────────────────────────────────────────────

@app.get("/tasks")
async def get_tasks(request: Request):
    """Get all tasks for the current user."""
    user = get_current_user(request)
    if not user:
        return []

    try:
        tasks = task_manager.get_all_tasks(user["email"])
        return tasks
    except Exception as e:
        print(f"❌ Task fetch error: {e}")
        return []


@app.post("/create-task")
async def create_task(req: CreateTaskRequest, request: Request):
    """Create a new task."""
    user = get_current_user(request)
    if not user:
        return {"error": "Not authenticated. Please login first."}

    try:
        task = task_manager.create_task(user["email"], req.model_dump())
        return task
    except Exception as e:
        print(f"❌ Task creation error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/calendar/tasks")
async def get_calendar_tasks(request: Request):
    """Get tasks formatted for the calendar view."""
    user = get_current_user(request)
    if not user:
        return []

    try:
        return task_manager.get_calendar_tasks(user["email"])
    except Exception as e:
        print(f"❌ Calendar tasks error: {e}")
        return []


@app.get("/calendar/events")
async def get_calendar_events(request: Request, year: int = None, month: int = None):
    """Fetch Google Calendar events for a given month."""
    user = get_current_user(request)
    if not user:
        return []

    google_token = get_google_token(request)
    if not google_token:
        print("⚠️ No Google access token for /calendar/events")
        return []

    # Default to current month if not specified
    from datetime import datetime
    now = datetime.utcnow()
    y = year or now.year
    m = month or now.month

    # Build time range for the month
    time_min = f"{y}-{str(m).zfill(2)}-01T00:00:00Z"
    if m == 12:
        time_max = f"{y + 1}-01-01T00:00:00Z"
    else:
        time_max = f"{y}-{str(m + 1).zfill(2)}-01T00:00:00Z"

    try:
        credentials = auth.get_gmail_credentials(google_token)
        events = calendar_service.fetch_events(credentials, time_min=time_min, time_max=time_max)
        print(f"✅ Fetched {len(events)} calendar events for {user['email']} ({y}-{m})")
        return events
    except Exception as e:
        print(f"❌ Calendar events error: {e}")
        traceback.print_exc()
        return []


@app.get("/priority-tasks")
async def get_priority_tasks(request: Request):
    """Get all tasks for the priority board."""
    user = get_current_user(request)
    if not user:
        return {"tasks": []}

    try:
        return task_manager.get_priority_tasks(user["email"])
    except Exception as e:
        print(f"❌ Priority tasks error: {e}")
        return {"tasks": []}


@app.post("/update-task-priority")
async def update_priority(req: UpdatePriorityRequest, request: Request):
    """Update a task's priority (from drag & drop on priority board)."""
    user = get_current_user(request)
    if not user:
        return {"status": "not_authenticated"}

    try:
        success = task_manager.update_task_priority(
            user["email"], req.title, req.priority
        )
        if success:
            return {"status": "updated"}
        return JSONResponse(status_code=404, content={"error": "Task not found"})
    except Exception as e:
        print(f"❌ Priority update error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── Task Lifecycle ──────────────────────────────────────────────────────────

@app.post("/tasks/{task_id}/complete")
async def complete_task_endpoint(task_id: str, request: Request):
    """Mark a task as completed."""
    user = get_current_user(request)
    if not user:
        return {"status": "not_authenticated"}

    success = task_manager.complete_task(user["email"], task_id)
    if success:
        return {"status": "completed"}
    return JSONResponse(status_code=404, content={"error": "Task not found"})


@app.delete("/tasks/{task_id}")
async def delete_task_endpoint(task_id: str, request: Request):
    """Delete a single task."""
    user = get_current_user(request)
    if not user:
        return {"status": "not_authenticated"}

    success = task_manager.delete_task(user["email"], task_id)
    if success:
        return {"status": "deleted"}
    return JSONResponse(status_code=404, content={"error": "Task not found"})


@app.post("/tasks/clear-all")
async def clear_all_tasks(request: Request):
    """Delete all tasks for current user (reset)."""
    user = get_current_user(request)
    if not user:
        return {"status": "not_authenticated"}

    count = task_manager.delete_all_tasks(user["email"])
    return {"status": "cleared", "deleted_count": count}


# ─── Agent Route ─────────────────────────────────────────────────────────────

@app.post("/agent/run")
async def run_agent(request: Request):
    """
    AI Agent: Fetches Gmail emails → checks calendar → extracts tasks with AI → saves to Firestore.
    Now uses POST to prevent accidental re-triggers.
    """
    user = get_current_user(request)
    if not user:
        return {"status": "not_authenticated", "tasks_created": 0}

    google_token = get_google_token(request)
    if not google_token:
        return {"status": "no_google_token", "tasks_created": 0}

    try:
        credentials = auth.get_gmail_credentials(google_token)

        # Step 1: Fetch recent emails
        emails = gmail_service.fetch_emails(credentials, max_results=10)
        if not emails:
            return {"status": "no_emails", "tasks_created": 0}

        # Step 2: KEYWORD FILTER — only emails matching keywords proceed
        matched_emails = ai_engine.filter_emails_by_keywords(emails)
        if not matched_emails:
            return {
                "status": "no_matching_emails",
                "emails_scanned": len(emails),
                "emails_matched": 0,
                "tasks_created": 0,
                "message": "No emails matched your keyword filters",
            }

        # Step 3: Get existing task titles for dedup
        existing_titles = list(task_manager.get_existing_titles(user["email"]))

        # Step 4: Get upcoming calendar events for conflict avoidance
        from datetime import datetime
        now = datetime.utcnow()
        time_min = now.isoformat() + "Z"
        if now.month == 12:
            time_max = now.replace(year=now.year + 1, month=1, day=1).isoformat() + "Z"
        else:
            time_max = now.replace(month=now.month + 1, day=1).isoformat() + "Z"

        calendar_events = []
        try:
            calendar_events = calendar_service.fetch_events(credentials, time_min=time_min, time_max=time_max, max_results=10)
        except Exception:
            pass  # Calendar might not be enabled

        # Step 5: AI extracts tasks from ONLY keyword-matched emails
        extracted_tasks = ai_engine.extract_tasks_from_emails(
            matched_emails,
            existing_titles=existing_titles,
            calendar_events=calendar_events,
        )
        if not extracted_tasks:
            return {
                "status": "no_tasks_found",
                "emails_scanned": len(emails),
                "emails_matched": len(matched_emails),
                "tasks_created": 0,
            }

        # Step 6: Save tasks to Firestore (bulk with dedup)
        created_tasks = task_manager.create_tasks_bulk(user["email"], extracted_tasks)

        return {
            "status": "success",
            "emails_scanned": len(emails),
            "emails_matched": len(matched_emails),
            "tasks_extracted": len(extracted_tasks),
            "tasks_created": len(created_tasks),
            "tasks": created_tasks,
        }

    except Exception as e:
        print(f"❌ Agent error: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# ─── Chat Route ──────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    """AI chat assistant."""
    user = get_current_user(request)
    user_email = user["email"] if user else None

    # Build context from current user's tasks
    context = ""
    if user_email:
        try:
            tasks = task_manager.get_all_tasks(user_email)
            if tasks:
                task_summary = "\n".join(
                    [f"- {t['title']} (priority: {t.get('priority', 'medium')}, date: {t.get('date', 'N/A')})"
                     for t in tasks[:10]]
                )
                context = f"My current tasks:\n{task_summary}"
        except Exception:
            pass

    response = ai_engine.chat_response(req.message, context)
    return {
        "id": f"msg-{id(response)}",
        "text": response,
        "sender": "bot",
    }


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
