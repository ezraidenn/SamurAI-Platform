# 🔐 Credenciales de Acceso - UCU Reporta

## 👨‍💼 Usuario Administrador (Gobierno/Municipio)

### Credenciales de Login
```
Email:    admin@ucu.gob.mx
Password: admin123
CURP:     AUCU850101HYNXXX01
```

### Acceso al Dashboard Admin
1. Ir a: http://localhost:3000
2. Click en "Iniciar Sesión" (esquina superior derecha)
3. Ingresar email y contraseña
4. Serás redirigido automáticamente a: `/admin`

### Funcionalidades del Admin
- ✅ Ver todos los reportes del sistema
- ✅ Mapa interactivo con markers coloreados por estado
- ✅ KPIs: Total, Resueltos, Pendientes, En Proceso, Tiempo Promedio
- ✅ Gráficas por categoría y estado
- ✅ Cambiar estado de reportes (Pendiente → En Proceso → Resuelto)
- ✅ Ver detalles completos de cada reporte

---

## 👥 Usuario Ciudadano (Para Testing)

### Credenciales de Login
```
Email:    maria@example.com
Password: password123
CURP:     GOGM900515MYNXNR03
```

### Acceso al Dashboard Ciudadano
1. Ir a: http://localhost:3000
2. Click en "Iniciar Sesión"
3. Ingresar email y contraseña
4. Serás redirigido automáticamente a: `/panel`

### Funcionalidades del Ciudadano
- ✅ Crear reportes con mapa y foto
- ✅ Ver solo sus propios reportes
- ✅ Dashboard con gráficas personales
- ✅ Filtrar reportes por estado y categoría
- ✅ Ver detalles de sus reportes

---

## 🆕 Crear Nuevo Usuario Admin

Si necesitas crear otro usuario administrador, sigue estos pasos:

### Opción 1: Desde la Base de Datos (SQLite)

```bash
# Abrir la base de datos
sqlite3 backend/database/ucudigital.db

# Cambiar rol de un usuario existente a admin
UPDATE users SET role='admin' WHERE email='admin@ucu.gob.mx';

# Verificar
SELECT id, name, email, role FROM users;

# Salir
.quit
```

### Opción 2: Crear Script Python

Crear archivo `backend/create_admin.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User
from utils.auth import get_password_hash

# Conectar a la base de datos
engine = create_engine("sqlite:///./database/ucudigital.db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Crear usuario admin
admin_user = User(
    name="Administrador UCU",
    email="admin@ucu.gob.mx",
    curp="AUCU850101HYNXXX01",
    hashed_password=get_password_hash("admin123"),
    role="admin"
)

db.add(admin_user)
db.commit()
print("✅ Usuario admin creado exitosamente")
```

Ejecutar:
```bash
cd backend
python create_admin.py
```

---

## 🔄 Cambiar Contraseña

Para cambiar la contraseña de cualquier usuario:

```bash
sqlite3 backend/database/ucudigital.db

# Ver usuarios
SELECT id, email, role FROM users;

# Nota: Las contraseñas están hasheadas con bcrypt
# Para cambiar, es mejor crear un nuevo usuario o usar la API
```

---

## 🌐 URLs de la Plataforma

### Desarrollo (Local)
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard Ciudadano**: http://localhost:3000/panel
- **Dashboard Admin**: http://localhost:3000/admin
- **Crear Reporte**: http://localhost:3000/reportar
- **API Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Producción (Después de deployment)
- **Frontend**: https://tudominio.com
- **Backend API**: https://api.tudominio.com

---

## 🎯 Flujo de Testing Completo

### Como Administrador:

1. **Login**
   - Ir a http://localhost:3000/login
   - Email: `admin@ucu.gob.mx`
   - Password: `admin123`

2. **Ver Dashboard**
   - Automáticamente en `/admin`
   - Ver KPIs globales
   - Ver mapa con todos los reportes
   - Ver gráficas

3. **Gestionar Reportes**
   - En la tabla, click "Cambiar Estado"
   - Cambiar de "Pendiente" a "En Proceso"
   - Agregar comentario (opcional)
   - Ver actualización en tiempo real

### Como Ciudadano:

1. **Registrarse** (opcional)
   - Ir a http://localhost:3000/register
   - Completar formulario con CURP válido

2. **Login**
   - Email: `maria@example.com`
   - Password: `password123`

3. **Crear Reporte**
   - Click "Nuevo Reporte"
   - Seleccionar categoría (ej: Bache)
   - Describir problema
   - Marcar ubicación en mapa
   - Subir foto (opcional)
   - Enviar

4. **Ver Dashboard**
   - Ver gráficas personales
   - Filtrar reportes
   - Ver detalles

---

## 🔒 Seguridad

### Contraseñas Hasheadas
Todas las contraseñas están hasheadas con bcrypt. Nunca se almacenan en texto plano.

### JWT Tokens
- Expiración: 7 días (10080 minutos)
- Almacenados en localStorage del navegador
- Incluyen información del usuario y rol

### Roles
- `citizen`: Usuario normal (por defecto)
- `admin`: Administrador con acceso completo

---

## 📞 Soporte

Si tienes problemas para acceder:

1. Verificar que el backend esté corriendo: http://localhost:8000/docs
2. Verificar que el frontend esté corriendo: http://localhost:3000
3. Limpiar localStorage del navegador (F12 → Application → Local Storage → Clear)
4. Reiniciar ambos servidores

---

## 🎉 ¡Listo para Usar!

Usa las credenciales de admin para acceder al dashboard administrativo y gestionar todos los reportes de la plataforma.

**Email**: admin@ucu.gob.mx  
**Password**: admin123  
**Dashboard**: http://localhost:3000/admin
