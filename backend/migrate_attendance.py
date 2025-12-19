import sqlite3

def migrate():
    conn = sqlite3.connect('hostel.db')
    cursor = conn.cursor()
    
    print("Creating attendance_logs table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date DATE,
        time TIMESTAMP,
        status VARCHAR,
        latitude FLOAT,
        longitude FLOAT,
        distance_meters FLOAT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
