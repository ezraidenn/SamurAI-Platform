"""
Script simple para crear usuario administrador

Ejecutar desde el directorio raíz:
    python create_admin_simple.py
"""
import sqlite3
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Conectar a la base de datos
db_path = "backend/database/ucudigital.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Verificar si el usuario admin ya existe
    cursor.execute("SELECT id, email, role FROM users WHERE email = ?", ("admin@ucu.gob.mx",))
    existing_admin = cursor.fetchone()
    
    if existing_admin:
        print("⚠️  Usuario admin ya existe")
        print(f"   ID: {existing_admin[0]}")
        print(f"   Email: {existing_admin[1]}")
        print(f"   Rol: {existing_admin[2]}")
        
        # Actualizar rol a admin si no lo es
        if existing_admin[2] != "admin":
            cursor.execute("UPDATE users SET role = ? WHERE email = ?", ("admin", "admin@ucu.gob.mx"))
            conn.commit()
            print("✅ Rol actualizado a 'admin'")
        else:
            print("✅ El usuario ya tiene rol de admin")
            
        # Actualizar contraseña
        hashed_password = get_password_hash("admin123")
        cursor.execute("UPDATE users SET hashed_password = ? WHERE email = ?", (hashed_password, "admin@ucu.gob.mx"))
        conn.commit()
        print("✅ Contraseña actualizada a 'admin123'")
    else:
        # Crear nuevo usuario admin
        hashed_password = get_password_hash("admin123")
        created_at = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO users (name, email, curp, hashed_password, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "Administrador UCU",
            "admin@ucu.gob.mx",
            "AUCU850101HYNXXX01",
            hashed_password,
            "admin",
            created_at
        ))
        
        conn.commit()
        
        print("✅ Usuario administrador creado exitosamente!")
        print(f"   Nombre: Administrador UCU")
        print(f"   Email: admin@ucu.gob.mx")
        print(f"   CURP: AUCU850101HYNXXX01")
        print(f"   Rol: admin")
    
    # Verificar si existe usuario ciudadano de prueba
    cursor.execute("SELECT id FROM users WHERE email = ?", ("maria@example.com",))
    existing_citizen = cursor.fetchone()
    
    if not existing_citizen:
        hashed_password = get_password_hash("password123")
        created_at = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO users (name, email, curp, hashed_password, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "María González",
            "maria@example.com",
            "GOGM900515MYNXNR03",
            hashed_password,
            "citizen",
            created_at
        ))
        
        conn.commit()
        print("\n✅ Usuario ciudadano de prueba creado")
        print("   Email: maria@example.com")
        print("   Password: password123")
    else:
        print("\n✅ Usuario ciudadano de prueba ya existe")
    
    print("\n" + "="*50)
    print("CREDENCIALES DE ACCESO")
    print("="*50)
    print("\n👨‍💼 ADMINISTRADOR (Dashboard Admin)")
    print("Email:    admin@ucu.gob.mx")
    print("Password: admin123")
    print("URL:      http://localhost:3000/admin")
    print("\n👥 CIUDADANO (Dashboard Ciudadano)")
    print("Email:    maria@example.com")
    print("Password: password123")
    print("URL:      http://localhost:3000/panel")
    print("="*50)
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()

print("\n✅ Configuración completada!")
print("\n📝 Nota: Asegúrate de que el backend esté corriendo en http://localhost:8000")
print("         y el frontend en http://localhost:3000")
