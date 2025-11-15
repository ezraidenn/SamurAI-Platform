# 📍 Sistema de Autocompletado y Validación de Ubicación - Mérida, Yucatán

## 🎯 Funcionalidades Implementadas

### 1. ✅ Autocompletado por Código Postal (API COPOMEX)

**Ubicación:** `frontend/src/services/locationService.js`

**Funcionalidad:**
- Cuando el usuario ingresa un código postal de 5 dígitos, se consulta automáticamente la API de COPOMEX
- Se obtienen y muestran las colonias asociadas al código postal
- Se autocompletar los campos de municipio y estado
- Se valida que el código postal pertenezca a Mérida, Yucatán

**Flujo:**
1. Usuario escribe código postal (ej: `97000`)
2. Sistema valida formato (5 dígitos)
3. Consulta API COPOMEX: `https://api.copomex.com/query/info_cp/{cp}`
4. Extrae colonias, municipio y estado
5. Llena automáticamente los campos del formulario
6. Valida que sea Mérida, Yucatán
7. Muestra mensaje de validación

**Código:**
```javascript
// En MeridaReportFormPage.jsx
const handleCodigoPostalChange = async (e) => {
  const cp = e.target.value;
  
  if (cp.length === 5 && /^\d{5}$/.test(cp)) {
    const result = await getAndValidateAddressByCP(cp);
    
    if (result.success) {
      setColonias(result.colonias);
      setFormData(prev => ({
        ...prev,
        municipio: result.municipio,
        estado: result.estado,
        colonia: result.colonias.length === 1 ? result.colonias[0] : ''
      }));
      
      setLocationValidation(result.validation);
    }
  }
};
```

---

### 2. ✅ Autocompletado por Coordenadas (Reverse Geocoding)

**Ubicación:** 
- `frontend/src/components/MapPicker.jsx` (mapa con marcador arrastrable)
- `frontend/src/services/locationService.js` (servicio de geocoding)

**Funcionalidad:**
- El marcador del mapa es arrastrable
- Al mover el marcador o hacer clic en el mapa, se obtienen las coordenadas
- Se consulta API de Nominatim (OpenStreetMap) para reverse geocoding
- Se autocompletar todos los campos: código postal, colonia, municipio, estado, dirección
- Se valida automáticamente que la ubicación sea de Mérida

**Flujo:**
1. Usuario arrastra el marcador o hace clic en el mapa
2. Sistema captura coordenadas (lat, lng)
3. Consulta Nominatim: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}`
4. Extrae: código postal, colonia, municipio, estado, calle
5. Autocompleta formulario
6. Si hay código postal, obtiene lista de colonias de COPOMEX
7. Valida que sea Mérida, Yucatán
8. Muestra mensaje de validación

**Código:**
```javascript
// En MapPicker.jsx
<LocationMarker 
  position={position} 
  setPosition={handlePositionChange}
  onDragEnd={async (lat, lng) => {
    if (onLocationFound) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.address) {
        onLocationFound({
          position: { lat, lng },
          address: data.address,
          displayName: data.display_name,
        });
      }
    }
  }}
/>
```

---

### 3. ✅ Validación de Ubicación en Mérida, Yucatán

**Ubicación:** 
- Frontend: `frontend/src/services/locationService.js`
- Backend: `backend/utils/location_validator.py`

**Funcionalidad:**
- Valida que la dirección pertenezca a Mérida, Yucatán
- Verifica municipio, estado y código postal
- Valida coordenadas GPS (bounding box de Mérida)
- Bloquea el envío del formulario si la ubicación no es válida

**Criterios de Validación:**

#### Frontend:
```javascript
function validateMeridaYucatan(municipio, estado, codigoPostal) {
  // 1. Normalizar strings (sin acentos, minúsculas)
  const municipioNorm = normalizeMunicipio(municipio);
  const estadoNorm = normalizeEstado(estado);
  
  // 2. Validar municipio = "Mérida"
  const esMerida = municipioNorm === 'merida';
  
  // 3. Validar estado = "Yucatán"
  const esYucatan = estadoNorm === 'yucatan';
  
  // 4. Validar código postal (lista de 400+ CPs de Mérida)
  const cpValido = codigosPostalesMerida.includes(codigoPostal);
  
  // 5. Resultado
  const esValido = esMerida && esYucatan && cpValido;
  
  return {
    valid: esValido,
    mensaje: esValido 
      ? 'Ubicación válida: Mérida, Yucatán'
      : 'La ubicación no pertenece a Mérida, Yucatán...'
  };
}
```

#### Backend:
```python
def validate_merida_location(description, postal_code, latitude, longitude):
    # 1. Validar código postal
    if postal_code and postal_code not in MERIDA_POSTAL_CODES:
        return False, f"CP {postal_code} no pertenece a Mérida"
    
    # 2. Validar coordenadas (bounding box)
    if latitude and longitude:
        if not (20.85 <= latitude <= 21.05 and 
                -89.75 <= longitude <= -89.50):
            return False, "Coordenadas fuera de Mérida"
    
    # 3. Validar descripción (detectar otros municipios/estados)
    # ...
    
    return True, "Ubicación válida: Mérida, Yucatán"
