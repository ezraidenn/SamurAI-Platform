"""
Script para crear reportes de prueba asignados al operador
"""
import sys
import os
from datetime import datetime

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from backend.database import Base

# Definir modelo Report simplificado (sin foreign keys para evitar problemas)
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    assigned_to = Column(Integer, nullable=True)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_url = Column(String, nullable=True)
    priority = Column(Integer, default=1, nullable=False)
    status = Column(String, default="pendiente", nullable=False)
    ai_validated = Column(Integer, default=0, nullable=False)
    ai_confidence = Column(Float, nullable=True)
    ai_suggested_category = Column(String, nullable=True)
    ai_urgency_level = Column(String, nullable=True)
    ai_keywords = Column(Text, nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    ai_image_valid = Column(Integer, default=1, nullable=True)
    ai_severity_score = Column(Integer, nullable=True)
    ai_observed_details = Column(Text, nullable=True)
    ai_quantity_assessment = Column(String, nullable=True)
    ai_rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

DATABASE_URL = "sqlite:///./database/ucudigital.db"

def create_test_reports():
    """Crea reportes de prueba asignados al operador"""
    
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # ID del operador (asumiendo que es el ID 3)
        operator_id = 3
        # ID del ciudadano (asumiendo que es el ID 2)
        citizen_id = 2
        
        # Crear tablas si no existen
        Base.metadata.create_all(bind=engine)
        
        # Reportes de prueba (usando el modelo real de Report)
        test_reports = [
            {
                "user_id": citizen_id,
                "category": "bache",
                "description": "Bache grande de aproximadamente 1.5 metros de diámetro frente a la tienda Oxxo en Centro, Calle 20 x 15 y 17. Representa peligro para motociclistas y ciclistas. Se encuentra en la esquina con el semáforo.",
                "latitude": 21.0897,
                "longitude": -89.6189,
                "status": "pendiente",
                "priority": 4,
                "assigned_to": operator_id,
                "ai_urgency_level": "high"
            },
            {
                "user_id": citizen_id,
                "category": "vialidad",
                "description": "Grieta longitudinal de aproximadamente 5 metros en el carril derecho en Cholul, Calle 25 entre 30 y 32. Puede causar daños a los vehículos. Ubicada cerca del parque principal.",
                "latitude": 21.0910,
                "longitude": -89.6175,
                "status": "en_proceso",
                "priority": 3,
                "assigned_to": operator_id,
                "ai_urgency_level": "medium"
            },
            {
                "user_id": citizen_id,
                "category": "bache",
                "description": "Hundimiento severo en la vía principal de San José Tzal que dificulta el tránsito. Aproximadamente 3 metros de largo por 2 de ancho. Requiere atención urgente.",
                "latitude": 21.0925,
                "longitude": -89.6200,
                "status": "pendiente",
                "priority": 5,
                "assigned_to": operator_id,
                "ai_urgency_level": "critical"
            },
            {
                "user_id": citizen_id,
                "category": "vialidad",
                "description": "Señal de alto completamente borrada y poste inclinado en Santa Cruz, Esquina Calle 10 con 15. Representa riesgo de accidentes en la intersección. Requiere reemplazo completo.",
                "latitude": 21.0880,
                "longitude": -89.6210,
                "status": "pendiente",
                "priority": 4,
                "assigned_to": operator_id,
                "ai_urgency_level": "high"
            },
            {
                "user_id": citizen_id,
                "category": "bache",
                "description": "Múltiples baches en la carretera principal de Xcunyá, Carretera Mérida-Progreso Km 15. El más grande tiene aproximadamente 2 metros de diámetro. Causa molestias a los conductores.",
                "latitude": 21.0865,
                "longitude": -89.6225,
                "status": "pendiente",
                "priority": 3,
                "assigned_to": operator_id,
                "ai_urgency_level": "medium"
            }
        ]
        
        # Crear reportes
        created_count = 0
        for report_data in test_reports:
            report = Report(**report_data)
            db.add(report)
            created_count += 1
        
        db.commit()
        
        print(f"✅ {created_count} reportes de prueba creados y asignados al operador")
        print(f"\nReportes creados:")
        for i, report_data in enumerate(test_reports, 1):
            print(f"  {i}. {report_data['category'].upper()}")
            print(f"     Prioridad: {report_data['priority']} | Estado: {report_data['status']}")
        
    except Exception as e:
        print(f"❌ Error al crear reportes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creando reportes de prueba...\n")
    create_test_reports()
    print("\n✅ Proceso completado!")
