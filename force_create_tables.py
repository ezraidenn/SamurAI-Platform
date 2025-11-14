"""
Script para forzar la creación de tablas en la base de datos
"""
import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Cambiar al directorio backend para que las rutas relativas funcionen
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Crear Base
Base = declarative_base()

# Definir modelos directamente
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    curp = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    reports = relationship("Report", back_populates="user")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_url = Column(String, nullable=True)
    priority = Column(Integer, default=1, nullable=False)
    status = Column(String, default="pendiente", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="reports")

# Crear directorio si no existe
os.makedirs("database", exist_ok=True)

# Crear engine
DATABASE_URL = "sqlite:///./database/ucudigital.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

print("="*70)
print("CREANDO TABLAS EN LA BASE DE DATOS")
print("="*70)

try:
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("\n✅ Tablas creadas exitosamente!")
    
    # Verificar que se crearon
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"\nTablas en la base de datos: {len(tables)}")
    for table in tables:
        print(f"  ✓ {table}")
        
        # Mostrar columnas
        columns = inspector.get_columns(table)
        for col in columns:
            print(f"    - {col['name']} ({col['type']})")
    
    print("\n" + "="*70)
    print("✅ Base de datos lista para usar!")
    print("="*70)
    
    # Mostrar ruta completa
    db_path = os.path.abspath("database/ucudigital.db")
    print(f"\nRuta de la base de datos:")
    print(f"  {db_path}")
    
except Exception as e:
    print(f"\n❌ Error al crear tablas: {e}")
    import traceback
    traceback.print_exc()
