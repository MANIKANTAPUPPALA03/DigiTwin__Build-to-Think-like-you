"""
Firebase Auth — verifies Firebase ID tokens and manages Google access tokens for Gmail API.
No custom OAuth flow needed — Firebase handles everything on the frontend.
"""
import os
from dotenv import load_dotenv
from firebase_admin import auth as firebase_auth

load_dotenv()


def verify_firebase_token(id_token: str) -> dict | None:
    """
    Verify a Firebase ID token and return user info.
    Returns { uid, email, name } or None if invalid.
    """
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return {
            "uid": decoded.get("uid", ""),
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "picture": decoded.get("picture", ""),
        }
    except Exception as e:
        print(f"❌ Firebase verify failed: {e}")
        # For Hybrid Auth debugging:
        try:
            # Try to verify as generic Google token (since we used external Client ID)
            from google.oauth2 import id_token
            from google.auth.transport import requests
            payload = id_token.verify_oauth2_token(id_token, requests.Request())
            print(f"✅ Verified as Generic Google Token: {payload.get('email')}")
            return {
                "uid": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "picture": payload.get("picture"),
            }
        except Exception as e2:
            print(f"❌ Generic Google verify also failed: {e2}")
        
        return None


def get_gmail_credentials(google_access_token: str):
    """
    Create Google credentials from a Google access token.
    Used for Gmail API access.
    """
    if not google_access_token:
        return None

    from google.oauth2.credentials import Credentials
    return Credentials(token=google_access_token)


def exchange_code_for_token(code: str, redirect_uri: str) -> str:
    """
    Exchange authorization code for an access token.
    Uses credentials.json to get client secret.
    """
    try:
        from google_auth_oauthlib.flow import Flow
        
        # Ensure credentials.json exists
        creds_path = "credentials.json"
        if not os.path.exists(creds_path):
            print("❌ credentials.json not found!")
            return None

        # Create flow
        flow = Flow.from_client_secrets_file(
            creds_path,
            scopes=[
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/calendar.readonly"
            ],
            redirect_uri=redirect_uri
        )
        
        # Exchange code
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        return credentials.token
    except Exception as e:
        print(f"❌ Token exchange error: {e}")
        return None
