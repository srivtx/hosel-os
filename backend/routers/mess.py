from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
# import face_recognition
import random
import time
try: from .. import models, schemas, database
except ImportError:
    import sys
    sys.path.append("..")
    import models, schemas, database

router = APIRouter(
    prefix="/mess",
    tags=["mess"]
)

@router.post("/enroll/{student_id}")
async def enroll_face(student_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    # Simulation Mode
    time.sleep(1) 
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student.face_encoding = "simulated_encoding_123"
    db.commit()
    return {"message": "Face enrolled successfully (Simulation Mode)"}

@router.post("/verify")
async def verify_face(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    # Simulation Mode
    time.sleep(1.5)
    
    # 70% chance of success for demo purposes
    if random.choice([True, True, True, False, True, False, True]): 
        student = db.query(models.Student).filter(models.Student.meal_credits > 0).first()
        if not student:
             return {"status": "denied", "reason": "No students with credits found"}

        student.meal_credits -= 1
        db.commit()
        
        return {
            "status": "authorized",
            "student": student.name,
            "credits": student.meal_credits
        }
    else:
        return {
            "status": "denied",
            "reason": "Face Not Recognized"
        }

@router.get("/credits/{student_id}")
def get_credits(student_id: int, db: Session = Depends(database.get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    return {"credits": student.meal_credits if student else 0}
