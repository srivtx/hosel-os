import sqlite3

def migrate():
    conn = sqlite3.connect('hostel.db')
    cursor = conn.cursor()
    
    print("Creating parcels table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS parcels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        courier VARCHAR,
        pickup_code VARCHAR,
        status VARCHAR DEFAULT 'Waiting',
        arrival_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        collected_at DATETIME,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
