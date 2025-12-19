from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
import random
from .. import models, schemas, database

router = APIRouter(
    prefix="/monitoring",
    tags=["monitoring"]
)

@router.post("/simulate")
def simulate_readings(db: Session = Depends(database.get_db)):
    # 1. Get all unique rooms from students
    students = db.query(models.Student).all()
    rooms = set(s.room_number for s in students if s.room_number)
    
    # 2. Clear existing readings to avoid duplicates in this simple sim
    db.query(models.ElectricityReading).delete()
    
    # 3. Generate data for last 30 days
    today = date.today()
    readings = []
    
    for room in rooms:
        for i in range(30):
            day = today - timedelta(days=i)
            # Random usage between 2.0 and 12.0 kWh
            usage = round(random.uniform(2.0, 12.0), 2)
            
            # Weekend spike simulation
            if day.weekday() >= 5: 
                usage += random.uniform(1.0, 3.0)
                
            readings.append(models.ElectricityReading(
                room_number=room,
                reading_date=day,
                units_kwh=usage
            ))
            
    db.add_all(readings)
    db.commit()
    
    return {"message": f"Simulated {len(readings)} readings for {len(rooms)} rooms"}

@router.get("/stats/{student_id}")
def get_student_stats(student_id: int, db: Session = Depends(database.get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    readings = db.query(models.ElectricityReading)\
        .filter(models.ElectricityReading.room_number == student.room_number)\
        .order_by(models.ElectricityReading.reading_date)\
        .all()
        
    total_units = sum(r.units_kwh for r in readings)
    avg_daily = total_units / len(readings) if readings else 0
    projected_units = avg_daily * 30
    
    # Simple rate: ₹10 per unit
    projected_bill = round(projected_units * 10, 2)
    current_bill = round(total_units * 10, 2)
    
    return {
        "room_number": student.room_number,
        "readings": readings,
        "total_units": round(total_units, 2),
        "current_bill": current_bill,
        "projected_bill": projected_bill,
        "avg_daily": round(avg_daily, 2)
    }

@router.get("/admin-stats")
def get_admin_stats(db: Session = Depends(database.get_db)):
    readings = db.query(models.ElectricityReading).all()
    
    # Aggregate Totals
    total_units = sum(r.units_kwh for r in readings)
    total_bill = round(total_units * 10, 2) # Rate 10
    
    # Group by Room
    room_stats = {}
    for r in readings:
        if r.room_number not in room_stats:
            room_stats[r.room_number] = 0
        room_stats[r.room_number] += r.units_kwh
        
    # Convert to list and sort by usage desc
    sorted_rooms = []
    for room, units in room_stats.items():
        sorted_rooms.append({
            "room_number": room,
            "total_units": round(units, 2),
            "bill": round(units * 10, 2)
        })
    sorted_rooms.sort(key=lambda x: x['total_units'], reverse=True)
    
    return {
        "total_units": round(total_units, 2),
        "total_bill": total_bill,
        "room_breakdown": sorted_rooms
    }