```

**Mensajes de Error:**
- ❌ "El código postal 12345 no pertenece a Mérida, Yucatán"
- ❌ "Las coordenadas no están dentro de Mérida, Yucatán"
- ❌ "Municipio detectado: Progreso. Estado detectado: Yucatán"
- ❌ "Solo se aceptan reportes de Mérida, Yucatán"

**Comportamiento:**
- Frontend: Muestra mensaje de error, deshabilita botón de envío
- Backend: Rechaza el reporte con HTTP 400 Bad Request

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **`frontend/src/services/locationService.js`**
   - Servicio completo de ubicación
   - Funciones: `getAddressByPostalCode()`, `getAddressByCoordinates()`, `validateMeridaYucatan()`
   - Integración con COPOMEX y Nominatim

2. **`frontend/src/pages/MeridaReportFormPage.jsx`**
   - Formulario completo para Mérida
   - Autocompletado por CP y coordenadas
   - Validación en tiempo real
   - UX mejorada con indicadores visuales

3. **`backend/utils/location_validator.py`**
   - Validador de ubicación para backend
   - Lista completa de CPs de Mérida (400+)
   - Validación por coordenadas, CP y descripción

### Archivos Modificados:

1. **`frontend/src/components/MapPicker.jsx`**
   - Marcador arrastrable
   - Reverse geocoding en dragend
   - Eventos de click y drag

2. **`frontend/src/App.jsx`**
   - Nueva ruta: `/reportar-merida`
   - Import del nuevo componente

3. **`backend/routes/reports.py`**
   - Validación de ubicación en creación de reportes
   - Rechazo automático si no es Mérida

---

## 🚀 Cómo Usar

### Para Usuarios:

#### Opción 1: Autocompletar por Código Postal
1. Ir a: `http://localhost:3000/reportar-merida`
2. Ingresar código postal (ej: `97000`)
3. Esperar autocompletado (colonias, municipio, estado)
4. Seleccionar colonia del dropdown
5. Completar dirección y descripción
6. Seleccionar ubicación en mapa
7. Subir foto
8. Enviar reporte

#### Opción 2: Autocompletar por Mapa
1. Ir a: `http://localhost:3000/reportar-merida`
2. Hacer clic en "📍 Usar mi ubicación actual" O arrastrar el marcador
3. Sistema autocompleta: CP, colonia, municipio, estado, dirección
4. Verificar datos autocompletados
5. Completar descripción
6. Subir foto
7. Enviar reporte

### Validación Automática:
- ✅ Verde: "Ubicación válida: Mérida, Yucatán"
- ❌ Rojo: "La ubicación no pertenece a Mérida, Yucatán..."
- Botón de envío se deshabilita si ubicación no es válida

---

## 🔧 APIs Utilizadas

### 1. COPOMEX (Códigos Postales de México)
- **URL:** `https://api.copomex.com/query/info_cp/{cp}`
- **Token:** `pruebas` (reemplazar en producción)
- **Respuesta:**
```json
{
  "response": {
    "asentamiento": ["Centro", "García Ginerés", ...],
    "municipio": "Mérida",
    "estado": "Yucatán"
  }
}
```

### 2. Nominatim (OpenStreetMap Reverse Geocoding)
- **URL:** `https://nominatim.openstreetmap.org/reverse`
- **Parámetros:** `lat`, `lon`, `format=json`, `addressdetails=1`
- **Respuesta:**
```json
{
  "address": {
    "road": "Calle 60",
    "house_number": "450",
    "suburb": "Centro",
    "city": "Mérida",
    "state": "Yucatán",
    "postcode": "97000"
  },
  "display_name": "Calle 60 450, Centro, Mérida, Yucatán, 97000, México"
}
```

---

## 🎨 UX/UI Implementada

### Indicadores Visuales:

