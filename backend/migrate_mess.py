import sqlite3

def migrate():
    conn = import os; sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hostel.db'))
    cursor = conn.cursor()
    
    print("Migrating Student table for Mess System...")
    
    try:
        cursor.execute("ALTER TABLE students ADD COLUMN meal_credits INTEGER DEFAULT 30")
        print("Added meal_credits column.")
    except sqlite3.OperationalError:
        print("meal_credits column already exists.")

    try:
        cursor.execute("ALTER TABLE students ADD COLUMN face_encoding TEXT")
        print("Added face_encoding column.")
    except sqlite3.OperationalError:
        print("face_encoding column already exists.")
    
    conn.commit()
    conn.close()
    print("Mess Migration successful.")

if __name__ == "__main__":
    migrate()
