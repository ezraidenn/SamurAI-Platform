# ✅ SOLUCIÓN - Base de Datos Creada Correctamente

## 🎉 Problema Resuelto

La base de datos ahora está creada correctamente con todas las tablas.

---

## 📊 Estado Actual

✅ **Base de datos creada**: `backend/database/ucudigital.db`  
✅ **Tablas creadas**:
- `users` (8 columnas)
- `reports` (11 columnas)

✅ **Ruta completa**:
```
C:\Users\raulc\Downloads\SamurAI Reportes\backend\database\ucudigital.db
```

---

## 🔐 Pasos para Crear Usuario Admin (2309045@upy.edu.mx)

### Paso 1: Registrarse en la Plataforma

1. **Asegúrate que el backend esté corriendo**:
   ```bash
   # Si no está corriendo, ejecuta:
   cd "C:\Users\raulc\Downloads\SamurAI Reportes"
   venv\Scripts\activate
   uvicorn backend.main:app --reload
   ```

2. **Asegúrate que el frontend esté corriendo**:
   ```bash
   # Si no está corriendo, ejecuta:
   cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
   npm run dev
   ```

3. **Ir a la página de registro**:
   ```
   http://localhost:3000/register
   ```

4. **Completar el formulario**:
   ```
   Nombre: [Tu nombre completo]
   Email: 2309045@upy.edu.mx
   CURP: [Tu CURP válido - 18 caracteres]
   Password: [Tu contraseña segura]
   Confirmar: [Misma contraseña]
   ```

   **Ejemplo de CURP válido:**
   ```
   RAMC950815HYNXXX01
   ```
   (Debe tener exactamente 18 caracteres y seguir el formato oficial)

5. **Click "Registrarse"**

---

### Paso 2: Cambiar Rol a Admin

Después de registrarte exitosamente, ejecuta:

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
python update_admin_role.py
```

**Salida esperada:**
```
✅ Usuario encontrado:
   ID: 1
   Nombre: [Tu nombre]
   Email: 2309045@upy.edu.mx
   Rol actual: citizen

✅ Rol actualizado a 'admin' exitosamente!
   Nuevo rol: admin
```

---

### Paso 3: Acceder al Dashboard Admin

1. **Ir a login**:
   ```
   http://localhost:3000/login
   ```

2. **Ingresar credenciales**:
   ```
   Email: 2309045@upy.edu.mx
   Password: [Tu contraseña]
   ```

3. **Click "Iniciar Sesión"**

4. **Serás redirigido automáticamente a**:
   ```
   http://localhost:3000/admin
   ```

---

## 🛠️ Scripts Disponibles

### 1. Crear Tablas (Ya ejecutado ✅)
```bash
python force_create_tables.py
```

### 2. Ver Usuarios
```bash
python check_users.py
```

### 3. Cambiar Rol a Admin
```bash
python update_admin_role.py
```

### 4. Ver Estructura de DB
```bash
python check_db_structure.py
```

---

## ✅ Verificación

Para verificar que todo funciona:

```bash
# 1. Ver estructura de la base de datos
python check_db_structure.py

# Deberías ver:
# ✓ Tabla: users (8 columnas)
# ✓ Tabla: reports (11 columnas)

# 2. Ver usuarios registrados
python check_users.py

# Después de registrarte, deberías ver tu usuario
```

---

## 🎯 Resumen del Proceso

```
1. ✅ Base de datos creada (force_create_tables.py)
2. ⏳ Registrarse en http://localhost:3000/register
3. ⏳ Ejecutar: python update_admin_role.py
4. ⏳ Login en http://localhost:3000/login
5. ⏳ Acceder a http://localhost:3000/admin
```

---

## 🔍 Troubleshooting

### "No puedo registrarme"

**Verifica:**
- Backend corriendo: http://localhost:8000/docs
- Frontend corriendo: http://localhost:3000
- CURP tiene 18 caracteres exactos
- Email no está ya registrado

### "El script dice que no encuentra el usuario"

**Solución:**
1. Primero regístrate en http://localhost:3000/register
2. Luego ejecuta `python update_admin_role.py`

### "Sigo viendo dashboard de ciudadano"

**Solución:**
1. Cierra sesión (logout)
2. Ejecuta `python update_admin_role.py`
3. Vuelve a iniciar sesión

---

## 📝 Formato CURP Válido

El CURP debe tener **exactamente 18 caracteres** con este formato:

```
AAAA NNNNNN S AAAAA AN
│    │      │ │     ││
│    │      │ │     │└─ Dígito verificador
│    │      │ │     └── Letra aleatoria
│    │      │ └──────── 5 letras del estado y nombre
│    │      └────────── Sexo (H/M)
│    └───────────────── Fecha (AAMMDD)
└────────────────────── 4 letras apellidos+nombre
```

**Ejemplo válido:**
```
RAMC950815HYNXXX01
```

---

## 🎉 ¡Listo!

La base de datos está funcionando correctamente. Solo necesitas:

1. **Registrarte** con el email `2309045@upy.edu.mx`
2. **Ejecutar** `python update_admin_role.py`
3. **Acceder** al dashboard admin

¡Todo está listo para usar! 🚀
