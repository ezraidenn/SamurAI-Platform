# 🚀 Setup - UCU Reporta

## 📋 Requisitos Previos

- Python 3.12+
- Node.js 18+
- Git

---

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/SamurAI-Platform.git
cd "SamurAI Reportes"
```

### 2. Configurar Backend

```bash
# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos (con Alembic)
python scripts/init_database.py
```

Este script:
- ✅ Aplica todas las migraciones de Alembic
- ✅ Crea el usuario admin inicial
- ✅ Configura la base de datos correctamente

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

---

## ▶️ Ejecutar el Proyecto

### Backend (Terminal 1)

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**URLs:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**URL:** http://localhost:3000

---

## 🔑 Credenciales Iniciales

```
Email:    admin@ucu.gob.mx
Password: admin123
```

---

## 🔄 Migraciones de Base de Datos

### ¿Qué son las Migraciones?

Las migraciones permiten modificar la estructura de la base de datos **sin perder datos**.

### Comandos Principales

```bash
# Ver estado actual
alembic current

# Crear nueva migración (después de modificar modelos)
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones pendientes
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

### Flujo de Trabajo

1. **Modificar modelo** en `backend/models/`
2. **Crear migración:** `alembic revision --autogenerate -m "Add field X"`
3. **Revisar** el archivo generado en `alembic/versions/`
4. **Aplicar:** `alembic upgrade head`

📚 **Más info:** Ver `MIGRACIONES.md`

---

## 📁 Estructura del Proyecto

```
SamurAI Reportes/
├── backend/
│   ├── models/          # Modelos de BD (User, Report)
│   ├── routes/          # Endpoints de API
│   ├── auth/            # JWT y autenticación
│   ├── database.py      # Configuración de BD
│   └── main.py          # App FastAPI
├── frontend/
│   ├── src/
│   │   ├── pages/       # Páginas React
│   │   ├── components/  # Componentes reutilizables
│   │   ├── context/     # Context API (Auth)
│   │   └── services/    # API calls (Axios)
│   └── package.json
├── alembic/
│   ├── versions/        # Archivos de migración
│   └── env.py           # Config de Alembic
├── scripts/
│   ├── init_database.py # Inicialización de BD
│   └── quick_create_admin.py
└── alembic.ini          # Config principal de Alembic
```

---

## 🎯 Sistema de Roles

### Jerarquía

```
👑 Admin (Nivel 3)
   ↓
👔 Supervisor (Nivel 2)
   ↓
🔧 Operador (Nivel 1)
   ↓
👤 Ciudadano (Nivel 0)
```

### Permisos

| Rol | Crear Reportes | Ver Todos | Asignar | Cambiar Roles | Gestión Usuarios |
|-----|----------------|-----------|---------|---------------|------------------|
| Ciudadano | ✅ | ❌ | ❌ | ❌ | ❌ |
| Operador | ✅ | ✅ | ❌ | Ciudadano | ❌ |
| Supervisor | ✅ | ✅ | ✅ | Operador, Ciudadano | ❌ |
| Admin | ✅ | ✅ | ✅ | **TODOS** (excepto sí mismo) | ✅ |

📚 **Más info:** Ver `SISTEMA_ROLES.md`

---

## 🛠️ Desarrollo

### Agregar un Nuevo Campo a un Modelo

**Ejemplo:** Agregar campo `notes` a `Report`

1. **Modificar el modelo:**

```python
# backend/models/report.py
class Report(Base):
    # ... campos existentes ...
    notes = Column(Text, nullable=True)  # NUEVO
```

2. **Crear migración:**

```bash
alembic revision --autogenerate -m "Add notes field to reports"
```

3. **Revisar archivo generado:**

```bash
# Abrir alembic/versions/XXXXX_add_notes_field_to_reports.py
# Verificar que los cambios son correctos
```

4. **Aplicar migración:**

```bash
alembic upgrade head
```

5. **¡Listo!** El campo existe sin perder datos.

---

## 🐛 Troubleshooting

### Error: "no such column"

**Causa:** La base de datos no tiene la columna que el código espera.

**Solución:**
```bash
alembic upgrade head
```

### Error: "alembic: command not found"

**Causa:** Alembic no está instalado.

**Solución:**
```bash
pip install alembic
```

### Backend no inicia

**Verificar:**
1. ¿Está instalado Python 3.12+?
2. ¿Están instaladas las dependencias? `pip install -r requirements.txt`
3. ¿Está aplicada la migración? `alembic upgrade head`

### Frontend no inicia

**Verificar:**
1. ¿Está instalado Node.js 18+?
2. ¿Están instaladas las dependencias? `npm install`
3. ¿El backend está corriendo en puerto 8000?

---

## 📚 Documentación Adicional

- `MIGRACIONES.md` - Guía completa de migraciones
- `SISTEMA_ROLES.md` - Sistema de roles y permisos
- `CAMBIAR_ROL_USUARIO.md` - Cómo cambiar roles de usuarios

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**¡Listo para desarrollar!** 🎉
