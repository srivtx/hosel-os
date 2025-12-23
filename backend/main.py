from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from . import models, database
    from .routers import students, rent, discipline, laundry, complaints, gate_pass, monitoring, attendance, parcels, mess, rooms, marketplace
except ImportError:
    import models, database
    from routers import students, rent, discipline, laundry, complaints, gate_pass, monitoring, attendance, parcels, mess, rooms, marketplace

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Auto-seed database if empty (Fix for Render Free Tier)
try:
    from .seed import seed_rooms
    seed_rooms()
except ImportError as e:
    # Fallback if running locally as script, but log it just in case
    print(f"Auto-seeding skipped (ImportError): {e}")
except Exception as e:
    print(f"Seeding failed: {e}")

app = FastAPI(title="Hostel Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(rent.router)
app.include_router(discipline.router)
app.include_router(laundry.router)
app.include_router(complaints.router)
app.include_router(gate_pass.router)
app.include_router(monitoring.router)
app.include_router(attendance.router)
app.include_router(parcels.router)
app.include_router(mess.router)
app.include_router(rooms.router)
app.include_router(marketplace.router)

@app.get("/")
def read_root():
    return {"message": "Hostel Management System API is running"}

@app.post("/seed")
def seed_database():
    try:
        try:
            from backend.seed import seed_rooms
        except ImportError:
            from seed import seed_rooms
            
        result = seed_rooms()
        return {"message": "Seeding operation completed", "details": result}
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}
