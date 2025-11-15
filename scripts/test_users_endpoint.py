"""
Probar endpoint de usuarios directamente
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_db
from backend.models.user import User

print("=" * 60)
print("USUARIOS EN BASE DE DATOS")
print("=" * 60)

db = next(get_db())

try:
    users = db.query(User).all()
    print(f"\n✅ Total de usuarios en DB: {len(users)}\n")
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"  Nombre: {user.name}")
        print(f"  Email: {user.email}")
        print(f"  Rol: {user.role}")
        print(f"  Creado: {user.created_at}")
        print()
    
finally:
    db.close()

print("=" * 60)
