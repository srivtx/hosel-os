from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/rent",
    tags=["rent"]
)

@router.post("/", response_model=schemas.RentPayment)
def create_rent_payment(payment: schemas.RentPaymentCreate, db: Session = Depends(database.get_db)):
    db_payment = models.RentPayment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[schemas.RentPayment])
def read_rent_payments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    payments = db.query(models.RentPayment).offset(skip).limit(limit).all()
    return payments

@router.get("/pending", response_model=List[schemas.RentPayment])
def read_pending_payments(db: Session = Depends(database.get_db)):
    return db.query(models.RentPayment).filter(models.RentPayment.status != "paid").all()
