# 📊 DICCIONARIO DE DATOS - UCU Reporta

**Sistema:** UCU Reporta  
**Versión:** 1.0.0  
**Base de Datos:** SQLite (PostgreSQL-ready)  
**Fecha:** Noviembre 2024

---

## 📋 TABLAS DE LA BASE DE DATOS

### Tabla: `users`

Almacena información de usuarios (ciudadanos y administradores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | ID único del usuario |
| `name` | VARCHAR(255) | NOT NULL | Nombre completo |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email para login |
| `curp` | VARCHAR(18) | UNIQUE, NOT NULL | CURP mexicano |
| `hashed_password` | VARCHAR(255) | NOT NULL | Password hasheado (bcrypt) |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT='citizen' | 'citizen' o 'admin' |
| `created_at` | TIMESTAMP | DEFAULT=NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | ON UPDATE=NOW() | Última actualización |

**Validaciones:**
- CURP: `^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$` (18 caracteres)
- Email: formato válido
- Password: mínimo 8 caracteres
- Role: solo 'citizen' o 'admin'

---

### Tabla: `reports`

Almacena reportes de incidentes cívicos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | ID único del reporte |
| `user_id` | INTEGER | FOREIGN KEY(users.id) | Usuario que creó el reporte |
| `category` | VARCHAR(50) | NOT NULL | Categoría del incidente |
| `description` | TEXT | NOT NULL | Descripción detallada |
| `latitude` | FLOAT | NOT NULL | Coordenada GPS (lat) |
| `longitude` | FLOAT | NOT NULL | Coordenada GPS (lng) |
| `photo_url` | VARCHAR(255) | NULL | URL de foto subida |
| `priority` | INTEGER | NOT NULL, DEFAULT=1 | Prioridad (1-5) |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT='pendiente' | Estado del reporte |
| `created_at` | TIMESTAMP | DEFAULT=NOW() | Fecha de creación |
| `updated_at` | TIMESTAMP | ON UPDATE=NOW() | Última actualización |

**Valores Permitidos:**

**category:**
- `bache` - Baches en calles
- `alumbrado` - Alumbrado público
- `basura` - Acumulación de basura
- `drenaje` - Problemas de drenaje
- `vialidad` - Problemas viales

**status:**
- `pendiente` - Sin atender
- `en_proceso` - En resolución
- `resuelto` - Completado

**priority:** 1 (baja) a 5 (crítica)

---

## 🔌 ENDPOINTS DE LA API

### Autenticación (`/auth`)

#### `POST /auth/register`
Registra nuevo usuario.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "curp": "PEGJ900515HYNXXX01",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "curp": "PEGJ900515HYNXXX01",
  "role": "citizen",
  "created_at": "2024-11-14T10:30:00Z"
}
```

---

#### `POST /auth/login`
Autentica usuario.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "citizen"
  }
}
```

---

#### `GET /auth/me`
Obtiene usuario actual (requiere token).

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "curp": "PEGJ900515HYNXXX01",
  "role": "citizen"
}
```

---

### Reportes (`/reports`)

#### `POST /reports`
Crea nuevo reporte (requiere auth).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "category": "bache",
  "description": "Bache grande en calle principal",
  "latitude": 20.9674,
  "longitude": -89.5926
}
```

**Response 201:**
```json
{
  "id": 1,
  "user_id": 5,
  "category": "bache",
  "description": "Bache grande...",
  "latitude": 20.9674,
  "longitude": -89.5926,
  "photo_url": null,
  "priority": 3,
  "status": "pendiente",
  "created_at": "2024-11-14T10:30:00Z"
}
```

**Cálculo de Prioridad:**
- Base por categoría: bache=3, alumbrado=2, basura=1, drenaje=4, vialidad=2
- +1 si descripción contiene: "accidente", "niños", "riesgo", "peligro", "urgente", "emergencia"
- Máximo: 5

---

#### `POST /reports/{id}/upload-photo`
Sube foto para reporte.

