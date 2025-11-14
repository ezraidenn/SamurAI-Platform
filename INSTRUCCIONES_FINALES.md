# 📋 INSTRUCCIONES FINALES - UCU Reporta

## 🎯 RESUMEN EJECUTIVO

Tu plataforma **UCU Reporta** está 100% completa y funcional. Aquí están los pasos finales:

---

## 1️⃣ SUBIR A GITHUB

Abre PowerShell o Git Bash y ejecuta:

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"

# Inicializar Git
git init

# Agregar archivos
git add .

# Commit
git commit -m "🎉 UCU Reporta - Plataforma completa"

# Conectar con GitHub
git remote add origin https://github.com/ezraidenn/SamurAI-Platform.git

# Subir (usar --force si el repo ya tiene contenido)
git push -u origin main --force
```

**✅ Listo! Tu código estará en GitHub**

---

## 2️⃣ CREAR USUARIO ADMINISTRADOR

### Opción A: Desde el Frontend (MÁS FÁCIL)

1. **Asegúrate que el backend esté corriendo**:
   ```bash
   cd "C:\Users\raulc\Downloads\SamurAI Reportes"
   venv\Scripts\activate
   uvicorn backend.main:app --reload
   ```

2. **Asegúrate que el frontend esté corriendo**:
   ```bash
   cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
   npm run dev
   ```

3. **Registrar usuario admin**:
   - Ir a: http://localhost:3000/register
   - Completar formulario:
     ```
     Nombre: Administrador UCU
     Email: admin@ucu.gob.mx
     CURP: AUCU850101HYNXXX01
     Contraseña: admin123
     Confirmar: admin123
     ```
   - Click "Registrarse"

4. **Cambiar rol a admin** (SQLite):
   ```bash
   # Abrir base de datos
   sqlite3 backend/database/ucudigital.db
   
   # Cambiar rol
   UPDATE users SET role='admin' WHERE email='admin@ucu.gob.mx';
   
   # Verificar
   SELECT id, name, email, role FROM users;
   
   # Salir
   .quit
   ```

### Opción B: Desde Python (ALTERNATIVA)

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
venv\Scripts\activate
python create_admin_simple.py
```

---

## 3️⃣ ACCEDER AL DASHBOARD ADMIN

### 🔐 Credenciales de Administrador

```
Email:    admin@ucu.gob.mx
Password: admin123
URL:      http://localhost:3000/admin
```

### 📝 Pasos para acceder:

1. Ir a: http://localhost:3000
2. Click en "Iniciar Sesión" (esquina superior derecha)
3. Ingresar:
   - Email: `admin@ucu.gob.mx`
   - Password: `admin123`
4. Click "Iniciar Sesión"
5. **Serás redirigido automáticamente a `/admin`**

### 🎯 Lo que verás en el Dashboard Admin:

✅ **5 KPIs principales**:
- Total de reportes
- Reportes resueltos
- Reportes pendientes
- Reportes en proceso
- Tiempo promedio de resolución

✅ **Mapa interactivo**:
- Todos los reportes con markers coloreados
- 🟡 Amarillo = Pendiente
- 🔵 Azul = En proceso
- 🟢 Verde = Resuelto
- Click en marker para ver detalles

✅ **Gráficas**:
- Gráfica de barras por categoría
- Gráfica de pie por estado

✅ **Tabla de reportes**:
- Todos los reportes del sistema
- Botón "Cambiar Estado" en cada reporte
- Modal para actualizar estado

---

## 4️⃣ CREAR REPORTES DE PRUEBA

### Como Ciudadano:

1. **Registrar usuario ciudadano**:
   - Ir a: http://localhost:3000/register
   - Completar formulario con datos válidos
   
2. **Crear reporte**:
   - Login como ciudadano
   - Click "Nuevo Reporte"
   - Seleccionar categoría (ej: Bache)
   - Describir: "Bache grande en calle principal"
   - Click en el mapa para marcar ubicación
   - Opcional: Subir foto
   - Click "Crear Reporte"

3. **Ver en dashboard admin**:
   - Logout del ciudadano
   - Login como admin
   - Ver el reporte en el mapa y tabla

---

