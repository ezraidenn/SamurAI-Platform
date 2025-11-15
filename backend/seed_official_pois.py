"""
Seed Official POIs
Poblar base de datos con POIs oficiales de Ucú (escuelas, hospitales, etc.)
"""
import sys
import os

# Agregar el directorio backend al path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# Importar config
from config import DATABASE_URL

# Importar Base desde database
from database import Base

# Definir modelos mínimos necesarios
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    role = Column(String)

class PointOfInterest(Base):
    __tablename__ = "points_of_interest"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    nombre = Column(String(200))
    descripcion = Column(Text)
    categoria = Column(String(50))
    subcategoria = Column(String(50))
    direccion = Column(String(500))
    colonia = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    telefono = Column(String(20))
    whatsapp = Column(String(20))
    email = Column(String(100))
    website = Column(String(200))
    facebook = Column(String(200))
    instagram = Column(String(200))
    horarios = Column(JSON)
    photo_url = Column(String(500))
    ia_status = Column(String(20))
    human_status = Column(String(20))
    status = Column(String(20))
    is_public = Column(Boolean)
    is_official = Column(Boolean)
    views_count = Column(Integer)
    reports_count = Column(Integer)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

# Conectar a BD
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# POIs Oficiales de Ucú
OFFICIAL_POIS = [
    # EDUCACIÓN
    {
        "nombre": "Escuela Primaria Benito Juárez",
        "descripcion": "Escuela primaria pública con educación de calidad",
        "categoria": "educacion",
        "subcategoria": "primaria",
        "direccion": "Calle 20 x 15 y 17, Centro",
        "colonia": "Centro",
        "latitude": 21.0320,
        "longitude": -89.7460,
        "telefono": "999-123-4567",
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Escuela Secundaria Técnica No. 45",
        "descripcion": "Educación secundaria con talleres técnicos",
        "categoria": "educacion",
        "subcategoria": "secundaria",
        "direccion": "Calle 22 x 19 y 21, Centro",
        "colonia": "Centro",
        "latitude": 21.0335,
        "longitude": -89.7445,
        "telefono": "999-234-5678",
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Telesecundaria Ucú",
        "descripcion": "Educación secundaria a distancia",
        "categoria": "educacion",
        "subcategoria": "secundaria",
        "direccion": "Calle 18 x 13, Centro",
        "colonia": "Centro",
        "latitude": 21.0305,
        "longitude": -89.7475,
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # SALUD
    {
        "nombre": "Centro de Salud Ucú",
        "descripcion": "Centro de salud público con atención médica general",
        "categoria": "salud",
        "subcategoria": "centro_salud",
        "direccion": "Calle 19 x 16 y 18, Centro",
        "colonia": "Centro",
        "latitude": 21.0325,
        "longitude": -89.7455,
        "telefono": "999-345-6789",
        "horarios": {"general": "Lunes a Viernes 8:00 AM - 3:00 PM"},
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Farmacia San José",
        "descripcion": "Farmacia con medicamentos genéricos y de patente",
        "categoria": "salud",
        "subcategoria": "farmacia",
        "direccion": "Calle 21 x 16, Centro",
        "colonia": "Centro",
        "latitude": 21.0330,
        "longitude": -89.7465,
        "telefono": "999-456-7890",
        "horarios": {"general": "Lunes a Domingo 7:00 AM - 10:00 PM"},
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # GOBIERNO
    {
        "nombre": "Palacio Municipal de Ucú",
        "descripcion": "Presidencia municipal y oficinas administrativas",
        "categoria": "gobierno",
        "subcategoria": "municipal",
        "direccion": "Calle 20 x 17, Centro",
        "colonia": "Centro",
        "latitude": 21.0318,
        "longitude": -89.7462,
        "telefono": "999-567-8901",
        "horarios": {"general": "Lunes a Viernes 8:00 AM - 3:00 PM"},
        "website": "https://ucu.gob.mx",
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Comisaría Municipal",
        "descripcion": "Oficina de la comisaría municipal",
        "categoria": "gobierno",
        "subcategoria": "comisaria",
        "direccion": "Calle 18 x 15, Centro",
        "colonia": "Centro",
        "latitude": 21.0310,
        "longitude": -89.7470,
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # RELIGIOSO
    {
        "nombre": "Iglesia de San Francisco de Asís",
        "descripcion": "Iglesia católica principal de Ucú",
        "categoria": "religioso",
        "subcategoria": "iglesia",
        "direccion": "Calle 21 x 18, Centro",
        "colonia": "Centro",
        "latitude": 21.0322,
        "longitude": -89.7458,
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # PARQUES
    {
        "nombre": "Parque Principal de Ucú",
        "descripcion": "Plaza principal con áreas verdes y bancas",
        "categoria": "parque",
        "subcategoria": "plaza",
        "direccion": "Calle 20 x 19, Centro",
        "colonia": "Centro",
        "latitude": 21.0315,
        "longitude": -89.7463,
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Cancha Deportiva Municipal",
        "descripcion": "Cancha de fútbol y básquetbol pública",
        "categoria": "deporte",
        "subcategoria": "cancha",
        "direccion": "Calle 24 x 21, Centro",
        "colonia": "Centro",
        "latitude": 21.0340,
        "longitude": -89.7450,
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # GASOLINERAS
    {
        "nombre": "Gasolinera Pemex Ucú",
        "descripcion": "Estación de servicio Pemex",
        "categoria": "gasolinera",
        "subcategoria": "pemex",
        "direccion": "Carretera Mérida-Motul km 18",
        "colonia": "Entrada",
        "latitude": 21.0350,
        "longitude": -89.7440,
        "telefono": "999-678-9012",
        "horarios": {"general": "24 horas"},
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    
    # TIENDAS OFICIALES
    {
        "nombre": "OXXO Ucú Centro",
        "descripcion": "Tienda de conveniencia 24 horas",
        "categoria": "tienda",
        "subcategoria": "conveniencia",
        "direccion": "Calle 22 x 17, Centro",
        "colonia": "Centro",
        "latitude": 21.0328,
        "longitude": -89.7468,
        "horarios": {"general": "24 horas"},
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    },
    {
        "nombre": "Tiendas 3B",
        "descripcion": "Tienda de abarrotes con precios bajos",
        "categoria": "supermercado",
        "subcategoria": "abarrotes",
        "direccion": "Calle 23 x 18, Centro",
        "colonia": "Centro",
        "latitude": 21.0332,
        "longitude": -89.7452,
        "horarios": {"general": "Lunes a Domingo 8:00 AM - 9:00 PM"},
        "is_official": True,
        "ia_status": "approved",
        "human_status": "approved",
        "status": "approved"
    }
]

def seed_official_pois():
    """Poblar BD con POIs oficiales"""
    print("=" * 60)
    print("🏛️  SEEDING OFFICIAL POIs")
    print("=" * 60)
    
    try:
        # Obtener primer admin como creador de POIs oficiales
        admin = db.query(User).filter_by(role='admin').first()
        
        if not admin:
            print("❌ No se encontró ningún usuario admin")
            print("Por favor crea un admin primero")
            return
        
        print(f"✅ POIs oficiales serán creados por: {admin.name} ({admin.email})")
        
        # Verificar si ya existen POIs oficiales
        existing = db.query(PointOfInterest).filter_by(is_official=True).count()
        
        if existing > 0:
            print(f"\n⚠️  Ya existen {existing} POIs oficiales en la BD")
            response = input("¿Deseas eliminarlos y volver a crearlos? (s/n): ")
            if response.lower() == 's':
                db.query(PointOfInterest).filter_by(is_official=True).delete()
                db.commit()
                print("✅ POIs oficiales eliminados")
            else:
                print("❌ Operación cancelada")
                return
        
        # Crear POIs oficiales
        created_count = 0
        for poi_data in OFFICIAL_POIS:
            poi = PointOfInterest(
                user_id=admin.id,  # Asignar al admin
                **poi_data,
                is_public=True,  # POIs oficiales son públicos
                views_count=0,
                reports_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(poi)
            created_count += 1
            print(f"✅ {poi_data['nombre']} ({poi_data['categoria']})")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print(f"✅ {created_count} POIs oficiales creados exitosamente")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_official_pois()
