# 🔧 Cómo Cambiar el Rol de un Usuario

## ✅ Método Correcto (Usando la API)

### Opción 1: Desde el Navegador (Swagger UI)

1. **Abre la documentación de la API**:
   ```
   http://localhost:8000/docs
   ```

2. **Busca el endpoint**: `PATCH /admin/users/{user_id}/role`

3. **Click en "Try it out"**

4. **Ingresa los datos**:
   - `user_id`: ID del usuario (ej: 1, 2, 3)
   - Request body:
   ```json
   {
     "role": "admin"
   }
   ```

5. **Click "Execute"**

6. **Verifica la respuesta**:
   ```json
   {
     "id": 1,
     "name": "Usuario",
     "email": "usuario@example.com",
     "role": "admin",
     "message": "User role updated to admin"
   }
   ```

---

### Opción 2: Desde Python (requests)

```python
import requests

# Primero, haz login como admin para obtener el token
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={
        "email": "admin@example.com",
        "password": "admin123"
    }
)

token = login_response.json()["access_token"]

# Luego, actualiza el rol del usuario
response = requests.patch(
    "http://localhost:8000/admin/users/1/role",
    json={"role": "admin"},
    headers={"Authorization": f"Bearer {token}"}
)

print(response.json())
```

---

### Opción 3: Desde curl (PowerShell)

```powershell
# Primero, obtén el token
$login = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method Post -Body (@{email="admin@example.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"

$token = $login.access_token

# Luego, actualiza el rol
$headers = @{Authorization = "Bearer $token"}
$body = @{role = "admin"} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/admin/users/1/role" -Method Patch -Headers $headers -Body $body -ContentType "application/json"
```

---

## 📋 Ver Todos los Usuarios

### Desde Swagger UI

1. **Abre**: http://localhost:8000/docs
2. **Busca**: `GET /admin/users`
3. **Click**: "Try it out" → "Execute"

### Desde Python

```python
import requests

# Login como admin
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={"email": "admin@example.com", "password": "admin123"}
)

token = login_response.json()["access_token"]

# Ver todos los usuarios
response = requests.get(
    "http://localhost:8000/admin/users",
    headers={"Authorization": f"Bearer {token}"}
)

users = response.json()
for user in users:
    print(f"ID: {user['id']}, Email: {user['email']}, Role: {user['role']}")
```

---

## 🚫 Método Incorrecto (Scripts SQLite)

**NO uses scripts que modifiquen SQLite directamente** porque:

1. No usan la sesión de SQLAlchemy correctamente
2. No actualizan el `updated_at` automáticamente
3. Pueden causar problemas de concurrencia
4. No validan los datos

---

## ✅ Endpoints Disponibles

### Para Admins

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/users` | Listar todos los usuarios |
| PATCH | `/admin/users/{user_id}/role` | Cambiar rol de usuario |
| GET | `/admin/reports/summary` | Estadísticas de reportes |
| PATCH | `/admin/reports/{report_id}/status` | Cambiar estado de reporte |

### Para Todos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Ver perfil actual |
| GET | `/reports` | Ver reportes |
| POST | `/reports` | Crear reporte |

---

## 🎯 Flujo Completo para Crear Admin

1. **Registrar usuario** en http://localhost:3000/register

2. **Obtener el ID del usuario**:
   - Login como admin existente
   - Ir a http://localhost:8000/docs
   - Ejecutar `GET /admin/users`
   - Buscar el usuario por email
   - Anotar su `id`

3. **Cambiar el rol**:
   - En http://localhost:8000/docs
   - Ejecutar `PATCH /admin/users/{user_id}/role`
   - Body: `{"role": "admin"}`

4. **Verificar**:
   - El usuario cierra sesión
   - Vuelve a hacer login
   - Debería ver el dashboard admin

---

## 📝 Ejemplo Completo

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Registrar nuevo usuario
register_data = {
    "name": "Nuevo Admin",
    "email": "nuevo@admin.com",
    "curp": "NAAD850101HYNXXX01",
    "password": "admin123"
}

register_response = requests.post(
    f"{BASE_URL}/auth/register",
    json=register_data
)

print("Usuario registrado:", register_response.json())

# 2. Login como admin existente
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "admin@example.com",
        "password": "admin123"
    }
)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Ver todos los usuarios para obtener el ID
users_response = requests.get(
    f"{BASE_URL}/admin/users",
    headers=headers
)

users = users_response.json()
new_user = next(u for u in users if u["email"] == "nuevo@admin.com")
user_id = new_user["id"]

print(f"ID del nuevo usuario: {user_id}")

# 4. Cambiar rol a admin
role_response = requests.patch(
    f"{BASE_URL}/admin/users/{user_id}/role",
    json={"role": "admin"},
    headers=headers
)

print("Rol actualizado:", role_response.json())
```

---

**Usa SIEMPRE la API, nunca scripts SQLite directos.** ✅
