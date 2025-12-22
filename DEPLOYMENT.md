# 🚀 HostelOS Deployment Guide

Since **HostelOS** is a full-stack app (React + Python), we need to host the two parts separately. This guide uses free-tier services.

---

## 🏗️ 1. Deploy Backend (Render)
*Render is great for Python/FastAPI apps.*

1.  **Push your code to GitHub** (You just did this!).
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a **New Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
5.  Click **Deploy**.
6.  **Copy the URL** Render gives you (e.g., `https://hostel-backend.onrender.com`).

---

## 🎨 2. Deploy Frontend (Vercel)
*Vercel is best for React/Vite apps.*

1.  Go to [vercel.com](https://vercel.com) and **Add New Project**.
2.  Import your GitHub repository.
3.  **Project Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend` (Click "Edit" next to Root Directory and select `frontend`).
4.  **Environment Variables**:
    *   Add a variable named `VITE_API_URL`.
    *   Value: The **Render Backend URL** you copied in Step 1 (e.g., `https://hostel-backend.onrender.com`).
    *   *Note: I will update your code to use this variable.*
5.  Click **Deploy**.

---

## 🔗 3. Connect Them
Once both are live:
1.  Open your **Frontend Vercel URL** in a browser.
2.  It should load and talk to your Render backend automatically!

---

### ⚡ Quick Alternative: Ngrok (Temporary Demo)
If you just want to show it to a friend *right now* without deploying:
1.  Run the backend locally: `uvicorn backend.main:app --reload`
2.  Run the frontend locally: `npm run dev`
3.  Install ngrok and run: `ngrok http 5173`
4.  Share the link ngrok gives you.

---

## 🌱 Post-Deployment: Seeding the Database
When you first deploy, the database is empty (No Rooms).
To fix this, go to your **Render Dashboard** -> **Shell** (tab on the left) and run:

```bash
python seed_rooms.py
```

This will populate the rooms, and your 3D view will light up! ✨
