# 🚀 Instrucciones de Uso - Módulo de Puntos de Interés

## ✅ Estado Actual del Sistema

**Backend:** ✅ Corriendo en http://0.0.0.0:8000
**Frontend:** ✅ Corriendo en http://172.16.3.191:3000
**Base de Datos:** ✅ Neon PostgreSQL conectada
**POIs Iniciales:** ✅ 12 puntos de Ucú cargados

---

## 🌐 URLs de Acceso

### Desde tu computadora:
- **Mapa Público:** http://localhost:3000/mapa-negocios
- **Registrar POI:** http://localhost:3000/registrar-poi
- **Validar POIs:** http://localhost:3000/admin/validar-pois
- **API Docs:** http://localhost:8000/docs

### Desde otros dispositivos en tu red:
- **Mapa Público:** http://172.16.3.191:3000/mapa-negocios
- **Registrar POI:** http://172.16.3.191:3000/registrar-poi
- **Validar POIs:** http://172.16.3.191:3000/admin/validar-pois
- **API Docs:** http://172.16.3.191:8000/docs

---

## 👥 Credenciales de Prueba

### Admin:
```
Email: admin@ucu.gob.mx
Password: admin123
```

### Usuario Regular:
```
Email: maria@example.com
Password: password123
```

---

## 📱 Guía de Uso para Usuarios

### 1. Ver Mapa Público de Negocios

**URL:** http://localhost:3000/mapa-negocios

**Pasos:**
1. Abrir la URL (no requiere login)
2. Ver todos los puntos de interés aprobados en el mapa
3. Usar el filtro de categorías en la parte superior
4. Hacer clic en los marcadores (emojis) para ver detalles
5. Ver información completa en los popups

**Funcionalidades:**
- ✅ 12 puntos iniciales de Ucú visibles
- ✅ Filtrar por categoría (tienda, servicio, comercio, etc.)
- ✅ Ver fotos de los lugares
- ✅ Ver dirección y descripción
- ✅ Polígono de Ucú visible en el mapa

---

### 2. Registrar un Punto de Interés

**URL:** http://localhost:3000/registrar-poi

**Pasos:**
1. **Iniciar sesión** (cualquier usuario autenticado)
2. Ir a la URL de registro
3. **Llenar el formulario:**
   - Nombre del negocio o lugar
   - Seleccionar categoría
   - Escribir dirección
   - Agregar descripción (opcional)
4. **Seleccionar ubicación en el mapa:**
   - Hacer clic en el mapa
   - O arrastrar el marcador rojo
   - ⚠️ Solo puedes seleccionar dentro de Ucú
   - Si intentas salir, el marcador regresa automáticamente
5. **Subir foto** (opcional)
6. Hacer clic en "📤 Registrar Punto de Interés"
7. Ver mensaje de confirmación
8. **Esperar validación** del administrador

**Notas Importantes:**
- ✅ El punto quedará en estado "pendiente"
- ✅ No aparecerá en el mapa público hasta ser aprobado
- ✅ Recibirás notificación cuando sea validado
- ⚠️ Solo se aceptan ubicaciones dentro de Ucú

---

### 3. Ver Mis Puntos Registrados

**Próximamente:** `/mis-puntos`

Por ahora, los puntos registrados se pueden ver en:
- Panel de validación (si eres admin)
- Base de datos directamente

---

## 👨‍💼 Guía de Uso para Administradores

### 1. Validar Puntos de Interés Pendientes

**URL:** http://localhost:3000/admin/validar-pois

**Pasos:**
1. **Iniciar sesión como admin**
   - Email: admin@ucu.gob.mx
   - Password: admin123

2. **Ver lista de pendientes**
   - Panel izquierdo muestra todos los POIs pendientes
   - Contador indica cuántos hay

3. **Seleccionar un POI**
   - Hacer clic en cualquier POI de la lista
   - Se muestra información detallada

4. **Revisar información:**
   - Nombre y categoría
   - Dirección y descripción
   - Foto (si existe)
   - **Ubicación en el mapa** (verificar que esté en Ucú)
   - Fecha de registro

5. **Tomar decisión:**
   
   **Opción A: Aprobar**
   - Hacer clic en "✅ Aprobar"
   - El POI aparecerá inmediatamente en el mapa público
   - Estado cambia a "aprobado"
   
   **Opción B: Rechazar**
   - Escribir un **comentario explicando el motivo**
   - Hacer clic en "❌ Rechazar"
   - El usuario verá el comentario
   - Estado cambia a "rechazado"

6. **Continuar con el siguiente**
   - El sistema automáticamente muestra el siguiente POI pendiente
   - Repetir el proceso

**Criterios de Validación:**
- ✅ Ubicación dentro de Ucú
- ✅ Nombre real de negocio o lugar
- ✅ Categoría correcta
- ✅ Foto apropiada (si existe)
- ✅ Dirección válida
- ❌ Rechazar si: spam, ubicación incorrecta, información falsa

---

## 🗺️ Características del Mapa Restringido

### Polígono de Ucú

**Siempre Visible:**
- Borde rojo oscuro/guinda
- Interior rojo claro/rosado
- Delimita claramente el municipio

**Restricción Automática:**
- No se puede seleccionar fuera del polígono
- Marcador regresa automáticamente
- Mensaje de advertencia aparece

