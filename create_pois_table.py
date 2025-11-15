"""
Script para crear la tabla points_of_interest en la base de datos.
"""
from backend.database import engine
from backend.models.point_of_interest import PointOfInterest
from backend.models.user import User

def create_pois_table():
    """Crear tabla de POIs."""
    print("🔄 Creando tabla points_of_interest...")
    
    try:
        PointOfInterest.__table__.create(bind=engine, checkfirst=True)
        print("✅ Tabla points_of_interest creada exitosamente")
        
        # Verificar
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "points_of_interest" in tables:
            print("✓ Tabla verificada en la base de datos")
            print(f"✓ Tablas existentes: {', '.join(tables)}")
        else:
            print("⚠️  Advertencia: La tabla no aparece en la lista")
            
    except Exception as e:
        print(f"❌ Error al crear la tabla: {e}")
        raise

if __name__ == "__main__":
    create_pois_table()
