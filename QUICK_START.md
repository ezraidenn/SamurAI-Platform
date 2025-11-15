# 🚀 Quick Start - UCU Reporta

## ⚡ Inicio Rápido (Recomendado)

### Opción 1: Script Automático
```bash
# Doble click en:
start_all.bat
```

Esto iniciará automáticamente:
- ✅ Backend en http://localhost:8000
- ✅ Frontend en http://localhost:3000
- ✅ Abrirá el navegador

---

## 📋 Inicio Manual (Paso a Paso)

### Paso 1: Iniciar el Backend

```bash
# Terminal 1
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
python start_backend.py
```

**Deberías ver:**
```
🔧 BACKEND CONFIGURATION
Host: 0.0.0.0
Port: 8000
AI Validation: ✅ Enabled
✓ UCU Reporta API is running
```

✅ Backend corriendo en: http://localhost:8000

### Paso 2: Iniciar el Frontend

```bash
# Terminal 2
cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
npm run dev
```

**Deberías ver:**
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://10.186.174.19:3000/
```

✅ Frontend corriendo en: http://localhost:3000

### Paso 3: Crear Usuario Admin (Solo primera vez)

```bash
# Terminal 3 (con backend corriendo)
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
python scripts\quick_create_admin.py
```

## Paso 5: Acceder al Dashboard Admin

1. Ir a: http://localhost:3000
2. Click en "Iniciar Sesión"
3. Usar credenciales:
   ```
   Email:    admin@ucu.gob.mx
   Password: admin123
   ```
4. Serás redirigido a: http://localhost:3000/admin

---

## 🔐 Credenciales Completas

### 👨‍💼 Administrador (Gobierno)
```
Email:    admin@ucu.gob.mx
Password: admin123
CURP:     AUCU850101HYNXXX01
URL:      http://localhost:3000/admin
```

**Funcionalidades:**
- Ver todos los reportes del sistema
- Mapa interactivo con markers coloreados
- KPIs y estadísticas globales
- Cambiar estado de reportes
- Gráficas por categoría y estado

### 👥 Ciudadano (Testing)
```
Email:    maria@example.com
Password: password123
CURP:     GOGM900515MYNXNR03
URL:      http://localhost:3000/panel
```

**Funcionalidades:**
- Crear reportes con mapa y foto
- Ver solo sus propios reportes
- Dashboard personal con gráficas
- Filtrar reportes

---

## 📝 Comandos Rápidos

### Backend
```bash
# Iniciar
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
venv\Scripts\activate
uvicorn backend.main:app --reload

# Ver logs
# Los logs aparecen en la misma terminal

# Detener
# Ctrl + C
```

### Frontend
```bash
# Iniciar
cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
npm run dev

# Build para producción
npm run build

# Detener
# Ctrl + C
```

### Git
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción"

# Push
git push origin main
```

---

## 🌐 URLs Importantes

- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard Admin**: http://localhost:3000/admin
- **Dashboard Ciudadano**: http://localhost:3000/panel
- **Crear Reporte**: http://localhost:3000/reportar
- **API Docs**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

---

## ⚠️ Troubleshooting

### ❌ Error: "Network Error" o "ERR_CONNECTION_TIMED_OUT"

**Causa:** El backend NO está corriendo.

**Solución:**
```bash
# 1. Abrir nueva terminal
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# 2. Iniciar backend
python start_backend.py

# 3. Verificar que muestre:
# ✓ UCU Reporta API is running
```

**Verificar que funciona:**
- Abre http://localhost:8000/health en el navegador
- Deberías ver: `{"status":"healthy","service":"UCU Reporta API"}`

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
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### No puedo hacer login
```bash
# Recrear usuario admin
python create_admin_simple.py

# Limpiar localStorage del navegador
# F12 → Application → Local Storage → Clear All
```

### Base de datos corrupta
```bash
# Eliminar y recrear (perderás datos)
rm backend/database/ucudigital.db

# Reiniciar backend (creará nueva BD)
uvicorn backend.main:app --reload

# Recrear usuarios
python create_admin_simple.py
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Usuario admin creado
- [ ] Puedo hacer login como admin
- [ ] Veo el dashboard admin
- [ ] Proyecto subido a GitHub

---

¡Listo para usar! 🎉
