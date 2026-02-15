# 📘 DigiTwin Project Documentation

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Framer Motion
- **State/Auth**: React Context API + Firebase Auth
- **Routing**: React Router DOM (v6)

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn
- **AI Engine**: Groq (Llama 3.3 70B Versatile)
- **Database**: Google Firestore (NoSQL)
- **Email/Calendar**: Gmail API + Google Calendar API (via `google-api-python-client`)

---

## 🔌 API Endpoints
All endpoints are prefixed with the backend URL (e.g., `https://your-app.onrender.com`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Check if backend is running. |
| **GET** | `/emails` | Fetch recent emails from Gmail. |
| **GET** | `/tasks` | Get all pending actions/tasks. |
| **POST** | `/tasks` | Create a new manual task. |
| **GET** | `/calendar/events` | Fetch Google Calendar events & Holidays. |
| **GET** | `/priority-tasks` | Get tasks organized by priority (High/Med/Low). |
| **POST** | `/update-priority` | Drag-and-drop priority update. |
| **POST** | `/complete/{task_id}` | Mark a task as completed. |
| **DELETE** | `/delete/{task_id}` | Delete a task permanently. |
| **POST** | `/agent/run` | **The Magic Button**: Scans emails, checks calendar, runs AI, creates tasks. |
| **POST** | `/chat` | Chat with DigiTwin AI (Context-aware). |

---

## 🚀 Deployment Guide

### **1. Backend (Render)**
- **Repo**: Connect your GitHub repo.
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
- **Environment Variables**:
  - `GROQ_API_KEY`: *(From your .env)*
  - `FIREBASE_CREDENTIALS`: *(Content of `backend/firebase-key.json`)*

### **2. Frontend (Firebase Hosting)**
- **Install CLI**: `npm install -g firebase-tools`
- **Login**: `firebase login`
- **Init**: `firebase init hosting` (Public dir: `frontend/dist`, SPA: `Yes`)
- **Configure**: Create `frontend/.env.production`:
  ```env
  VITE_API_URL=https://your-backend-url.onrender.com
  VITE_FIREBASE_API_KEY=...
  # ... other firebase configs
  ```
- **Deploy**:
  ```bash
  cd frontend
  npm run build
  cd ..
  firebase deploy --only hosting
  ```

---

## 🔑 Environment Variables Reference

### **Backend (.env / Render)**
```ini
GROQ_API_KEY=gsk_...
FIREBASE_CREDENTIALS={...json_content...}
# GOOGLE_CREDENTIALS is NOT needed (Handled by Frontend Token)
```

### **Frontend (.env / .env.production)**
```ini
VITE_API_URL=http://localhost:8000 (or https://your-backend.onrender.com)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
