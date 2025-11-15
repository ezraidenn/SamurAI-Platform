# 🌐 Configuración para Acceso en Red Local

**Servidor Principal:** `172.16.19.195` (Raúl)

---

## 📋 Para el Servidor Principal (Raúl)

### 1. Configuración Backend

Tu `backend/.env` ya está configurado:

```env
# Base de datos compartida (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# CORS - Permitir acceso desde red local
CORS_ORIGINS=http://172.16.19.195:3000,http://localhost:3000,http://127.0.0.1:3000
```

### 2. Iniciar Backend

```bash
cd backend
python start_backend.py
```

**El backend estará disponible en:**
- `http://172.16.19.195:8000` (red local)
- `http://localhost:8000` (local)

### 3. Configuración Frontend

Tu `frontend/.env` ya está configurado:

```env
VITE_API_BASE_URL=http://172.16.19.195:8000
```

### 4. Iniciar Frontend

```bash
cd frontend
npm run dev
```

**El frontend estará disponible en:**
- `http://172.16.19.195:3000` (red local)
- `http://localhost:3000` (local)

---

## 👥 Para Miembros del Equipo

### Opción 1: Usar el Servidor de Raúl (Recomendado)

**Solo necesitas acceder desde tu navegador:**

```
http://172.16.19.195:3000
```

✅ **Ventajas:**
- No necesitas instalar nada
- Todos usan la misma base de datos (Neon)
- Cambios se reflejan en tiempo real

⚠️ **Requisitos:**
- Estar en la misma red que Raúl
- Raúl debe tener el backend y frontend corriendo

---

### Opción 2: Correr Tu Propia Instancia

Si quieres desarrollar en tu máquina:

#### 1. Clonar Repositorio

```bash
git clone https://github.com/ezraidenn/SamurAI-Platform.git
cd SamurAI-Platform
```

#### 2. Configurar Backend

```bash
cd backend
cp .env.example .env
```

**Editar `backend/.env`:**
- ✅ Mantener `DATABASE_URL` de Neon (ya está configurado)
- ✅ Cambiar `CORS_ORIGINS` para incluir tu IP

```env
# Ejemplo si tu IP es 192.168.1.100
CORS_ORIGINS=http://192.168.1.100:3000,http://localhost:3000,http://127.0.0.1:3000
```

#### 3. Instalar Dependencias Backend

```bash
pip install -r requirements.txt
```

#### 4. Iniciar Backend

```bash
python start_backend.py
```

#### 5. Configurar Frontend

```bash
cd ../frontend
```

**Crear `frontend/.env`:**

```env
# Si usas tu propio backend
VITE_API_BASE_URL=http://localhost:8000

# O si quieres usar el backend de Raúl
VITE_API_BASE_URL=http://172.16.19.195:8000
```

#### 6. Instalar Dependencias Frontend

```bash
npm install
```

#### 7. Iniciar Frontend

```bash
npm run dev
```

---

## 🔍 Verificación

### Backend Funcionando

Abre en tu navegador:
```
http://172.16.19.195:8000/docs
```

Deberías ver la documentación de la API (Swagger).

### Frontend Funcionando

Abre en tu navegador:
```
http://172.16.19.195:3000
```

Deberías ver la página de login.

### Conexión a Neon

Desde la máquina del servidor, ejecuta:

```bash
python scripts/test_neon_connection.py
```

Deberías ver:
```
✅ CONECTADO A NEON (PostgreSQL)
👥 Usuarios encontrados: 3
```

---

## 🌐 URLs del Proyecto

### Servidor Principal (Raúl - 172.16.19.195)

- **Frontend:** http://172.16.19.195:3000
- **Backend API:** http://172.16.19.195:8000
- **API Docs:** http://172.16.19.195:8000/docs
- **Base de Datos:** Neon PostgreSQL (compartida)

### Acceso Local (en tu propia máquina)

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🔐 Credenciales de Prueba

### Admin
- **Email:** `2309045@upy.edu.mx`
- **Password:** Consultar con Raúl

### Ciudadano
- **Email:** `jorge@gmail.com`
- **Password:** Consultar con Raúl

---

## ⚠️ Solución de Problemas

### Error: "Network Error" o CORS

**Causa:** El backend no está corriendo o CORS no está configurado.

**Solución:**
1. Verificar que el backend esté corriendo en `172.16.19.195:8000`
2. Verificar que estés en la misma red
3. Reiniciar el backend

### Error: "Cannot connect to database"

**Causa:** Problema con conexión a Neon.

**Solución:**
1. Verificar que el `DATABASE_URL` en `.env` sea correcto
2. Verificar conexión a internet
3. Ejecutar `python scripts/test_neon_connection.py`

### No puedo acceder desde mi dispositivo

**Causa:** Firewall o red diferente.

**Solución:**
1. Verificar que estés en la misma red WiFi
2. Verificar firewall de Windows en la máquina de Raúl
3. Ping a `172.16.19.195` para verificar conectividad

---

## 📊 Base de Datos Compartida (Neon)

**Todos los miembros del equipo usan la misma base de datos.**

- ✅ Cambios en tiempo real
- ✅ No necesitas migrar datos
- ✅ Todos ven los mismos reportes y usuarios

**Dashboard de Neon:** https://console.neon.tech

---

## 🚀 Workflow Recomendado

### Para Desarrollo Rápido:
1. Raúl corre backend y frontend en `172.16.19.195`
2. Equipo accede a `http://172.16.19.195:3000`
3. Todos trabajan con la misma BD

### Para Desarrollo Individual:
1. Cada quien clona el repo
2. Cada quien corre su propio frontend
3. Todos apuntan al backend de Raúl o a Neon directamente

---

## 📝 Notas Importantes

1. **Siempre usar Neon** - No usar SQLite
2. **Reiniciar backend después de cambios en `.env`**
3. **Estar en la misma red** para acceso por IP
4. **Firewall de Windows** puede bloquear conexiones

---

**Última actualización:** 15 de Noviembre, 2025  
**Mantenido por:** Raúl Cetina
