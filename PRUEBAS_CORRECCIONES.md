# 🧪 GUÍA DE PRUEBAS - CORRECCIONES IMPLEMENTADAS

## 📋 RESUMEN DE CORRECCIONES

### ✅ 1. Mapa NO se centra automáticamente
### ✅ 2. Coordenadas correctas de Ucú con reverse geocoding completo
### ✅ 3. Tabla de gestión de POIs

---

## 🎯 PRUEBAS A REALIZAR

### **PRUEBA 1: Mapa NO se centra automáticamente**

**Objetivo:** Verificar que el mapa permanece donde el usuario lo deja

**Pasos:**
1. Ir a http://172.16.3.191:3000
2. Login con usuario ciudadano:
   - Email: `maria@example.com`
   - Password: `password123`
3. Click en "Reportar" en el menú
4. Scroll hasta el mapa
5. **Hacer clic en cualquier punto del mapa**
6. **Arrastrar el mapa a otra ubicación**
7. **Mover el marcador arrastrándolo**

**Resultado Esperado:**
- ✅ El mapa NO debe centrarse automáticamente
- ✅ El mapa debe quedarse donde lo dejaste
- ✅ Solo el marcador se mueve, no el mapa completo

---

### **PRUEBA 2: Coordenadas correctas de Ucú**

**Objetivo:** Verificar que el polígono corresponde al municipio real de Ucú

**Pasos:**
1. Ir a "Reportar" o "Registrar Negocio"
2. Observar el mapa
3. Verificar el polígono rosado con borde rojo

**Resultado Esperado:**
- ✅ Centro del mapa: **21.0317, -89.7464**
- ✅ El polígono debe estar centrado en Ucú, Yucatán
- ✅ Código postal: **97357**

**Referencia:**
- Puedes comparar con Google Maps buscando "Ucú, Yucatán"
- Las coordenadas deben coincidir aproximadamente

---

### **PRUEBA 3: Botón "Usar Mi Ubicación" con auto-llenado completo**

**Objetivo:** Verificar que el botón obtiene la ubicación y llena todos los campos

**Pasos:**
1. Ir a "Reportar"
2. Click en el botón **"📍 Usar Mi Ubicación"** (esquina superior derecha del mapa)
3. Permitir permisos de ubicación en el navegador
4. Esperar a que cargue (verás "Obteniendo...")

**Resultado Esperado:**
- ✅ El marcador se mueve a tu ubicación actual
- ✅ Si estás en Ucú, auto-llena:
  - **Dirección:** Calle y número
  - **Código Postal:** 97357
- ✅ Si estás fuera de Ucú, muestra alerta
- ✅ Los campos se pueden editar después

**Nota:** Si no estás físicamente en Ucú, el sistema te alertará que estás fuera del polígono.

---

### **PRUEBA 4: Tabla de Gestión de POIs (Admin/Supervisor)**

**Objetivo:** Verificar que la tabla funciona correctamente

#### **4.1. Acceso como Administrador**

**Pasos:**
1. Logout del usuario actual
2. Login como administrador:
   - Email: `admin@ucu.gob.mx`
   - Password: `admin123`
3. Verificar que aparece en el menú: **"📋 Gestionar POIs"**
4. Click en "Gestionar POIs"

**Resultado Esperado:**
- ✅ Se muestra una tabla con todos los POIs
- ✅ Columnas: Nombre, Categoría, Dirección, Estado, Acciones
- ✅ Filtros funcionando (búsqueda, estado, categoría)

#### **4.2. Búsqueda y Filtros**

**Pasos:**
1. En la tabla de gestión de POIs
2. Escribir algo en el campo de búsqueda
3. Cambiar el filtro de "Estado"
4. Cambiar el filtro de "Categoría"

**Resultado Esperado:**
- ✅ La tabla se filtra en tiempo real
- ✅ Muestra el contador: "Mostrando X de Y puntos de interés"
- ✅ Los filtros se pueden combinar

#### **4.3. Editar un POI**

**Pasos:**
1. Click en "✏️ Editar" en cualquier POI
2. Se abre un modal
3. Modificar el nombre, categoría o dirección
4. Click en "Guardar Cambios"

**Resultado Esperado:**
- ✅ Modal se abre correctamente
- ✅ Campos pre-llenados con datos actuales
- ✅ Al guardar, muestra "✅ POI actualizado exitosamente"
- ✅ La tabla se actualiza automáticamente

#### **4.4. Eliminar un POI**

**Pasos:**
1. Click en "🗑️ Eliminar" en cualquier POI
2. Se abre modal de confirmación
3. Click en "Eliminar"

