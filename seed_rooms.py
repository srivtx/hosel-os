import sys
import os
# Add the current directory (project root) to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend import models, database
from sqlalchemy.orm import Session

def seed_rooms():
    db = database.SessionLocal()
    
    # Check if rooms exist
    if db.query(models.Room).count() > 0:
        print("Rooms already seeded!")
        return

    print("Seeding Rooms...")
    
    rooms_data = []
    
    # Floor 1 (101-105)
    for i in range(1, 6):
        rooms_data.append(models.Room(number=f"10{i}", capacity=2, current_occupancy=0))
        
    # Floor 2 (201-205)
    for i in range(1, 6):
        rooms_data.append(models.Room(number=f"20{i}", capacity=2, current_occupancy=1)) # Partially full
        
    # Floor 3 (301-305)
    for i in range(1, 6):
        rooms_data.append(models.Room(number=f"30{i}", capacity=1, current_occupancy=1)) # Full

    db.add_all(rooms_data)
    db.commit()
    print(f"Successfully added {len(rooms_data)} rooms!")
    db.close()

if __name__ == "__main__":
    seed_rooms()
