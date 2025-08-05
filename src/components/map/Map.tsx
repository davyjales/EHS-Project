import React, { useMemo, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWaste } from '@/contexts/WasteContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Fix Leaflet default markers issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Regiões e estados do Brasil com coordenadas
const BRAZIL_REGIONS = {
  'Norte': {
    states: {
      'Acre': [-9.0238, -70.8120],
      'Amapá': [1.4102, -51.7780],
      'Amazonas': [-3.4168, -65.8561],
      'Pará': [-5.5307, -52.2960],
      'Rondônia': [-11.5057, -63.5806],
      'Roraima': [2.7376, -62.0751],
      'Tocantins': [-10.1753, -48.2982]
    }
  },
  'Nordeste': {
    states: {
      'Alagoas': [-9.5713, -36.7819],
      'Bahia': [-12.5797, -41.7007],
      'Ceará': [-5.4984, -39.3206],
      'Maranhão': [-4.9609, -45.2744],
      'Paraíba': [-7.2399, -36.7819],
      'Pernambuco': [-8.8137, -36.9541],
      'Piauí': [-8.5569, -42.7401],
      'Rio Grande do Norte': [-5.4026, -36.9541],
      'Sergipe': [-10.5741, -37.3857]
    }
  },
  'Centro-Oeste': {
    states: {
      'Distrito Federal': [-15.7801, -47.9292],
      'Goiás': [-15.8270, -49.8362],
      'Mato Grosso': [-12.6819, -56.9211],
      'Mato Grosso do Sul': [-20.7722, -54.7852]
    }
  },
  'Sudeste': {
    states: {
      'Espírito Santo': [-19.1834, -40.3089],
      'Minas Gerais': [-18.5122, -44.5550],
      'Rio de Janeiro': [-22.9068, -43.1729],
      'São Paulo': [-23.5505, -46.6333]
    }
  },
  'Sul': {
    states: {
      'Paraná': [-24.8935, -51.4394],
      'Rio Grande do Sul': [-30.0346, -51.2177],
      'Santa Catarina': [-27.2423, -50.2189]
    }
  }
};

interface MapProps {
  className?: string;
  height?: string;
}

type RegionKey = keyof typeof BRAZIL_REGIONS;



export function Map({ className = "", height = "400px" }: MapProps) {
  const { wasteItems } = useWaste();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  // Create markers data with region info
  const markersData = useMemo(() => {
    const allStates: any[] = [];
    
    Object.entries(BRAZIL_REGIONS).forEach(([regionName, region]) => {
      Object.entries(region.states).forEach(([stateName, coordinates]) => {
        // Simulate some waste data for demonstration
        const wasteCount = Math.floor(Math.random() * 10) + 1;
        allStates.push({
          id: stateName,
          stateName,
          regionName,
          coordinates: coordinates as [number, number],
          wasteCount,
          wastes: Array.from({ length: wasteCount }, (_, i) => ({
            id: `${stateName}-${i}`,
            title: `Resíduo ${i + 1}`,
            quantity: Math.floor(Math.random() * 100) + 10,
            unit: 'kg',
            wasteType: ['Plástico', 'Metal', 'Papel', 'Vidro'][Math.floor(Math.random() * 4)]
          }))
        });
      });
    });
    
    return allStates;
  }, []);

  // Filter markers by selected region
  const filteredMarkers = useMemo(() => {
    if (selectedRegion === 'all') return markersData;
    return markersData.filter(marker => marker.regionName === selectedRegion);
  }, [markersData, selectedRegion]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        center: [-14.0, -54.0],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filtered data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    filteredMarkers.forEach(markerData => {
      try {
        const marker = L.marker(markerData.coordinates)
          .bindPopup(`
            <div class="p-2 min-w-[200px]">
              <h3 class="font-semibold text-sm mb-2">${markerData.stateName}</h3>
              <p class="text-xs text-gray-600 mb-2">Região: ${markerData.regionName}</p>
              <p class="text-xs text-gray-600 mb-2">
                ${markerData.wasteCount} resíduo${markerData.wasteCount > 1 ? 's' : ''} disponível${markerData.wasteCount > 1 ? 'eis' : ''}
              </p>
              <div class="space-y-1">
                ${markerData.wastes.slice(0, 3).map((waste: any) => `
                  <div class="text-xs">
                    <strong>${waste.title}</strong><br />
                    ${waste.quantity} ${waste.unit} - ${waste.wasteType}
                  </div>
                `).join('')}
                ${markerData.wastes.length > 3 ? `
                  <div class="text-xs text-gray-500">
                    e mais ${markerData.wastes.length - 3}...
                  </div>
                ` : ''}
              </div>
            </div>
          `);

        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    });
  }, [filteredMarkers]);

  return (
    <div className={className}>
      {/* Region Filter */}
      <div className="mb-4 flex items-center gap-4">
        <Filter className="h-4 w-4" />
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Regiões</SelectItem>
            {Object.keys(BRAZIL_REGIONS).map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredMarkers.length} estado{filteredMarkers.length !== 1 ? 's' : ''} exibido{filteredMarkers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Map Container */}
      <div 
        className="border rounded-lg shadow-sm overflow-hidden bg-background"
        style={{ height }}
      >
        <div
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
          className="relative"
        />
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredMarkers.length}
            </div>
            <div className="text-xs text-muted-foreground">Estados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredMarkers.reduce((acc, marker) => acc + marker.wasteCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Resíduos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {selectedRegion === 'all' ? Object.keys(BRAZIL_REGIONS).length : 1}
            </div>
            <div className="text-xs text-muted-foreground">Região{selectedRegion === 'all' ? 'ões' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredMarkers.reduce((acc, marker) => acc + marker.wastes.reduce((sum: number, waste: any) => sum + waste.quantity, 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">kg Total</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}