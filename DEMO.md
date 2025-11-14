# 🎬 UCU Reporta - Guía de Demo

Esta guía te ayudará a demostrar todas las funcionalidades de la plataforma **UCU Reporta**.

## 🚀 Iniciar la Plataforma

### 1. Backend (Terminal 1)
```bash
# Activar entorno virtual
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
venv\Scripts\activate

# Iniciar servidor
uvicorn backend.main:app --reload
```
✅ Backend corriendo en: http://localhost:8000

### 2. Frontend (Terminal 2)
```bash
# Navegar a frontend
cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"

# Iniciar servidor
npm run dev
```
✅ Frontend corriendo en: http://localhost:3000

---

## 👥 Usuarios de Prueba

### Ciudadano
```
Email: maria@example.com
Password: password123
CURP: GOGM900515MYNXNR03
```

### Administrador
```
Email: admin@ucu.gob.mx
Password: admin123
CURP: AUCU850101HYNXXX01
```

**⚠️ IMPORTANTE**: Para que el usuario admin tenga rol de administrador, ejecuta:
```sql
-- Conectar a la base de datos
sqlite3 backend/database/ucudigital.db

-- Cambiar rol a admin
UPDATE users SET role='admin' WHERE email='admin@ucu.gob.mx';

-- Verificar
SELECT id, name, email, role FROM users;
```

---

## 📋 Script de Demostración

### PARTE 1: Registro y Login (5 min)

#### 1.1 Registrar Usuario Ciudadano
1. Ir a http://localhost:3000/register
2. Completar formulario:
   - Nombre: "Juan López"
   - Email: "juan@test.com"
   - CURP: "LOGJ920815HYNNPR04" (válido)
   - Contraseña: "password123"
3. ✅ **Resultado**: Pantalla de éxito → Redirección a login

#### 1.2 Login como Ciudadano
1. Usar credenciales: maria@example.com / password123
2. ✅ **Resultado**: Redirección automática a `/panel`
3. **Mostrar**: Navbar con "Hola, María" y opciones ciudadano

---

### PARTE 2: Crear Reportes (10 min)

#### 2.1 Reporte con Prioridad Alta
1. Click en "Nuevo Reporte" o ir a `/reportar`
2. Seleccionar: 🕳️ **Bache**
3. Descripción: 
   ```
   Bache muy grande en calle principal cerca de la escuela primaria.
   Representa un riesgo de accidente para niños y vehículos.
   Urgente atención requerida.
   ```
4. Click en el mapa (coordenadas en Mérida)
5. Opcionalmente: Subir foto
6. ✅ **Resultado**: 
   - Reporte creado con prioridad **4** (bache=3 + keywords=1)
   - Redirección a dashboard

#### 2.2 Reporte con Prioridad Normal
1. Nuevo reporte
2. Seleccionar: 🗑️ **Basura**
3. Descripción: "Acumulación de basura en esquina de la calle"
4. Marcar ubicación diferente
5. ✅ **Resultado**: 
   - Prioridad **1** (basura sin keywords)

#### 2.3 Reporte con Foto
1. Nuevo reporte
2. Seleccionar: 💡 **Alumbrado**
3. Descripción: "Poste de luz apagado desde hace 3 días"
4. **Subir foto** → Ver preview
5. ✅ **Resultado**: Reporte con imagen

---

### PARTE 3: Dashboard Ciudadano (5 min)

#### 3.1 Ver Estadísticas
1. En `/panel`
2. **Mostrar KPIs animados**:
   - Total reportes
   - Pendientes, En proceso, Resueltos
3. **Mostrar gráficas**:
   - Pie chart por estado
   - Bar chart por categoría

#### 3.2 Filtrar Reportes
1. Filtrar por estado: "Pendiente"
2. ✅ Ver solo reportes pendientes
3. Filtrar por categoría: "Bache"
4. Limpiar filtros

#### 3.3 Ver Detalles
1. Click en "Ver detalles" en un reporte
2. **Modal muestra**:
   - Descripción completa
   - Ubicación GPS
   - Foto (si existe)
   - Estado y prioridad

---

### PARTE 4: Dashboard Admin (10 min)

#### 4.1 Login como Admin
1. Cerrar sesión
2. Login con: admin@ucu.gob.mx / admin123
3. ✅ **Resultado**: Redirección a `/admin`

#### 4.2 Ver KPIs Globales
**Mostrar 5 KPIs:**
- 📊 Total reportes del sistema
- ✅ Resueltos
- ⏳ Pendientes
- 🔄 En proceso
- ⏱️ Tiempo promedio de resolución

#### 4.3 Mapa Interactivo
1. **Ver mapa** con todos los reportes
2. **Markers coloreados**:
   - 🟡 Amarillo = Pendiente
   - 🔵 Azul = En proceso
   - 🟢 Verde = Resuelto
