"""
Probar el endpoint /admin/users directamente
"""
import requests

# URL del backend
BASE_URL = "http://localhost:8000"

# Primero hacer login para obtener token
print("=" * 60)
print("PROBANDO ENDPOINT /admin/users")
print("=" * 60)

# Login
print("\n1. Haciendo login como admin...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "2309045@upy.edu.mx",
        "password": "Pool8131"  # Cambia esto si tu contraseña es diferente
    }
)

if login_response.status_code != 200:
    print(f"❌ Error en login: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()["access_token"]
print(f"✅ Login exitoso, token obtenido")

# Obtener usuarios
print("\n2. Obteniendo lista de usuarios...")
headers = {"Authorization": f"Bearer {token}"}
users_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)

if users_response.status_code != 200:
    print(f"❌ Error obteniendo usuarios: {users_response.status_code}")
    print(users_response.text)
    exit(1)

users = users_response.json()
print(f"\n✅ Usuarios obtenidos: {len(users)}")
print("\n" + "=" * 60)
print("USUARIOS DEVUELTOS POR EL ENDPOINT:")
print("=" * 60)

for user in users:
    print(f"\nID: {user['id']}")
    print(f"  Nombre: {user['name']}")
    print(f"  Email: {user['email']}")
    print(f"  Rol: {user['role']}")

print("\n" + "=" * 60)
print(f"TOTAL: {len(users)} usuarios")
print("=" * 60)