**Resultado Esperado:**
- ✅ Modal de confirmación se abre
- ✅ Muestra el nombre del POI a eliminar
- ✅ Al confirmar, muestra "✅ POI eliminado exitosamente"
- ✅ El POI desaparece de la tabla

#### **4.5. Acceso como Supervisor**

**Pasos:**
1. Logout del admin
2. Login como supervisor:
   - Email: `supervisor@ucu.gob.mx`
   - Password: `supervisor123`
3. Verificar que aparece "📋 Gestionar POIs" en el menú
4. Click en "Gestionar POIs"

**Resultado Esperado:**
- ✅ El supervisor tiene acceso completo
- ✅ Puede ver, editar y eliminar POIs
- ✅ Funciona igual que para admin

---

## 🔍 VERIFICACIÓN DE ERRORES

### **Consola del Navegador**

**Pasos:**
1. Presiona F12 para abrir DevTools
2. Ve a la pestaña "Console"
3. Realiza las pruebas anteriores

**Resultado Esperado:**
- ✅ NO debe haber errores en rojo
- ⚠️ Pueden aparecer warnings (amarillo) pero no errores
- ✅ Las peticiones a la API deben ser 200 OK

### **Network (Red)**

**Pasos:**
1. En DevTools, ve a la pestaña "Network"
2. Realiza las pruebas
3. Observa las peticiones

**Resultado Esperado:**
- ✅ `/points-of-interest/pending` → 200 OK
- ✅ `/points-of-interest/public` → 200 OK
- ✅ `/points-of-interest/user` → 200 OK
- ✅ PUT `/points-of-interest/{id}` → 200 OK
- ✅ DELETE `/points-of-interest/{id}` → 200 OK

---

## 📊 CHECKLIST FINAL

### **Funcionalidades Generales**
- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] No hay errores en consola del navegador
- [ ] Todas las peticiones API son exitosas

### **Corrección 1: Mapa**
- [ ] Mapa NO se centra automáticamente al mover marcador
- [ ] Mapa permanece donde el usuario lo deja
- [ ] Marcador se puede arrastrar libremente

### **Corrección 2: Coordenadas**
- [ ] Polígono centrado en Ucú real (21.0317, -89.7464)
- [ ] Botón "Usar Mi Ubicación" funciona
- [ ] Auto-llenado de dirección completa
- [ ] Auto-llenado de código postal (97357)
- [ ] Reverse geocoding obtiene todos los datos

### **Corrección 3: Tabla de Gestión**
- [ ] Tabla visible para admin y supervisor
- [ ] Búsqueda funciona correctamente
- [ ] Filtros funcionan correctamente
- [ ] Editar POI funciona
- [ ] Eliminar POI funciona
- [ ] Modal de edición se abre y cierra
- [ ] Modal de eliminación se abre y cierra
- [ ] Tabla se actualiza después de cambios

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### **Problema:** El mapa sigue centrándose automáticamente
**Solución:** 
- Refresca la página (Ctrl+R o Cmd+R)
- Limpia caché del navegador (Ctrl+Shift+R)

### **Problema:** "Usar Mi Ubicación" no funciona
**Solución:**
- Verifica que diste permisos de ubicación al navegador
- En Chrome: Icono de candado → Configuración del sitio → Ubicación → Permitir

### **Problema:** No aparece "Gestionar POIs" en el menú
**Solución:**
- Verifica que estás logueado como admin o supervisor
- Logout y vuelve a hacer login

### **Problema:** Error 404 en las peticiones
**Solución:**
- Verifica que el backend esté corriendo
- Las rutas correctas son `/points-of-interest/` NO `/api/points-of-interest/`

### **Problema:** No se pueden editar o eliminar POIs
**Solución:**
- Verifica que tienes rol de admin o supervisor
- Verifica que el token de autenticación sea válido
- Intenta hacer logout y login nuevamente

---

## 📞 CONTACTO

Si encuentras algún problema durante las pruebas, documenta:
1. **Qué estabas haciendo** (pasos exactos)
2. **Qué esperabas que pasara**
3. **Qué pasó en realidad**
4. **Errores en consola** (si los hay)
5. **Captura de pantalla** (si es posible)

---

## ✅ ESTADO ACTUAL

**Fecha:** 15 de Noviembre, 2025
**Hora:** 5:25 AM

**Servidores:**
- ✅ Backend: http://0.0.0.0:8000
- ✅ Frontend: http://172.16.3.191:3000

**Correcciones:**
- ✅ Mapa NO se centra automáticamente
- ✅ Coordenadas correctas de Ucú
- ✅ Tabla de gestión de POIs

**Sin errores conocidos** 🎉
