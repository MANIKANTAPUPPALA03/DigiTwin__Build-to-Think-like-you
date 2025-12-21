from datetime import datetime, timedelta

def assign_priority(tasks):
    prioritized = []

    for t in tasks:
        priority = "low"

        if "urgent" in t["title"].lower():
            priority = "high"
        elif "meeting" in t["title"].lower():
            priority = "medium"

        prioritized.append({
            **t,
            "priority": priority
        })

    return prioritized
