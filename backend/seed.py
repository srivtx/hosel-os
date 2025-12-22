try:
    from . import models, database
except ImportError:
    import models, database
from sqlalchemy.orm import Session

def seed_rooms():
    db = database.SessionLocal()
    
    try:
        # Check if rooms exist
        # We wrap in try-except in case table doesn't exist yet (though create_all runs before)
        if db.query(models.Room).count() > 0:
            print("Rooms already seeded!")
            return
    except Exception as e:
        print(f"Error checking rooms: {e}")
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

    try:
        db.add_all(rooms_data)
        db.commit()
        print(f"Successfully added {len(rooms_data)} rooms!")
    except Exception as e:
        print(f"Error seeding rooms: {e}")
        db.rollback()
    finally:
        db.close()
