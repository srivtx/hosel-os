from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas, database

router = APIRouter(
    prefix="/gate",
    tags=["gate"]
)

@router.post("/scan", response_model=schemas.GateEntry)
def scan_qr(student_id: int, db: Session = Depends(database.get_db)):
    # 1. Check if student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Get last entry to toggle status
    last_entry = db.query(models.GateEntry)\
        .filter(models.GateEntry.student_id == student_id)\
        .order_by(desc(models.GateEntry.timestamp))\
        .first()

    # Default to OUT if no history (assuming they are inside initially)
    # OR: If last was IN, now is OUT. If last was OUT, now is IN.
    new_event_type = "OUT"
    if last_entry and last_entry.event_type == "OUT":
        new_event_type = "IN"
    elif last_entry and last_entry.event_type == "IN":
        new_event_type = "OUT"
    
    # 3. Create new log
    new_entry = models.GateEntry(
        student_id=student_id,
        event_type=new_event_type
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    # Inject student name for easier frontend display (if schema supports it, relying on ORM relation usually better but schema mismatch often happens)
    # We added student_name to schema as Optional
    response = schemas.GateEntry.from_orm(new_entry)
    response.student_name = student.name 
    
    return response

@router.get("/logs", response_model=List[schemas.GateEntry])
def read_logs(skip: int = 0, limit: int = 50, db: Session = Depends(database.get_db)):
    logs = db.query(models.GateEntry).order_by(desc(models.GateEntry.timestamp)).offset(skip).limit(limit).all()
    
    # Manual join for names effectively if needed, or rely on ORM lazy load if Pydantic supports it
    # Pydantic v2 from_attributes handles lazy loading often, but let's be safe
    result = []
    for log in logs:
        s_log = schemas.GateEntry.from_orm(log)
        if log.student:
            s_log.student_name = log.student.name
        result.append(s_log)
        
    return result

@router.delete("/cleanup")
def cleanup_logs(days: int = 60, db: Session = Depends(database.get_db)):
    if days < 1:
        raise HTTPException(status_code=400, detail="Days must be positive")
        
    cutoff_date = datetime.now() - timedelta(days=days)
    
    deleted_count = db.query(models.GateEntry)\
        .filter(models.GateEntry.timestamp < cutoff_date)\
        .delete(synchronize_session=False)
        
    db.commit()
    
    return {"message": f"Deleted {deleted_count} logs older than {days} days"}