**Headers:** `Authorization: Bearer <token>`  
**Content-Type:** `multipart/form-data`

**Request:** `photo: File (max 5MB)`

**Response 200:**
```json
{
  "id": 1,
  "photo_url": "/static/uploads/report_1_1699999999.jpg",
  ...
}
```

---

#### `GET /reports`
Lista reportes (filtrable).

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status`: pendiente | en_proceso | resuelto
- `category`: bache | alumbrado | basura | drenaje | vialidad

**Comportamiento:**
- Ciudadano: solo sus reportes
- Admin: todos los reportes

**Response 200:** Array de reportes

---

#### `GET /reports/{id}`
Obtiene reporte específico.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** Objeto reporte

---

### Administración (`/admin`)

#### `GET /admin/reports/summary`
Estadísticas globales (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "total_reports": 156,
  "pending_reports": 45,
  "in_progress_reports": 22,
  "resolved_reports": 89,
  "avg_resolution_time_hours": 24.5,
  "count_by_category": {
    "bache": 45,
    "alumbrado": 30,
    "basura": 25,
    "drenaje": 35,
    "vialidad": 21
  },
  "count_by_status": {
    "pendiente": 45,
    "en_proceso": 22,
    "resuelto": 89
  }
}
```

---

#### `PATCH /admin/reports/{id}/status`
Actualiza estado de reporte (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "en_proceso",
  "comment": "Equipo enviado al sitio"
}
```

**Response 200:** Reporte actualizado

---

## 🎨 COMPONENTES FRONTEND

### Páginas

| Ruta | Componente | Acceso | Descripción |
|------|------------|--------|-------------|
| `/` | LandingPage | Público | Página de inicio |
| `/login` | LoginPage | Público | Formulario login |
| `/register` | RegisterPage | Público | Formulario registro |
| `/reportar` | ReportFormPage | Auth | Crear reporte |
| `/panel` | CitizenDashboardPage | Citizen | Dashboard ciudadano |
| `/admin` | AdminDashboardPage | Admin | Dashboard admin |

### Componentes Clave

- **MapPicker**: Mapa interactivo (Leaflet)
- **ProtectedRoute**: Guard de rutas
- **ErrorBoundary**: Manejo de errores
- **MainLayout**: Layout con navbar

### Context

**AuthContext:**
```javascript
{
  user, token, loading,
  login(), logout(),
  isAuthenticated(), isAdmin(), isCitizen()
}
```

---

## 🔐 SEGURIDAD

### Passwords
- Hashing: bcrypt
- Nunca en texto plano
- Min 8 caracteres

### JWT
- Algoritmo: HS256
- Expiración: 7 días
- Payload: { sub, email, role }

### Validaciones
- CURP: regex estricto
- SQL Injection: protegido por ORM
- XSS: React escapa HTML

---

## 🔄 FLUJOS PRINCIPALES

### Registro
```
Usuario → RegisterPage → POST /auth/register
→ Validar CURP/email únicos
→ Hashear password
→ Guardar en DB (role='citizen')
→ Redirect /login
```

### Login
```
Usuario → LoginPage → POST /auth/login
→ Verificar credenciales
→ Generar JWT (7 días)
→ Guardar en localStorage
→ Redirect según rol (admin→/admin, citizen→/panel)
```

### Crear Reporte
```
Ciudadano → ReportFormPage
→ Llenar formulario + mapa
→ POST /reports
→ Calcular prioridad automática
→ Guardar en DB
→ Si hay foto: POST /reports/{id}/upload-photo
→ Redirect /panel
```

### Gestión Admin
```
Admin → AdminDashboardPage
→ GET /admin/reports/summary (KPIs)
→ GET /reports (todos)
→ Renderizar mapa + gráficas
→ Click "Cambiar Estado"
→ PATCH /admin/reports/{id}/status
→ Actualizar DB
→ Refrescar vista
```

---

## 📊 REGLAS DE NEGOCIO

### Prioridad Automática
1. Base por categoría
2. +1 si keywords críticos
3. Rango: 1-5

### Roles
- **citizen**: CRUD propios reportes
- **admin**: Ver/gestionar todos

### Estados
- pendiente → en_proceso → resuelto
- Solo admin puede cambiar

### Fotos
- Max 5MB
- Formatos: jpg, png, gif
- Guardado: `/static/uploads/`

---

## 🛠️ TECNOLOGÍAS

**Backend:**
- FastAPI, SQLAlchemy, SQLite
- JWT (python-jose), bcrypt (passlib)
- Pydantic v2

**Frontend:**
- React 18, Vite, Tailwind CSS
- React Router v6, Axios
- Leaflet, Recharts, Framer Motion

---

## 📝 INICIALIZACIÓN DE BASE DE DATOS

### Creación Automática
Las tablas se crean automáticamente cuando el backend inicia por primera vez:
```python
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)
```

### Creación Manual (Si es necesario)
Si las tablas no se crean automáticamente:
```bash
python force_create_tables.py
```

### Verificar Estructura
```bash
python check_db_structure.py
```

### Ver Usuarios
```bash
python check_users.py
```

---

## 🔐 CREDENCIALES Y USUARIOS ADMIN

### Crear Usuario Admin

**Paso 1:** Registrarse en http://localhost:3000/register
```
Email: 2309045@upy.edu.mx
CURP: [18 caracteres válidos]
Password: [Tu contraseña]
```

**Paso 2:** Cambiar rol a admin
```bash
python update_admin_role.py
```

**Paso 3:** Login en http://localhost:3000/login

### Cambiar Rol Manualmente (Alternativa)
```bash
sqlite3 backend/database/ucudigital.db
UPDATE users SET role='admin' WHERE email='2309045@upy.edu.mx';
SELECT id, name, email, role FROM users;
.quit
```

---

## 🛠️ SCRIPTS DE UTILIDAD

| Script | Descripción | Comando |
|--------|-------------|---------|
| `force_create_tables.py` | Crea tablas en la base de datos | `python force_create_tables.py` |
| `check_db_structure.py` | Muestra estructura de la BD | `python check_db_structure.py` |
| `check_users.py` | Lista todos los usuarios | `python check_users.py` |
| `update_admin_role.py` | Cambia rol a admin | `python update_admin_role.py` |
| `create_admin_simple.py` | Crea usuario admin | `python create_admin_simple.py` |

---

## 📍 UBICACIÓN DE ARCHIVOS

### Base de Datos
```
backend/database/ucudigital.db
```

### Fotos Subidas
```
backend/static/uploads/
├── report_1_1699999999.jpg
├── report_2_1700000000.png
└── ...
```

### Logs
- Backend: Terminal donde corre uvicorn
- Frontend: Terminal donde corre npm/vite

---

## ⚠️ NOTAS IMPORTANTES

1. **Base de Datos:**
   - Se crea automáticamente al iniciar el backend
   - Si hay problemas, usar `force_create_tables.py`
   - Ubicación: `backend/database/ucudigital.db`

2. **Usuarios Admin:**
   - No hay usuarios admin por defecto
   - Deben crearse manualmente o cambiar rol después del registro
   - Script disponible: `update_admin_role.py`

3. **CURP:**
   - Debe tener exactamente 18 caracteres
   - Formato: `^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$`
   - Ejemplo válido: `RAMC950815HYNXXX01`

4. **Fotos:**
   - Máximo 5MB por foto
   - Formatos: jpg, jpeg, png, gif
   - Se guardan en `backend/static/uploads/`

5. **JWT Tokens:**
   - Expiración: 7 días (10080 minutos)
   - Se guardan en localStorage del navegador
   - Se envían en header: `Authorization: Bearer <token>`

---

**Documento generado:** 14 Nov 2024  
**Versión:** 1.1  
**Última actualización:** Correcciones sobre creación de BD y scripts
