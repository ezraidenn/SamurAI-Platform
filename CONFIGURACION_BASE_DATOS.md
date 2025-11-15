# 🗄️ Configuración de Base de Datos Compartida

## 📋 Descripción

Este proyecto usa SQLite como base de datos local. Para que todos los colaboradores usen la **misma base de datos**, sigue estas instrucciones.

---

## 🔧 Configuración Actual

### Ubicación de la Base de Datos
```
database/ucudigital.db
```

### Variables de Entorno (backend/.env)
```env
DATABASE_URL=sqlite:///./database/ucudigital.db
```

---

## 📥 Cómo Usar la Base de Datos Compartida

### Opción 1: Clonar el Repositorio (Recomendado)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ezraidenn/SamurAI-Platform.git
   cd "SamurAI Reportes"
   ```

2. **La base de datos ya está incluida:**
   - El archivo `database/ucudigital.db` está en el repositorio
   - Git lo descargará automáticamente

3. **Instalar dependencias:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Iniciar el proyecto:**
   ```bash
   # Backend
   python start_backend.py
   
   # Frontend (en otra terminal)
   npm run dev
   ```

---

### Opción 2: Descargar Base de Datos Manualmente

Si ya tienes el proyecto clonado pero no tienes la base de datos:

1. **Descargar la base de datos desde GitHub:**
   - Ve a: https://github.com/ezraidenn/SamurAI-Platform/tree/main/database
   - Descarga `ucudigital.db`

2. **Colocar en la carpeta correcta:**
   ```
   SamurAI Reportes/
   └── database/
       └── ucudigital.db  ← Aquí
   ```

3. **Verificar permisos:**
   - En Windows: Click derecho → Propiedades → Desmarcar "Solo lectura"
   - En Linux/Mac: `chmod 664 database/ucudigital.db`

---

## 🔄 Sincronizar Cambios en la Base de Datos

### ⚠️ IMPORTANTE

La base de datos SQLite **NO se sincroniza automáticamente** entre computadoras. Si haces cambios:

### Para Subir Cambios:
```bash
git add database/ucudigital.db
git commit -m "update: Actualizar base de datos"
git push origin main
```

### Para Descargar Cambios:
```bash
git pull origin main
```

---

## 🛠️ Migraciones de Base de Datos

Si necesitas actualizar el esquema de la base de datos:

```bash
cd backend

# Crear nueva migración
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migración
alembic upgrade head
```

---

## 📊 Datos de Prueba

La base de datos incluye:

### Usuarios de Prueba:
- **Admin:** 
  - Email: `admin@ucudigital.com`
  - Password: `admin123`

- **Ciudadano:**
  - Email: `usuario@test.com`
  - Password: `test123`

### Reportes de Ejemplo:
- 10 reportes de prueba con diferentes categorías
- Reportes con validación de IA
- Reportes con diferentes estados (pendiente, en proceso, resuelto)

---

## 🔐 Seguridad

### ⚠️ NO SUBIR A PRODUCCIÓN

Esta configuración es **SOLO para desarrollo local**. Para producción:

1. Usar PostgreSQL o MySQL
2. Configurar variables de entorno seguras
3. No incluir la base de datos en el repositorio

### Variables de Entorno para Producción:
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db
```

---

## 🆘 Solución de Problemas

### Error: "Database is locked"
```bash
# Cerrar todas las conexiones
# Reiniciar el backend
python start_backend.py
```

### Error: "No such table"
```bash
# Ejecutar migraciones
cd backend
alembic upgrade head
```

### Error: "Permission denied"
```bash
# Windows
attrib -r database\ucudigital.db

# Linux/Mac
chmod 664 database/ucudigital.db
```

---

## 📝 Notas Adicionales

- **Backup:** Haz copias de seguridad regularmente
  ```bash
  copy database\ucudigital.db database\ucudigital_backup.db
  ```

- **Reset:** Para empezar de cero
  ```bash
  del database\ucudigital.db
  alembic upgrade head
  python scripts/create_initial_admin.py
  ```

---

## 🤝 Colaboración

Cuando trabajes en equipo:

1. **Antes de empezar:** `git pull origin main`
2. **Hacer cambios** en tu copia local
3. **Probar** que todo funciona
4. **Commit y push** si todo está bien
5. **Avisar al equipo** de cambios importantes

---

## 📞 Contacto

Si tienes problemas con la configuración de la base de datos, contacta al administrador del proyecto.

---

**Última actualización:** Noviembre 2025
