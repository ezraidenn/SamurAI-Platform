# ⚙️ Configuración - UCU Reporta

## 📋 Variables de Entorno

El proyecto usa archivos `.env` para configuración. **NO hardcodea** ninguna URL o puerto.

---

## 🔧 Backend (.env)

### Ubicación
```
backend/.env
```

### Variables Disponibles

```bash
# Server Configuration
HOST=0.0.0.0                    # Escucha en todas las interfaces
PORT=8000                       # Puerto del servidor

# Database
DATABASE_URL=sqlite:///./database/ucudigital.db

# JWT Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS - Orígenes permitidos (separados por coma)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://10.186.174.19:3000

# Environment
ENVIRONMENT=development
```

### Configuración para Red Local

Para acceder desde otros dispositivos en tu red:

1. **Obtén tu IP local:**
   ```bash
   # Windows
   ipconfig
   
   # Busca "IPv4 Address" en tu adaptador de red
   # Ejemplo: 10.186.174.19
   ```

2. **Actualiza CORS_ORIGINS:**
   ```bash
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://TU_IP:3000
   ```

---

## 🎨 Frontend (.env)

### Ubicación
```
frontend/.env
```

### Variables Disponibles

```bash
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000
```

### Configuración para Red Local

**Para desarrollo local:**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

**Para acceso desde red (otros dispositivos):**
```bash
VITE_API_BASE_URL=http://10.186.174.19:8000
```

---

## 🚀 Iniciar el Proyecto

### Método 1: Scripts Automáticos

**Backend:**
```bash
python start_backend.py
```
Este script lee automáticamente el `.env` y configura todo.

**Frontend:**
```bash
cd frontend
npm run dev
```
Vite lee automáticamente el `.env`.

### Método 2: Manual

**Backend:**
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📱 Acceso desde Otros Dispositivos

### Configuración Completa

1. **Obtén tu IP:**
   ```bash
   ipconfig
   # Ejemplo: 10.186.174.19
   ```

2. **Backend `.env`:**
   ```bash
   HOST=0.0.0.0
   PORT=8000
   CORS_ORIGINS=http://localhost:3000,http://10.186.174.19:3000
   ```

3. **Frontend `.env`:**
   ```bash
   VITE_API_BASE_URL=http://10.186.174.19:8000
   ```

4. **Inicia ambos servidores**

5. **Accede desde cualquier dispositivo:**
   - Frontend: `http://10.186.174.19:3000`
   - Backend API: `http://10.186.174.19:8000`
   - API Docs: `http://10.186.174.19:8000/docs`

---

## 🔒 Seguridad

### Producción

**NUNCA uses estos valores en producción:**

❌ **MAL:**
```bash
SECRET_KEY=ucu-reporta-secret-key-2024
CORS_ORIGINS=*
```

✅ **BIEN:**
```bash
SECRET_KEY=<genera-una-clave-segura-aleatoria>
CORS_ORIGINS=https://tu-dominio.com
```

### Generar SECRET_KEY Segura

```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## 📝 Archivos .env

### ⚠️ Importante

- ✅ `.env.example` - Commitear al repo (plantilla)
- ❌ `.env` - **NO commitear** (contiene secretos)

### .gitignore

Asegúrate de que `.env` esté en `.gitignore`:

```
# Environment variables
.env
backend/.env
frontend/.env
```

---

## 🔍 Verificar Configuración

### Backend

Al iniciar, verás:

```
============================================================
🔧 BACKEND CONFIGURATION
============================================================
Host: 0.0.0.0
Port: 8000
Database: sqlite:///./database/ucudigital.db
CORS Origins: ['http://localhost:3000', 'http://10.186.174.19:3000']
Environment: development
============================================================
```

### Frontend

En la consola del navegador:

```
🔗 API Base URL: http://10.186.174.19:8000
```

---

## 🐛 Troubleshooting

### Error: CORS

**Síntoma:** `Access-Control-Allow-Origin` error

**Solución:** Agrega el origen del frontend a `CORS_ORIGINS` en backend `.env`

```bash
CORS_ORIGINS=http://localhost:3000,http://TU_IP:3000
```

### Error: Cannot connect to API

**Síntoma:** `Network Error` en frontend

**Solución:** Verifica que `VITE_API_BASE_URL` apunte al backend correcto

```bash
# Frontend .env
VITE_API_BASE_URL=http://10.186.174.19:8000
```

### Error: 404 Not Found

**Síntoma:** API endpoints no encontrados

**Solución:** Verifica que el backend esté corriendo en el puerto correcto

```bash
# Backend .env
PORT=8000
```

---

## 📚 Ejemplos de Configuración

### Desarrollo Local (Solo tu PC)

**Backend `.env`:**
```bash
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend `.env`:**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Desarrollo en Red (Acceso desde otros dispositivos)

**Backend `.env`:**
```bash
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://10.186.174.19:3000
```

**Frontend `.env`:**
```bash
VITE_API_BASE_URL=http://10.186.174.19:8000
```

### Producción

**Backend `.env`:**
```bash
HOST=0.0.0.0
PORT=8000
SECRET_KEY=<clave-segura-generada>
CORS_ORIGINS=https://tudominio.com
ENVIRONMENT=production
```

**Frontend `.env`:**
```bash
VITE_API_BASE_URL=https://api.tudominio.com
```

---

**¡Ahora todo es configurable y no hay hardcoding!** ✅
