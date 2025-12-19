import sqlite3

def migrate():
    conn = sqlite3.connect('hostel.db')
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
