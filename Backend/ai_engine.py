import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# ═══════════════════════════════════════════════════════════════════════════════
# KEYWORD-BASED EMAIL FILTERING
# Only emails matching these keywords will be processed into tasks.
# ═══════════════════════════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════════════════════════
# KEYWORD-BASED EMAIL FILTERING
# Only emails matching these keywords will be processed into tasks.
# ═══════════════════════════════════════════════════════════════════════════════

# ✅ CORE ACTION KEYWORDS (Very Strong Signals)
CORE_ACTION_KEYWORDS = [
    "submit", "submission", "complete", "finish", "attend", "join", "appear for",
    "pay", "payment due", "renew", "renewal", "return", "respond", "reply required",
    "confirm", "approve", "review", "prepare", "upload", "download and submit",
    "register", "schedule", "reschedule", "book", "cancel", "update", "verify",
    "validate", "sign", "sign and send", "provide", "share", "send", "apply",
    "fill out", "fill in", "complete form", "action required", "immediate action",
    "urgent action", "mandatory", "required", "must"
]

# ⏳ DEADLINE / TIME INDICATORS (Very Important)
DEADLINE_KEYWORDS = [
    "deadline", "due", "due date", "last date", "by", "before", "on or before",
    "no later than", "expires", "expiry", "expiration", "closing date",
    "final date", "submission closes", "ends on", "valid till", "valid until",
    "time limit", "within", "prior to"
]

# 📅 EVENT / APPOINTMENT SIGNALS
EVENT_KEYWORDS = [
    "meeting", "call", "interview", "session", "appointment", "webinar",
    "workshop", "seminar", "conference", "demo", "presentation", "review meeting",
    "standup", "discussion", "briefing", "orientation", "induction",
    "exam", "test", "quiz", "assessment", "viva", "practical"
]

# 💰 FINANCIAL / PAYMENT SIGNALS
FINANCIAL_KEYWORDS = [
    "invoice", "bill", "payment", "emi", "subscription", "renewal", "fee",
    "charges", "outstanding", "pending payment", "balance due", "installment",
    "tax filing", "penalty", "late fee"
]

# 📄 DOCUMENT / FORM SIGNALS
DOCUMENT_KEYWORDS = [
    "form submission", "documentation", "upload documents", "attach documents",
    "submit report", "submit project", "submit assignment", "submit application",
    "approval pending", "verification required", "kyc", "compliance"
]

# 🚨 STRONG URGENCY TRIGGERS
URGENCY_KEYWORDS = [
    "urgent", "immediately", "asap", "important", "critical", "high priority",
    "time sensitive", "don't miss", "required immediately", "final reminder",
    "last reminder"
]

# 🔎 NATURAL LANGUAGE PHRASES
PHRASE_KEYWORDS = [
    "you need to", "you have to", "please ensure", "please complete",
    "kindly submit", "kindly confirm", "kindly attend", "please respond",
    "please pay", "please return", "make sure to", "remember to"
]

# All keywords combined
ALL_KEYWORDS = (
    CORE_ACTION_KEYWORDS + DEADLINE_KEYWORDS + EVENT_KEYWORDS +
    FINANCIAL_KEYWORDS + DOCUMENT_KEYWORDS + URGENCY_KEYWORDS + PHRASE_KEYWORDS
)

# Words to IGNORE — emails containing ONLY these are skipped
IGNORE_KEYWORDS = [
    "newsletter", "discount", "offer", "sale", "promotion", "advertisement",
    "update available", "social media", "notification", "alert",
    "thanks", "congratulations",
]

# Date Pattern Regex (DD-MM-YYYY, YYYY-MM-DD, HH:MM, etc.)
DATE_PATTERN = re.compile(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}:\d{2}\s?(?:am|pm)?', re.IGNORECASE)



def _email_matches_keywords(email: dict) -> tuple[bool, list[str]]:
    """
    Check if an email matches any of the defined keywords.
    Returns (matches: bool, matched_keywords: list[str])
    """
    text = " ".join([
        email.get("subject", ""),
        email.get("snippet", ""),
        email.get("sender", ""),
    ]).lower()

    # First check if it's an ignore-only email
    has_ignore = any(kw in text for kw in IGNORE_KEYWORDS)

    # Check for matching keywords
    matched = []
    for kw in ALL_KEYWORDS:
        if kw.lower() in text:
            matched.append(kw)

    # Check for date patterns (Bonus Signal)
    has_date = DATE_PATTERN.search(text)
    if has_date:
        matched.append("DATE_PATTERN_DETECTED")

    # If it has keywords (or dates), it matches (even if it also has ignore words)
    if matched:
        return True, matched

    # If it has ONLY ignore words and no positive keywords, skip it
    if has_ignore:
        return False, []

    # No keywords at all — skip
    return False, []


def filter_emails_by_keywords(emails: list[dict]) -> list[dict]:
    """
    Filter emails to only those containing relevant keywords.
    Adds 'matched_keywords' to each matching email.
    """
    filtered = []
    for email in emails:
        matches, keywords = _email_matches_keywords(email)
        if matches:
            email["matched_keywords"] = keywords
            filtered.append(email)
    return filtered


