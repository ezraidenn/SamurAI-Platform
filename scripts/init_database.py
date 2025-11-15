"""
Script de inicialización de la base de datos.
Crea la BD con Alembic y agrega el usuario admin inicial.
"""
import subprocess
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from backend.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database
DATABASE_URL = "sqlite:///./database/ucudigital.db"

def init_database():
    """Inicializa la base de datos con Alembic."""
    print("🔧 Inicializando base de datos...")
    
    # Aplicar migraciones
    print("\n📦 Aplicando migraciones con Alembic...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Error aplicando migraciones:")
        print(result.stderr)
        return False
    
    print(result.stdout)
    print("✅ Migraciones aplicadas correctamente")
    return True

def create_admin():
    """Crea el usuario admin inicial."""
    print("\n👤 Creando usuario admin...")
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
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
        
        print("✅ Admin creado exitosamente!")
        print(f"   Email: admin@ucu.gob.mx")
        print(f"   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Ejecuta la inicialización completa."""
    print("="*60)
    print("  INICIALIZACIÓN DE BASE DE DATOS - UCU REPORTA")
    print("="*60)
    
    # Inicializar BD con Alembic
    if not init_database():
        print("\n❌ Falló la inicialización")
        return
    
    # Crear admin
    create_admin()
    
    print("\n" + "="*60)
    print("✅ INICIALIZACIÓN COMPLETADA")
    print("="*60)
    print("\n📝 Credenciales de acceso:")
    print("   Email:    admin@ucu.gob.mx")
    print("   Password: admin123")
    print("\n🚀 Inicia el servidor con:")
    print("   python -m uvicorn backend.main:app --reload")
    print("="*60)

if __name__ == "__main__":
    main()
