
from database import SessionLocal
from models.user import User
from models.analysis import Analysis  # Import to avoid the error
from core.security import get_password_hash

def reset_admin_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == 'admin').first()
        if user:
            new_password = "admin"
            user.hashed_password = get_password_hash(new_password)
            db.commit()
            print(f"Password for user '{user.username}' has been reset to '{new_password}'")
        else:
            # Create admin user if it doesn't exist
            new_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("Admin user created with password 'admin'")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
