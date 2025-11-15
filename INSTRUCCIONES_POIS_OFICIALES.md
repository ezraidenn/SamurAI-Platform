# 🏛️ POIs Oficiales - Instrucciones

## ¿Qué son los POIs Oficiales?

Los **POIs Oficiales** son lugares verificados y administrados por el equipo (escuelas, hospitales, gasolineras, parques, etc.) que aparecen en el mapa con un **badge dorado** y borde especial, similar a Google Maps.

## Diferencias entre POIs

| Característica | POIs de Usuarios | POIs Oficiales |
|----------------|------------------|----------------|
| **Creador** | Cualquier usuario | Solo admins |
| **Validación** | Requiere IA + humana | Pre-aprobados |
| **Icono** | Borde blanco | Borde dorado + ✓ |
| **Edición** | Solo dueño | Solo admins |
| **Eliminación** | Dueño o admin | Solo admins |
| **Badge** | Ninguno | "✓ LUGAR OFICIAL" |

## 🚀 Instalación

### Paso 1: Agregar columna `is_official`

```bash
cd backend
python add_is_official_column.py
```

### Paso 2: Poblar POIs oficiales

```bash
python seed_official_pois.py
```

Esto creará automáticamente:
- ✅ 3 Escuelas (primaria, secundaria, telesecundaria)
- ✅ 2 Centros de salud (centro de salud, farmacia)
- ✅ 2 Oficinas de gobierno (palacio municipal, comisaría)
- ✅ 1 Iglesia
- ✅ 2 Espacios públicos (parque, cancha)
- ✅ 1 Gasolinera
- ✅ 2 Tiendas oficiales (OXXO, 3B)

**Total: 13 POIs oficiales**

## 📍 POIs Incluidos

### Educación
- Escuela Primaria Benito Juárez
- Escuela Secundaria Técnica No. 45
- Telesecundaria Ucú

### Salud
- Centro de Salud Ucú
- Farmacia San José

### Gobierno
- Palacio Municipal de Ucú
- Comisaría Municipal

### Religioso
- Iglesia de San Francisco de Asís

### Espacios Públicos
- Parque Principal de Ucú
- Cancha Deportiva Municipal

### Servicios
- Gasolinera Pemex Ucú
- OXXO Ucú Centro
- Tiendas 3B

## 🎨 Visualización en el Mapa

Los POIs oficiales se muestran con:
- 🟡 **Borde dorado** en el marcador
- ✓ **Badge de verificación** en la esquina
- 🏅 **Etiqueta "✓ LUGAR OFICIAL"** en el modal
- 📏 **Tamaño ligeramente mayor** (36px vs 32px)

## ✏️ Agregar Más POIs Oficiales

### Opción 1: Editar el script

Edita `backend/seed_official_pois.py` y agrega más POIs al array `OFFICIAL_POIS`:

```python
{
    "nombre": "Nuevo Lugar",
    "descripcion": "Descripción del lugar",
    "categoria": "tienda",  # Ver categorías disponibles
    "subcategoria": "abarrotes",
    "direccion": "Calle X x Y, Colonia",
    "colonia": "Centro",
    "latitude": 21.0320,
    "longitude": -89.7460,
    "telefono": "999-XXX-XXXX",
    "horarios": "Lunes a Viernes 8:00 AM - 5:00 PM",
    "is_official": True,
    "ia_status": "approved",
    "human_status": "approved",
    "status": "approved"
}
```

Luego ejecuta:
```bash
python seed_official_pois.py
```

### Opción 2: Desde la base de datos

Puedes marcar cualquier POI existente como oficial:

```sql
UPDATE points_of_interest 
SET is_official = TRUE, 
    is_public = TRUE,
    status = 'approved'
WHERE id = X;
```

## 🔐 Permisos de Admin

Los admins pueden:
- ✅ Ver botón "Eliminar" en POIs oficiales
- ✅ Ver botón "Editar" en POIs oficiales
- ✅ Crear nuevos POIs oficiales
- ✅ Modificar POIs existentes a oficiales

Los usuarios normales:
- ❌ No pueden eliminar POIs oficiales
- ❌ No pueden editar POIs oficiales
- ✅ Pueden ver POIs oficiales en el mapa
- ✅ Pueden reportar problemas con POIs oficiales

## 📊 Categorías Disponibles

- `tienda` - Tiendas y comercios
- `supermercado` - Supermercados
- `restaurante` - Restaurantes
- `cafe` - Cafés
- `salud` - Centros de salud, farmacias
- `educacion` - Escuelas, universidades
- `belleza` - Salones de belleza
- `taller` - Talleres mecánicos
- `oficina` - Oficinas
- `financiero` - Bancos, cajeros
- `gobierno` - Oficinas gubernamentales
- `deporte` - Gimnasios, canchas
- `entretenimiento` - Cines, teatros
- `religioso` - Iglesias, templos
- `parque` - Parques, plazas
- `gasolinera` - Gasolineras
- `hospedaje` - Hoteles
- `otro` - Otros

## 🗺️ Coordenadas de Ucú

Para agregar POIs, usa coordenadas dentro de estos límites:

- **Latitud**: 21.020833 a 21.043611
- **Longitud**: -89.760833 a -89.733333
- **Centro**: 21.0317, -89.7464

Puedes usar Google Maps para obtener coordenadas exactas:
1. Click derecho en el lugar
2. Seleccionar las coordenadas
3. Copiar y pegar en el script

## 🔄 Actualizar POIs Oficiales

Si necesitas actualizar los POIs oficiales:

```bash
python seed_official_pois.py
# Responde 's' cuando pregunte si quieres eliminar los existentes
```

## 📝 Notas Importantes

- Los POIs oficiales **NO pasan por validación IA**
- Se crean directamente como **aprobados**
- Son **públicos** por defecto
- Solo pueden ser modificados por **admins**
- Aparecen en el mapa con **prioridad visual**

## 🎯 Próximos Pasos

1. Ejecutar los scripts de instalación
2. Verificar que aparezcan en el mapa con borde dorado
3. Agregar más POIs oficiales según necesites
4. Mantener actualizada la información

---

**¿Preguntas?** Contacta al equipo de desarrollo.
