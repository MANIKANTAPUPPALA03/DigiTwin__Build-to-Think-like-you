from pydantic import BaseModel
import google.generativeai as genai
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

class EmailInput(BaseModel):
    subject: str
    body: str

@app.post("/agent/extract-task")
def extract_task(email: EmailInput):
    prompt = f"""
    From this email, extract ONE task if it exists.

    Respond ONLY in valid JSON:
    {{
      "title": string,
      "date": YYYY-MM-DD,
      "type": "task" | "meeting" | "reminder"
    }}

    If no task exists, return null.

    Email subject:
    {email.subject}

    Email body:
    {email.body}
    """

    response = model.generate_content(prompt)

    try:
        return json.loads(response.text)
    except:
        return None
