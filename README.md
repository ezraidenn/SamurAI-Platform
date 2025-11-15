# UCU Reporta & Negocios 🏛️🏪

**Plataforma Integral de Reportes Ciudadanos y Directorio de Negocios Locales**

UCU Reporta es una plataforma moderna que combina dos sistemas esenciales para municipios:
1. **Sistema de Reportes Ciudadanos**: Reporta y da seguimiento a problemas municipales (baches, alumbrado, basura, drenaje, vialidad)
2. **Directorio de Negocios Locales**: Mapa interactivo con negocios verificados y POIs oficiales (escuelas, hospitales, gobierno)

## 🌟 Overview

Plataforma completa con dos módulos principales:

### 📋 Sistema de Reportes
- Reportes ciudadanos de problemas urbanos
- Dashboard para operadores municipales
- Validación automática con IA
- Sistema de priorización inteligente

### 🏪 Sistema de Negocios (POIs)
- Directorio de negocios locales
- Mapa interactivo con marcadores personalizados
- POIs oficiales pre-cargados (escuelas, hospitales, gobierno)
- Validación automática con IA (GPT-4 Vision)
- Sistema de categorías inteligente

**Stack Tecnológico:**
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Neon)
- **Frontend**: React + Vite + Tailwind CSS + Leaflet
- **IA**: OpenAI GPT-4o-mini con visión

## 🚀 Quick Start

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn backend.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

### Frontend Setup ✅

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at:
- **App**: http://localhost:3000

## 📁 Project Structure

```
SamurAI Reportes/
├── backend/
│   ├── main.py                    # Entry point con todos los routers
│   ├── database.py                # PostgreSQL config con pool optimizado
│   ├── config.py                  # Variables de entorno
│   ├── models/
│   │   ├── user.py               # Modelo de usuarios
│   │   ├── report.py             # Modelo de reportes
│   │   ├── point_of_interest.py  # Modelo de POIs/Negocios
│   │   ├── announcement.py       # Modelo de anuncios
│   │   └── strike.py             # Sistema de moderación
│   ├── schemas/
│   │   ├── user.py
│   │   ├── report.py
│   │   └── point_of_interest.py  # Schemas de POIs
│   ├── routes/
│   │   ├── users.py              # Auth y usuarios
│   │   ├── reports.py            # CRUD de reportes
│   │   ├── points_of_interest.py # CRUD de POIs
│   │   ├── announcements.py      # Sistema de anuncios
│   │   ├── admin.py              # Endpoints de admin
│   │   └── name_change.py        # Cambio de nombres
│   ├── services/
│   │   └── poi_validator.py      # Validación IA con GPT-4 Vision
│   ├── static/uploads/           # Fotos de reportes y POIs
│   ├── seed_official_pois.py     # Script para POIs oficiales
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── OperatorDashboardPage.jsx
│   │   │   ├── NegociosPage.jsx          # Hub de negocios
│   │   │   ├── MapaNegociosPage.jsx      # Mapa interactivo
│   │   │   ├── RegistrarNegocioPage.jsx  # Registro de negocio
│   │   │   ├── MisNegociosPage.jsx       # Gestión de negocios
│   │   │   └── ValidarNegociosPage.jsx   # Validación admin
│   │   ├── components/
│   │   │   ├── MapPicker.jsx             # Selector de ubicación
│   │   │   └── UcuMap.jsx                # Mapa de reportes
│   │   ├── constants/
│   │   │   └── poiCategories.js          # Categorías de POIs
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── services/
│   │       └── api.js                    # Cliente API
│   └── package.json
├── INSTRUCCIONES_POIS_OFICIALES.md
└── README.md
```

## 🎯 Características Principales

### 📋 Sistema de Reportes Ciudadanos
- ✅ Registro y autenticación con JWT
- ✅ Creación de reportes con foto y geolocalización
- ✅ Dashboard ciudadano con filtros y estadísticas
- ✅ Sistema de priorización automática
- ✅ Seguimiento en tiempo real del estatus
- ✅ Dashboard para operadores municipales
- ✅ Panel de administración completo
- ✅ Sistema de moderación con strikes

### 🏪 Sistema de Negocios y POIs
- ✅ Registro de negocios con validación IA
- ✅ Pre-validación de fotos con GPT-4 Vision
- ✅ Detección automática de categoría
- ✅ Mapa interactivo con Leaflet
- ✅ Marcadores personalizados por categoría
- ✅ 13 POIs oficiales pre-cargados:
  - 3 Escuelas (primaria, secundaria, telesecundaria)
  - 2 Centros de salud (centro de salud, farmacia)
  - 2 Oficinas de gobierno (palacio municipal, comisaría)
  - 1 Iglesia
  - 2 Espacios públicos (parque, cancha deportiva)
  - 1 Gasolinera
  - 2 Tiendas oficiales (OXXO, 3B)
