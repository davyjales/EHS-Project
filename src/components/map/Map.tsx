
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useWaste } from '@/contexts/WasteContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapProps {
  className?: string;
  height?: string;
}

// Coordenadas aproximadas das principais cidades brasileiras
const BRAZIL_CITIES: Record<string, [number, number]> = {
  'São Paulo, SP': [-46.6333, -23.5505],
  'Rio de Janeiro, RJ': [-43.1729, -22.9068],
  'Belo Horizonte, MG': [-43.9378, -19.9208],
  'Salvador, BA': [-38.5014, -12.9714],
  'Brasília, DF': [-47.8825, -15.7942],
  'Fortaleza, CE': [-38.5434, -3.7172],
  'Manaus, AM': [-60.0251, -3.1190],
  'Curitiba, PR': [-49.2731, -25.4284],
  'Recife, PE': [-34.8777, -8.0539],
  'Porto Alegre, RS': [-51.2177, -30.0346],
  'Campinas, SP': [-47.0608, -22.9056],
  'Joinville, SC': [-48.8467, -26.3045],
  'Goiânia, GO': [-49.2643, -16.6869],
  'Belém, PA': [-48.5044, -1.4558],
  'Guarulhos, SP': [-46.5333, -23.4625],
  'São Luís, MA': [-44.3068, -2.5307],
  'Maceió, AL': [-35.7353, -9.6498],
  'Campo Grande, MS': [-54.6464, -20.4697],
  'João Pessoa, PB': [-34.8641, -7.1195],
  'Teresina, PI': [-42.8034, -5.0892],
  'Natal, RN': [-35.2094, -5.7945],
  'Aracaju, SE': [-37.0731, -10.9472],
  'Cuiabá, MT': [-56.0916, -15.6014],
  'Vitória, ES': [-40.3376, -20.3155],
  'Florianópolis, SC': [-48.5482, -27.5969]
};

export function Map({ className = "", height = "400px" }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const { wasteItems } = useWaste();

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-54.0, -14.0], // Centro do Brasil
      zoom: 4
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on('load', () => {
      addWasteMarkers();
    });
  };

  const addWasteMarkers = () => {
    if (!map.current) return;

    // Agrupa os resíduos por localização
    const locationGroups = wasteItems.reduce((groups, waste) => {
      if (!groups[waste.location]) {
        groups[waste.location] = [];
      }
      groups[waste.location].push(waste);
      return groups;
    }, {} as Record<string, typeof wasteItems>);

    // Adiciona marcadores para cada localização
    Object.entries(locationGroups).forEach(([location, wastes]) => {
      const coordinates = BRAZIL_CITIES[location];
      if (!coordinates) return;

      // Cria elemento customizado para o marcador
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: #22c55e;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      `;

      // Cria popup com informações dos resíduos
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-2">${location}</h3>
          <p class="text-xs text-gray-600 mb-2">${wastes.length} resíduo${wastes.length > 1 ? 's' : ''} disponível${wastes.length > 1 ? 'eis' : ''}</p>
          <div class="space-y-1">
            ${wastes.slice(0, 3).map(waste => `
              <div class="text-xs">
                <strong>${waste.title}</strong><br>
                ${waste.quantity} ${waste.unit} - ${waste.wasteType}
              </div>
            `).join('')}
            ${wastes.length > 3 ? `<div class="text-xs text-gray-500">e mais ${wastes.length - 3}...</div>` : ''}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 15 })
        .setHTML(popupContent);

      new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setTimeout(initializeMap, 100);
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <div 
        className={`border rounded-lg shadow-sm overflow-hidden flex items-center justify-center bg-eco-green-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6 max-w-md">
          <MapPin className="mx-auto h-12 w-12 text-eco-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configure o Mapa</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para visualizar o mapa, insira seu token público do Mapbox. 
            Você pode obtê-lo em{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-eco-green-600 hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoiY..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" className="w-full" disabled={!mapboxToken.trim()}>
              Carregar Mapa
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`border rounded-lg shadow-sm overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
