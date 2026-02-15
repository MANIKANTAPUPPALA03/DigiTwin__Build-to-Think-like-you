import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
# Priority 1: FIREBASE_CREDENTIALS env var (JSON string)
# Priority 2: FIREBASE_KEY_PATH file path (default: firebase-key.json)

firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
_firebase_key_path = os.getenv("FIREBASE_KEY_PATH", "firebase-key.json")
db = None

try:
    if not firebase_admin._apps:
        cred = None
        
        if firebase_creds_json:
            # Load from JSON string (Release/Cloud environment)
            import json
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            print("✅ Firebase initialized from FIREBASE_CREDENTIALS env var")
        elif os.path.exists(_firebase_key_path):
            # Load from file (Local environment)
            cred = credentials.Certificate(_firebase_key_path)
            print(f"✅ Firebase initialized from file: {_firebase_key_path}")
        else:
            print(f"⚠️  Firebase key not found (Env: FIREBASE_CREDENTIALS or File: {_firebase_key_path}) — Firestore disabled")

        if cred:
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            
except Exception as e:
    print(f"⚠️  Firebase initialization failed: {e}")


def _ensure_db():
    """Raise a clear error if Firestore is not available."""
    if db is None:
        raise RuntimeError(
            "Firestore is not initialized. Place your firebase-key.json in the backend/ directory."
        )


def get_user_tasks_ref(user_email: str):
    """Get reference to a user's tasks collection."""
    _ensure_db()
    return db.collection("users").document(user_email).collection("tasks")


def get_user_emails_ref(user_email: str):
    """Get reference to a user's cached emails collection."""
    _ensure_db()
    return db.collection("users").document(user_email).collection("emails")


def get_user_doc(user_email: str):
    """Get reference to a user document."""
    _ensure_db()
    return db.collection("users").document(user_email)
