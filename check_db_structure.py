"""
Script para ver la estructura de la base de datos
"""
import sqlite3

db_path = "backend/database/ucudigital.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("="*70)
    print("ESTRUCTURA DE LA BASE DE DATOS")
    print("="*70)
    
    # Ver todas las tablas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    if tables:
        print(f"\nTablas encontradas: {len(tables)}\n")
        for table in tables:
            table_name = table[0]
            print(f"📋 Tabla: {table_name}")
            
            # Ver estructura de cada tabla
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
            
            # Contar registros
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"   Registros: {count}")
            print("-" * 70)
    else:
        print("\n❌ No hay tablas en la base de datos")
        print("\n💡 Las tablas se crean automáticamente al iniciar el backend")
        print("   Ejecuta: uvicorn backend.main:app --reload")
    
    print("="*70)
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    conn.close()
