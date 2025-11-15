# 🔄 Sistema de Migraciones con Alembic

## 📚 ¿Qué son las Migraciones?

Las migraciones permiten **modificar la estructura de la base de datos sin perder datos**. En lugar de borrar y recrear la BD, aplicamos cambios incrementales.

---

## 🎯 Ventajas

✅ **No se pierden datos** - Los usuarios, reportes, etc. se mantienen  
✅ **Versionado** - Historial de cambios en la BD  
✅ **Reversible** - Puedes deshacer cambios  
✅ **Colaborativo** - El equipo comparte las migraciones  

---

## 🛠️ Comandos Principales

### 1. Crear una Nueva Migración

Cuando modificas un modelo (User, Report, etc.):

```bash
alembic revision --autogenerate -m "Descripción del cambio"
```

**Ejemplo:**
```bash
alembic revision --autogenerate -m "Add assigned_to field to reports"
```

Esto crea un archivo en `alembic/versions/` con los cambios detectados.

### 2. Aplicar Migraciones

Para aplicar todas las migraciones pendientes:

```bash
alembic upgrade head
```

### 3. Ver Estado Actual

Para ver qué migraciones están aplicadas:

```bash
alembic current
```

### 4. Ver Historial

Para ver todas las migraciones:

```bash
alembic history
```

### 5. Revertir Migración

Para deshacer la última migración:

```bash
alembic downgrade -1
```

---

## 📝 Flujo de Trabajo

### Escenario: Agregar un nuevo campo

**1. Modificar el modelo**

```python
# backend/models/report.py
class Report(Base):
    # ... campos existentes ...
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)  # NUEVO
```

**2. Crear migración**

```bash
alembic revision --autogenerate -m "Add assigned_to to reports"
```

**3. Revisar el archivo generado**

Alembic crea un archivo en `alembic/versions/`. Revísalo para asegurarte de que los cambios son correctos.

**4. Aplicar migración**

```bash
alembic upgrade head
```

**5. ¡Listo!** La base de datos ahora tiene el nuevo campo sin perder datos.

---

## 🔍 Ejemplo Completo

### Antes (sin migraciones)
```bash
# ❌ Método antiguo - PIERDE DATOS
rm backend/database/ucudigital.db
python -m uvicorn backend.main:app --reload
# Todos los usuarios y reportes se perdieron 😢
```

### Ahora (con migraciones)
```bash
# ✅ Método nuevo - CONSERVA DATOS
# 1. Modificar modelo
# 2. Crear migración
alembic revision --autogenerate -m "Add new field"

# 3. Aplicar
alembic upgrade head

# Todos los datos se mantienen 🎉
```

---

## 📂 Estructura de Archivos

```
SamurAI Reportes/
├── alembic/
│   ├── versions/          # Archivos de migración
│   │   └── 641700c80868_initial_migration.py
│   ├── env.py            # Configuración de Alembic
│   └── README
├── alembic.ini           # Configuración principal
└── backend/
    ├── database.py
    └── models/
        ├── user.py
        └── report.py
```

---

## ⚠️ Notas Importantes

### SQLite Limitaciones

SQLite tiene limitaciones para algunas operaciones:
- ❌ No puede eliminar columnas directamente
- ❌ No puede modificar tipos de columnas
- ✅ Puede agregar columnas
- ✅ Puede crear/eliminar tablas

Para cambios complejos, Alembic usa una estrategia de "recrear tabla":
1. Crea tabla temporal con nueva estructura
2. Copia datos
3. Elimina tabla vieja
4. Renombra tabla temporal

### Buenas Prácticas

1. **Siempre revisa** el archivo de migración generado
2. **Haz backup** antes de migraciones importantes
3. **Prueba** en desarrollo antes de producción
4. **Commitea** las migraciones al repositorio
5. **No edites** migraciones ya aplicadas

---

## 🚀 Comandos Útiles

### Crear migración vacía (manual)
```bash
alembic revision -m "Custom migration"
```

### Aplicar hasta una migración específica
```bash
alembic upgrade <revision_id>
```

### Ver SQL sin aplicar
```bash
alembic upgrade head --sql
```

### Marcar como aplicada sin ejecutar
```bash
alembic stamp head
```

---

## 🔧 Configuración Actual

**Base de datos:** `sqlite:///./backend/database/ucudigital.db`

**Modelos registrados:**
- `User` - Usuarios del sistema
- `Report` - Reportes ciudadanos

**Migración inicial:** `641700c80868` - Estado actual con campo `assigned_to`

---

## 📖 Recursos

- [Documentación Alembic](https://alembic.sqlalchemy.org/)
- [Tutorial Alembic](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Autogenerate](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)

---

## ✅ Checklist para Cambios en BD

- [ ] Modificar modelo en `backend/models/`
- [ ] Crear migración: `alembic revision --autogenerate -m "..."`
- [ ] Revisar archivo generado en `alembic/versions/`
- [ ] Aplicar migración: `alembic upgrade head`
- [ ] Verificar que funciona
- [ ] Commit de la migración al repo

---

**¡Ahora los cambios en la BD no destruyen datos!** 🎊
