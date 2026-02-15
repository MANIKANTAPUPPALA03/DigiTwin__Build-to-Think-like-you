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
