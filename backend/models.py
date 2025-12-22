from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Float
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
try:
    from .database import Base
except ImportError:
    from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    room_number = Column(String)
    move_in_date = Column(Date)
    move_out_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    password = Column(String, default="password") # Default password for existing users
    meal_credits = Column(Integer, default=30)
    face_encoding = Column(Text, nullable=True)

    rent_payments = relationship("RentPayment", back_populates="student")
    discipline_logs = relationship("DisciplineLog", back_populates="student")
    complaints = relationship("Complaint", back_populates="student")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    capacity = Column(Integer)
    current_occupancy = Column(Integer, default=0)

class RentPayment(Base):
    __tablename__ = "rent_payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    amount = Column(Float)
    month = Column(String) # Format: YYYY-MM
    status = Column(String) # paid, unpaid, late
    payment_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    student = relationship("Student", back_populates="rent_payments")

class DisciplineLog(Base):
    __tablename__ = "discipline_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    incident_date = Column(DateTime, default=func.now())
    category = Column(String) # Noise, Damage, Late Entry, etc
    description = Column(Text)
    penalty_amount = Column(Float, default=0.0)

    student = relationship("Student", back_populates="discipline_logs")

class LaundryUsage(Base):
    __tablename__ = "laundry_usage"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    machine_id = Column(Integer) # 1, 2, etc.
    usage_date = Column(DateTime, default=func.now())
    slot = Column(String) # e.g., "Morning", "Afternoon"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    category = Column(String) # Water, Electricity, Cleanliness
    description = Column(Text)
    status = Column(String, default="open") # open, resolved
    created_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="complaints")

class GateEntry(Base):
    __tablename__ = "gate_entries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    timestamp = Column(DateTime, default=func.now())
    event_type = Column(String) # "IN" or "OUT"

    student = relationship("Student")

class ElectricityReading(Base):
    __tablename__ = "electricity_readings"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String) # Storing room number directly for simplicity in simulation
    reading_date = Column(Date)
    units_kwh = Column(Float)

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date)
    time = Column(DateTime)
    status = Column(String) # "Present" or "Away"
    latitude = Column(Float)
    longitude = Column(Float)
    distance_meters = Column(Float)

    student = relationship("Student")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    courier = Column(String)
    pickup_code = Column(String)
    status = Column(String, default="Waiting") # Waiting, Collected
    arrival_time = Column(DateTime, default=datetime.now)
    collected_at = Column(DateTime, nullable=True)

    student = relationship("Student")

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String)
    description = Column(Text)
    price = Column(Float)
    condition = Column(String) # New, Like New, Used, Damaged
    status = Column(String, default="Available") # Available, Sold
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

    seller = relationship("Student")
