from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
try:
    from backend.database import get_db
    from backend.models import MarketplaceItem, Student
    from backend.routers.students import get_current_student
except ImportError:
    from database import get_db
    from models import MarketplaceItem, Student
    from routers.students import get_current_student

router = APIRouter(
    prefix="/marketplace",
    tags=["marketplace"]
)

# Pydantic Models
class ItemCreate(BaseModel):
    title: str
    description: str
    price: float
    condition: str
    image_url: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: float
    condition: str
    status: str
    image_url: Optional[str]
    created_at: datetime
    seller_name: str
    seller_room: str

    class Config:
        orm_mode = True

@router.get("/items", response_model=List[ItemResponse])
def get_available_items(db: Session = Depends(get_db)):
    items = db.query(MarketplaceItem).filter(MarketplaceItem.status == "Available").order_by(MarketplaceItem.created_at.desc()).all()
    
    # Enrich response with seller details
    response = []
    for item in items:
        response.append({
            "id": item.id,
            "seller_id": item.seller_id,
            "title": item.title,
            "description": item.description,
            "price": item.price,
            "condition": item.condition,
            "status": item.status,
            "image_url": item.image_url,
            "created_at": item.created_at,
            "seller_name": item.seller.name if item.seller else "Unknown",
            "seller_room": item.seller.room_number if item.seller else "N/A"
        })
    return response

@router.get("/my-items", response_model=List[ItemResponse])
def get_my_items(current_student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    items = db.query(MarketplaceItem).filter(MarketplaceItem.seller_id == current_student.id).order_by(MarketplaceItem.created_at.desc()).all()
    
    response = []
    for item in items:
        response.append({
            "id": item.id,
            "seller_id": item.seller_id,
            "title": item.title,
            "description": item.description,
            "price": item.price,
            "condition": item.condition,
            "status": item.status,
            "image_url": item.image_url,
            "created_at": item.created_at,
            "seller_name": current_student.name,
            "seller_room": current_student.room_number
        })
    return response

@router.post("/items", response_model=ItemResponse)
def create_item(item: ItemCreate, current_student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    db_item = MarketplaceItem(
        seller_id=current_student.id,
        title=item.title,
        description=item.description,
        price=item.price,
        condition=item.condition,
        image_url=item.image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return {
        "id": db_item.id,
        "seller_id": db_item.seller_id,
        "title": db_item.title,
        "description": db_item.description,
        "price": db_item.price,
        "condition": db_item.condition,
        "status": db_item.status,
        "image_url": db_item.image_url,
        "created_at": db_item.created_at,
        "seller_name": current_student.name,
        "seller_room": current_student.room_number
    }

@router.put("/items/{item_id}/sold")
def mark_as_sold(item_id: int, current_student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.seller_id != current_student.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    item.status = "Sold"
    db.commit()
    return {"message": "Marked as sold"}

@router.delete("/items/{item_id}")
def delete_item(item_id: int, current_student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.seller_id != current_student.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
