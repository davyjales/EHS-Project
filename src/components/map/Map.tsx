import React, { useMemo, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWaste } from '@/contexts/WasteContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

// Fix Leaflet default markers issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

function MapLoadingFallback() {
  return (
    <Card className="border">
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando mapa...</span>
      </CardContent>
    </Card>
  );
}

function LocationList({ markers }: { markers: any[] }) {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Localizações dos Resíduos</h3>
        <div className="space-y-2">
          {markers.map((marker) => (
            <div key={marker.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
              <MapPin className="h-4 w-4 mt-1 text-primary" />
              <div>
                <p className="font-medium text-sm">{marker.location}</p>
                <p className="text-xs text-muted-foreground">
                  {marker.wastes.length} resíduo{marker.wastes.length > 1 ? 's' : ''} disponível{marker.wastes.length > 1 ? 'eis' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Map({ className = "", height = "400px" }: MapProps) {
  const { wasteItems } = useWaste();
  
  // Add safety check for wasteItems
  const safeWasteItems = wasteItems || [];
  
  // Group waste items by location and create markers data
  const markers = useMemo(() => {
    if (!safeWasteItems.length) return [];
    
    const locationGroups = safeWasteItems.reduce((groups, waste) => {
      if (!groups[waste.location]) {
        groups[waste.location] = [];
      }
      groups[waste.location].push(waste);
      return groups;
    }, {} as Record<string, typeof safeWasteItems>);

    return Object.entries(locationGroups)
      .map(([location, wastes]) => {
        const coordinates = BRAZIL_CITIES[location];
        if (!coordinates) return null;
        
        return {
          id: location,
          location,
          coordinates,
          wastes
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);
  }, [safeWasteItems]);

  // If no markers, show location list fallback
  if (!markers.length) {
    return (
      <div className={className} style={{ height }}>
        <Card className="border h-full">
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Nenhum resíduo disponível no mapa</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={`border rounded-lg shadow-sm overflow-hidden ${className}`}
      style={{ height }}
    >
      <Suspense fallback={<MapLoadingFallback />}>
        <MapContainer
          center={[-14.0, -54.0]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.coordinates}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-2">{marker.location}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {marker.wastes.length} resíduo{marker.wastes.length > 1 ? 's' : ''} disponível{marker.wastes.length > 1 ? 'eis' : ''}
                  </p>
                  <div className="space-y-1">
                    {marker.wastes.slice(0, 3).map((waste) => (
                      <div key={waste.id} className="text-xs">
                        <strong>{waste.title}</strong><br />
                        {waste.quantity} {waste.unit} - {waste.wasteType}
                      </div>
                    ))}
                    {marker.wastes.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        e mais {marker.wastes.length - 3}...
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Suspense>
    </div>
  );
}