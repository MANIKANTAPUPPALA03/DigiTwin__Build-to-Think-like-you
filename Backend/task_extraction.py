def extract_tasks_from_emails(emails):
    tasks = []

    for email in emails:
        text = f"{email.get('subject','')} {email.get('body','')}".lower()

        if any(word in text for word in ["exam", "deadline", "meeting", "submit", "assignment"]):
            tasks.append({
                "title": email.get("subject", "Email Task"),
                "description": email.get("body", ""),
                "priority": "high",
            })

    return tasks
