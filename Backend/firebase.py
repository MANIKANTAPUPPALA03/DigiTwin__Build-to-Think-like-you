# firebase.py
import os
from pathlib import Path
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, db

# ---------- LOAD ENV ----------
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# ---------- INIT FIREBASE (only once) ----------
if not firebase_admin._apps:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
    })

    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://digitwin-c1f5c-default-rtdb.firebaseio.com"
    })

# ---------- EXPORT DB ----------
realtime_db = db
