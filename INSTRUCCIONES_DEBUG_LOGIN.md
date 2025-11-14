# 🔍 Instrucciones para Debug del Login

## Problema Actual
El login falla con error 401 "Incorrect email or password" aunque las credenciales son correctas en la base de datos.

## ✅ Lo que Hemos Verificado

1. ✅ **Base de datos**: Usuarios existen
2. ✅ **Passwords**: Los hashes son válidos
3. ✅ **Verificación local**: `verify_password()` funciona correctamente
4. ✅ **Backend**: Está corriendo y responde

## 🔧 Pasos para Debuggear

### 1. Reiniciar el Backend con Logs

```bash
# Detener el backend actual (Ctrl+C)
# Luego iniciar de nuevo:
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
venv\Scripts\activate
uvicorn backend.main:app --reload
```

### 2. Probar Login y Ver Logs

En otra terminal:
```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
python scripts\test_login.py
```

### 3. Revisar los Logs del Backend

El backend ahora mostrará logs detallados como:
```
🔐 Login attempt:
   Email: 2309045@upy.edu.mx
   User found: True
   User ID: 1
   User role: admin
   Hash (first 30): $2b$12$7DmbTcHeux.5.K1.qpxqa
   Password valid: True/False
   ✅ Login SUCCESS  o  ❌ Login FAILED
```

### 4. Interpretar los Logs

**Si dice "User found: False":**
- El email no está en la base de datos
- Ejecuta: `python scripts\check_users.py`

**Si dice "Password valid: False":**
- El hash no coincide
- Ejecuta: `python scripts\verify_passwords.py`

**Si dice "Password valid: True" pero aún falla:**
- Hay un bug en la lógica del endpoint
- Revisar el código en `backend/routes/users.py`

## 🧪 Tests Disponibles

```bash
# Ver usuarios en BD
python scripts\check_users.py

# Verificar passwords
python scripts\verify_passwords.py

# Debug detallado
python scripts\debug_login.py

# Test directo del backend
python scripts\test_backend_direct.py

# Test de la API
python scripts\test_api_detailed.py

# Test simple de login
python scripts\test_login.py
```

## 🎯 Credenciales para Probar

```
Email: 2309045@upy.edu.mx
Password: admin123
```

## 📝 Qué Buscar en los Logs

1. **"User found: True"** - El usuario existe ✅
2. **"Password valid: True"** - El password es correcto ✅
3. **"Login SUCCESS"** - Todo funciona ✅

Si ves los 3 ✅ pero el login aún falla, hay un problema después de la verificación.

## 🔄 Siguiente Paso

Después de reiniciar el backend y ver los logs, comparte la salida completa para identificar el problema exacto.
