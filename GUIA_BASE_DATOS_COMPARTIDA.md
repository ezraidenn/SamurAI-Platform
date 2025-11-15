# 🌐 Guía: Base de Datos Compartida para el Equipo

## 🎯 Objetivo

Que **todos los desarrolladores** usen **TU base de datos centralizada**, no copias locales.

---

## 📋 Opciones Disponibles

### Opción 1: Supabase (Recomendado) ⭐
- ✅ **Gratis** hasta 500MB
- ✅ PostgreSQL en la nube
- ✅ Fácil de configurar
- ✅ Panel de administración web

### Opción 2: Railway
- ✅ Gratis con límites
- ✅ PostgreSQL
- ✅ Deploy automático

### Opción 3: Neon
- ✅ Gratis para desarrollo
- ✅ PostgreSQL serverless
- ✅ Muy rápido

---

## 🚀 OPCIÓN 1: Supabase (Paso a Paso)

### 1. Crear Cuenta en Supabase

1. Ve a: https://supabase.com
2. Click en **"Start your project"**
3. Crea una cuenta (GitHub recomendado)

### 2. Crear Proyecto

1. Click en **"New Project"**
2. Configuración:
   - **Name:** `ucu-reporta`
   - **Database Password:** Guarda esta contraseña ⚠️
   - **Region:** Closest to you (ej: South America)
3. Click **"Create new project"**
4. Espera 2-3 minutos

### 3. Obtener Credenciales

1. En el dashboard, ve a **Settings** → **Database**
2. Busca **"Connection string"**
3. Selecciona **"URI"**
4. Copia la URL (se ve así):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```

### 4. Configurar en el Proyecto

#### A. Actualizar `backend/.env`

```env
# Comentar SQLite
# DATABASE_URL=sqlite:///./database/ucudigital.db

# Usar PostgreSQL de Supabase
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres
```

⚠️ **IMPORTANTE:** Reemplaza `[TU-PASSWORD]` y `[TU-PROJECT-REF]` con tus datos reales.

#### B. Instalar Dependencia de PostgreSQL

```bash
cd backend
pip install psycopg2-binary
```

#### C. Actualizar `requirements.txt`

Agregar al final:
```
psycopg2-binary==2.9.9
```

### 5. Migrar Datos

#### A. Crear Tablas en Supabase

```bash
cd backend
alembic upgrade head
```

#### B. Crear Usuario Admin

```bash
python scripts/create_initial_admin.py
```

#### C. (Opcional) Migrar Datos Existentes

Si ya tienes datos en SQLite que quieres mover:

```bash
# Exportar de SQLite
sqlite3 database/ucudigital.db .dump > backup.sql

# Importar a PostgreSQL (necesitas ajustar el SQL)
# O usar herramientas como pgloader
```

---

## 👥 Configuración para el Equipo

### Para Cada Desarrollador:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ezraidenn/SamurAI-Platform.git
   cd "SamurAI Reportes"
   ```

2. **Instalar dependencias:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configurar `.env` con TU base de datos:**
   
   Compartir el archivo `backend/.env` con la URL de Supabase:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Iniciar el proyecto:**
   ```bash
   # Backend
   python start_backend.py
   
   # Frontend
   npm run dev
   ```

---

## 🔐 Seguridad

### ⚠️ NO SUBIR `.env` A GITHUB

1. **Verificar `.gitignore`:**
   ```
   backend/.env
   frontend/.env
   ```

2. **Compartir credenciales de forma segura:**
   - Por mensaje privado
   - Por Discord/Slack
   - Por email cifrado
   - **NUNCA en el repositorio público**

### Alternativa: Variables de Entorno

Crear `backend/.env.example`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=your-secret-key-here
```

Cada desarrollador copia y configura su propio `.env`.

---

## 📊 Ventajas de Base de Datos Compartida

✅ **Todos ven los mismos datos**
✅ **No hay conflictos de sincronización**
✅ **Cambios en tiempo real**
✅ **Más cercano a producción**
✅ **Backups automáticos** (Supabase)

---

## 🛠️ Comandos Útiles

### Ver Datos en Supabase

1. Ve al dashboard de Supabase
2. Click en **"Table Editor"**
3. Explora tus tablas

### Hacer Backup

```bash
# Desde Supabase dashboard
Settings → Database → Backups → Download
```

### Resetear Base de Datos

```bash
# Eliminar todas las tablas
alembic downgrade base

# Recrear
alembic upgrade head

# Crear admin
python scripts/create_initial_admin.py
```

---

## 🆘 Solución de Problemas

### Error: "Connection refused"
- Verifica que la URL sea correcta
- Verifica que el proyecto de Supabase esté activo
- Revisa el firewall

### Error: "Authentication failed"
- Verifica la contraseña en la URL
- Asegúrate de no tener espacios extra

### Error: "SSL required"
Agregar al final de la URL:
```
?sslmode=require
```

---

## 💰 Costos

### Supabase Free Tier:
- ✅ 500MB de base de datos
- ✅ 2GB de ancho de banda
- ✅ 50,000 usuarios activos mensuales
- ✅ Backups automáticos (7 días)

**Suficiente para desarrollo y pruebas** ✅

---

## 📝 Checklist de Configuración

- [ ] Crear cuenta en Supabase
- [ ] Crear proyecto
- [ ] Obtener URL de conexión
- [ ] Actualizar `backend/.env`
- [ ] Instalar `psycopg2-binary`
- [ ] Ejecutar `alembic upgrade head`
- [ ] Crear usuario admin
- [ ] Compartir credenciales con el equipo
- [ ] Verificar que todos se conecten correctamente

---

## 🎓 Recursos Adicionales

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Tutorial:** https://www.postgresql.org/docs/
- **Alembic Docs:** https://alembic.sqlalchemy.org/

---

## 📞 Soporte

Si alguien del equipo tiene problemas:

1. Verificar que tenga la URL correcta
2. Verificar que instaló `psycopg2-binary`
3. Verificar que ejecutó las migraciones
4. Revisar logs del backend

---

**Última actualización:** Noviembre 2025

**Configurado por:** Raúl Abel Cetina Pool
