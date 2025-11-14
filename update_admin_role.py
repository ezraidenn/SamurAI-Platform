"""
Script para dar rol de admin a un usuario específico

Ejecutar:
    python update_admin_role.py
"""
import sqlite3
import os

# Conectar a la base de datos
db_path = "backend/database/ucudigital.db"

# Verificar que la base de datos existe
if not os.path.exists(db_path):
    print("❌ Error: La base de datos no existe")
    print(f"   Ruta buscada: {os.path.abspath(db_path)}")
    print("\n💡 Solución:")
    print("   1. Asegúrate que el backend esté corriendo")
    print("   2. Ejecuta: python force_create_tables.py")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Email del usuario a actualizar
    email = "2309045@upy.edu.mx"
    
    # Verificar si el usuario existe
    cursor.execute("SELECT id, name, email, role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if user:
        print(f"✅ Usuario encontrado:")
        print(f"   ID: {user[0]}")
        print(f"   Nombre: {user[1]}")
        print(f"   Email: {user[2]}")
        print(f"   Rol actual: {user[3]}")
        
        # Actualizar rol a admin
        cursor.execute("UPDATE users SET role = ? WHERE email = ?", ("admin", email))
        conn.commit()
        
        print(f"\n✅ Rol actualizado a 'admin' exitosamente!")
        
        # Verificar actualización
        cursor.execute("SELECT role FROM users WHERE email = ?", (email,))
        new_role = cursor.fetchone()[0]
        print(f"   Nuevo rol: {new_role}")
        
    else:
        print(f"❌ Usuario con email '{email}' no encontrado en la base de datos")
        print("\n💡 El usuario debe registrarse primero en:")
        print("   http://localhost:3000/register")
        print("\nDatos sugeridos para registro:")
        print(f"   Email: {email}")
        print("   Nombre: [Tu nombre]")
        print("   CURP: [CURP válido de 18 caracteres]")
        print("   Password: [Tu contraseña]")
        print("\nDespués de registrarse, ejecuta este script nuevamente.")
    
    # Mostrar todos los admins actuales
    print("\n" + "="*50)
    print("USUARIOS CON ROL ADMIN:")
    print("="*50)
    cursor.execute("SELECT id, name, email FROM users WHERE role = 'admin'")
    admins = cursor.fetchall()
    
    if admins:
        for admin in admins:
            print(f"  • {admin[1]} ({admin[2]})")
    else:
        print("  No hay usuarios admin todavía")
    print("="*50)
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()

print("\n✅ Proceso completado!")
