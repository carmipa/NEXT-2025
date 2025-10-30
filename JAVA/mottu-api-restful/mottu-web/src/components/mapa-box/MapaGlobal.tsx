"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchWithCache } from '@/cache/cache';
import 'leaflet/dist/leaflet.css';

// Interfaces
interface PatioGlobal {
    id: number; nome: string; endereco: string; cidade: string; estado: string; cep: string; pais: string;
    totalVagas: number; vagasLivres: number; vagasOcupadas: number; vagasManutencao: number;
    percentualOcupacao: number; status: string;
    lat?: number; // Adicionado para geocodificação
    lng?: number; // Adicionado para geocodificação
}

interface MapaGlobalProps {
    onPatioSelect: (patioId: number) => void;
    patioSelecionado: number | null;
}

export default function MapaGlobal({ onPatioSelect, patioSelecionado }: MapaGlobalProps) {
    // Estados
    const [patios, setPatios] = useState<PatioGlobal[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapError, setMapError] = useState<string | null>(null);

    // Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<unknown>(null);
    const markersLayerRef = useRef<unknown>(null); // Ref para a camada de marcadores

    // Constantes
    const centroBrasil = { lat: -14.235, lng: -51.9253, zoom: 4 };

    // Função para buscar dados da API e geocodificar endereços
    const fetchPatiosAndGeocode = useCallback(async () => {
        setLoading(true);
        setMapError(null);
        console.log('🌐 Buscando pátios da API...');
        try {
            const data = await fetchWithCache<PatioGlobal[]>('/api/mapa-global', 'mapas');
            if (!Array.isArray(data)) throw new Error('Formato de dados inválido');
            console.log(`✅ Pátios carregados: ${data.length}`);

            console.log('🌍 Iniciando geocodificação dinâmica dos endereços via proxy...');
            const geocodedPatios = await Promise.all(
                data.map(async (patio: PatioGlobal) => {
                    try {
                        const addressQuery = `${patio.endereco}, ${patio.cidade}, ${patio.estado}, ${patio.pais}`;
                        const geoData = await fetchWithCache<any[]>(`/api/geocode?address=${encodeURIComponent(addressQuery)}`, 'mapas');
                        
                        if (geoData && geoData.length > 0) {
                            const { lat, lon } = geoData[0];
                            console.log(`📍 Geocodificado: ${patio.nome} -> [${lat}, ${lon}]`);
                            return { ...patio, lat: parseFloat(lat), lng: parseFloat(lon) };
                        } else {
                            console.warn(`Nenhum resultado de geocodificação para: ${patio.nome}`);
                            return { ...patio, lat: centroBrasil.lat, lng: centroBrasil.lng }; // Fallback
                        }
                    } catch (geoError) {
                        console.error(`❌ Erro na geocodificação para ${patio.nome}:`, geoError);
                        return { ...patio, lat: centroBrasil.lat, lng: centroBrasil.lng }; // Fallback
                    }
                })
            );
            
            setPatios(geocodedPatios);

        } catch (error) {
            console.error('❌ Erro ao buscar pátios:', error);
            setMapError(error instanceof Error ? error.message : 'Erro desconhecido');
            setPatios([]);
        } finally {
            setLoading(false);
        }
    }, [centroBrasil.lat, centroBrasil.lng]);

    useEffect(() => {
        fetchPatiosAndGeocode();
    }, [fetchPatiosAndGeocode]);

    useEffect(() => {
        let mapContainer: HTMLDivElement | null = null;

        if (mapRef.current && !mapInstanceRef.current) {
            const initMap = async () => {
                try {
                    console.log('🗺️ Inicializando mapa Leaflet...');
                    const L = await import('leaflet');

                    if ((mapRef.current as any)._leaflet_id) return;

                    const map = L.map(mapRef.current!, { scrollWheelZoom: true }).setView([centroBrasil.lat, centroBrasil.lng], centroBrasil.zoom);
                    mapInstanceRef.current = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap',
                    }).addTo(map);

                    markersLayerRef.current = L.layerGroup().addTo(map);
                    
                    // CORREÇÃO: Impede o zoom da página quando o mouse está sobre o mapa
                    mapContainer = mapRef.current;
                    if (mapContainer) {
                        // Bloqueia propagação de eventos para a página
                        L.DomEvent.disableScrollPropagation(mapContainer);
                        L.DomEvent.disableClickPropagation(mapContainer);
                        
                        // Listener adicional para garantir que o zoom da página seja bloqueado
                        const onWheel = (e: WheelEvent) => {
                            // Bloqueia o zoom da página (Ctrl+scroll) mas permite zoom do mapa
                            if (e.ctrlKey) {
                                e.preventDefault();
                            }
                        };
                        mapContainer.addEventListener('wheel', onWheel as EventListener, { passive: false });

                        // Guarda referência para cleanup
                        (mapContainer as any)._wheelHandler = onWheel;
                    }

                    console.log('✅ Mapa base inicializado com sucesso!');
                } catch (error) {
                    console.error('❌ Erro ao inicializar o mapa:', error);
                    setMapError('Falha ao carregar o mapa interativo.');
                }
            };

            initMap();
        }

        return () => {
            if (mapInstanceRef.current) {
                console.log('🧹 Limpando instância do mapa...');
                if (mapContainer) {
                    // Remove listener nativo registrado
                    const wheelHandler = (mapContainer as any)._wheelHandler as EventListener | undefined;
                    if (wheelHandler) mapContainer.removeEventListener('wheel', wheelHandler as EventListener);
                }
                (mapInstanceRef.current as any).remove();
                mapInstanceRef.current = null;
            }
        };
    }, [centroBrasil.lat, centroBrasil.lng, centroBrasil.zoom]);

    useEffect(() => {
        if (mapInstanceRef.current && markersLayerRef.current && !loading) {
            const updateMarkers = async () => {
                try {
                    const L = await import('leaflet');
                    console.log('🔄 Atualizando marcadores no mapa...');
                    (markersLayerRef.current as any).clearLayers();

                    patios.forEach(patio => {
                        if (patio.lat && patio.lng) {
                            const corMarcador = patio.percentualOcupacao > 70 ? '#ef4444' : '#1E40AF';
                            
                            const marker = L.marker([patio.lat, patio.lng], {
                                icon: L.divIcon({
                                    className: 'custom-marker',
                                    html: `<div style="background:${corMarcador};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.5);"></div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })
                            });

                            marker.bindPopup(`<b>${patio.nome}</b><br>${patio.vagasLivres} vagas livres`);
                            marker.on('click', () => onPatioSelect(patio.id));
                            
                            (markersLayerRef.current as any).addLayer(marker);
                        }
                    });

                    console.log(`✅ ${patios.length} marcadores atualizados.`);
                } catch (error) {
                    console.error('❌ Erro ao atualizar marcadores:', error);
                    setMapError('Falha ao atualizar os marcadores no mapa.');
                }
            };

            updateMarkers();
        }
    }, [patios, loading, onPatioSelect]);

    useEffect(() => {
        if (mapInstanceRef.current && patioSelecionado) {
            const patio = patios.find(p => p.id === patioSelecionado);
            if (patio && patio.lat && patio.lng) {
                mapInstanceRef.current.setView([patio.lat, patio.lng], 15);
            }
        }
    }, [patioSelecionado, patios]);

    const Overlay = () => {
        if (!loading && !mapError && patios.length > 0) return null;

        let content;
        if (loading) {
            content = (
                <div className="text-center text-gray-600">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Carregando e geocodificando pátios...</p>
                </div>
            );
        } else if (mapError) {
            content = (
                <div className="text-center text-red-800">
                    <h3 className="text-lg font-semibold">⚠️ Erro ao carregar</h3>
                    <p className="text-sm">{mapError}</p>
                    <button onClick={fetchPatiosAndGeocode} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Tentar Novamente
                    </button>
                </div>
            );
        } else {
            content = (
                <div className="text-center text-gray-600">
                    <h3 className="text-lg font-semibold">🗺️ Nenhum pátio encontrado</h3>
                    <p>Não há pátios cadastrados para exibir no mapa.</p>
                </div>
            );
        }

        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-10">
                {content}
            </div>
        );
    };

    return (
        <div className="relative bg-white rounded-lg overflow-hidden border" style={{ height: '80vh' }}>
            <Overlay />
            <div ref={mapRef} className="w-full h-full bg-gray-200" />
        </div>
    );
}
