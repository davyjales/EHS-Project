import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWaste } from '@/contexts/WasteContext';

interface MapProps {
  className?: string;
  height?: string;
}

// Coordenadas aproximadas das principais cidades brasileiras
const BRAZIL_CITIES: Record<string, LatLngExpression> = {
  'São Paulo, SP': [-23.5505, -46.6333],
  'Rio de Janeiro, RJ': [-22.9068, -43.1729],
  'Belo Horizonte, MG': [-19.9208, -43.9378],
  'Salvador, BA': [-12.9714, -38.5014],
  'Brasília, DF': [-15.7942, -47.8825],
  'Fortaleza, CE': [-3.7172, -38.5434],
  'Manaus, AM': [-3.1190, -60.0251],
  'Curitiba, PR': [-25.4284, -49.2731],
  'Recife, PE': [-8.0539, -34.8777],
  'Porto Alegre, RS': [-30.0346, -51.2177],
  'Campinas, SP': [-22.9056, -47.0608],
  'Joinville, SC': [-26.3045, -48.8467],
  'Goiânia, GO': [-16.6869, -49.2643],
  'Belém, PA': [-1.4558, -48.5044],
  'Guarulhos, SP': [-23.4625, -46.5333],
  'São Luís, MA': [-2.5307, -44.3068],
  'Maceió, AL': [-9.6498, -35.7353],
  'Campo Grande, MS': [-20.4697, -54.6464],
  'João Pessoa, PB': [-7.1195, -34.8641],
  'Teresina, PI': [-5.0892, -42.8034],
  'Natal, RN': [-5.7945, -35.2094],
  'Aracaju, SE': [-10.9472, -37.0731],
  'Cuiabá, MT': [-15.6014, -56.0916],
  'Vitória, ES': [-20.3155, -40.3376],
  'Florianópolis, SC': [-27.5969, -48.5482]
};

// Create a custom icon for the markers
const createCustomIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export function Map({ className = "", height = "400px" }: MapProps) {
  const { wasteItems } = useWaste();
  
  // Group waste items by location
  const locationGroups = useMemo(() => {
    return wasteItems.reduce((groups, waste) => {
      if (!groups[waste.location]) {
        groups[waste.location] = [];
      }
      groups[waste.location].push(waste);
      return groups;
    }, {} as Record<string, typeof wasteItems>);
  }, [wasteItems]);

  // Create markers data
  const markers = useMemo(() => {
    return Object.entries(locationGroups)
      .map(([location, wastes]) => {
        const coordinates = BRAZIL_CITIES[location];
        if (!coordinates) return null;
        
        return {
          location,
          coordinates,
          wastes
        };
      })
      .filter(Boolean);
  }, [locationGroups]);

  // Fix for default marker icons in production
  useEffect(() => {
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5S10.015 8 12.5 8S17 10.015 17 12.5S14.985 17 12.5 17Z" fill="#22c55e"/>
        </svg>
      `),
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5S10.015 8 12.5 8S17 10.015 17 12.5S14.985 17 12.5 17Z" fill="#22c55e"/>
        </svg>
      `),
      shadowUrl: '',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }, []);

  return (
    <div 
      className={`border rounded-lg shadow-sm overflow-hidden ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={[-14.0, -54.0]} // Centro do Brasil
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          marker && (
            <Marker
              key={`${marker.location}-${index}`}
              position={marker.coordinates}
              icon={createCustomIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-2">{marker.location}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {marker.wastes.length} resíduo{marker.wastes.length > 1 ? 's' : ''} disponível{marker.wastes.length > 1 ? 'eis' : ''}
                  </p>
                  <div className="space-y-1">
                    {marker.wastes.slice(0, 3).map((waste, wasteIndex) => (
                      <div key={waste.id} className="text-xs">
                        <strong>{waste.title}</strong><br />
                        {waste.quantity} {waste.unit} - {waste.wasteType}
                      </div>
                    ))}
                    {marker.wastes.length > 3 && (
                      <div className="text-xs text-gray-500">
                        e mais {marker.wastes.length - 3}...
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}