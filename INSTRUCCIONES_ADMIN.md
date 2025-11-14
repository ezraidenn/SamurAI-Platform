# 🔐 Instrucciones para Crear Usuario Admin

## Para el correo: 2309045@upy.edu.mx

### Paso 1: Registrarse en la Plataforma

1. **Asegúrate que el backend y frontend estén corriendo**:
   ```bash
   # Terminal 1 - Backend
   cd "C:\Users\raulc\Downloads\SamurAI Reportes"
   venv\Scripts\activate
   uvicorn backend.main:app --reload
   
   # Terminal 2 - Frontend
   cd "C:\Users\raulc\Downloads\SamurAI Reportes\frontend"
   npm run dev
   ```

2. **Ir a la página de registro**:
   - URL: http://localhost:3000/register

3. **Completar el formulario**:
   ```
   Nombre: [Tu nombre completo]
   Email: 2309045@upy.edu.mx
   CURP: [Tu CURP válido de 18 caracteres]
   Password: [Tu contraseña segura]
   Confirmar Password: [Misma contraseña]
   ```

4. **Click en "Registrarse"**
   - Serás redirigido a la página de login

---

### Paso 2: Cambiar Rol a Admin

Después de registrarte, ejecuta uno de estos métodos:

#### Opción A: Usar Script Python

```bash
cd "C:\Users\raulc\Downloads\SamurAI Reportes"
python update_admin_role.py
```

El script automáticamente:
- Buscará el usuario con email `2309045@upy.edu.mx`
- Cambiará su rol a `admin`
- Mostrará confirmación

#### Opción B: Manualmente con SQLite

```bash
# Abrir base de datos
sqlite3 backend/database/ucudigital.db

# Cambiar rol
UPDATE users SET role='admin' WHERE email='2309045@upy.edu.mx';

# Verificar
SELECT id, name, email, role FROM users WHERE email='2309045@upy.edu.mx';

# Salir
.quit
```

---

### Paso 3: Acceder al Dashboard Admin

1. **Ir a**: http://localhost:3000/login

2. **Ingresar credenciales**:
   ```
   Email: 2309045@upy.edu.mx
   Password: [Tu contraseña]
   ```

3. **Click "Iniciar Sesión"**

4. **Serás redirigido automáticamente a**: http://localhost:3000/admin

---

## ✅ Verificar que Funciona

En el Dashboard Admin deberías ver:

- ✅ 5 KPI cards (Total, Resueltos, Pendientes, En Proceso, Tiempo Prom.)
- ✅ Mapa interactivo con todos los reportes
- ✅ Gráficas (Bar chart + Pie chart)
- ✅ Tabla con todos los reportes
- ✅ Botón "Cambiar Estado" en cada reporte

---

## 🔧 Troubleshooting

### "No puedo registrarme"
- Verifica que el backend esté corriendo en http://localhost:8000
- Verifica que el CURP tenga 18 caracteres y formato válido
- Verifica que el email no esté ya registrado

### "Sigo viendo dashboard de ciudadano"
- Cierra sesión (logout)
- Ejecuta el script para cambiar rol
- Vuelve a iniciar sesión

### "El script dice que no encuentra el usuario"
- Primero debes registrarte en http://localhost:3000/register
- Luego ejecuta el script

---

## 📝 Resumen

```
1. Registrarse → http://localhost:3000/register
2. Cambiar rol → python update_admin_role.py
3. Login → http://localhost:3000/login
4. Dashboard → http://localhost:3000/admin
```

¡Listo! 🎉
