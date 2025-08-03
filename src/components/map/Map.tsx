
import { useEffect, useRef } from 'react';

interface MapProps {
  className?: string;
  height?: string;
}

export function Map({ className = "", height = "400px" }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Aqui seria a integração com API de mapas como MapBox ou Google Maps
    // Por enquanto vamos mostrar só um placeholder

    // Uma implementação futura poderia usar:
    // import mapboxgl from 'mapbox-gl';
    // mapboxgl.accessToken = 'SEU_TOKEN_AQUI';
    // const map = new mapboxgl.Map({
    //   container: mapContainer.current!,
    //   style: 'mapbox://styles/mapbox/streets-v11',
    //   center: [-74.5, 40],
    //   zoom: 9
    // });
    
    // Aqui podemos adicionar markers para locais de coleta, etc.

    // Placeholder para o mapa
    if (mapContainer.current) {
      const placeholderMap = document.createElement('div');
      placeholderMap.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full bg-eco-green-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-eco-green-800 mb-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p class="text-eco-green-800 font-medium">Mapa de Coletas</p>
          <p class="text-eco-green-600 text-sm">Visualize pontos de coleta próximos</p>
        </div>
      `;
      mapContainer.current.appendChild(placeholderMap.firstElementChild!);
    }

    return () => {
      // Cleanup da API de mapas quando implementada
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className={`border rounded-lg shadow-sm overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
