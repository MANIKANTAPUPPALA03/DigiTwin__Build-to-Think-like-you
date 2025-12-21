from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events"
]

def get_credentials():
    """
    Returns stored OAuth credentials.
    Assumes you already completed Google OAuth login.
    """
    return Credentials(
        token=os.getenv("ACCESS_TOKEN"),
        refresh_token=os.getenv("REFRESH_TOKEN"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPES,
    )
