"""Quick script to create admin user."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database
DATABASE_URL = "sqlite:///./database/ucudigital.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models
from backend.models.user import User
from backend.database import Base

def create_admin():
    # Create tables first
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas")
    
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@ucu.gob.mx").first()
        if admin:
            print(f"✅ Admin ya existe: {admin.email} (rol: {admin.role})")
            if admin.role != "admin":
                admin.role = "admin"
                db.commit()
                print("✅ Rol actualizado a admin")
            return
        
        # Create admin
        admin = User(
            name="Admin UCU",
            email="admin@ucu.gob.mx",
            curp="AUCU000000HYNXXX00",
            hashed_password=pwd_context.hash("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("✅ Admin creado!")
        print("   Email: admin@ucu.gob.mx")
        print("   Password: admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
