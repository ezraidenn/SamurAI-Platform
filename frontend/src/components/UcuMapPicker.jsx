/**
 * Ucú Map Picker Component
 * 
 * Mapa interactivo restringido al municipio de Ucú, Yucatán
 * - Muestra polígono del municipio
 * - Restringe selección dentro del polígono
 * - Marcador arrastrable
 * - Validación automática de ubicación
 */
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Polígono de Ucú, Yucatán (coordenadas más precisas basadas en el municipio real)
// Centro aproximado: 21.0317, -89.7464
const UCU_POLYGON = [
  [21.0650, -89.7750],  // Noroeste
  [21.0680, -89.7550],  // Norte
  [21.0650, -89.7350],  // Noreste
  [21.0450, -89.7250],  // Este-Norte
  [21.0250, -89.7200],  // Este
  [21.0050, -89.7250],  // Este-Sur
  [20.9950, -89.7350],  // Sureste
  [20.9900, -89.7500],  // Sur
  [20.9950, -89.7650],  // Suroeste
  [21.0100, -89.7750],  // Oeste-Sur
  [21.0350, -89.7800],  // Oeste
  [21.0650, -89.7750],  // Cierre
];

// Centro de Ucú (coordenadas reales)
const UCU_CENTER = [21.0317, -89.7464];

// Límites de Ucú (área más amplia para visualización)
const UCU_BOUNDS = [
  [20.9800, -89.7900],  // Suroeste
  [21.0800, -89.7100],  // Noreste
];

// Icono personalizado para el marcador
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Verifica si un punto está dentro del polígono de Ucú
 */
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Encuentra el punto más cercano dentro del polígono
 */
function getClosestPointInPolygon(lat, lng, polygon) {
  let minDistance = Infinity;
  let closestPoint = null;
  
  // Verificar cada segmento del polígono
  for (let i = 0; i < polygon.length - 1; i++) {
    const p1 = polygon[i];
    const p2 = polygon[i + 1];
    
    // Calcular punto más cercano en el segmento
    const closest = closestPointOnSegment(lat, lng, p1, p2);
    const distance = getDistance(lat, lng, closest[0], closest[1]);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = closest;
    }
  }
  
  return closestPoint;
}

/**
 * Encuentra el punto más cercano en un segmento de línea
 */
function closestPointOnSegment(lat, lng, p1, p2) {
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  
  const A = lat - lat1;
  const B = lng - lng1;
  const C = lat2 - lat1;
  const D = lng2 - lng1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lat1;
    yy = lng1;
  } else if (param > 1) {
    xx = lat2;
    yy = lng2;
  } else {
    xx = lat1 + param * C;
    yy = lng1 + param * D;
  }
  
  return [xx, yy];
}

/**
 * Calcula distancia entre dos puntos
 */
function getDistance(lat1, lng1, lat2, lng2) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
}

/**
 * Componente de marcador arrastrable con restricción
 */
function DraggableMarker({ position, setPosition, onLocationChange, onOutsideUcu, onAddressFound }) {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    async dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        const lat = newPos.lat;
        const lng = newPos.lng;
        
        // Verificar si está dentro de Ucú
        if (isPointInPolygon(lat, lng, UCU_POLYGON)) {
          setPosition([lat, lng]);
          if (onLocationChange) {
            onLocationChange(lat, lng);
          }
          // Obtener dirección automáticamente
          if (onAddressFound) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                  headers: {
                    'User-Agent': 'UCU-Reporta-Platform/1.0'
                  }
                }
              );
              const data = await response.json();
              
              const addressInfo = {
                street: data.address?.road || data.address?.street || '',
                houseNumber: data.address?.house_number || '',
                suburb: data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || data.address?.village || '',
                city: data.address?.city || data.address?.town || data.address?.municipality || 'Ucú',
                state: data.address?.state || 'Yucatán',
                postcode: data.address?.postcode || '97357',
                country: data.address?.country || 'México',
                fullAddress: data.display_name || ''
              };
              
              onAddressFound({
                lat,
                lng,
                address: addressInfo
              });
            } catch (error) {
              console.error('Error obteniendo dirección:', error);
            }
          }
        } else {
          // Mover al punto más cercano dentro del polígono
          const closest = getClosestPointInPolygon(lat, lng, UCU_POLYGON);
          setPosition(closest);
          marker.setLatLng(closest);
          
          if (onOutsideUcu) {
            onOutsideUcu();
          }
        }
      }
    },
  };
  
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
}

/**
 * Componente para manejar clics en el mapa
 */
function MapClickHandler({ setPosition, onLocationChange, onOutsideUcu, onAddressFound }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Verificar si está dentro de Ucú
      if (isPointInPolygon(lat, lng, UCU_POLYGON)) {
        setPosition([lat, lng]);
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
        // Obtener dirección automáticamente
        if (onAddressFound) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'UCU-Reporta-Platform/1.0'
                }
              }
            );
            const data = await response.json();
            
            const addressInfo = {
              street: data.address?.road || data.address?.street || '',
              houseNumber: data.address?.house_number || '',
              suburb: data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || data.address?.village || '',
              city: data.address?.city || data.address?.town || data.address?.municipality || 'Ucú',
              state: data.address?.state || 'Yucatán',
              postcode: data.address?.postcode || '97357',
              country: data.address?.country || 'México',
              fullAddress: data.display_name || ''
            };
            
            onAddressFound({
              lat,
              lng,
              address: addressInfo
            });
          } catch (error) {
            console.error('Error obteniendo dirección:', error);
          }
        }
      } else {
        // Mover al punto más cercano dentro del polígono
        const closest = getClosestPointInPolygon(lat, lng, UCU_POLYGON);
        setPosition(closest);
        
        if (onOutsideUcu) {
          onOutsideUcu();
        }
      }
    },
  });
  
  return null;
}

