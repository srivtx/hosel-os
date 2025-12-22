from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

@router.get("/", response_model=List[schemas.Room])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    rooms = db.query(models.Room).offset(skip).limit(limit).all()
    
    # Dynamic Occupancy Calculation
    for room in rooms:
        student_count = db.query(models.Student).filter(models.Student.room_number == room.number).count()
        room.current_occupancy = student_count
        
    return rooms

@router.get("/{room_id}", response_model=schemas.Room)
def read_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
