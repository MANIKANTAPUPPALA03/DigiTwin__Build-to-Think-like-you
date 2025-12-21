from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import base64

# Firebase
from firebase import realtime_db

# ---------------- LOAD ENV ----------------
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events",
]

# ---------------- APP INIT ----------------
app = FastAPI(title="Smart Life Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- GLOBAL STATE ----------------
user_credentials: Credentials | None = None
processed_email_ids = set()

# ---------------- UTIL FUNCTIONS ----------------
def build_oauth_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI],
            }
        },
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

def extract_email_body(payload):
    if "parts" in payload:
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain":
                data = part["body"].get("data")
                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

    data = payload.get("body", {}).get("data")
    if data:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

    return ""

def get_user_email(credentials):
    gmail = build("gmail", "v1", credentials=credentials)
    profile = gmail.users().getProfile(userId="me").execute()
    return profile.get("emailAddress")

def save_agent_log(user_email, log):
    safe_key = user_email.replace(".", "_")
    realtime_db.reference(f"agent_logs/{safe_key}").push(log)

# ---------------- ROUTES ----------------
@app.get("/")
def home():
    return {"status": "Smart Life Agent running"}

# ---------------- LOGIN ----------------
@app.get("/login")
def login():
    flow = build_oauth_flow()
    auth_url, _ = flow.authorization_url(
        prompt="consent",
        access_type="offline",
    )
    return RedirectResponse(auth_url)

# ---------------- OAUTH CALLBACK ----------------
@app.get("/auth/callback")
def auth_callback(code: str):
    global user_credentials

    flow = build_oauth_flow()
    flow.fetch_token(code=code)
    user_credentials = flow.credentials
    
    # Get user email to create session
    user_email = get_user_email(user_credentials)
    
    # Create a simple session token (in production, use JWT or proper session management)
    import secrets
    session_token = secrets.token_urlsafe(32)
    
    # Store session (in production, use Redis or database)
    # For now, we'll pass the email in the redirect
    
    # Redirect with user email so frontend can create Firebase session
    return RedirectResponse(f"http://localhost:5173/dashboard?email={user_email}&oauth=true")

# ---------------- AGENT RUN ----------------
@app.get("/agent/run")
def agent_run():
    if user_credentials is None:
        return {"error": "Not logged in"}

    gmail = build("gmail", "v1", credentials=user_credentials)
    calendar = build("calendar", "v3", credentials=user_credentials)

    user_email = get_user_email(user_credentials)

    results = gmail.users().messages().list(
        userId="me",
        maxResults=20
    ).execute()

    messages = results.get("messages", [])

    for meta in messages:
        msg_id = meta["id"]
        if msg_id in processed_email_ids:
            continue

        processed_email_ids.add(msg_id)

        msg = gmail.users().messages().get(
            userId="me",
            id=msg_id,
            format="full"
        ).execute()

        subject = ""
        for h in msg["payload"].get("headers", []):
            if h["name"] == "Subject":
                subject = h["value"]

        body = extract_email_body(msg["payload"])
        text = f"{subject} {body}".lower()

        is_actionable = any(
            k in text
            for k in ["exam", "deadline", "meeting", "submit", "assignment", "payment"]
        )

        log = {
            "subject": subject,
            "decision": "Skipped",
            "time": datetime.utcnow().isoformat(),
        }

        if is_actionable:
            start = datetime.utcnow() + timedelta(hours=1)
            end = start + timedelta(hours=1)

            event = {
                "summary": subject or "Task from Email",
                "description": body[:300],
                "start": {"dateTime": start.isoformat() + "Z"},
                "end": {"dateTime": end.isoformat() + "Z"},
            }

            calendar.events().insert(
                calendarId="primary",
                body=event
            ).execute()

            log["decision"] = "Actionable"

        save_agent_log(user_email, log)

    return {"message": "Agent executed"}

# ---------------- CALENDAR TASKS (IMPORTANT) ----------------
@app.get("/calendar/tasks")
def get_calendar_tasks():
    if user_credentials is None:
        return []

    user_email = get_user_email(user_credentials)
    safe_key = user_email.replace(".", "_")

    logs = realtime_db.reference(f"agent_logs/{safe_key}").get() or {}
    tasks = []

    for k, log in logs.items():
        if log.get("decision") == "Actionable":
            tasks.append({
                "id": k,
                "title": log.get("subject", "Task"),
                "date": log.get("time", "")[:10],
                "type": "task"
            })

    return tasks

# ---------------- EMAILS ENDPOINT ----------------
@app.get("/emails")
def get_emails():
    """Return emails from Gmail or empty list if not authenticated"""
    if user_credentials is None:
        return []
    
    try:
        gmail = build("gmail", "v1", credentials=user_credentials)
        results = gmail.users().messages().list(
            userId="me",
            maxResults=10
        ).execute()
        
        messages = results.get("messages", [])
        emails = []
        
        for meta in messages:
            msg = gmail.users().messages().get(
                userId="me",
                id=meta["id"],
                format="full"
            ).execute()
            
            # Extract subject and sender
            subject = ""
            sender = ""
            for h in msg["payload"].get("headers", []):
                if h["name"] == "Subject":
                    subject = h["value"]
                elif h["name"] == "From":
                    sender = h["value"]
            
            # Extract snippet
            snippet = msg.get("snippet", "")
            
            # Extract email body
            body = ""
            if "parts" in msg["payload"]:
                for part in msg["payload"]["parts"]:
                    if part["mimeType"] == "text/plain":
                        if "data" in part["body"]:
                            import base64
                            body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                            break
            elif "body" in msg["payload"] and "data" in msg["payload"]["body"]:
                import base64
                body = base64.urlsafe_b64decode(msg["payload"]["body"]["data"]).decode("utf-8")
            
            # If no body found, use snippet
            if not body:
                body = snippet
            
            emails.append({
                "id": meta["id"],
                "subject": subject,
                "sender": sender,
                "snippet": snippet,
                "body": body,
                "timestamp": msg.get("internalDate", ""),
                "date": msg.get("internalDate", "")
            })
        
        return emails
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return []

