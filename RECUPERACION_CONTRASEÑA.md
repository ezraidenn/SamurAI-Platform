# 🔑 Sistema de Recuperación de Contraseña

## 🔄 Modo Simulado (Fallback)

Este sistema de recuperación de contraseña funciona completamente en el **frontend** sin necesidad de backend, base de datos ni envío de emails reales.

---

## 📋 Características

### ✅ **Funcionalidad Completa**
- Solicitud de recuperación de contraseña
- Generación de token único
- Verificación de token
- Cambio de contraseña
- Expiración de tokens (1 hora)
- Validaciones de seguridad

### 🔄 **Modo Simulado**
- **Sin backend**: Todo funciona en el navegador
- **Sin base de datos**: Usa `localStorage`
- **Sin emails**: Muestra el link directamente
- **Temporal**: Los tokens expiran en 1 hora
- **Seguro**: Validaciones completas

---

## 🎯 Flujo de Usuario

### 1. **Olvidé mi contraseña**
```
Login → "¿Olvidaste tu contraseña?" → /recuperar-contraseña
```

### 2. **Solicitar recuperación**
```
1. Ingresar email
2. Click en "Enviar enlace de recuperación"
3. Sistema genera token único
4. Token se guarda en localStorage
5. Se muestra link directo (modo simulado)
```

### 3. **Restablecer contraseña**
```
1. Click en el link mostrado
2. Sistema verifica token
3. Formulario de nueva contraseña
4. Validaciones de seguridad
5. Confirmación de contraseña
6. Click en "Actualizar contraseña"
```

### 4. **Éxito**
```
1. Token se elimina de localStorage
2. Mensaje de éxito
3. Redirección automática a login (2 segundos)
4. Iniciar sesión normalmente
```

---

## 🔒 Seguridad Implementada

### **Tokens**
- ✅ Generados aleatoriamente
- ✅ Únicos por solicitud
- ✅ Expiran en 1 hora
- ✅ Un solo token activo a la vez
- ✅ Se eliminan después de usarse

### **Validaciones**
- ✅ Email requerido
- ✅ Contraseña mínimo 8 caracteres
- ✅ Confirmación de contraseña
- ✅ Token válido y no expirado
- ✅ Mensajes de error claros

---

## 💾 Almacenamiento

### **localStorage Keys**

#### `password_reset_token`
```json
{
  "email": "usuario@example.com",
  "token": "abc123xyz789...",
  "expiresAt": "2024-11-15T10:30:00.000Z"
}
```

**Ciclo de vida**:
- Creado: Al solicitar recuperación
- Usado: Al verificar token
- Eliminado: Al cambiar contraseña o expirar

---

## 📁 Archivos del Sistema

### **Frontend**

#### Páginas
- `frontend/src/pages/ForgotPasswordPage.jsx` - Solicitar recuperación
- `frontend/src/pages/ResetPasswordPage.jsx` - Cambiar contraseña

#### API (Simulada)
- `frontend/src/services/api.js`
  - `forgotPassword(email)` - Generar token
  - `verifyResetToken(token)` - Verificar validez
  - `resetPassword(token, newPassword)` - Cambiar contraseña

#### Rutas
- `frontend/src/App.jsx`
  - `/recuperar-contraseña` - Página de solicitud
  - `/restablecer/:token` - Página de reset

---

## 🎨 UI/UX

### **ForgotPasswordPage**
- 📧 Formulario de email
- ✅ Mensajes de éxito/error
- 🔄 Indicador de modo simulado
- 🔗 Link directo al reset
- ℹ️ Información sobre el sistema

### **ResetPasswordPage**
- ⏳ Loading durante verificación
- ❌ Pantalla de error si token inválido
- 🔐 Formulario de nueva contraseña
- 👁️ Validación en tiempo real
- ✅ Redirección automática al éxito

---

## 🚀 Cómo Usar

### **1. Desde Login**
```
1. Ir a http://localhost:3000/login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar cualquier email
4. Click en "Continuar con el restablecimiento"
5. Ingresar nueva contraseña
6. Confirmar
```

### **2. Directamente**
```
1. Ir a http://localhost:3000/recuperar-contraseña
2. Seguir el flujo normal
```

---

## ⚙️ Configuración

### **Tiempo de Expiración**
```javascript
// En frontend/src/services/api.js
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

// Para cambiar a 30 minutos:
const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
```

### **Longitud del Token**
```javascript
// En frontend/src/services/api.js
const token = Math.random().toString(36).substring(2, 15) + 
              Math.random().toString(36).substring(2, 15);

// Genera tokens de ~26 caracteres
```

---

## 🔄 Migración a Backend Real

Cuando quieras implementar el backend real:

### **1. Backend ya creado** ✅
- `backend/models/password_reset.py`
- `backend/routes/password_recovery.py`
- Endpoints listos

### **2. Cambiar en frontend**
```javascript
// En frontend/src/services/api.js

// ANTES (Simulado):
export const forgotPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // ... código simulado
};

// DESPUÉS (Real):
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};
```

### **3. Configurar Email**
```python
# En backend/routes/password_recovery.py
# Descomentar y configurar:
send_password_reset_email(user.email, token)
```

### **4. Crear tabla**
```bash
cd backend
python create_password_reset_table.py
```

---

## 📊 Ventajas del Modo Simulado

### ✅ **Desarrollo**
- No requiere configuración de email
- No requiere base de datos adicional
- Pruebas rápidas e inmediatas
- Sin dependencias externas

### ✅ **Demo/Prototipo**
- Funcionalidad completa visible
- Sin costos de servicios
- Fácil de mostrar
- Sin configuración compleja

### ✅ **Testing**
- Tokens predecibles
- Control total del flujo
- Sin rate limiting
- Debugging sencillo

---

## ⚠️ Limitaciones

### **No usar en producción**
- ❌ Los tokens están en el navegador
- ❌ No hay persistencia real
- ❌ No hay notificación por email
- ❌ Se pierde al limpiar localStorage

### **Solo para**
- ✅ Desarrollo local
- ✅ Prototipos
- ✅ Demos
- ✅ Testing de UI/UX

---

## 🎯 Próximos Pasos

### **Para Producción**
1. Implementar backend real
2. Configurar servicio de email (SendGrid, AWS SES)
3. Agregar rate limiting
4. Logs de seguridad
5. Notificaciones de cambio de contraseña

### **Mejoras Opcionales**
- 💪 Medidor de fortaleza de contraseña
- 📱 SMS como alternativa
- 🔐 Autenticación de dos factores
- 📧 Verificación de email al registrarse

---

## 📞 Soporte

Si tienes dudas sobre el sistema:
1. Revisa este documento
2. Revisa el código comentado
3. Prueba el flujo completo
4. Consulta la documentación de React

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0.0 (Modo Simulado)
