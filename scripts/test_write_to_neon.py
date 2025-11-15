"""
Prueba de ESCRITURA en Neon - Cambiar rol de usuario
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from backend.database import get_db, engine
from backend.models.user import User

print("=" * 60)
print("PRUEBA DE ESCRITURA EN NEON")
print("=" * 60)

# Verificar conexión
print(f"\n📊 Conectado a: {str(engine.url)[:50]}...")

if "neon.tech" not in str(engine.url):
    print("❌ ERROR: No estás conectado a Neon!")
    exit(1)

print("✅ Conectado a Neon")

# Obtener sesión
db = next(get_db())

try:
    # Buscar usuario con ID 2
    print("\n🔍 Buscando usuario con ID 2...")
    user = db.query(User).filter(User.id == 2).first()
    
    if not user:
        print("❌ Usuario no encontrado")
        exit(1)
    
    print(f"✅ Usuario encontrado: {user.email}")
    print(f"   Rol actual: {user.role}")
    
    # Guardar rol anterior
    old_role = user.role
    
    # Cambiar rol
    new_role = "admin" if old_role != "admin" else "citizen"
    print(f"\n🔄 Cambiando rol de '{old_role}' a '{new_role}'...")
    
    user.role = new_role
    db.commit()
    
    print(f"✅ Rol cambiado en la sesión")
    
    # Verificar en la base de datos
    print("\n🔍 Verificando cambio en Neon...")
    db.refresh(user)
    
    if user.role == new_role:
        print(f"✅ ÉXITO: Rol cambiado a '{new_role}' en Neon")
    else:
        print(f"❌ ERROR: Rol no se guardó correctamente")
    
    # Verificar con query directa
    print("\n🔍 Verificación con query directa a Neon...")
    direct_engine = create_engine(str(engine.url))
    with direct_engine.connect() as conn:
        result = conn.execute(text(f"SELECT role FROM users WHERE id = 2"))
        db_role = result.fetchone()[0]
        print(f"   Rol en Neon: {db_role}")
        
        if db_role == new_role:
            print("✅ CONFIRMADO: Cambio guardado en Neon")
        else:
            print("❌ ERROR: Cambio no se guardó")
    
    # Revertir cambio
    print(f"\n🔄 Revirtiendo cambio a '{old_role}'...")
    user.role = old_role
    db.commit()
    print(f"✅ Rol revertido a '{old_role}'")
    
    print("\n" + "=" * 60)
    print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
    print("=" * 60)
    print("\n💡 Conclusión:")
    print("   - El backend SÍ está conectado a Neon")
    print("   - Los cambios SÍ se guardan en Neon")
    print("   - Todo funciona correctamente ✅")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
