"""
Script para migrar categorías antiguas a las 4 categorías englobadas.

Mapeo:
- bache -> via_mal_estado
- alumbrado -> iluminacion_visibilidad
- basura -> infraestructura_danada
- drenaje -> infraestructura_danada
- vialidad -> senalizacion_transito
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal
from backend.models.report import Report
from sqlalchemy import func

# Mapeo de categorías antiguas a nuevas
CATEGORY_MAPPING = {
    'bache': 'via_mal_estado',
    'alumbrado': 'iluminacion_visibilidad',
    'basura': 'infraestructura_danada',
    'drenaje': 'infraestructura_danada',
    'vialidad': 'senalizacion_transito',
}

def migrate_categories():
    """Migrar todas las categorías antiguas a las nuevas"""
    db = SessionLocal()
    
    try:
        print("🔄 Iniciando migración de categorías...")
        print("=" * 60)
        
        # Contar reportes por categoría antigua
        print("\n📊 Reportes actuales por categoría:")
        for old_cat in CATEGORY_MAPPING.keys():
            count = db.query(Report).filter(Report.category == old_cat).count()
            if count > 0:
                print(f"  - {old_cat}: {count} reportes")
        
        # Migrar cada categoría
        total_updated = 0
        for old_category, new_category in CATEGORY_MAPPING.items():
            count = db.query(Report).filter(Report.category == old_category).update(
                {Report.category: new_category},
                synchronize_session=False
            )
            if count > 0:
                print(f"\n✅ Migrados {count} reportes de '{old_category}' → '{new_category}'")
                total_updated += count
        
        db.commit()
        
        print("\n" + "=" * 60)
        print(f"✅ Migración completada: {total_updated} reportes actualizados")
        
        # Mostrar resumen final
        print("\n📊 Reportes por categoría nueva:")
        new_categories = ['via_mal_estado', 'infraestructura_danada', 'senalizacion_transito', 'iluminacion_visibilidad']
        for new_cat in new_categories:
            count = db.query(Report).filter(Report.category == new_cat).count()
            print(f"  - {new_cat}: {count} reportes")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MIGRACIÓN DE CATEGORÍAS")
    print("=" * 60)
    print("\nEste script migrará las categorías antiguas a las 4 nuevas:")
    print("  • bache → via_mal_estado")
    print("  • alumbrado → iluminacion_visibilidad")
    print("  • basura → infraestructura_danada")
    print("  • drenaje → infraestructura_danada")
    print("  • vialidad → senalizacion_transito")
    print("\n" + "=" * 60)
    
    response = input("\n¿Deseas continuar? (s/n): ")
    if response.lower() == 's':
        migrate_categories()
    else:
        print("\n❌ Migración cancelada")
