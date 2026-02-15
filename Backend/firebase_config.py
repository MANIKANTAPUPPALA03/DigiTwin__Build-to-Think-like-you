import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK (graceful — won't crash if key is missing)
_firebase_key_path = os.getenv("FIREBASE_KEY_PATH", "firebase-key.json")
db = None

try:
    if not firebase_admin._apps:
        if os.path.exists(_firebase_key_path):
            cred = credentials.Certificate(_firebase_key_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print(f"✅ Firebase initialized with {_firebase_key_path}")
        else:
            print(f"⚠️  Firebase key not found at '{_firebase_key_path}' — Firestore disabled")
            print("   Download it from Firebase Console → Project Settings → Service Accounts")
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
