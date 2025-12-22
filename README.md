# 🏨 HostelOS
> **The Future of Hostel Management.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

**HostelOS** upgrades the traditional hostel experience into a high-tech, digital ecosystem. From **3D Digital Twins** of the building to a student-run **Marketplace**, we automate the boring stuff so you can focus on the living.

---

## ✨ Visual Tour

### 🖥️ Admin Dashboard
*Real-time overview of occupancy, energy, and issues.*
![Dashboard](./screenshots/dashboard.png)

### 🌍 3D Digital Twin
*Interactive, real-time visualization of hostel rooms and occupancy.*
![3D Digital Twin](./screenshots/3d_twin.png)

### 🛍️ Student Marketplace
*A private, safe economy for students to buy and sell items.*
![Marketplace](./screenshots/marketplace.png)

---

## 🚀 Key Features

*   **🌍 3D Digital Twin**: Navigate your hostel like a video game. See room status (Red/Yellow/Green) in real-time.
*   **🛍️ Student Marketplace**: A specialized platform for students to sell books, gadgets, and furniture. **Students Only!**
*   **🤖 AI Face Mess System**: Futuristic dining access using Face ID simulation and credit tracking.
*   **📍 Smart Attendance**: Geolocation-based check-ins. No more long queues for attendance.
*   **� Digital Mailroom**: Secure package tracking. Get a PIN, show it, take your parcel.
*   **⚡ IoT Energy Monitoring**: Track simulated electricity usage per room and find power hogs.
*   **🎟️ Digital Gate Pass**: QR-code based exit and entry logs.

---

## 🛠️ The Tech Stack

*   **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Recharts, React Three Fiber.
*   **Backend**: FastAPI (Python), SQLAlchemy, SQLite.
*   **Architecture**: Modular REST API with Role-Based Access Control (RBAC).

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialize Database
python migrate_db.py
python migrate_parcels.py
python migrate_marketplace.py 
# (Run other migrate scripts as needed)

uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## � Demo Credentials

| Portal | Username / Phone | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin` |
| **Student** | `9328994892` | `9328994892` |

---

*Built with ❤️ for the Entupr Hackathon.*
