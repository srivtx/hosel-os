from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/laundry",
    tags=["laundry"]
)

@router.post("/", response_model=schemas.LaundryUsage)
def log_laundry_usage(usage: schemas.LaundryUsageCreate, db: Session = Depends(database.get_db)):
    db_usage = models.LaundryUsage(**usage.dict())
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

@router.get("/", response_model=List[schemas.LaundryUsage])
def read_laundry_usage(skip: int = 0, limit: int = 100, date: str = None, db: Session = Depends(database.get_db)):
    query = db.query(models.LaundryUsage)
    if date:
        # Filter where usage_date contains the date string (simple text matching for SQLite date strings)
        # In a robust system, we would cast to Date type, but SQLite stores as strings often.
        # Assuming format YYYY-MM-DD
        query = query.filter(models.LaundryUsage.usage_date.like(f"{date}%"))
    
    usage = query.offset(skip).limit(limit).all()
    return usage
