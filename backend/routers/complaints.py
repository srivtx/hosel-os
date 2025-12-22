from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/complaints",
    tags=["complaints"]
)

@router.post("/", response_model=schemas.Complaint)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(database.get_db)):
    db_complaint = models.Complaint(**complaint.dict())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.get("/", response_model=List[schemas.Complaint])
def read_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    complaints = db.query(models.Complaint).offset(skip).limit(limit).all()
    return complaints

@router.put("/{complaint_id}", response_model=schemas.Complaint)
def update_complaint(complaint_id: int, complaint: schemas.ComplaintUpdate, db: Session = Depends(database.get_db)):
    db_complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if db_complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    for key, value in complaint.dict(exclude_unset=True).items():
        setattr(db_complaint, key, value)
    
    db.commit()
    db.refresh(db_complaint)
    return db_complaint
