# DEPLOY IN 2 MINUTES - COPY THESE COMMANDS ⚡

## Step 1: Deploy Backend to Render (1 minute)
1. Go to: https://render.com (Sign in with GitHub)
2. Click "New +" → "Web Service"
3. Connect this repo
4. Fill in:
   - Name: digitwin-backend
   - Root Directory: Backend
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
5. Add Environment Variables:
   - CLIENT_ID = (your Google OAuth client ID)
   - CLIENT_SECRET = (your secret)
6. Click "Create Web Service"

✅ Wait 2 min, copy the URL: https://digitwin-backend-xxxx.onrender.com

## Step 2: Deploy Frontend to Vercel (30 seconds)

```bash
cd frontend
npm run build
npx vercel --prod
```

Follow prompts, enter through defaults.

✅ LIVE URL: https://your-project.vercel.app

---

## EVEN FASTER Alternative:

**Netlify Drop (10 seconds for frontend):**
1. cd frontend && npm run build
2. Go to: https://app.netlify.com/drop
3. Drag the `dist` folder
4. DONE!

**Backend stays local for demo** - just show it running!

---

## Update Backend URL (if needed)
After backend deploys, update frontend/.env.production with real URL, then redeploy frontend.

TOTAL TIME: 3 MINUTES! 🚀
