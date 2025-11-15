"""
Script to check and update user role in database.
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.user import User
from backend.config import DATABASE_URL

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Get all users
    users = db.query(User).all()
    
    print("\n" + "="*60)
    print("USUARIOS EN LA BASE DE DATOS")
    print("="*60)
    
    for user in users:
        print(f"\nID: {user.id}")
        print(f"Nombre: {user.name}")
        print(f"Email: {user.email}")
        print(f"Rol: {user.role}")
        print(f"CURP: {user.curp}")
        print("-" * 60)
    
    print(f"\nTotal de usuarios: {len(users)}")
    
    # Ask if user wants to update a role
    print("\n¿Deseas actualizar el rol de algún usuario? (s/n): ", end="")
    response = input().strip().lower()
    
    if response == 's':
        print("\nIngresa el email del usuario: ", end="")
        email = input().strip()
        
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"\nUsuario encontrado: {user.name} ({user.email})")
            print(f"Rol actual: {user.role}")
            print("\nRoles disponibles:")
            print("1. citizen")
            print("2. operator")
            print("3. supervisor")
            print("4. admin")
            print("\nIngresa el nuevo rol: ", end="")
            new_role = input().strip().lower()
            
            if new_role in ['citizen', 'operator', 'supervisor', 'admin']:
                old_role = user.role
                user.role = new_role
                db.commit()
                print(f"\n✅ Rol actualizado de '{old_role}' a '{new_role}'")
            else:
                print("\n❌ Rol inválido")
        else:
            print(f"\n❌ Usuario con email '{email}' no encontrado")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
