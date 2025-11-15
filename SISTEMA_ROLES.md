# 🔐 Sistema de Roles Jerárquicos - UCU Reporta

## 📊 Jerarquía de Roles

El sistema implementa 4 niveles de roles con permisos escalonados:

```
👑 Admin (Nivel 3)
   ↓
👔 Supervisor (Nivel 2)
   ↓
🔧 Operador (Nivel 1)
   ↓
👤 Ciudadano (Nivel 0)
```

---

## 🎯 Roles y Permisos

### 👤 Ciudadano (Nivel 0)
**Permisos:**
- ✅ Crear reportes
- ✅ Ver sus propios reportes
- ✅ Actualizar sus propios reportes
- ❌ Ver reportes de otros
- ❌ Cambiar estados
- ❌ Asignar reportes

**Rutas:**
- `/panel` - Dashboard ciudadano
- `/reportar` - Crear reporte

---

### 🔧 Operador (Nivel 1)
**Permisos:**
- ✅ Todo lo del ciudadano
- ✅ Ver todos los reportes
- ✅ Actualizar estado de reportes asignados
- ✅ Ver reportes asignados a él
- ❌ Asignar reportes a otros
- ❌ Cambiar roles de usuarios

**Rutas:**
- `/operator` - Dashboard operador
- Ver reportes asignados

---

### 👔 Supervisor (Nivel 2)
**Permisos:**
- ✅ Todo lo del operador
- ✅ Asignar reportes a operadores
- ✅ Ver lista de staff (operadores, supervisores, admins)
- ✅ Cambiar roles de: ciudadanos y operadores
- ❌ Cambiar roles de supervisores o admins
- ❌ Acceder a gestión completa de usuarios

**Rutas:**
- `/supervisor` - Dashboard supervisor
- Asignar reportes

---

### 👑 Admin (Nivel 3)
**Permisos:**
- ✅ Acceso completo al sistema
- ✅ Cambiar roles de cualquier usuario (excepto el suyo)
- ✅ Asignar reportes
- ✅ Ver todos los usuarios
- ✅ Gestión completa de usuarios
- ✅ Ver estadísticas completas

**Rutas:**
- `/admin` - Dashboard admin
- `/admin/users` - Gestión de usuarios

---

## 🔄 Reglas de Cambio de Roles

### Regla Principal
**Admin tiene permisos totales. Otros usuarios solo pueden asignar roles de nivel inferior al suyo**

### Ejemplos:

#### Admin puede asignar:
- ✅ Admin (otros admins, no a sí mismo)
- ✅ Supervisor
- ✅ Operador
- ✅ Ciudadano
- **Excepción:** ❌ No puede cambiar su propio rol

#### Supervisor puede asignar:
- ✅ Operador
- ✅ Ciudadano
- ❌ Supervisor (mismo nivel)
- ❌ Admin (nivel superior)

#### Operador puede asignar:
- ✅ Ciudadano
- ❌ Operador (mismo nivel)
- ❌ Supervisor (nivel superior)
- ❌ Admin (nivel superior)

#### Ciudadano:
- ❌ No puede asignar roles

---

## 🛡️ Protecciones del Sistema

### 1. No Auto-Modificación
- ❌ Ningún usuario puede cambiar su propio rol
- Previene escalación de privilegios

### 2. Jerarquía Estricta
- ❌ No se puede asignar un rol igual o superior al propio
- Mantiene la estructura de permisos

### 3. Validación en Backend
- Todas las verificaciones se hacen en el servidor
- El frontend solo oculta opciones, no previene

---

## 📋 Endpoints de API

### Gestión de Usuarios

#### `GET /admin/users`
**Permisos:** Cualquier rol autenticado  
**Descripción:** Lista usuarios según permisos  
**Filtro:** Solo muestra usuarios de nivel igual o inferior

#### `PATCH /admin/users/{user_id}/role`
**Permisos:** Operador+ (para asignar ciudadano), Supervisor+ (para más)  
**Body:**
```json
{
  "role": "operator"
}
```
**Respuesta:**
```json
{
  "id": 1,
  "name": "Usuario",
  "email": "user@example.com",
  "role": "operator",
  "previous_role": "citizen",
  "message": "User role updated from citizen to operator"
}
```

#### `GET /admin/staff`
**Permisos:** Supervisor+  
**Descripción:** Lista solo staff (operadores, supervisores, admins)  
**Uso:** Para asignar reportes

---

### Asignación de Reportes

