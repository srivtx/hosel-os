import sqlite3

def migrate():
    conn = sqlite3.connect('hostel.db')
    cursor = conn.cursor()
    
    try:
        # Check if column exists first to avoid error
        cursor.execute("SELECT password FROM students LIMIT 1")
    except sqlite3.OperationalError:
        print("Adding password column...")
        # Add password column with default value matching phone (optional logic) or fixed default
        # For simplicity in SQL, we set a static default, then we can update it if needed
        cursor.execute("ALTER TABLE students ADD COLUMN password TEXT DEFAULT '123456'")
        
        # Optionally set password = phone for existing users
        cursor.execute("UPDATE students SET password = phone")
        conn.commit()
        print("Migration successful.")
    else:
        print("Column already exists.")
    
    conn.close()

if __name__ == "__main__":
    migrate()
