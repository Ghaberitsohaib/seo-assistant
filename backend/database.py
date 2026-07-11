from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# For MySQL, we might need to create the database if it doesn't exist
# We try to connect to the server first to check/create the DB
try:
    if settings.DATABASE_URL.startswith("mysql"):
        # Extract base connection without DB name
        base_url = settings.DATABASE_URL.rsplit('/', 1)[0]
        db_name = settings.DATABASE_URL.rsplit('/', 1)[1]
        
        temp_engine = create_engine(base_url)
        with temp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            conn.commit()
        temp_engine.dispose()
except Exception as e:
    print(f"Database creation check failed: {e}")

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
