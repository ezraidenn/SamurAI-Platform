/**
 * MapPicker Component
 * 
 * Interactive map for selecting report location.
 * Uses Leaflet via react-leaflet.
 */
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

// Fix Leaflet default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MapPicker({ value, onChange, height = 'h-96' }) {
  // Default center: Mérida, Yucatán
  const defaultCenter = { lat: 20.9674, lng: -89.5926 };
  const [position, setPosition] = useState(value || null);

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onChange) {
      onChange(newPosition);
    }
  };

  return (
    <div className={`${height} rounded-lg overflow-hidden border-2 border-gray-300`}>
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
      
      {position && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
          <strong>Ubicación seleccionada:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
