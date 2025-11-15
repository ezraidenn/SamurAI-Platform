"""
Fix horarios field - convert string to JSON dict
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from config import DATABASE_URL

def fix_horarios():
    """Convertir horarios de string a JSON dict"""
    print("=" * 60)
    print("🔧 FIXING HORARIOS FIELD")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Actualizar horarios que son strings a JSON
            result = conn.execute(text("""
                UPDATE points_of_interest 
                SET horarios = json_build_object('general', horarios::text)::json
                WHERE horarios IS NOT NULL 
                AND json_typeof(horarios) = 'string'
            """))
            
            conn.commit()
            
            print(f"\n✅ {result.rowcount} registros actualizados")
            print("=" * 60)
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("=" * 60)

if __name__ == "__main__":
    fix_horarios()
