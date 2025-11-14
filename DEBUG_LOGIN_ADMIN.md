# 🔍 DEBUG - Login Admin No Funciona

## Problema
El usuario tiene rol `admin` en la base de datos pero no ve el dashboard admin.

## Pasos para Debuggear

### 1. Verificar Usuario en BD
```bash
python scripts\check_users.py
```

**Resultado esperado:**
```
ID: 1
  Email: 2309045@upy.edu.mx
  Rol: admin  ← Debe decir "admin"
```

### 2. Hacer Login y Ver Logs

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña Console**
3. **Haz login** con: 2309045@upy.edu.mx
4. **Busca estos logs**:

```
🔐 Iniciando login...
✅ Login exitoso: {user: {...}, access_token: "..."}
```

5. **Expande el objeto `user`** y verifica:
```javascript
user: {
  id: 1,
  name: "Administrador UPY",
  email: "2309045@upy.edu.mx",
  role: "admin"  ← DEBE DECIR "admin"
}
```

6. **Verifica el redirect**:
```
➡️ Redirigiendo a: /admin  ← Debe decir "/admin"
```

### 3. Verificar localStorage

En la consola del navegador, ejecuta:

```javascript
// Ver el usuario guardado
JSON.parse(localStorage.getItem('user'))

// Debe mostrar:
{
  id: 1,
  name: "Administrador UPY",
  email: "2309045@upy.edu.mx",
  role: "admin"  ← DEBE DECIR "admin"
}
```

### 4. Verificar Respuesta del Backend

En la consola del BACKEND (donde corre uvicorn), deberías ver:

```
🔐 Login attempt:
   Email: 2309045@upy.edu.mx
   User found: True
   User ID: 1
   User role: admin  ← DEBE DECIR "admin"
   Password valid: True
   ✅ Login SUCCESS
```

## Posibles Problemas

### A. El backend devuelve role incorrecto

**Síntoma:** En los logs del frontend, `user.role` NO es "admin"

**Solución:**
1. Verifica que el usuario en BD tenga rol "admin"
2. Reinicia el backend
3. Intenta login de nuevo

### B. El usuario en localStorage es viejo

**Síntoma:** localStorage tiene un usuario con role "citizen"

**Solución:**
```javascript
// En consola del navegador
localStorage.clear()
// Luego haz login de nuevo
```

### C. El ProtectedRoute no reconoce admin

**Síntoma:** Te redirige a /panel en lugar de /admin

**Solución:** Verifica que `response.user.role === 'admin'` en los logs

### D. Estás usando el usuario incorrecto

**Síntoma:** El usuario NO es el que registraste manualmente

**Solución:** 
- Usa SOLO: `2309045@upy.edu.mx` (el que registraste TÚ)
- NO uses: `admin@ucu.gob.mx` (creado por script, no funciona)

## Script de Verificación Rápida

Ejecuta esto en la consola del navegador DESPUÉS de hacer login:

```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user);
console.log('Es admin?', user?.role === 'admin');
console.log('Debería ir a:', user?.role === 'admin' ? '/admin' : '/panel');
```

## Solución Rápida

Si nada funciona:

1. **Limpia todo**:
```javascript
// En consola del navegador
localStorage.clear()
```

2. **Cierra sesión** (si estás logueado)

3. **Registra un NUEVO usuario**:
   - Ve a: http://localhost:3000/register
   - Email: `test@admin.com`
   - CURP: `TEAA850101HYNXXX01`
   - Password: `admin123`

4. **Cambia el rol**:
```bash
# Edita scripts/update_admin_role.py
# Cambia la línea 27:
email = "test@admin.com"

# Ejecuta:
python scripts\update_admin_role.py
```

5. **Login** con el nuevo usuario

---

**Si después de esto NO funciona, comparte:**
1. Los logs de la consola del navegador (F12)
2. Los logs del backend (terminal)
3. El resultado de `localStorage.getItem('user')`
