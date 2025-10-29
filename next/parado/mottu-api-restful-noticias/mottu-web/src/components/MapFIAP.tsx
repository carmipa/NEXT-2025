'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapFIAP({ className = 'pcw-map' }) {
  const mapRef = useRef(null);
  const Lref = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // FIAP Paulista — coordenadas exatas
  const FIAP = { lat: -23.56405004412361, lng: -46.65239386642615 };

  useEffect(() => {
    (async () => {
      const L = (await import('leaflet')).default;

      // Corrigir ícones do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!Lref.current && mapRef.current) {
        Lref.current = L.map(mapRef.current).setView([FIAP.lat, FIAP.lng], 16);

        // Usar OpenStreetMap que é 100% gratuito e sempre funciona
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c']
        }).addTo(Lref.current);

        L.marker([FIAP.lat, FIAP.lng])
          .addTo(Lref.current)
          .bindPopup(`<b>FIAP — Paulista</b><br/>Av. Paulista, 1106<br/>(${FIAP.lat.toFixed(7)}, ${FIAP.lng.toFixed(7)})`)
          .openPopup();

        // Invalidar o tamanho do mapa após um pequeno delay para garantir que o container esteja renderizado
        setTimeout(() => {
          if (Lref.current) {
            Lref.current.invalidateSize();
            setMapReady(true);
          }
        }, 100);
      }
    })();

    return () => {
      if (Lref.current) {
        Lref.current.remove();
        Lref.current = null;
      }
    };
  }, []);

  // Invalidar o mapa quando ele estiver pronto e quando o container mudar de tamanho
  useEffect(() => {
    if (mapReady && Lref.current && mapRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (Lref.current) {
          setTimeout(() => {
            Lref.current.invalidateSize();
          }, 50);
        }
      });
      
      resizeObserver.observe(mapRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [mapReady]);

  return (
    <div className="relative h-full flex flex-col">
      <div ref={mapRef} className={`${className} flex-1`} />
      <div className="pcw-map-footer">
        Coordenadas: <strong>{FIAP.lat.toFixed(7)}, {FIAP.lng.toFixed(7)}</strong>
      </div>
    </div>
  );
}
