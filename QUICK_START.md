# 🚀 Quick Start - UCU Reporta

## Paso 1: Subir a GitHub

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "🎉 UCU Reporta - Plataforma completa de reportes ciudadanos"

# Conectar con GitHub
git remote add origin https://github.com/ezraidenn/SamurAI-Platform.git

# Subir (forzar si el repo ya tiene contenido)
git branch -M main
git push -u origin main --force
```

## Paso 2: Iniciar el Backend

```bash
# Abrir terminal 1
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# Activar entorno virtual
venv\Scripts\activate

# Iniciar backend
uvicorn backend.main:app --reload
```

✅ Backend corriendo en: http://localhost:8000

## Paso 3: Crear Usuario Admin

```bash
# Abrir terminal 2 (con el backend corriendo)
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# Activar entorno virtual
venv\Scripts\activate

# Ejecutar script
python create_admin_simple.py
```

## Paso 4: Iniciar el Frontend

```bash
# Abrir terminal 3
cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"

# Iniciar frontend
npm run dev
```

✅ Frontend corriendo en: http://localhost:3000

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
