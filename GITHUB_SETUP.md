# 🚀 Subir UCU Reporta a GitHub

## Pasos para subir el proyecto

### 1. Inicializar Git (si no está inicializado)

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "🎉 Initial commit - UCU Reporta Platform Complete

- ✅ Backend con FastAPI, JWT auth, CRUD de reportes
- ✅ Frontend con React, Tailwind, Leaflet, Recharts
- ✅ Sistema de autenticación con roles (citizen/admin)
- ✅ Dashboard ciudadano con gráficas y filtros
- ✅ Dashboard admin con mapa interactivo y gestión
- ✅ Landing page profesional
- ✅ Documentación completa (DEMO.md, DEPLOYMENT.md)
- ✅ Error boundary y manejo de errores
- ✅ 100% funcional y listo para producción"
```

### 2. Conectar con GitHub

```bash
# Agregar remote
git remote add origin https://github.com/ezraidenn/SamurAI-Platform.git

# Verificar remote
git remote -v

# Subir a GitHub
git branch -M main
git push -u origin main
```

### 3. Si el repositorio ya tiene contenido

```bash
# Opción A: Forzar push (reemplaza todo)
git push -u origin main --force

# Opción B: Pull primero y merge
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 📝 Comandos Completos (Copy-Paste)

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
git init
git add .
git commit -m "🎉 UCU Reporta - Plataforma completa de reportes ciudadanos"
git remote add origin https://github.com/ezraidenn/SamurAI-Platform.git
git branch -M main
git push -u origin main --force
```

## ⚠️ Nota Importante

El `.gitignore` ya está configurado para NO subir:
- ❌ Base de datos (`database/`, `*.db`)
- ❌ Archivos subidos (`backend/static/uploads/*`)
- ❌ Variables de entorno (`.env`)
- ❌ node_modules
- ❌ venv/

Esto es correcto para seguridad y tamaño del repositorio.

## 🔄 Futuras actualizaciones

```bash
# Agregar cambios
git add .

# Commit
git commit -m "Descripción de cambios"

# Push
git push origin main
```

¡Listo para subir! 🚀
