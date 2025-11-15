# 🚀 Instrucciones para el Equipo - UCU Reporta

## 👋 Bienvenido al Proyecto

Este documento te guiará para configurar el proyecto en tu computadora y conectarte a la **base de datos compartida del equipo en Supabase**.

---

## 📋 Requisitos Previos

- ✅ Python 3.8 o superior
- ✅ Node.js 16 o superior  
- ✅ Git instalado
- ✅ Editor de código (VS Code recomendado)

---

## 🔧 Configuración Inicial (Solo una vez)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ezraidenn/SamurAI-Platform.git
cd "SamurAI Reportes"
```

### 2. Configurar Backend

#### A. Crear entorno virtual (recomendado)

```bash
cd backend
python -m venv venv

# Activar entorno virtual:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

#### B. Instalar dependencias

```bash
pip install -r requirements.txt
```

**IMPORTANTE:** Esto instalará `psycopg2-binary` que es necesario para conectarse a PostgreSQL/Supabase.

#### C. Verificar archivo `.env`

El archivo `backend/.env` **YA ESTÁ CONFIGURADO** con la base de datos compartida del equipo en Neon.

Verifica que contenga:

```env
DATABASE_URL=postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ **No necesitas cambiar nada** - Ya está listo para usar.

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Verificar que `frontend/.env` contenga:

```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Iniciar el Proyecto

### Terminal 1 - Backend

```bash
cd backend

# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Iniciar servidor
python start_backend.py
```

✅ Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Deberías ver:
```
➜  Local:   http://localhost:3000/
```

---

## 🌐 Acceder a la Aplicación

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8000
3. **Documentación API:** http://localhost:8000/docs

---

## 👤 Usuarios de Prueba

### Administrador:
- **Email:** `admin@ucudigital.com`
- **Password:** `admin123`

### Ciudadano:
- **Email:** `usuario@test.com`  
- **Password:** `test123`

---

## 🗄️ Base de Datos Compartida

### ⚠️ IMPORTANTE - LEE ESTO

**TODOS usamos la MISMA base de datos** alojada en Neon (PostgreSQL):

✅ **Ventajas:**
- Todos ven los mismos datos en tiempo real
- No hay conflictos de sincronización
- Cambios instantáneos para todo el equipo
- Backups automáticos

⚠️ **Ten cuidado:**
- Los cambios que hagas **SE VEN INMEDIATAMENTE** para todos
- Si borras algo, se borra para todos
- Si creas un reporte de prueba, todos lo verán

### Acceso al Dashboard de Neon

**URL:** https://console.neon.tech

**Credenciales:**
- Pide acceso a Raúl Abel Cetina Pool

Desde ahí puedes:
- Ver todas las tablas
- Ejecutar queries SQL
- Ver métricas de uso
- Hacer backups

---

## 🔄 Flujo de Trabajo Diario

### 1. Antes de Empezar a Trabajar

```bash
# Actualizar código
git pull origin main

# Activar entorno virtual
cd backend
venv\Scripts\activate

# Verificar si hay nuevas dependencias
pip install -r requirements.txt
```

### 2. Durante el Desarrollo

- Trabaja normalmente
- Haz commits frecuentes con mensajes descriptivos
- Prueba tus cambios localmente
- **Recuerda:** Todos usan la misma BD, coordina con el equipo

### 3. Al Terminar

```bash
# Guardar cambios
git add .
git commit -m "descripción clara de tus cambios"
git push origin main
```

---

## 📝 Buenas Prácticas

### ✅ Hacer:
- Probar localmente antes de hacer push
- Usar datos de prueba realistas
- Comunicar cambios importantes al equipo
- Hacer commits pequeños y frecuentes

### ❌ No Hacer:
- Borrar datos de producción sin avisar
- Hacer cambios masivos sin coordinar
- Subir credenciales o API keys al repositorio
- Modificar el `.env` sin consultar

---

## 🆘 Solución de Problemas

### Error: "Connection refused" o "Can't connect to database"

**Solución:**
1. Verifica tu conexión a internet
2. Verifica que el `.env` tenga la URL correcta
3. Verifica que instalaste `psycopg2-binary`:
   ```bash
   pip install psycopg2-binary
   ```

### Error: "Module not found"

**Solución:**
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Port 8000 already in use"

**Solución:**
- Cierra otros procesos de Python
- O cambia el puerto en `backend/.env`:
  ```env
  PORT=8001
  ```

### Frontend no se conecta al Backend

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
3. Reinicia el frontend

---

## 🔐 Información Sensible

### ⚠️ NUNCA SUBAS A GITHUB:

- Archivos `.env`
- API Keys de OpenAI
- Contraseñas
- Tokens de acceso

El `.gitignore` ya está configurado para ignorar estos archivos.

---

## 📊 Estructura del Proyecto

```
SamurAI Reportes/
├── backend/
│   ├── models/          # Modelos de base de datos
│   ├── routes/          # Endpoints de la API
│   ├── services/        # Lógica de negocio
│   ├── .env            # Configuración (NO SUBIR)
│   └── start_backend.py
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API calls
│   │   └── context/     # Context providers
│   └── .env            # Configuración frontend
└── scripts/
    └── migrate_to_supabase.py  # Script de migración
```

---

## 🤝 Contacto y Soporte

**Líder del Proyecto:** Raúl Abel Cetina Pool

**Problemas técnicos:**
1. Revisa esta documentación
2. Busca en el código
3. Pregunta en el grupo del equipo
4. Contacta a Raúl

---

## 📚 Recursos Adicionales

- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev

---

## ✅ Checklist de Configuración

- [ ] Repositorio clonado
- [ ] Python y Node.js instalados
- [ ] Entorno virtual creado y activado
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Archivo `.env` verificado
- [ ] Backend inicia correctamente
- [ ] Frontend inicia correctamente
- [ ] Puedo hacer login con usuarios de prueba
- [ ] Puedo ver reportes existentes

---

**Última actualización:** Noviembre 2025

**¡Bienvenido al equipo! 🎉**