- ✅ POIs oficiales con borde dorado y badge de verificación
- ✅ Sistema de validación humana para admins
- ✅ Gestión de negocios propios
- ✅ Filtros por categoría
- ✅ Modal de detalles con toda la información
- ✅ Opciones de admin (eliminar/editar)

### 🤖 Validación con IA
- ✅ Integración con OpenAI GPT-4o-mini
- ✅ Validación de fotos (apropiadas, relevantes)
- ✅ Detección automática de categoría de negocio
- ✅ Análisis de spam y contenido inapropiado
- ✅ Sugerencias de mejora automáticas
- ✅ Confianza y scoring de validación

### 👥 Sistema de Usuarios y Roles
- ✅ **Ciudadano**: Crear reportes y registrar negocios
- ✅ **Operador**: Gestionar reportes asignados
- ✅ **Supervisor**: Gestión de usuarios + operaciones
- ✅ **Admin**: Control total del sistema

### 📢 Sistema de Anuncios
- ✅ Publicación de anuncios municipales
- ✅ Subida de imágenes
- ✅ Gestión de anuncios activos

## 🎉 Estado del Proyecto

**Status**: ✅ **PRODUCCIÓN - DESPLEGADO**

- ✅ Backend desplegado en Render
- ✅ Frontend desplegado en Vercel
- ✅ Base de datos PostgreSQL en Neon
- ✅ Sistema de POIs completamente funcional
- ✅ Validación IA operativa
- ✅ Mapa interactivo con 13 POIs oficiales
- ✅ Listo para uso municipal

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.13**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM con soporte para PostgreSQL
- **PostgreSQL (Neon)** - Base de datos en la nube
- **Pydantic** - Validación de datos
- **JWT** - Autenticación con tokens
- **OpenAI GPT-4o-mini** - IA para validación
- **Alembic** - Migraciones de base de datos
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router v6** - Navegación
- **Leaflet** - Mapas interactivos
- **Recharts** - Gráficos y analytics
- **Framer Motion** - Animaciones fluidas
- **Axios** - Cliente HTTP

### Infraestructura
- **Render** - Hosting del backend
- **Vercel** - Hosting del frontend
- **Neon** - Base de datos PostgreSQL serverless
- **GitHub** - Control de versiones

## 📊 Modelos de Datos

### User
- Autenticación con email y CURP
- Roles: citizen, operator, supervisor, admin
- Sistema de strikes y moderación
- Relaciones: reportes, POIs, anuncios

### Report
- Categorías: bache, alumbrado, basura, drenaje, vialidad
- Coordenadas GPS
- Prioridad (1-5, auto-calculada)
- Status: pendiente, en_proceso, resuelto
- Foto opcional

### PointOfInterest (POI)
- 17 categorías de negocios
- Validación IA automática
- Validación humana por admins
- Coordenadas GPS
- Foto, contacto, horarios, redes sociales
- Campo `is_official` para POIs verificados

### Announcement
- Título, contenido, imagen
- Fechas de inicio y fin
- Visibilidad controlada

## 🌐 API Documentation

**Producción:**
- **API**: https://samurai-backend.onrender.com
- **Docs**: https://samurai-backend.onrender.com/docs
- **ReDoc**: https://samurai-backend.onrender.com/redoc

**Local:**
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

## 🚀 Despliegue

### URLs de Producción
- **Frontend**: https://samurai-frontend.vercel.app
- **Backend**: https://samurai-backend.onrender.com
- **Base de Datos**: Neon PostgreSQL (pooled connection)

### Variables de Entorno Requeridas

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-proj-...
CORS_ORIGINS=https://tu-frontend.vercel.app
```

**Frontend (.env):**
```env
VITE_API_URL=https://samurai-backend.onrender.com
```

## 📚 Documentación Adicional

- 📘 [Instrucciones POIs Oficiales](INSTRUCCIONES_POIS_OFICIALES.md) - Guía completa del sistema de POIs
- 🔧 [Configuración de Equipo](CONFIGURACION_EQUIPO.md) - Setup del equipo de desarrollo

## 👥 Equipo

Desarrollado para municipios de Yucatán como parte de la iniciativa de tecnología cívica.

**Desarrolladores:**
- Raúl Cetina - Full Stack Developer & Product Lead

## 📝 Licencia

Este proyecto es parte de la iniciativa UCU Reporta para mejorar la participación ciudadana y el desarrollo económico local en municipios de Yucatán.

---

## 🎯 Quick Start Local

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

**Visita:** http://localhost:3000

---

**Status**: ✅ **100% FUNCIONAL Y DESPLEGADO**  
**Última actualización**: Noviembre 2025