def extract_tasks_from_emails(
    emails: list[dict],
    existing_titles: list[str] = None,
    calendar_events: list[dict] = None,
) -> list[dict]:
    """
    Use Groq AI to extract actionable tasks ONLY from keyword-matched emails.
    Emails are pre-filtered by keywords before being sent to AI.
    """
    if not emails:
        return []

    # Build email summaries including matched keywords
    email_summaries = []
    for e in emails[:10]:
        keywords_str = ", ".join(e.get("matched_keywords", [])[:5])
        email_summaries.append(
            f"- From: {e.get('sender', 'Unknown')}\n"
            f"  Subject: {e.get('subject', '')}\n"
            f"  Snippet: {e.get('snippet', '')}\n"
            f"  Matched Keywords: [{keywords_str}]"
        )

    emails_text = "\n".join(email_summaries)

    # Build existing tasks context
    existing_context = ""
    if existing_titles:
        existing_context = (
            "\n\nEXISTING TASKS (do NOT create duplicates of these):\n"
            + "\n".join(f"- {t}" for t in list(existing_titles)[:20])
        )

    # Build calendar context
    calendar_context = ""
    if calendar_events:
        cal_items = [f"- {ev.get('title', '')} on {ev.get('start', '')}" for ev in calendar_events[:10]]
        if cal_items:
            calendar_context = (
                "\n\nUPCOMING CALENDAR EVENTS (avoid scheduling conflicts):\n"
                + "\n".join(cal_items)
            )

    prompt = f"""You are analyzing emails that were pre-filtered by keywords.
Each email has already been identified as containing actionable keywords.

Rules:
1. Create at MOST 5 tasks total.
2. Create tasks ONLY for genuinely actionable items matching the keywords shown.
3. Do NOT duplicate any existing tasks listed below.
4. Consider calendar events to avoid scheduling conflicts.
5. Today's date is {__import__('datetime').datetime.now().strftime('%Y-%m-%d')}.

Emails:
{emails_text}
{existing_context}
{calendar_context}

For each task, return a JSON array with:
- "title": short clear task title (max 8 words)
- "description": brief action description (1 sentence)
- "date": due date in YYYY-MM-DD format (use today if unclear)
- "priority": "high", "medium", or "low"
- "category": one of "Meeting", "Deadline", "Follow-up", "Action Item", "General"

Return ONLY a valid JSON array. If no actionable tasks, return [].
No markdown formatting, just raw JSON."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart task extraction assistant. You create tasks ONLY from emails that match specific keywords. Be selective — quality over quantity. Always respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=1500,
        )

        content = response.choices[0].message.content.strip()

        # Clean markdown code blocks if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            content = content.rsplit("```", 1)[0]
            content = content.strip()

        tasks = json.loads(content)
        if isinstance(tasks, list):
            return tasks[:5]  # Hard cap at 5
        return []

    except json.JSONDecodeError as e:
        print(f"Failed to parse AI response as JSON: {e}")
        return []
    except Exception as e:
        print(f"Groq AI error: {e}")
        return []



def chat_response(user_message: str, context: str = "") -> str:
    """Get an AI chat response for the floating assistant with rich knowledge."""
    
    system_prompt = """You are **DigiTwin AI**, a "Smart Life Agent" designed to be a digital counterpart for students and professionals.
    
    # 🎯 YOUR MISSION
    "To be more than just a tool—a digital counterpart that understands context, manages workload, and autonomously handles the mundane, leaving users free to focus on what truly matters."
    
    # 👥 YOUR CREATORS (THE TEAM)
    You were built by a team of passionate B.Tech students for the **Google AI Agentathon**:
    - **Lohitha (The Architect)**: 3rd year Data Science student at CMR Technical Campus. She designed your core structure and scalability.
    - **Chandana (The R&D)**: 2nd year IT student at Malla Reddy College. She leads research on cutting-edge AI technologies.
    - **Uday (Frontend Developer)**: 3rd year CSM student at Vardhaman College of Engineering. He crafted your beautiful UI/UX.
    - **Manikanta (Backend Developer)**: 3rd year CSE student at CMR Technical Campus. He built your robust backend and AI logic.
    
    # ⚡ YOUR CAPABILITIES
    1. **Task Extraction**: You scan emails for keywords (exams, meetings, assignments) and auto-create actionable tasks.
    2. **Calendar Sync**: You check Google Calendar for conflicts before scheduling.
    3. **Priority Management**: You organize tasks by priority (High, Medium, Low) on a drag-and-drop board.
    4. **Cognitive Offloading**: You help reduce mental fatigue by tracking deadlines and "remembering" things for the user.
    
    # 🧠 YOUR PERSONALITY
    - Friendly, intelligent, and proactive.
    - You use emojis occasionally to keep things light (📅, ✅, 🚀).
    - You prioritize "Deep Work" and helping the user stay focused.
    
    If the user asks "What can you do?" or "Who built you?", use the info above.
    Keep responses concise (2-3 sentences) unless asked for detail.
    """

    messages = [{"role": "system", "content": system_prompt}]

    if context:
        messages.append({"role": "user", "content": f"Here is my current context:\n{context}"})
        messages.append({"role": "assistant", "content": "Got it! I have your current context. How can I help?"})

    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chat error: {e}")
        return "Sorry, I'm having trouble responding right now. Please try again in a moment."
