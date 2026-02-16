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
    Uses direct HTTP POST to Google's token endpoint (works reliably with 'postmessage' redirect_uri).
    """
    try:
        import requests as http_requests
        import json

        # Get client credentials from env vars or credentials.json
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

        if not client_id or not client_secret:
            # Fallback: read from credentials.json
            creds_path = "credentials.json"
            if os.path.exists(creds_path):
                with open(creds_path) as f:
                    creds_data = json.load(f)
                    web = creds_data.get("web", {})
                    client_id = web.get("client_id")
                    client_secret = web.get("client_secret")
            else:
                print("❌ No GOOGLE_CLIENT_ID/SECRET env vars and no credentials.json found!")
                return None

        # Direct token exchange with Google
        token_response = http_requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

        if token_response.status_code != 200:
            print(f"❌ Token exchange failed: {token_response.status_code} - {token_response.text}")
            return None

        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if access_token:
            print(f"✅ Token exchange successful, got access_token (len={len(access_token)})")
            return access_token
        else:
            print(f"❌ No access_token in response: {token_data}")
            return None

    except Exception as e:
        print(f"❌ Token exchange error: {e}")
        import traceback
        traceback.print_exc()
        return None

