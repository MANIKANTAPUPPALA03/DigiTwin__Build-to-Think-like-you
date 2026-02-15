
# 🧠 DigiTwin - AI Productivity Agent

DigiTwin is an intelligent personal agent that helps you manage your digital life. It connects with your **Gmail** and **Google Calendar** to automatically organize your tasks, schedule meetings, and help you focus on what matters.

## 🚀 Features
- **AI Task Extraction**: Automatically converts emails into actionable tasks.
- **Smart Calendar**: Syncs with Google Calendar (Events + Holidays) to prevent conflicts.
- **Priority Board**: Drag-and-drop interface to manage tasks by urgency.
- **Interactive Chat**: Ask the AI about your schedule, tasks, or the project itself.

---

## 🛠️ Project Structure
- `frontend/`: React + Vite + TailwindCSS
- `backend/`: FastAPI + Firebase Admin + Groq AI

---

## ⚡ Deployment Guide

### 1. Prerequisites
- **Node.js** & **Python 3.10+**
- **Firebase Project**: Firestore & Auth enabled.
- **Google Cloud Console**: Gmail API & Calendar API enabled.
- **Groq API Key**: For the AI engine.

### 2. Backend Deployment (Render / Railway)
1. Push this repo to GitHub.
2. Create a new Web Service on **Render**.
3. Point to the `backend` directory (Root Directory: `backend`).
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
6. **Environment Variables** (Add these in Render Dashboard):
   - `GROQ_API_KEY`: `your_groq_key`
   - `FIREBASE_CREDENTIALS`: (Paste contents of `firebase-key.json` here)
   - `GOOGLE_CREDENTIALS`: (Paste contents of `credentials.json` here)
   *(Note: You may need to modify `main.py` to read credentials from env vars instead of files for production, or use Render's "Secret Files" feature to upload the JSON files directly.)*

### 3. Frontend Deployment (Firebase Hosting)
1. Install Firebase tools globally (if not installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Hosting (if needed, or just skip if firebase.json is present):
   ```bash
   firebase init hosting
   ```
   *(Select your existing project, use `frontend/dist` as public directory, configure as single-page app: Yes)*

4. **Build and Deploy**:
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```
   *(Ensure you have set up your `.env.production` in `frontend/` before building! For Firebase Hosting, environmental variables must be baked into the build.)*

**Important**: Since Firebase Hosting serves static files, you MUST create a `.env.production` file in the `frontend` directory with your real backend URL and Firebase config before running `npm run build`.

Example `frontend/.env.production`:
```
VITE_API_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=...
...
```

---

## 🏃 Run Locally
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 👥 The Team
Built with ❤️ by **Lohitha, Chandana, Uday, and Manikanta** for the Google AI Agentathon.
