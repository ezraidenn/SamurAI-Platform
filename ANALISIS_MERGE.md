# 📊 ANÁLISIS DE MERGE - Unificación de Ramas

## 🌿 Ramas Disponibles

1. **`main`** - Rama principal (base)
2. **`raulc`** - Sistema de validación IA + strikes + baneos
3. **`feature/ucu-validations-and-improvements`** - Validaciones UCU + timeout de sesión
4. **`perfil-de-usuario`** - Perfil de usuario + cambio de nombre

---

## 📁 Archivos Modificados por Rama

### Rama `raulc` (Sistema IA + Strikes)
**Nuevos archivos:**
- ✅ `backend/services/ai_validator.py` - Validación con GPT-4
- ✅ `backend/services/moderation.py` - Sistema de strikes
- ✅ `backend/middleware/ban_check.py` - Middleware de baneos
- ✅ `backend/models/strike.py` - Modelo de strikes
- ✅ `frontend/src/hooks/useBanStatus.js` - Hook de estado de ban
- ✅ `VALIDACION_IA.md` - Documentación
- ✅ Migraciones de IA y strikes

**Archivos modificados:**
- ⚠️ `backend/models/user.py` - Campos de moderación
- ⚠️ `backend/models/report.py` - Campos de IA
- ⚠️ `backend/routes/reports.py` - Validación secuencial
- ⚠️ `backend/routes/users.py` - Endpoint de strikes
- ⚠️ `backend/schemas/user.py` - Ban info
- ⚠️ `frontend/src/pages/ReportFormPage.jsx` - Modal + banner
- ⚠️ `frontend/src/layouts/MainLayout.jsx` - Botón deshabilitado
- ⚠️ `frontend/src/pages/AdminDashboardPage.jsx` - Filtros + strikes

---

### Rama `feature/ucu-validations-and-improvements`
**Nuevos archivos:**
- ✅ `frontend/src/config/ucuData.js` - Datos de UCU
- ✅ `frontend/src/hooks/useSessionTimeout.js` - Timeout de sesión

**Archivos modificados:**
- ⚠️ `backend/auth/jwt_handler.py` - Mejoras JWT
- ⚠️ `backend/models/user.py` - Validaciones UCU
- ⚠️ `backend/models/report.py` - Validaciones
- ⚠️ `backend/routes/admin.py` - Mejoras admin
- ⚠️ `frontend/src/App.jsx` - Rutas
- ⚠️ `frontend/src/components/MapPicker.jsx` - Mejoras mapa
- ⚠️ `frontend/src/context/AuthContext.jsx` - Timeout
- ⚠️ `frontend/src/layouts/MainLayout.jsx` - UI mejorada
- ⚠️ `frontend/src/pages/LoginPage.jsx` - Validaciones
- ⚠️ `frontend/src/pages/ReportFormPage.jsx` - Validaciones UCU

**Archivos eliminados:**
- ❌ Varios archivos de configuración y scripts antiguos
- ❌ `.env` files (movidos a .env.example)

---

### Rama `perfil-de-usuario`
**Nuevos archivos:**
- ✅ `backend/models/name_change_request.py` - Modelo de cambio de nombre
- ✅ `backend/routes/name_change.py` - Rutas de cambio de nombre
- ✅ `backend/schemas/name_change_request.py` - Schemas
- ✅ `frontend/src/components/NameChangeModal.jsx` - Modal
- ✅ `frontend/src/pages/ProfilePage.jsx` - Página de perfil

**Archivos modificados:**
- ⚠️ `backend/main.py` - Registro de rutas
- ⚠️ `backend/routes/admin.py` - Gestión de solicitudes
- ⚠️ `backend/routes/users.py` - Endpoints de perfil
- ⚠️ `backend/schemas/user.py` - Schemas de usuario
- ⚠️ `frontend/src/App.jsx` - Ruta de perfil
- ⚠️ `frontend/src/context/AuthContext.jsx` - Actualización de perfil
- ⚠️ `frontend/src/layouts/MainLayout.jsx` - Link a perfil
- ⚠️ `frontend/src/services/api.js` - APIs de perfil

---

## ⚠️ CONFLICTOS POTENCIALES

### 🔴 CONFLICTOS CRÍTICOS (Requieren atención)

#### 1. **`backend/models/user.py`**
- **raulc**: Agrega campos de moderación (strike_count, is_banned, ban_until, ban_reason)
- **feature/ucu**: Agrega validaciones UCU
- **Solución**: ✅ Combinar ambos cambios (no hay conflicto real)

#### 2. **`backend/models/report.py`**
- **raulc**: Agrega campos de IA (ai_validated, ai_confidence, ai_reasoning, etc.)
- **feature/ucu**: Agrega validaciones
- **Solución**: ✅ Combinar ambos cambios

#### 3. **`backend/routes/users.py`**
- **raulc**: Agrega endpoint `/users/{user_id}/strikes`
- **perfil**: Agrega endpoints de perfil y cambio de nombre
- **Solución**: ✅ Combinar ambos (diferentes endpoints)

#### 4. **`frontend/src/layouts/MainLayout.jsx`**
- **raulc**: Agrega botón deshabilitado con tooltip de ban
- **feature/ucu**: Mejoras de UI y timeout
- **perfil**: Agrega link a perfil
- **Solución**: ⚠️ REQUIERE MERGE MANUAL - Combinar las 3 funcionalidades

