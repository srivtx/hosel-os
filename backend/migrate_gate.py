import sqlite3

def migrate():
    conn = sqlite3.connect('hostel.db')
    cursor = conn.cursor()
    
    # Enable Foreign Keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    print("Creating gate_entries table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gate_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type VARCHAR,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
