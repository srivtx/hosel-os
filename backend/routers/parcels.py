from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import random
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/parcels",
    tags=["parcels"]
)

@router.post("/receive", response_model=schemas.Parcel)
def receive_parcel(parcel: schemas.ParcelCreate, db: Session = Depends(database.get_db)):
    # Generate 4-digit code
    code = str(random.randint(1000, 9999))
    
    new_parcel = models.Parcel(
        student_id=parcel.student_id,
        courier=parcel.courier,
        pickup_code=code,
        status="Waiting",
        arrival_time=datetime.now()
    )
    db.add(new_parcel)
    db.commit()
    db.refresh(new_parcel)
    return new_parcel

@router.get("/pending", response_model=list[schemas.Parcel])
def get_pending_parcels(db: Session = Depends(database.get_db)):
    # Return all waiting parcels (Joined with Student for UI convenience if needed, 
    # but for now returning raw parcel objects. Frontend can match names or we can upgrade schema)
    return db.query(models.Parcel).filter(models.Parcel.status == "Waiting").all()

@router.get("/my-parcels/{student_id}", response_model=list[schemas.Parcel])
def get_my_parcels(student_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Parcel).filter(
        models.Parcel.student_id == student_id,
        models.Parcel.status == "Waiting"
    ).all()

@router.post("/collect/{parcel_id}")
def collect_parcel(parcel_id: int, db: Session = Depends(database.get_db)):
    parcel = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
        
    parcel.status = "Collected"
    parcel.collected_at = datetime.now()
    db.commit()
    return {"message": "Parcel marked as collected"}