# ---------------- TASKS ENDPOINT ----------------
@app.get("/tasks")
def get_tasks():
    """Return tasks from Firebase or empty list if not authenticated"""
    if user_credentials is None:
        return []
    
    try:
        user_email = get_user_email(user_credentials)
        safe_key = user_email.replace(".", "_")
        
        logs = realtime_db.reference(f"agent_logs/{safe_key}").get() or {}
        tasks = []
        
        for k, log in logs.items():
            tasks.append({
                "id": k,
                "title": log.get("subject", "Task"),
                "description": log.get("description", ""),  # Use actual description, not subject
                "date": log.get("time", "")[:10],
                "status": "completed" if log.get("decision") == "Actionable" else "pending",
                "priority": log.get("priority", "medium"),
                "category": "Email"
            })
        
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []

# ---------------- PRIORITY TASKS ENDPOINT ----------------
@app.get("/priority-tasks")
def get_priority_tasks():
    """Return tasks organized by priority for the Priority Board"""
    if user_credentials is None:
        return {"tasks": []}
    
    try:
        user_email = get_user_email(user_credentials)
        safe_key = user_email.replace(".", "_")
        
        logs = realtime_db.reference(f"agent_logs/{safe_key}").get() or {}
        tasks = []
        
        for k, log in logs.items():
            # Use priority from log if available, otherwise determine from keywords
            if "priority" in log:
                priority = log["priority"]
            else:
                # Determine priority based on keywords
                subject = log.get("subject", "").lower()
                priority = "medium"  # default
                
                if any(word in subject for word in ["urgent", "asap", "important", "deadline"]):
                    priority = "high"
                elif any(word in subject for word in ["fyi", "info", "update"]):
                    priority = "low"
            
            tasks.append({
                "title": log.get("subject", "Task"),
                "date": log.get("time", "")[:10],
                "priority": priority
            })
        
        return {"tasks": tasks}
    except Exception as e:
        print(f"Error fetching priority tasks: {e}")
        return {"tasks": []}

# ---------------- CALENDAR TASKS ----------------
@app.get("/calendar/tasks")
def get_calendar_tasks():
    if user_credentials is None:
        return []

    user_email = get_user_email(user_credentials)
    safe_key = user_email.replace(".", "_")

    logs = realtime_db.reference(f"agent_logs/{safe_key}").get() or {}
    tasks = []

    for k, log in logs.items():
        if log.get("decision") == "Actionable":
            tasks.append({
                "id": k,
                "title": log.get("subject", "Task"),
                "date": log.get("time", "")[:10],
                "type": "task"
            })

    return tasks

# ---------------- UPDATE TASK PRIORITY ----------------
@app.post("/update-task-priority")
async def update_task_priority(update: dict):
    """Update task priority"""
    try:
        task_title = update.get("title")
        new_priority = update.get("priority")
        
        if user_credentials is None:
            return {"success": False, "error": "Not authenticated"}
        
        user_email = get_user_email(user_credentials)
        safe_key = user_email.replace(".", "_")
        
        logs = realtime_db.reference(f"agent_logs/{safe_key}").get() or {}
        
        # Find and update the task
        for key, log in logs.items():
            if log.get("subject") == task_title:
                realtime_db.reference(f"agent_logs/{safe_key}/{key}").update({
                    "priority": new_priority
                })
                return {"success": True, "message": f"Updated {task_title} to {new_priority}"}
        
        return {"success": False, "error": "Task not found"}
    except Exception as e:
        print(f"Error updating priority: {e}")
        return {"success": False, "error": str(e)}

# ---------------- CREATE TASK ENDPOINT ----------------
@app.post("/create-task")
async def create_task(task: dict):
    """Create a new task and save to Firebase"""
    try:
        # Generate a unique ID
        from datetime import datetime
        import random
        task_id = f"task_{datetime.utcnow().timestamp()}_{random.randint(1000, 9999)}"
        
        # Create task object with all fields
        new_task = {
            "id": task_id,
            "title": task.get("title", "Untitled Task"),
            "description": task.get("description", ""),
            "date": task.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
            "priority": task.get("priority", "medium"),
            "type": "task",
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # If user is authenticated, save to their Firebase
        if user_credentials is not None:
            user_email = get_user_email(user_credentials)
            safe_key = user_email.replace(".", "_")
            
            # Save to agent_logs so it appears in priority board and calendar
            realtime_db.reference(f"agent_logs/{safe_key}").push({
                "subject": new_task["title"],
                "description": new_task["description"],
                "priority": new_task["priority"],
                "decision": "Manual",
                "time": f"{new_task['date']}T12:00:00",  # Use task date
            })
        
        return {"success": True, "task": new_task}
    except Exception as e:
        print(f"Error creating task: {e}")
        return {"success": False, "error": str(e)}
