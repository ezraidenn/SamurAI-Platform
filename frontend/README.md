# UCU Reporta - Frontend

**Frontend para la plataforma de reportes ciudadanos UCU Reporta**

Aplicación web construida con React + Vite + Tailwind CSS con tema institucional "guinda".

## 🎨 Tecnologías

- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegación
- **Framer Motion** - Animaciones
- **Axios** - Cliente HTTP
- **Recharts** - Gráficas (PROMPT 6)
- **React Leaflet** - Mapas interactivos (PROMPT 5/6)

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` si es necesario (por defecto apunta a `http://localhost:8000`).

### 3. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── layouts/
│   │   └── MainLayout.jsx      # Layout principal con navbar
│   ├── pages/
│   │   ├── LoginPage.jsx        # Página de login
│   │   ├── RegisterPage.jsx     # Página de registro
│   │   ├── ReportFormPage.jsx   # Crear reporte
│   │   ├── CitizenDashboardPage.jsx  # Dashboard ciudadano
│   │   └── AdminDashboardPage.jsx    # Dashboard admin
│   ├── services/
│   │   └── api.js              # Servicios de API
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globales
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Tema de Colores

El tema utiliza el color institucional **"guinda"** (similar al partido Morena):

```js
guinda: {
  DEFAULT: '#800020',  // Guinda principal
  light: '#a63a4a',    // Guinda claro
  dark: '#4d0013',     // Guinda oscuro
}
```

### Uso en Tailwind:

```jsx
<div className="bg-guinda text-white">
  <button className="bg-guinda-dark hover:bg-guinda-light">
    Botón
  </button>
</div>
```

## 📱 Diseño Responsivo

La aplicación es completamente responsive:

- **Mobile-first**: Diseñada primero para dispositivos móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navbar**: Hamburger menu en mobile, horizontal en desktop
- **Cards**: Stack vertical en mobile, grid en desktop

## 🔌 Integración con Backend

El servicio de API (`src/services/api.js`) está configurado para:

- Base URL configurable via `VITE_API_URL`
- Inyección automática de token JWT en headers
- Interceptor para manejo de errores 401 (token expirado)
- Funciones helper para todos los endpoints del backend

### Ejemplo de uso:

```js
import { loginUser, createReport } from './services/api';

// Login
const { access_token, user } = await loginUser({
  email: 'user@example.com',
  password: 'password123'
});

// Crear reporte
const report = await createReport({
  category: 'bache',
  description: 'Bache grande...',
  latitude: 21.1619,
  longitude: -86.8515
});
```

## 🎭 Animaciones

Framer Motion está configurado para animaciones suaves:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenido animado
</motion.div>
```

## ✅ Estado de Implementación

**All PROMPTs COMPLETE** ✅

### 🔜 Próximos Pasos

**PROMPT 4** - Autenticación en Frontend
- AuthContext para gestión de estado
- Login/Register funcionales
- Protected routes
- Manejo de roles (citizen/admin)

**PROMPT 5** - Reportes Ciudadanos
- Formulario de reportes con validación
- Mapa interactivo con Leaflet
- Upload de fotos
- Dashboard ciudadano con datos reales

**PROMPT 6** - Dashboard Admin
- Mapa con markers de reportes
- Gráficas con Recharts
- Gestión de estados de reportes
- KPIs en tiempo real

**PROMPT 7** - Pulido Final
- Optimizaciones responsive
- Loading states
- Toast notifications
- Testing y demo

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

## 📦 Dependencias Principales

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.26.1",
  "axios": "^1.7.7",
  "framer-motion": "^11.5.4",
  "recharts": "^2.12.7",
  "react-leaflet": "^4.2.1",
  "leaflet": "^1.9.4"
}
```

## 🤝 Desarrollo

El frontend está diseñado para integrarse perfectamente con el backend FastAPI:

- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`
- **CORS**: Ya configurado en el backend

## ✅ Estado Final de Implementación

### Completado al 100% 🎉

**PROMPT 3**: ✅ Base del frontend con routing y componentes  
**PROMPT 4**: ✅ Sistema de autenticación completo  
**PROMPT 5**: ✅ Reportes ciudadanos con mapa y gráficas  
**PROMPT 6**: ✅ Dashboard administrativo completo  
**PROMPT 7**: ✅ Landing page, error boundary y optimizaciones  

### Características Implementadas

#### Páginas Públicas
- 🌐 **Landing Page** - Página de inicio profesional
- 🔐 **Login/Register** - Con validación CURP

#### Características Ciudadano
- 📝 **Crear Reportes** - Formulario con mapa + fotos
- 📊 **Dashboard** - Con gráficas y filtros
- 🔍 **Seguimiento** - Estado en tiempo real

#### Características Admin
- 📈 **KPIs** - 5 métricas clave
- 🗺️ **Mapa Interactivo** - Markers por estado
- ⚙️ **Gestión** - Cambio de estados
- 📊 **Gráficas** - Por categoría y estado

### Seguridad y Calidad
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Role-based access
- ✅ Error boundary
- ✅ Form validation
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Performance optimized

## 📄 Licencia

Parte de la iniciativa UCU Reporta para municipios de Yucatán.
