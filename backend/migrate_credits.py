from database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 3;"))
            conn.commit()
            print("Successfully added credits column to users table.")
        except Exception as e:
            print("Could not add credits (maybe it already exists):", e)
            
        # Update existing users to have 3 credits if they are NULL
        try:
            conn.execute(text("UPDATE users SET credits = 3 WHERE credits IS NULL;"))
            conn.commit()
            print("Successfully initialized credits for existing users.")
        except Exception as e:
            print("Could not initialize credits:", e)

if __name__ == "__main__":
    run_migration()
