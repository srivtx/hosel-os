from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class StudentBase(BaseModel):
    name: str
    phone: str
    room_number: str
    move_in_date: date
    is_active: bool = True

class StudentCreate(StudentBase):
    password: str

class Student(StudentBase):
    id: int
    password: str # Include password in response just for verification in this simple app, or remove for security

    class Config:
        orm_mode = True

class StudentLogin(BaseModel):
    phone: str
    password: str

class RoomBase(BaseModel):
    number: str
    capacity: int

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    current_occupancy: int = 0

    class Config:
        from_attributes = True

class RentPaymentBase(BaseModel):
    amount: float
    month: str
    status: str
    payment_date: Optional[date] = None
    notes: Optional[str] = None

class RentPaymentCreate(RentPaymentBase):
    student_id: int

class RentPayment(RentPaymentBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class DisciplineLogBase(BaseModel):
    category: str
    description: str
    penalty_amount: float = 0.0

class DisciplineLogCreate(DisciplineLogBase):
    student_id: int
    incident_date: Optional[datetime] = None

class DisciplineLog(DisciplineLogBase):
    id: int
    student_id: int
    incident_date: datetime

    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    category: str
    description: str

class ComplaintCreate(ComplaintBase):
    student_id: int

class ComplaintUpdate(BaseModel):
    status: str
    resolved_at: Optional[datetime] = None

class Complaint(ComplaintBase):
    id: int
    student_id: int
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LaundryUsageBase(BaseModel):
    machine_id: int
    slot: str

class LaundryUsageCreate(LaundryUsageBase):
    student_id: int

class LaundryUsage(LaundryUsageBase):
    id: int
    student_id: int
    usage_date: datetime

    class Config:
        from_attributes = True

class GateEntryBase(BaseModel):
    event_type: str

class GateEntryCreate(GateEntryBase):
    student_id: int

class GateEntry(GateEntryBase):
    id: int
    student_id: int
    timestamp: datetime
    student_name: Optional[str] = None # Helper for frontend

    class Config:
        from_attributes = True

class ElectricityReadingBase(BaseModel):
    room_number: str
    reading_date: date
    units_kwh: float

class ElectricityReading(ElectricityReadingBase):
    id: int

    class Config:
        from_attributes = True

class AttendanceLogBase(BaseModel):
    latitude: float
    longitude: float

class AttendanceLogCreate(AttendanceLogBase):
    pass

class AttendanceLog(AttendanceLogBase):
    id: int
    student_id: int
    date: date
    time: datetime
    status: str
    distance_meters: float

    class Config:
        from_attributes = True

class LocationSetting(BaseModel):
    latitude: float
    longitude: float

class ParcelBase(BaseModel):
    courier: str
    student_id: int

class ParcelCreate(ParcelBase):
    pass

class Parcel(ParcelBase):
    id: int
    pickup_code: str
    status: str
    arrival_time: datetime
    collected_at: Optional[datetime] = None
    
    # Helper to show student name in UI if needed, but relationship handles it in ORM
    
    class Config:
        from_attributes = True
