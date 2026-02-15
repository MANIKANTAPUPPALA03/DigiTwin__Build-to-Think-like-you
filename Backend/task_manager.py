import uuid
from datetime import datetime
from firebase_config import get_user_tasks_ref


def get_all_tasks(user_email: str) -> list[dict]:
    """Get all tasks for a user from Firestore."""
    tasks_ref = get_user_tasks_ref(user_email)
    docs = tasks_ref.order_by("date").stream()

    tasks = []
    for doc in docs:
        task = doc.to_dict()
        task["id"] = doc.id
        tasks.append(task)
    return tasks


def get_existing_titles(user_email: str) -> set[str]:
    """Get all existing task titles for dedup checking."""
    tasks = get_all_tasks(user_email)
    return {t.get("title", "").strip().lower() for t in tasks}


def create_task(user_email: str, task_data: dict) -> dict:
    """Create a new task in Firestore."""
    tasks_ref = get_user_tasks_ref(user_email)

    task_id = f"task-{uuid.uuid4().hex[:8]}"
    task = {
        "title": task_data.get("title", "Untitled Task"),
        "description": task_data.get("description", ""),
        "date": task_data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "priority": task_data.get("priority", "medium"),
        "category": task_data.get("category", "General"),
        "status": task_data.get("status", "pending"),
        "createdAt": datetime.now().isoformat(),
    }

    tasks_ref.document(task_id).set(task)
    task["id"] = task_id
    return task


def create_tasks_bulk(user_email: str, tasks_list: list[dict]) -> list[dict]:
    """Create multiple tasks at once, skipping duplicates."""
    existing = get_existing_titles(user_email)
    created = []
    for task_data in tasks_list:
        title = task_data.get("title", "").strip().lower()
        if title and title not in existing:
            task = create_task(user_email, task_data)
            created.append(task)
            existing.add(title)  # Track new ones too
    return created


def complete_task(user_email: str, task_id: str) -> bool:
    """Mark a task as completed."""
    tasks_ref = get_user_tasks_ref(user_email)
    doc_ref = tasks_ref.document(task_id)
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.update({"status": "completed"})
        return True
    return False


def delete_task(user_email: str, task_id: str) -> bool:
    """Delete a single task."""
    tasks_ref = get_user_tasks_ref(user_email)
    doc_ref = tasks_ref.document(task_id)
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.delete()
        return True
    return False


def update_task_priority(user_email: str, title: str, new_priority: str) -> bool:
    """Update a task's priority by matching its title."""
    tasks_ref = get_user_tasks_ref(user_email)
    docs = tasks_ref.where("title", "==", title).stream()

    updated = False
    for doc in docs:
        doc.reference.update({"priority": new_priority})
        updated = True
    return updated


def get_priority_tasks(user_email: str) -> dict:
    """Get all tasks grouped for the priority board."""
    tasks = get_all_tasks(user_email)
    return {"tasks": tasks}


def get_calendar_tasks(user_email: str) -> list[dict]:
    """Get tasks formatted for the calendar view."""
    tasks = get_all_tasks(user_email)
    return [
        {
            "id": t["id"],
            "title": t["title"],
            "date": t.get("date", ""),
            "type": "task",
        }
        for t in tasks
    ]


def delete_all_tasks(user_email: str) -> int:
    """Delete all tasks for a user (reset)."""
    tasks_ref = get_user_tasks_ref(user_email)
    docs = tasks_ref.stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    return count