#### `PATCH /admin/reports/{report_id}/assign`
**Permisos:** Supervisor+  
**Body:**
```json
{
  "assigned_to": 5
}
```
**Respuesta:**
```json
{
  "id": 10,
  "assigned_to": 5,
  "assigned_user": {
    "id": 5,
    "name": "Operador Juan",
    "email": "juan@operator.com",
    "role": "operator"
  },
  "message": "Report assigned to Operador Juan"
}
```

**Validaciones:**
- ❌ No se puede asignar a ciudadanos
- ✅ Solo a operadores, supervisores o admins

---

## 🎨 Frontend - Componentes

### AuthContext
Funciones nuevas:
```javascript
const { 
  isAdmin,        // ¿Es admin?
  isSupervisor,   // ¿Es supervisor?
  isOperator,     // ¿Es operador?
  isCitizen,      // ¿Es ciudadano?
  isStaff,        // ¿Es staff? (operator+)
  getRoleLevel,   // Obtener nivel numérico
  hasMinRole      // ¿Tiene rol mínimo?
} = useAuth();
```

### ProtectedRoute
Nuevos parámetros:
```javascript
<ProtectedRoute requireAdmin={true}>
  {/* Solo admins */}
</ProtectedRoute>

<ProtectedRoute requireMinRole="supervisor">
  {/* Supervisores y admins */}
</ProtectedRoute>
```

### UserManagementPage
Nueva página para gestión de usuarios:
- Tabla de usuarios con filtros
- Búsqueda por nombre/email
- Filtro por rol
- Modal para cambiar roles
- Validación de permisos en UI

---

## 🗄️ Base de Datos

### Cambios en Modelos

#### User
```python
role = Column(String, default="citizen", nullable=False)
# Valores: "citizen", "operator", "supervisor", "admin"
```

#### Report
```python
assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
# ID del operador/supervisor asignado
```

---

## 🚀 Flujo de Trabajo

### Caso 1: Admin crea Supervisor

1. Admin va a `/admin/users`
2. Busca al usuario ciudadano
3. Click en "Cambiar Rol"
4. Selecciona "Supervisor"
5. Confirma
6. Usuario ahora es supervisor

### Caso 2: Supervisor asigna reporte

1. Supervisor ve reporte en dashboard
2. Click en "Asignar"
3. Selecciona operador de la lista
4. Confirma
5. Operador recibe el reporte

### Caso 3: Operador trabaja reporte

1. Operador ve reportes asignados
2. Actualiza estado a "en_proceso"
3. Trabaja en el reporte
4. Actualiza estado a "resuelto"

---

## 📝 Ejemplos de Uso

### Crear Admin desde Ciudadano

```bash
# 1. Usuario se registra como ciudadano
POST /auth/register
{
  "name": "Super Admin",
  "email": "admin@ucu.gob.mx",
  "curp": "AUCU850101HYNXXX01",
  "password": "admin123"
}

# 2. Admin existente cambia su rol
PATCH /admin/users/1/role
Authorization: Bearer {admin_token}
{
  "role": "admin"
}
```

### Supervisor asigna reporte a Operador

```bash
# 1. Obtener lista de staff
GET /admin/staff
Authorization: Bearer {supervisor_token}

# 2. Asignar reporte
PATCH /admin/reports/10/assign
Authorization: Bearer {supervisor_token}
{
  "assigned_to": 5
}
```

---

## ⚠️ Consideraciones Importantes

### Seguridad
1. **Nunca confíes solo en el frontend**
   - Todas las validaciones están en el backend
   - El frontend solo mejora UX

2. **Tokens JWT incluyen el rol**
   - El rol se verifica en cada request
   - Si cambia el rol, el usuario debe volver a loguearse

3. **No hay bypass posible**
   - Todas las rutas verifican permisos
   - Los endpoints validan jerarquía

### Performance
1. **Caché de usuarios**
   - La lista de usuarios se carga una vez
   - Se refresca después de cambios

2. **Filtros en frontend**
   - Búsqueda y filtros son locales
   - No hacen requests adicionales

---

## 🔄 Migración de Datos

Si ya tienes usuarios con solo "citizen" y "admin":

1. Los usuarios existentes mantienen sus roles
2. Nuevos roles se asignan manualmente
3. No hay migración automática necesaria
4. El campo `assigned_to` es nullable (puede ser NULL)

---

## 📚 Documentación de Referencia

- **Backend:** `backend/routes/admin.py`
- **Frontend Auth:** `frontend/src/context/AuthContext.jsx`
- **Gestión Usuarios:** `frontend/src/pages/UserManagementPage.jsx`
- **Rutas:** `frontend/src/App.jsx`
- **Protección:** `frontend/src/components/ProtectedRoute.jsx`

---

**Sistema implementado y funcional** ✅