/**
 * Componente para centrar el mapa solo en la carga inicial
 * NO se vuelve a centrar cuando el usuario interactúa con el mapa
 */
function MapCenterController({ center, zoom, shouldCenter }) {
  const map = useMap();
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Solo centrar UNA VEZ en la carga inicial
    if (!hasInitializedRef.current && shouldCenter) {
      map.setView(center, zoom);
      hasInitializedRef.current = true;
    }
    // Importante: NO incluir center, zoom en las dependencias para evitar re-centrado
  }, [map, shouldCenter]);
  
  return null;
}

/**
 * Componente principal del mapa de Ucú
 */
export default function UcuMapPicker({ 
  value, 
  onChange, 
  height = "h-96",
  showUserLocation = true,
  onLocationFound = null // Callback para cuando se encuentra una ubicación
}) {
  const [position, setPosition] = useState(value || UCU_CENTER);
  const [userLocation, setUserLocation] = useState(null);
  const [outsideWarning, setOutsideWarning] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  useEffect(() => {
    if (value) {
      setPosition(value);
    }
  }, [value]);
  
  useEffect(() => {
    if (onChange) {
      onChange({ lat: position[0], lng: position[1] });
    }
  }, [position]);
  
  // Obtener ubicación del usuario
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          
          // Verificar si el usuario está en Ucú
          if (isPointInPolygon(userLat, userLng, UCU_POLYGON)) {
            setUserLocation([userLat, userLng]);
            setPosition([userLat, userLng]);
          } else {
            // Usuario fuera de Ucú, usar centro por defecto
            setUserLocation(null);
          }
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, [showUserLocation]);
  
  const handleLocationChange = (lat, lng) => {
    setOutsideWarning(false);
  };
  
  const handleOutsideUcu = () => {
    setOutsideWarning(true);
    setTimeout(() => setOutsideWarning(false), 3000);
  };
  
  // Función para obtener dirección desde coordenadas (reverse geocoding)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UCU-Reporta-Platform/1.0'
          }
        }
      );
      const data = await response.json();
      
      // Extraer información completa
      const addressInfo = {
        street: data.address?.road || data.address?.street || '',
        houseNumber: data.address?.house_number || '',
        suburb: data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || data.address?.village || '',
        city: data.address?.city || data.address?.town || data.address?.municipality || 'Ucú',
        state: data.address?.state || 'Yucatán',
        postcode: data.address?.postcode || '97357',
        country: data.address?.country || 'México',
        fullAddress: data.display_name || ''
      };
      
      return addressInfo;
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      return null;
    }
  };
  
  // Función para usar la ubicación actual del usuario
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    
    setLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        
        // Verificar si el usuario está en Ucú
        if (isPointInPolygon(userLat, userLng, UCU_POLYGON)) {
          setUserLocation([userLat, userLng]);
          setPosition([userLat, userLng]);
          
          // Hacer reverse geocoding para obtener la dirección
          const addressData = await reverseGeocode(userLat, userLng);
          
          if (onLocationFound && addressData) {
            onLocationFound({
              lat: userLat,
              lng: userLng,
              address: addressData
            });
          }
        } else {
          // Usuario fuera de Ucú
          alert('Tu ubicación actual está fuera del municipio de Ucú. Por favor, selecciona una ubicación dentro del polígono.');
          setUserLocation(null);
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos de ubicación.');
        setLoadingLocation(false);
      }
    );
  };
  
  return (
    <div className="relative">
      {/* Botón de usar mi ubicación */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={loadingLocation}
        className="absolute top-4 right-4 z-[1000] bg-guinda hover:bg-guinda-dark text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingLocation ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Obteniendo...
          </>
        ) : (
          <>
            📍 Usar Mi Ubicación
          </>
        )}
      </button>
      
      {/* Advertencia de ubicación fuera de Ucú */}
      {outsideWarning && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          ⚠️ La ubicación seleccionada está fuera de Ucú, Yucatán
        </div>
      )}
      
      {/* Mapa */}
      <div className={`${height} rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg`}>
        <MapContainer
          center={UCU_CENTER}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          maxBounds={UCU_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={13}
          maxZoom={18}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Polígono de Ucú */}
          <Polygon
            positions={UCU_POLYGON}
            pathOptions={{
              color: '#8B0000',      // Borde rojo oscuro/guinda
              fillColor: '#FFB6C1',  // Interior rojo claro/rosado
              fillOpacity: 0.2,
              weight: 3,
            }}
          />
          
          {/* Marcador arrastrable */}
          <DraggableMarker
            position={position}
            setPosition={setPosition}
            onLocationChange={handleLocationChange}
            onOutsideUcu={handleOutsideUcu}
            onAddressFound={onLocationFound}
          />
          
          {/* Manejador de clics */}
          <MapClickHandler
            setPosition={setPosition}
            onLocationChange={handleLocationChange}
            onOutsideUcu={handleOutsideUcu}
            onAddressFound={onLocationFound}
          />
          
          {/* Controlador de centro - solo centra en carga inicial */}
          <MapCenterController center={UCU_CENTER} zoom={14} shouldCenter={!value} />
        </MapContainer>
      </div>
      
      {/* Información de coordenadas */}
      <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
        <span>
          📍 Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </span>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          ✓ Dentro de Ucú
        </span>
      </div>
      
      {/* Instrucciones */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación.
        Solo puedes seleccionar ubicaciones dentro de Ucú, Yucatán.
      </div>
    </div>
  );
}