1. **Loading States:**
   - Spinner mientras consulta API de CP
   - Mensaje "Obteniendo dirección..." en reverse geocoding

2. **Validación en Tiempo Real:**
   - Banner verde: ✅ "Ubicación válida: Mérida, Yucatán"
   - Banner rojo: ⚠️ "La ubicación no pertenece a Mérida, Yucatán"

3. **Campos Autocompletados:**
   - Municipio y Estado: readonly, fondo gris
   - Colonia: dropdown con opciones
   - Dirección: editable, se autocompleta pero usuario puede modificar

4. **Mapa Interactivo:**
   - Marcador arrastrable
   - Tooltip: "💡 Puedes hacer clic en el mapa o arrastrar el marcador"
   - Coordenadas mostradas debajo del mapa

5. **Botón de Envío:**
   - Deshabilitado si ubicación no válida
   - Loading state durante envío
   - Mensaje de éxito con redirección

---

## 🔒 Seguridad

### Frontend:
- Validación de formato de CP (5 dígitos)
- Validación de municipio y estado
- Validación de coordenadas
- Deshabilitar botón si no es válido

### Backend:
- Validación obligatoria en `create_report()`
- Rechazo con HTTP 400 si ubicación inválida
- Validación por CP, coordenadas y descripción
- Logs de intentos de reportes fuera de Mérida

---

## 📊 Códigos Postales de Mérida

**Total:** 400+ códigos postales válidos
**Rango:** 97000 - 97599
**Ejemplos:**
- Centro: 97000
- García Ginerés: 97070
- Itzimná: 97100
- Montebello: 97113
- Francisco de Montejo: 97203

---

## 🧪 Pruebas

### Casos de Prueba:

#### ✅ Caso 1: CP Válido de Mérida
- Input: `97000`
- Resultado: Autocompleta colonias, municipio="Mérida", estado="Yucatán"
- Validación: ✅ Verde

#### ✅ Caso 2: CP Inválido
- Input: `12345`
- Resultado: Error "Código postal no encontrado"
- Validación: ❌ Rojo

#### ✅ Caso 3: CP de Otro Municipio
- Input: `97357` (Ucú)
- Resultado: Autocompleta pero municipio="Ucú"
- Validación: ❌ "No pertenece a Mérida"

#### ✅ Caso 4: Arrastrar Marcador en Mérida
- Acción: Arrastrar a coordenadas de Mérida
- Resultado: Autocompleta todos los campos
- Validación: ✅ Verde

#### ✅ Caso 5: Arrastrar Marcador Fuera de Mérida
- Acción: Arrastrar a Progreso
- Resultado: Autocompleta con municipio="Progreso"
- Validación: ❌ "No pertenece a Mérida"

---

## 🚀 Despliegue

### Producción:

1. **Reemplazar Token de COPOMEX:**
```javascript
// En locationService.js
const COPOMEX_TOKEN = 'TU_TOKEN_REAL_AQUI';
```

2. **Configurar Rate Limiting:**
- COPOMEX: límites según plan
- Nominatim: máximo 1 request/segundo

3. **Agregar Caché:**
- Cachear respuestas de CPs frecuentes
- Cachear coordenadas de colonias conocidas

4. **Monitoreo:**
- Log de validaciones fallidas
- Alertas si muchos intentos fuera de Mérida

---

## 📝 Notas Adicionales

### Limitaciones:
- COPOMEX token de prueba tiene límites
- Nominatim requiere User-Agent
- Reverse geocoding puede ser lento

### Mejoras Futuras:
- Caché de respuestas de API
- Autocompletado de direcciones (Google Places)
- Validación más estricta por colonia
- Mapa de calor de reportes por zona

---

## ✅ Checklist de Implementación

- [x] Servicio de ubicación (locationService.js)
- [x] Autocompletado por código postal
- [x] Autocompletado por coordenadas
- [x] Validación frontend (Mérida, Yucatán)
- [x] Validación backend (location_validator.py)
- [x] Marcador arrastrable en mapa
- [x] Reverse geocoding en dragend
- [x] UX con indicadores visuales
- [x] Mensajes de error claros
- [x] Deshabilitar envío si no válido
- [x] Integración con formulario
- [x] Pruebas de funcionalidad
- [x] Documentación completa

---

## 🎉 ¡Sistema Completamente Funcional!

**URL de Prueba:** http://localhost:3000/reportar-merida

**Credenciales:**
- Email: `maria@example.com`
- Password: `password123`

**O crear cuenta nueva en:** http://localhost:3000/register
