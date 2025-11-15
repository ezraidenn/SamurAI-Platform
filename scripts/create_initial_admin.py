"""
Script to create initial admin user.
Run this after database reset to create the first admin.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models.user import User
from backend.routes.users import get_password_hash

def create_admin():
    """Create initial admin user."""
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@ucu.gob.mx").first()
        
        if existing_admin:
            print(f"❌ Admin user already exists: {existing_admin.email}")
            print(f"   Role: {existing_admin.role}")
            return
        
        # Create admin user
        admin_user = User(
            name="Administrador UCU",
            email="admin@ucu.gob.mx",
            curp="AUCU850101HYNXXX01",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   ID: {admin_user.id}")
        print(f"   Name: {admin_user.name}")
        print(f"   Email: {admin_user.email}")
        print(f"   Role: {admin_user.role}")
        print(f"\n📝 Login credentials:")
        print(f"   Email: admin@ucu.gob.mx")
        print(f"   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating initial admin user...")
    create_admin()
