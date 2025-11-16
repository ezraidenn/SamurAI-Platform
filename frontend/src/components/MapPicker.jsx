/**
 * MapPicker Component
 * 
 * Interactive map for selecting report location.
 * Uses Leaflet via react-leaflet.
 * Includes reverse geocoding on marker drag.
 */
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import { useState, useRef, useMemo } from 'react';
import L from 'leaflet';

// Fix Leaflet default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks and draggable marker
function LocationMarker({ position, setPosition, onDragEnd, isWithinUcu, onOutOfBounds }) {
  const markerRef = useRef(null);
  
  useMapEvents({
    click(e) {
      // Validar que esté dentro de Ucú
      if (!isWithinUcu(e.latlng.lat, e.latlng.lng)) {
        if (onOutOfBounds) {
          onOutOfBounds();
        }
        return;
      }
      
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
      // Trigger reverse geocoding on click
      if (onDragEnd) {
        onDragEnd(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          
          // Validar que esté dentro de Ucú
          if (!isWithinUcu(latlng.lat, latlng.lng)) {
            if (onOutOfBounds) {
              onOutOfBounds();
            }
            // Revertir a la posición anterior
            if (position) {
              marker.setLatLng([position.lat, position.lng]);
            }
            return;
          }
          
          setPosition({
            lat: latlng.lat,
            lng: latlng.lng,
          });
          // Trigger reverse geocoding on drag end
          if (onDragEnd) {
            onDragEnd(latlng.lat, latlng.lng);
          }
        }
      },
    }),
    [setPosition, onDragEnd, isWithinUcu, onOutOfBounds, position]
  );

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  ) : null;
}

export default function MapPicker({ value, onChange, onLocationFound, height = 'h-96' }) {
  // Default center: Ucú, Yucatán (coordenadas del centro del municipio)
  const defaultCenter = { lat: 21.0317, lng: -89.7464 };
  
  // Límites geográficos aproximados de Ucú (bounding box)
  const ucuBounds = {
    north: 21.06,   // Límite norte
    south: 21.00,   // Límite sur
    east: -89.72,   // Límite este
    west: -89.78    // Límite oeste
  };
  
  // Polígono aproximado del municipio de Ucú para visualización
  const ucuPolygon = [
    [21.06, -89.78],  // Noroeste
    [21.06, -89.72],  // Noreste
    [21.00, -89.72],  // Sureste
    [21.00, -89.78],  // Suroeste
  ];
  
  const [position, setPosition] = useState(value || null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const mapRef = useRef(null);
  
  // Función para verificar si una ubicación está dentro de Ucú
  const isWithinUcu = (lat, lng) => {
    return lat >= ucuBounds.south && 
           lat <= ucuBounds.north && 
           lng >= ucuBounds.west && 
           lng <= ucuBounds.east;
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onChange) {
      onChange(newPosition);
    }
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        handlePositionChange(newPosition);
        
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setView([newPosition.lat, newPosition.lng], 16);
        }

        // Try to get address using reverse geocoding
        if (onLocationFound) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              onLocationFound({
                position: newPosition,
                address: data.address,
                displayName: data.display_name,
              });
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('No se pudo obtener tu ubicación. Verifica los permisos.');
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={loadingLocation}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingLocation ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Obteniendo ubicación...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            📍 Usar mi ubicación actual
          </>
        )}
      </button>

      {locationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {locationError}
        </div>
      )}

      {/* Map Container */}
      <div className={`${height} rounded-lg overflow-hidden border-2 border-gray-300 relative z-0`}>
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          scrollWheelZoom={true}
          ref={mapRef}
          maxBounds={[[ucuBounds.south, ucuBounds.west], [ucuBounds.north, ucuBounds.east]]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Polígono visual de los límites de Ucú */}
          <Polygon
            positions={ucuPolygon}
            pathOptions={{
              color: '#8B1538',
              fillColor: '#8B1538',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 10'
            }}
          />
          
          <LocationMarker 
            position={position} 
            setPosition={handlePositionChange}
            isWithinUcu={isWithinUcu}
            onOutOfBounds={() => {
              setLocationError('⚠️ Por favor selecciona una ubicación dentro del municipio de Ucú');
              setTimeout(() => setLocationError(''), 3000);
            }}
            onDragEnd={async (lat, lng) => {
              // Trigger reverse geocoding when marker is dragged
              if (onLocationFound) {
                try {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`,
                    {
                      headers: {
                        'User-Agent': 'SamurAI-Platform/1.0'
                      }
                    }
                  );
                  const data = await response.json();
                  
                  if (data && data.address) {
                    onLocationFound({
                      position: { lat, lng },
                      address: data.address,
                      displayName: data.display_name,
                    });
                  }
                } catch (error) {
                  console.error('Error getting address:', error);
                }
              }
            }}
          />
        </MapContainer>
      </div>
      
      {position && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <strong>✓ Ubicación seleccionada:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