**Indicadores:**
- ✓ "Dentro de Ucú" (verde)
- ⚠️ "Fuera de Ucú" (rojo, temporal)
- Coordenadas en tiempo real

---

## 🔧 Solución de Problemas

### Problema: "No puedo seleccionar una ubicación"

**Solución:**
- Verifica que estés haciendo clic **dentro del polígono rosado**
- El polígono delimita el municipio de Ucú
- Si haces clic fuera, el marcador se moverá automáticamente al borde

---

### Problema: "Mi punto no aparece en el mapa público"

**Solución:**
- Los puntos deben ser **aprobados por un administrador**
- Estado actual: "pendiente"
- Espera la validación
- Una vez aprobado, aparecerá automáticamente

---

### Problema: "No puedo validar POIs (no veo el panel)"

**Solución:**
- Debes iniciar sesión como **admin o supervisor**
- Usuario regular no tiene acceso
- Credenciales de admin: admin@ucu.gob.mx / admin123

---

### Problema: "El mapa no carga"

**Solución:**
1. Verificar que el frontend esté corriendo:
   ```bash
   # En terminal, ir a:
   cd frontend
   npm run dev
   ```

2. Verificar conexión a internet (Leaflet requiere tiles de OpenStreetMap)

3. Limpiar caché del navegador

---

### Problema: "Error al subir foto"

**Solución:**
- Tamaño máximo: **10MB**
- Formatos permitidos: JPG, PNG, WEBP
- Verificar que el backend esté corriendo

---

## 📊 Verificar Datos en Base de Datos

### Ver POIs en la base de datos:

```sql
-- Todos los POIs
SELECT * FROM points_of_interest;

-- Solo aprobados
SELECT * FROM points_of_interest WHERE estado_validacion = 'aprobado';

-- Solo pendientes
SELECT * FROM points_of_interest WHERE estado_validacion = 'pendiente';

-- Contar por categoría
SELECT categoria, COUNT(*) as total 
FROM points_of_interest 
WHERE estado_validacion = 'aprobado'
GROUP BY categoria;
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Ciudadano registra su negocio

1. María tiene una tortillería en Ucú
2. Entra a `/registrar-poi`
3. Llena el formulario:
   - Nombre: "Tortillería Doña María"
   - Categoría: Comercio
   - Dirección: "Calle 20 x 19, Centro"
   - Descripción: "Tortillas de maíz frescas"
4. Selecciona ubicación en el mapa
5. Sube foto de su negocio
6. Envía el formulario
7. Espera validación del admin

---

### Caso 2: Admin valida el negocio

1. Admin entra a `/admin/validar-pois`
2. Ve "Tortillería Doña María" en la lista
3. Revisa la información
4. Verifica ubicación en el mapa (está en Ucú ✓)
5. Ve la foto (apropiada ✓)
6. Hace clic en "✅ Aprobar"
7. El negocio aparece inmediatamente en el mapa público

---

### Caso 3: Turista busca restaurantes

1. Turista entra a `/mapa-negocios` (sin login)
2. Selecciona filtro "🍽️ Restaurantes"
3. Ve todos los restaurantes aprobados en Ucú
4. Hace clic en "Comedor Doña Mary"
5. Ve dirección, descripción y foto
6. Usa la información para visitarlo

---

## 📱 Uso en Móviles

**Responsive:** ✅ Totalmente adaptado

**Funcionalidades móviles:**
- Touch para seleccionar en mapa
- Arrastrar marcador con el dedo
- Popups adaptados a pantalla pequeña
- Filtros accesibles
- Formularios optimizados

---

## 🔐 Permisos por Rol

### Usuario Regular (Citizen):
- ✅ Ver mapa público
- ✅ Registrar POIs
- ✅ Ver sus propios POIs
- ❌ Validar POIs
- ❌ Ver POIs de otros usuarios

### Admin/Supervisor:
- ✅ Todo lo anterior
- ✅ Ver POIs pendientes
- ✅ Aprobar POIs
- ✅ Rechazar POIs
- ✅ Ver todos los POIs

---

## 📈 Estadísticas Actuales

**POIs en el sistema:** 12
**POIs aprobados:** 12
**POIs pendientes:** 0
**Categorías con POIs:** 12

**Distribución por categoría:**
- Gobierno: 1
- Religión: 1
- Deporte: 1
- Parque: 1
- Salud: 1
- Educación: 1
- Tienda: 1
- Comercio: 2
- Servicio: 1
- Restaurante: 1
- Cultura: 1

---

## 🎉 ¡Sistema Listo para Usar!

**Todo está funcionando correctamente:**
- ✅ Backend operativo
- ✅ Frontend operativo
- ✅ Base de datos conectada
- ✅ 12 POIs iniciales cargados
- ✅ Mapa restringido funcionando
- ✅ Validación implementada
- ✅ Panel de admin operativo

**¡Comienza a explorar y registrar puntos de interés en Ucú! 🗺️**

---

## 📞 Documentación Adicional

- **Documentación Completa:** `DOCUMENTACION_PUNTOS_INTERES.md`
- **Resumen Ejecutivo:** `RESUMEN_PUNTOS_INTERES.md`
- **Configuración Actual:** `CONFIGURACION_ACTUAL.md`

---

**Última actualización:** 15 de Noviembre, 2025
**Versión:** 1.0.0
**Estado:** ✅ Producción
