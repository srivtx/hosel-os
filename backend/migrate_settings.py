import sqlite3

def migrate():
    conn = import os; sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hostel.db'))
    cursor = conn.cursor()
    
    print("Creating system_settings table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR PRIMARY KEY,
        value VARCHAR
    )
    """)
    
    # Insert default location if not exists (New Delhi Example)
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('HOSTEL_LAT', '28.6139')")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('HOSTEL_LNG', '77.2090')")
    
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