## 5️⃣ GESTIONAR REPORTES (ADMIN)

1. **Login como admin**
2. **En la tabla de reportes**:
   - Click "Cambiar Estado"
3. **En el modal**:
   - Cambiar de "Pendiente" a "En Proceso"
   - Agregar comentario (opcional)
   - Click "Actualizar Estado"
4. **Ver cambios**:
   - El marker en el mapa cambia de color
   - Los KPIs se actualizan
   - La tabla se actualiza

---

## 📊 ESTRUCTURA DEL PROYECTO EN GITHUB

```
SamurAI-Platform/
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── README.md
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   ├── package.json
│   └── README.md
├── README.md             # Documentación principal
├── DEMO.md               # Guía de demostración
├── DEPLOYMENT.md         # Guía de deployment
├── CREDENTIALS.md        # Credenciales de acceso
├── QUICK_START.md        # Inicio rápido
└── requirements.txt      # Dependencias Python
```

---

## 🎬 DEMO COMPLETO

### Flujo de Demostración (5 minutos):

1. **Landing Page** (30 seg)
   - Mostrar http://localhost:3000
   - Explicar características
   - Click "Comenzar Ahora"

2. **Registro** (30 seg)
   - Mostrar formulario
   - Validación de CURP
   - Registro exitoso

3. **Login Ciudadano** (30 seg)
   - Login con credenciales
   - Redirección a dashboard

4. **Crear Reporte** (1 min)
   - Seleccionar categoría
   - Describir problema
   - Marcar en mapa
   - Subir foto
   - Enviar

5. **Dashboard Ciudadano** (1 min)
   - Ver gráficas personales
   - Filtrar reportes
   - Ver detalles

6. **Login Admin** (30 seg)
   - Logout ciudadano
   - Login como admin
   - Redirección a dashboard admin

7. **Dashboard Admin** (1.5 min)
   - Mostrar KPIs
   - Mapa interactivo
   - Gráficas globales
   - Cambiar estado de reporte
   - Ver actualización en tiempo real

---

## 🔧 COMANDOS ÚTILES

### Iniciar Todo:

```bash
# Terminal 1 - Backend
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
venv\Scripts\activate
uvicorn backend.main:app --reload

# Terminal 2 - Frontend
cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
npm run dev
```

### Ver Logs:

```bash
# Backend logs: Terminal 1
# Frontend logs: Terminal 2
```

### Reiniciar:

```bash
# Ctrl + C en cada terminal
# Volver a ejecutar los comandos de inicio
```

---

## 📞 SOPORTE

### Documentación Disponible:

- **README.md** - Overview del proyecto
- **DEMO.md** - Guía de demostración detallada
- **DEPLOYMENT.md** - Deployment a producción
- **CREDENTIALS.md** - Todas las credenciales
- **backend/README.md** - Documentación del backend
- **frontend/README.md** - Documentación del frontend

### API Documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## ✅ CHECKLIST FINAL

- [ ] Código subido a GitHub
- [ ] Backend corriendo (http://localhost:8000)
- [ ] Frontend corriendo (http://localhost:3000)
- [ ] Usuario admin creado
- [ ] Login como admin funciona
- [ ] Dashboard admin visible
- [ ] Puedo crear reportes
- [ ] Puedo cambiar estados

---

## 🎉 ¡FELICIDADES!

Tu plataforma **UCU Reporta** está completamente funcional y lista para:

✅ Demos en vivo
✅ Presentaciones
✅ Testing con usuarios
✅ Deployment a producción
✅ Uso en municipios

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

1. **Deploy a producción** (ver DEPLOYMENT.md)
2. **Configurar dominio personalizado**
3. **Agregar más usuarios admin**
4. **Personalizar colores/logos**
5. **Agregar más categorías**
6. **Implementar notificaciones**

---

# 📧 CREDENCIALES RÁPIDAS

## 👨‍💼 ADMIN (GOBIERNO)
```
Email:    admin@ucu.gob.mx
Password: admin123
URL:      http://localhost:3000/admin
```

## 👥 CIUDADANO (TESTING)
```
Email:    maria@example.com
Password: password123
URL:      http://localhost:3000/panel
```

---

**¡Todo listo para usar! 🎊**