#### 5. **`frontend/src/pages/ReportFormPage.jsx`**
- **raulc**: Agrega modal de strikes y banner de ban
- **feature/ucu**: Agrega validaciones UCU
- **Solución**: ⚠️ REQUIERE MERGE MANUAL - Combinar validaciones

#### 6. **`frontend/src/App.jsx`**
- **feature/ucu**: Cambios en rutas
- **perfil**: Agrega ruta de perfil
- **Solución**: ✅ Combinar rutas

#### 7. **`frontend/src/context/AuthContext.jsx`**
- **feature/ucu**: Agrega timeout de sesión
- **perfil**: Agrega actualización de perfil
- **Solución**: ✅ Combinar ambas funcionalidades

#### 8. **`backend/main.py`**
- **perfil**: Registra rutas de name_change
- **Solución**: ✅ Agregar registro de rutas

---

## 🟡 CONFLICTOS MENORES

### 1. **`frontend/src/services/api.js`**
- Todas las ramas agregan funciones
- **Solución**: ✅ Combinar todas las funciones

### 2. **`backend/routes/admin.py`**
- **feature/ucu**: Mejoras admin
- **perfil**: Gestión de solicitudes de nombre
- **Solución**: ✅ Combinar funcionalidades

### 3. **`backend/schemas/user.py`**
- **raulc**: Agrega campos de ban
- **perfil**: Agrega campos de perfil
- **Solución**: ✅ Combinar schemas

---

## 🟢 SIN CONFLICTOS

### Archivos únicos por rama:
- ✅ Servicios de IA (raulc)
- ✅ Middleware de ban (raulc)
- ✅ Modelo de strikes (raulc)
- ✅ Hook de ban status (raulc)
- ✅ Datos de UCU (feature/ucu)
- ✅ Hook de timeout (feature/ucu)
- ✅ Modelo de name_change (perfil)
- ✅ Rutas de name_change (perfil)
- ✅ Página de perfil (perfil)
- ✅ Modal de cambio de nombre (perfil)

---

## 📋 PLAN DE MERGE RECOMENDADO

### Fase 1: Preparación
```bash
# 1. Asegurar que raulc esté actualizado
git checkout raulc
git pull origin raulc

# 2. Crear rama de integración
git checkout -b integration/merge-all
```

### Fase 2: Merge de perfil-de-usuario (Más simple)
```bash
# 3. Merge perfil-de-usuario
git merge origin/perfil-de-usuario

# Resolver conflictos en:
# - frontend/src/layouts/MainLayout.jsx
# - frontend/src/App.jsx
# - backend/routes/users.py
# - backend/schemas/user.py
```

### Fase 3: Merge de feature/ucu-validations-and-improvements
```bash
# 4. Merge feature/ucu
git merge origin/feature/ucu-validations-and-improvements

# Resolver conflictos en:
# - frontend/src/layouts/MainLayout.jsx (ya parcialmente resuelto)
# - frontend/src/pages/ReportFormPage.jsx
# - frontend/src/context/AuthContext.jsx
# - backend/models/user.py
# - backend/models/report.py
```

### Fase 4: Testing
```bash
# 5. Probar todo el sistema
# - Validación IA
# - Sistema de strikes
# - Perfil de usuario
# - Validaciones UCU
# - Timeout de sesión
```

### Fase 5: Merge a main
```bash
# 6. Si todo funciona, merge a main
git checkout main
git merge integration/merge-all
git push origin main
```

---

## 🎯 RESUMEN DE FUNCIONALIDADES POR RAMA

### `raulc` (Sistema IA + Moderación)
- ✅ Validación de imágenes con GPT-4 Vision
- ✅ Validación de texto ofensivo
- ✅ Sistema de strikes progresivos (1-5)
- ✅ Baneos temporales y permanentes
- ✅ Middleware de verificación de ban
- ✅ Dashboard admin con filtros y strikes
- ✅ Modal de strikes y banner de ban
- ✅ Historial de infracciones

### `feature/ucu-validations-and-improvements`
- ✅ Validaciones de datos UCU
- ✅ Timeout de sesión automático
- ✅ Mejoras en UI/UX
- ✅ Validaciones de formularios
- ✅ Mejoras en MapPicker
- ✅ Limpieza de archivos obsoletos

### `perfil-de-usuario`
- ✅ Página de perfil de usuario
- ✅ Solicitud de cambio de nombre
- ✅ Aprobación/rechazo por admin
- ✅ Modal de cambio de nombre
- ✅ Historial de solicitudes

---

## ⚡ PRIORIDAD DE MERGE

1. **ALTA**: `perfil-de-usuario` (menos conflictos, funcionalidad independiente)
2. **ALTA**: `feature/ucu-validations-and-improvements` (mejoras importantes)
3. **MEDIA**: Resolver conflictos finales
4. **BAJA**: Testing exhaustivo

---

## 🚨 ADVERTENCIAS

1. **NO ELIMINAR** archivos `.env` locales durante el merge
2. **VERIFICAR** que todas las migraciones se ejecuten en orden
3. **PROBAR** cada funcionalidad después del merge
4. **MANTENER** copias de seguridad antes de merge a main
5. **DOCUMENTAR** cualquier cambio manual realizado

---

## 📝 NOTAS ADICIONALES

- Las tres ramas son **complementarias**, no competitivas
- Los conflictos son principalmente en archivos compartidos (layouts, contexts)
- La mayoría de funcionalidades son **independientes**
- El merge debería ser **relativamente limpio** con atención manual

---

**Fecha de análisis**: 14 Nov 2024
**Analizado por**: Cascade AI
**Estado**: Listo para merge
