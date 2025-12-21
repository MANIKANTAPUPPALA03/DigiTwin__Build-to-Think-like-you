from googleapiclient.discovery import build
import base64

def get_last_20_emails(credentials):
    service = build("gmail", "v1", credentials=credentials)

    results = service.users().messages().list(
        userId="me",
        maxResults=20
    ).execute()

    messages = results.get("messages", [])
    emails = []

    for msg in messages:
        msg_data = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="full"
        ).execute()

        headers = msg_data["payload"]["headers"]

        subject = sender = date = ""
        for h in headers:
            if h["name"] == "Subject":
                subject = h["value"]
            if h["name"] == "From":
                sender = h["value"]
            if h["name"] == "Date":
                date = h["value"]

        body = ""
        if "parts" in msg_data["payload"]:
            for part in msg_data["payload"]["parts"]:
                if part["mimeType"] == "text/plain":
                    body = base64.urlsafe_b64decode(
                        part["body"]["data"]
                    ).decode("utf-8", errors="ignore")

        emails.append({
            "id": msg["id"],
            "subject": subject,
            "sender": sender,
            "date": date,
            "snippet": msg_data.get("snippet", ""),
            "body": body
        })

    return emails
