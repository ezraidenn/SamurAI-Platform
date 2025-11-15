# 🔧 Solución: Backend no se conecta a Neon

## ❌ Problema Detectado

El backend está usando **SQLite local** en lugar de **Neon (PostgreSQL)**.

Cuando cambias roles o datos, los cambios van a SQLite local, no a Neon.

---

## ✅ Solución

### 1. **Detener el Backend**

Si el backend está corriendo, **deténlo**:
- Presiona `Ctrl + C` en la terminal donde corre
- O cierra la terminal

### 2. **Verificar `.env`**

Abre `backend/.env` y verifica que tenga:

```env
DATABASE_URL=postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ **NO debe tener** la línea de SQLite activa:
```env
# DATABASE_URL=sqlite:///./database/ucudigital.db  ← Debe estar comentada
```

### 3. **Reiniciar el Backend**

```bash
cd backend
python start_backend.py
```

### 4. **Verificar Conexión**

Ejecuta el script de verificación:

```bash
python scripts/test_neon_connection.py
```

Deberías ver:
```
✅ CONECTADO A NEON (PostgreSQL)
```

---

## 🧪 Probar que Funciona

### Opción 1: Cambiar un Rol

1. Ve a http://localhost:8000/docs
2. Login como admin
3. Ejecuta `PATCH /admin/users/{user_id}/role`
4. Ve a Neon dashboard y verifica que el cambio aparezca

### Opción 2: Crear un Reporte

1. Ve a http://localhost:3000
2. Crea un reporte nuevo
3. Ve a Neon dashboard y verifica que aparezca

---

## 📊 Verificar en Neon

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a "Tables" → "users"
4. Deberías ver los cambios en tiempo real

---

## ⚠️ Importante

**SIEMPRE reinicia el backend después de cambiar el `.env`**

Las variables de entorno se cargan al inicio, no se recargan automáticamente.

---

## 🔍 Diagnóstico Rápido

Ejecuta este comando para ver a qué BD estás conectado:

```bash
python scripts/test_neon_connection.py
```

Si dice "SQLite" → Reinicia el backend
Si dice "Neon" → Todo está bien ✅

---

**Última actualización:** Noviembre 2025
