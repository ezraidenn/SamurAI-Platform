"""
Script para ver todos los usuarios en la base de datos
"""
import sqlite3

db_path = "backend/database/ucudigital.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("="*70)
    print("USUARIOS EN LA BASE DE DATOS")
    print("="*70)
    
    # Ver todos los usuarios
    cursor.execute("SELECT id, name, email, curp, role, created_at FROM users")
    users = cursor.fetchall()
    
    if users:
        print(f"\nTotal de usuarios: {len(users)}\n")
        for user in users:
            print(f"ID: {user[0]}")
            print(f"  Nombre: {user[1]}")
            print(f"  Email: {user[2]}")
            print(f"  CURP: {user[3]}")
            print(f"  Rol: {user[4]}")
            print(f"  Creado: {user[5]}")
            print("-" * 70)
    else:
        print("\n❌ No hay usuarios en la base de datos")
        print("\n💡 Registra usuarios en: http://localhost:3000/register")
    
    # Contar por rol
    cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    role_counts = cursor.fetchall()
    
    if role_counts:
        print("\n" + "="*70)
        print("USUARIOS POR ROL:")
        print("="*70)
        for role, count in role_counts:
            print(f"  {role}: {count}")
    
    print("="*70)
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    conn.close()
