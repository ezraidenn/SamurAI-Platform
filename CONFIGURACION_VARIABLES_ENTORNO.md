# 🔧 Configuración de Variables de Entorno

Esta guía explica cómo configurar correctamente las variables de entorno para que el backend se conecte a la base de datos compartida de Neon.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Variables de Entorno](#variables-de-entorno)
3. [Solución de Problemas](#solución-de-problemas)
4. [Verificación](#verificación)

---

## 🚀 Configuración Inicial

### Paso 1: Copiar el archivo de ejemplo

```bash
# Desde la raíz del proyecto
cd backend
cp .env.example .env
```

**IMPORTANTE:** El archivo `.env` ya está configurado con las credenciales correctas del equipo. **NO necesitas modificar nada**.

### Paso 2: Verificar el contenido

Abre `backend/.env` y verifica que tenga esta configuración:

```env
DATABASE_URL=postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

✅ **Correcto:** URL de PostgreSQL (Neon)  
❌ **Incorrecto:** `sqlite:///./database/ucudigital.db`

---

## 📝 Variables de Entorno

### Base de Datos (CRÍTICO)

```env
# Base de datos compartida del equipo (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Componentes de la URL:**
- **Usuario:** `neondb_owner`
- **Contraseña:** `npg_tApuG2hEok1y`
- **Host:** `ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech`
- **Base de datos:** `neondb`
- **SSL:** `sslmode=require` (obligatorio para Neon)

⚠️ **NOTA:** NO incluyas `channel_binding=require` - causa errores de autenticación.

### Servidor

```env
HOST=0.0.0.0
PORT=8000
```

### JWT (Autenticación)

```env
SECRET_KEY=ucu-reporta-secret-key-2024-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### CORS (Orígenes Permitidos)

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://10.186.174.19:3000
```

### OpenAI (Validación de IA)

```env
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o-mini
AI_VALIDATION_ENABLED=true
```

---

## 🔍 Verificación

### 1. Verificar que el backend carga el .env correctamente

Cuando inicies el backend, deberías ver:

```bash
python start_backend.py
```

**Salida esperada:**

```
🔍 database.py cargando .env desde: C:\Users\...\backend\.env
🔍 DATABASE_URL: postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-...
============================================================
🔧 BACKEND CONFIGURATION
============================================================
Host: 0.0.0.0
Port: 8000
Database: postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
CORS Origins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.186.174.19:3000']
Environment: development
AI Validation: ✅ Enabled
OpenAI Model: gpt-4o-mini
============================================================
```

✅ **Correcto:** `Database: postgresql://...`  
❌ **Incorrecto:** `Database: sqlite:///...`

### 2. Script de verificación

Ejecuta el script de prueba:

```bash
python scripts/test_neon_connection.py
```

**Salida esperada:**

```
============================================================
VERIFICACIÓN DE CONEXIÓN A NEON
============================================================
📊 URL de la base de datos: postgresql://neondb_owner:***@ep-long-mountain-a4s...
✅ CONECTADO A NEON (PostgreSQL)

👥 Usuarios encontrados: 3
  - 2309045@upy.edu.mx (admin)
  - jorge@gmail.com (citizen)
  - raulce1@gmail.com (citizen)

✅ Conexión exitosa
============================================================
```

---

## 🐛 Solución de Problemas

### Problema 1: Backend sigue usando SQLite

**Síntoma:**
```
Database: sqlite:///./database/ucudigital.db
```

**Solución:**
1. Verifica que `backend/.env` tenga la URL de Neon
2. **REINICIA el backend** (Ctrl + C y vuelve a iniciar)
3. Las variables de entorno se cargan al inicio, no se recargan automáticamente

### Problema 2: Error de autenticación

**Síntoma:**
```
psycopg2.OperationalError: password authentication failed
```

**Solución:**
1. Verifica que la URL NO tenga `channel_binding=require`
2. La URL correcta termina en `?sslmode=require`
3. Reinicia el backend

### Problema 3: No puedo acceder a gestión de usuarios (401)

**Síntoma:**
```
GET http://localhost:8000/admin/users 401 (Unauthorized)
```

**Solución:**
1. Cierra sesión en el frontend
2. Vuelve a hacer login
3. Los tokens JWT anteriores expiraron al reiniciar el backend

### Problema 4: Cambios no se reflejan en Neon

**Síntoma:**
- Cambias un rol en el frontend
- No aparece en el dashboard de Neon

**Solución:**
1. Verifica que el backend esté usando Neon (ver logs al iniciar)
2. Refresca la página del dashboard de Neon (F5)
3. Verifica que no estés viendo una tabla diferente o con filtros

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE

1. **El archivo `.env` está en `.gitignore`** - NO se sube a Git
2. **El archivo `.env.example` SÍ se sube** - Contiene las credenciales del equipo
3. **Todos los miembros del equipo usan las mismas credenciales**
4. **NO compartas estas credenciales fuera del equipo**

### Para nuevos miembros del equipo

1. Clona el repositorio
2. Copia `backend/.env.example` a `backend/.env`
3. Ya está listo - no necesitas cambiar nada

---

## 📊 Dashboard de Neon

**URL:** https://console.neon.tech

**Proyecto:** `SamurAI Platform`

**Tablas:**
- `users` - Usuarios del sistema
- `reports` - Reportes ciudadanos
- `strikes` - Strikes de usuarios

---

## 🔄 Flujo de Trabajo

### Al iniciar el proyecto

```bash
# 1. Clonar repositorio
git clone <repo-url>

# 2. Copiar variables de entorno
cd backend
cp .env.example .env

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Iniciar backend
python start_backend.py

# 5. Verificar conexión
python scripts/test_neon_connection.py
```

### Al hacer cambios

```bash
# 1. Hacer cambios en el código
# 2. Reiniciar backend si cambias .env
# 3. Verificar que funciona
# 4. Commit y push
git add .
git commit -m "descripción"
git push
```

---

## 📚 Archivos Relacionados

- `backend/.env` - Variables de entorno (NO en Git)
- `backend/.env.example` - Plantilla con credenciales reales (SÍ en Git)
- `backend/database.py` - Configuración de base de datos
- `backend/config.py` - Carga de variables de entorno
- `scripts/test_neon_connection.py` - Script de verificación

---

## 💡 Tips

1. **Siempre reinicia el backend después de cambiar `.env`**
2. **Verifica los logs al iniciar** - te dicen qué BD estás usando
3. **Usa los scripts de verificación** - son más rápidos que probar manualmente
4. **Si algo no funciona, verifica primero la conexión a Neon**

---

**Última actualización:** Noviembre 2025  
**Mantenido por:** Equipo SamurAI Platform
