"""
Script para verificar que el backend está conectado a Neon
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from backend.database import get_db, engine
from backend.models.user import User

print("=" * 60)
print("VERIFICACIÓN DE CONEXIÓN A NEON")
print("=" * 60)

# Verificar URL de la base de datos
print(f"\n📊 URL de la base de datos:")
print(f"{str(engine.url)[:50]}...")

# Verificar si es Neon o SQLite
if "neon.tech" in str(engine.url):
    print("✅ CONECTADO A NEON (PostgreSQL)")
elif "sqlite" in str(engine.url):
    print("❌ CONECTADO A SQLITE LOCAL")
    print("\n⚠️  PROBLEMA: El backend sigue usando SQLite!")
    print("Solución: Verifica que backend/.env tenga la URL de Neon")
else:
    print(f"⚠️  Base de datos desconocida: {engine.url}")

# Intentar consultar usuarios
try:
    from sqlalchemy.orm import Session
    db = next(get_db())
    
    users = db.query(User).all()
    print(f"\n👥 Usuarios encontrados: {len(users)}")
    
    for user in users:
        print(f"  - {user.email} ({user.role})")
    
    db.close()
    
    print("\n✅ Conexión exitosa")
    
except Exception as e:
    print(f"\n❌ Error al conectar: {e}")

print("\n" + "=" * 60)
