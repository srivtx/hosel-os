import sqlite3

def migrate():
    conn = import os; sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hostel.db'))
    cursor = conn.cursor()
    
    print("Creating electricity_readings table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS electricity_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number VARCHAR,
        reading_date DATE,
        units_kwh FLOAT
    )
    """)
    
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
