"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { VagaCompleta } from '../../app/mapa-box/types/VagaCompleta';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import 'leaflet/dist/leaflet.css';

interface VistaMapaProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
    patioSelecionado?: number | null;
}

export default function VistaMapa({ patioSelecionado }: VistaMapaProps) {
    const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const [patioAtual, setPatioAtual] = useState<PatioResponseDto | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    // Efeito para buscar os detalhes completos do pátio quando o ID muda
    useEffect(() => {
        if (patioSelecionado) {
            const fetchPatioDetails = async () => {
                setLoadingCoords(true);
                setCoordenadas(null); // Limpa coordenadas antigas
                try {
                    const patioData = await PatioService.getById(patioSelecionado);
                    setPatioAtual(patioData);

                    if (patioData && patioData.endereco) {
                        const { logradouro, numero, bairro, cidade, estado, pais } = patioData.endereco;
                        const addressParts = [logradouro, numero, bairro, cidade, estado, pais];
                        const addressQuery = addressParts.filter(Boolean).join(', ');

                        if (!addressQuery) {
                            throw new Error("Endereço do pátio está incompleto para geocodificação.");
                        }

                        const response = await fetch(`/api/geocode?address=${encodeURIComponent(addressQuery)}`);
                        const data = await response.json();

                        if (data && data.length > 0) {
                            setCoordenadas({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                        } else {
                            console.warn(`Geocodificação não encontrou resultados para: ${addressQuery}`);
                            setCoordenadas({ lat: -23.5505, lng: -46.6333 }); // Fallback
                        }
                    } else {
                         throw new Error("Pátio não possui um endereço associado.");
                    }
                } catch (error) {
                    console.error("Erro ao buscar detalhes ou geocodificar pátio:", error);
                    setCoordenadas({ lat: -23.5505, lng: -46.6333 }); // Fallback em caso de erro
                } finally {
                    setLoadingCoords(false);
                }
            };
            fetchPatioDetails();
        }
    }, [patioSelecionado]);

    // Efeito para inicializar e gerenciar o mapa
    useEffect(() => {
        if (mapRef.current && coordenadas) {
            (async () => {
                const L = (await import('leaflet')).default;

                if (!mapInstanceRef.current) {
                    delete (L.Icon.Default.prototype as any)._getIconUrl;
                    L.Icon.Default.mergeOptions({
                        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    });

                    const map = L.map(mapRef.current!).setView([coordenadas.lat, coordenadas.lng], 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors',
                    }).addTo(map);
                    mapInstanceRef.current = map;
                } else {
                    mapInstanceRef.current.setView([coordenadas.lat, coordenadas.lng], 15);
                }

                mapInstanceRef.current.eachLayer((layer: any) => {
                    if (layer instanceof L.Marker) {
                        layer.remove();
                    }
                });

                if (patioAtual) {
                    const marker = L.marker([coordenadas.lat, coordenadas.lng]).addTo(mapInstanceRef.current);
                    marker.bindPopup(`<b>${patioAtual.nomePatio}</b>`).openPopup();
                }

                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                }, 100);
            })();
        }
    }, [coordenadas, patioAtual]);

    useEffect(() => {
        if (mapRef.current) {
            const resizeObserver = new ResizeObserver(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            });
            resizeObserver.observe(mapRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-zinc-800/30 rounded-lg overflow-hidden" style={{ height: '500px', position: 'relative' }}>
                {loadingCoords && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <p className="text-white">Buscando coordenadas para {patioAtual?.nomePatio || 'pátio selecionado'}...</p>
                    </div>
                )}
                <div ref={mapRef} style={{ height: '100%', width: '100%', backgroundColor: '#333' }} />
                {!coordenadas && !loadingCoords && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Selecione um pátio para ver o mapa.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