3. Click en marker → Popup con info

#### 4.4 Gráficas Administrativas
1. **Gráfica de barras**: Reportes por categoría
2. **Gráfica de pie**: Distribución por estado

#### 4.5 Gestionar Estados
1. En la tabla, buscar reporte "Pendiente"
2. Click "Cambiar Estado"
3. **Modal aparece**:
   - Cambiar a "En Proceso"
   - Agregar comentario: "Equipo enviado al sitio"
4. ✅ **Resultado**: 
   - Estado actualizado
   - Marker en mapa cambia de color
   - KPIs se actualizan

#### 4.6 Resolver Reporte
1. Seleccionar reporte "En Proceso"
2. Cambiar estado a "Resuelto"
3. Comentario: "Problema solucionado, bache reparado"
4. ✅ **Resultado**: Reportes resueltos +1

---

## 🎯 Puntos Clave a Destacar

### Características Técnicas
- ✅ **Backend**: FastAPI con SQLAlchemy + SQLite
- ✅ **Frontend**: React + Vite + Tailwind CSS
- ✅ **Auth**: JWT con roles (citizen/admin)
- ✅ **Mapas**: Leaflet con OpenStreetMap
- ✅ **Gráficas**: Recharts
- ✅ **Animaciones**: Framer Motion
- ✅ **Responsive**: Mobile + Desktop

### Funcionalidades Clave
1. **CURP Validation**: Formato mexicano oficial
2. **Prioridad Automática**: Keywords + categoría
3. **Roles**: Ciudadano vs Administrador
4. **Geolocalización**: Mapas interactivos
5. **Upload de fotos**: Con preview
6. **Filtros**: Por estado y categoría
7. **KPIs en tiempo real**: Métricas del sistema
8. **Estado de reportes**: Workflow completo

### Ventajas para el Municipio
- 📱 **Acceso ciudadano**: Fácil reportar problemas
- 🗺️ **Geolocalización**: Ubicación exacta
- 📊 **Métricas**: Dashboard con estadísticas
- ⚡ **Priorización**: Automática por urgencia
- 👥 **Gestión**: Admin puede actualizar estados
- 📈 **Transparencia**: Ciudadanos ven progreso

---

## 🧪 Casos de Prueba Adicionales

### Test 1: Validación CURP
1. Intentar registro con CURP inválido: "ABC123"
2. ✅ Error: "Formato de CURP inválido"

### Test 2: Email Duplicado
1. Intentar registro con email existente
2. ✅ Error del backend

### Test 3: Protected Routes
1. Intentar acceder a `/admin` como ciudadano
2. ✅ Pantalla: "Acceso Denegado"

### Test 4: Session Persistence
1. Refresh página estando logueado
2. ✅ Sesión se mantiene (localStorage)

### Test 5: Responsive
1. Abrir DevTools → Modo móvil
2. ✅ Hamburger menu, cards en lugar de tablas

---

## 📸 Screenshots Recomendados

1. **Login/Register** - Pantallas de auth
2. **Formulario de reporte** - Con mapa y foto
3. **Dashboard ciudadano** - Con gráficas
4. **Mapa admin** - Con múltiples markers
5. **Modal de estado** - Cambio de status
6. **Responsive mobile** - Vista móvil

---

## 🎤 Pitch de 2 Minutos

> "UCU Reporta es una plataforma web que conecta a ciudadanos con sus municipios de forma digital y eficiente.
>
> **Para los ciudadanos**: Pueden reportar problemas urbanos (baches, alumbrado, basura, etc.) con su ubicación GPS exacta y fotos. Ven el estado de sus reportes en tiempo real.
>
> **Para los municipios**: Dashboard administrativo con mapa interactivo mostrando todos los reportes, KPIs automáticos, y gestión de estados. Sistema de priorización inteligente que detecta palabras clave como 'peligro' o 'niños' para atender emergencias primero.
>
> **Tecnología**: Backend robusto con FastAPI, frontend moderno con React, autenticación segura con JWT, y validación de identidad con CURP oficial mexicano.
>
> **Resultado**: Comunicación directa, transparente y eficiente entre ciudadanos y gobierno local."

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar puerto 8000
netstat -ano | findstr :8000

# Reinstalar dependencias
pip install -r requirements.txt
```

### Frontend no inicia
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Base de datos corrupta
```bash
# Eliminar y recrear
rm backend/database/ucudigital.db
# El backend la recreará automáticamente
```

### Rol admin no funciona
```sql
sqlite3 backend/database/ucudigital.db
UPDATE users SET role='admin' WHERE email='admin@ucu.gob.mx';
.quit
```

---

## 📚 API Docs

**Swagger UI**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

¡Listo para la demo! 🎉
