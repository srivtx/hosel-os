from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/discipline",
    tags=["discipline"]
)

@router.post("/", response_model=schemas.DisciplineLog)
def create_discipline_log(log: schemas.DisciplineLogCreate, db: Session = Depends(database.get_db)):
    db_log = models.DisciplineLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/", response_model=List[schemas.DisciplineLog])
def read_discipline_logs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    logs = db.query(models.DisciplineLog).offset(skip).limit(limit).all()
    return logs
