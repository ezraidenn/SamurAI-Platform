"""
Script simplificado para crear usuario administrador en UCU Reporta
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# Base para modelos
Base = declarative_base()

# Modelo User
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    curp = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Configuración de la base de datos
DATABASE_DIR = "./backend/database"
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)

DATABASE_URL = "sqlite:///./backend/database/ucudigital.db"

def create_admin_user():
    """Crea o actualiza el usuario administrador"""
    
    # Crear engine y sesión
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si el usuario admin ya existe
        existing_admin = db.query(User).filter(User.email == "admin@ucu.gob.mx").first()
        
        if existing_admin:
            print("⚠️  Usuario admin ya existe")
            print(f"   Email: {existing_admin.email}")
            print(f"   Rol: {existing_admin.role}")
            
            # Actualizar rol a admin si no lo es
            if existing_admin.role != "admin":
                existing_admin.role = "admin"
                existing_admin.hashed_password = get_password_hash("admin123")
                db.commit()
                print("✅ Rol actualizado a 'admin' y contraseña restablecida")
            else:
                print("✅ El usuario ya tiene rol de admin")
        else:
            # Crear nuevo usuario admin
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
            
            print("✅ Usuario administrador creado exitosamente!")
            print(f"   ID: {admin_user.id}")
            print(f"   Nombre: {admin_user.name}")
            print(f"   Email: {admin_user.email}")
            print(f"   CURP: {admin_user.curp}")
            print(f"   Rol: {admin_user.role}")
        
        print("\n" + "="*50)
        print("CREDENCIALES DE ACCESO")
        print("="*50)
        print("Email:    admin@ucu.gob.mx")
        print("Password: admin123")
        print("URL:      http://localhost:3000/admin")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error al crear usuario admin: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def create_test_citizen():
    """Crea un usuario ciudadano de prueba"""
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si el usuario ya existe
        existing_user = db.query(User).filter(User.email == "maria@example.com").first()
        
        if not existing_user:
            citizen_user = User(
                name="María González",
                email="maria@example.com",
                curp="GOGM900515MYNXNR03",
                hashed_password=get_password_hash("password123"),
                role="citizen"
            )
            
            db.add(citizen_user)
            db.commit()
            print("\n✅ Usuario ciudadano de prueba creado")
            print("   Email: maria@example.com")
            print("   Password: password123")
        else:
            print("\n✅ Usuario ciudadano de prueba ya existe")
            
    except Exception as e:
        print(f"❌ Error al crear usuario ciudadano: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Configurando usuarios de UCU Reporta...\n")
    
    # Crear usuario admin
    create_admin_user()
    
    # Crear usuario ciudadano de prueba
    create_test_citizen()
    
    print("\n✅ Configuración completada!")
    print("\nPuedes iniciar sesión con cualquiera de las credenciales mostradas.")
