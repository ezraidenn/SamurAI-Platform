"""
Cambiar rol de usuario directamente en Neon y verificar
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text

NEON_URL = "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

print("=" * 60)
print("PRUEBA: CAMBIAR ROL EN NEON")
print("=" * 60)

engine = create_engine(NEON_URL)

with engine.connect() as conn:
    # Ver usuarios actuales
    print("\n👥 Usuarios ANTES del cambio:")
    result = conn.execute(text("SELECT id, name, email, role FROM users ORDER BY id"))
    users = result.fetchall()
    for user in users:
        print(f"  ID: {user[0]} | {user[1]} | {user[2]} | Role: {user[3]}")
    
    # Cambiar rol del usuario ID 2 a 'admin'
    print("\n🔄 Cambiando rol del usuario ID 2 a 'admin'...")
    conn.execute(text("UPDATE users SET role = 'admin' WHERE id = 2"))
    conn.commit()
    print("✅ Cambio ejecutado")
    
    # Verificar cambio
    print("\n👥 Usuarios DESPUÉS del cambio:")
    result = conn.execute(text("SELECT id, name, email, role FROM users ORDER BY id"))
    users = result.fetchall()
    for user in users:
        print(f"  ID: {user[0]} | {user[1]} | {user[2]} | Role: {user[3]}")
    
    # Verificar específicamente el usuario 2
    result = conn.execute(text("SELECT role FROM users WHERE id = 2"))
    new_role = result.fetchone()[0]
    
    if new_role == 'admin':
        print("\n✅ ÉXITO: Rol cambiado correctamente en Neon")
        print("   Ve al dashboard de Neon y verifica que aparezca 'admin'")
    else:
        print(f"\n❌ ERROR: Rol sigue siendo '{new_role}'")

print("\n" + "=" * 60)
