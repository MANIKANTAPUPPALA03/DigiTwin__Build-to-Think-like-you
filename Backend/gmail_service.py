import base64
from googleapiclient.discovery import build
import traceback
import datetime

def log_debug(msg):
    with open("backend_debug.log", "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now()}] {msg}\n")



def fetch_emails(credentials, max_results: int = 20) -> list[dict]:
    """
    Fetch recent emails from Gmail using the user's OAuth credentials.
    Returns a list of email dicts: {id, sender, subject, snippet, body, date}
    """
    service = build("gmail", "v1", credentials=credentials)

    # Get message list
    try:
        log_debug(f"🔍 Fetching emails (max={max_results})...")

        results = service.users().messages().list(
            userId="me",
            maxResults=max_results,
            labelIds=["INBOX"],
        ).execute()

        messages = results.get("messages", [])
        log_debug(f"📧 Gmail API found {len(messages)} messages")
        
        if not messages:
            log_debug("⚠️ Gmail API returned NO messages")
            return []
    except Exception as e:
        log_debug(f"❌ Gmail API list failed: {e}")
        traceback.print_exc()
        return []

    emails = []
    for msg_info in messages:
        try:
            msg = service.users().messages().get(
                userId="me",
                id=msg_info["id"],
                format="full",
            ).execute()

            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}

            # Extract both text and html body
            body_text, body_html = _extract_body(msg.get("payload", {}))

            emails.append({
                "id": msg_info["id"],
                "sender": headers.get("From", "Unknown"),
                "subject": headers.get("Subject", "(No Subject)"),
                "snippet": msg.get("snippet", ""),
                "body": body_text or "",
                "body_html": body_html or "",
                "date": headers.get("Date", ""),
            })
        except Exception as e:
            print(f"Error fetching email {msg_info['id']}: {e}")
            continue

    return emails


def _extract_body(payload: dict) -> tuple[str, str]:
    """Extract both text/plain and text/html body from a Gmail message payload.
    Returns (body_text, body_html) tuple."""
    body_text = ""
    body_html = ""
    
    # Simple single-part message
    mime = payload.get("mimeType", "")
    data = payload.get("body", {}).get("data", "")
    
    if mime == "text/plain" and data:
        body_text = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
    elif mime == "text/html" and data:
        body_html = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    # Multipart — look through parts
    parts = payload.get("parts", [])
    for part in parts:
        part_mime = part.get("mimeType", "")
        part_data = part.get("body", {}).get("data", "")
        
        if part_mime == "text/plain" and part_data and not body_text:
            body_text = base64.urlsafe_b64decode(part_data).decode("utf-8", errors="replace")
        elif part_mime == "text/html" and part_data and not body_html:
            body_html = base64.urlsafe_b64decode(part_data).decode("utf-8", errors="replace")
        
        # Nested multipart (e.g. multipart/alternative inside multipart/mixed)
        if part.get("parts"):
            nested_text, nested_html = _extract_body(part)
            if nested_text and not body_text:
                body_text = nested_text
            if nested_html and not body_html:
                body_html = nested_html

    return body_text, body_html
