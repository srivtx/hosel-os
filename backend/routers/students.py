from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/students",
    tags=["students"]
)

@router.post("/login", response_model=schemas.Student)
def login_student(credentials: schemas.StudentLogin, db: Session = Depends(database.get_db)):
    student = db.query(models.Student).filter(models.Student.phone == credentials.phone).first()
    if not student:
        raise HTTPException(status_code=400, detail="Incorrect phone number")
    
    # Simple direct comparison for prototype. In production, use bcrypt.
    if student.password != credentials.password:
        raise HTTPException(status_code=400, detail="Incorrect password")
        
    return student

@router.post("/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(database.get_db)):
    # Default password to phone number if not provided (handling old clients or manual creation) purely logic-side
    # Schema requires password now, so it must be passed
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}", response_model=schemas.Student)
def read_student(student_id: int, db: Session = Depends(database.get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/rooms/", tags=["rooms"], response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(database.get_db)):
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/rooms/", tags=["rooms"], response_model=List[schemas.Room])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    rooms = db.query(models.Room).offset(skip).limit(limit).all()
    return rooms
