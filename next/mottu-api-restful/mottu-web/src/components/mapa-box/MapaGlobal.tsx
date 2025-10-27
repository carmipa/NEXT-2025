"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Interfaces
interface PatioGlobal {
    id: number; nome: string; endereco: string; cidade: string; estado: string; cep: string; pais: string;
    totalVagas: number; vagasLivres: number; vagasOcupadas: number; vagasManutencao: number;
    percentualOcupacao: number; status: string;
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
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null); // Ref para a camada de marcadores

    // Constantes
    const centroBrasil = { lat: -14.235, lng: -51.9253, zoom: 4 };

    // Função para buscar dados da API
    const fetchPatios = useCallback(async () => {
        setLoading(true);
        setMapError(null);
        console.log('🌐 Buscando pátios da API...');
        try {
            const response = await fetch('/api/mapa-global'); // URL relativa para usar o proxy
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Formato de dados inválido');
            console.log(`✅ Pátios carregados: ${data.length}`);
            setPatios(data);
        } catch (error) {
            console.error('❌ Erro ao buscar pátios:', error);
            setMapError(error instanceof Error ? error.message : 'Erro desconhecido');
            setPatios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito para buscar pátios na montagem do componente
    useEffect(() => {
        fetchPatios();
    }, [fetchPatios]);

    // Memoiza as coordenadas dos pátios
    const coordenadasPatios = useMemo(() => patios.map(patio => {
        const coordenadasPorCidade: { [key: string]: { lat: number; lng: number } } = {
            'Guarulhos': { lat: -23.4538, lng: -46.5331 },
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
        };
        const base = coordenadasPorCidade[patio.cidade] || { lat: -23.55, lng: -46.63 };
        return {
            ...patio,
            lat: base.lat + (Math.random() - 0.5) * 0.01,
            lng: base.lng + (Math.random() - 0.5) * 0.01,
        };
    }), [patios]);

    // Efeito para inicializar o mapa (roda uma vez)
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const initMap = async () => {
                try {
                    console.log('🗺️ Inicializando mapa Leaflet...');
                    const L = await import('leaflet');

                    if ((mapRef.current as any)._leaflet_id) {
                        return;
                    }

                    const map = L.map(mapRef.current!, { scrollWheelZoom: true }).setView([centroBrasil.lat, centroBrasil.lng], centroBrasil.zoom);
                    mapInstanceRef.current = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap',
                    }).addTo(map);

                    markersLayerRef.current = L.layerGroup().addTo(map);

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
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [centroBrasil.lat, centroBrasil.lng, centroBrasil.zoom]);

    // Efeito para atualizar os marcadores
    useEffect(() => {
        if (mapInstanceRef.current && markersLayerRef.current && !loading) {
            const updateMarkers = async () => {
                try {
                    const L = await import('leaflet');
                    console.log('🔄 Atualizando marcadores no mapa...');
                    markersLayerRef.current.clearLayers();

                    coordenadasPatios.forEach(patio => {
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
                        
                        markersLayerRef.current.addLayer(marker);
                    });

                    console.log(`✅ ${coordenadasPatios.length} marcadores atualizados.`);
                } catch (error) {
                    console.error('❌ Erro ao atualizar marcadores:', error);
                    setMapError('Falha ao atualizar os marcadores no mapa.');
                }
            };

            updateMarkers();
        }
    }, [coordenadasPatios, loading, onPatioSelect]);

    // Efeito para centralizar no pátio selecionado
    useEffect(() => {
        if (mapInstanceRef.current && patioSelecionado) {
            const patio = coordenadasPatios.find(p => p.id === patioSelecionado);
            if (patio) {
                mapInstanceRef.current.setView([patio.lat, patio.lng], 12);
            }
        }
    }, [patioSelecionado, coordenadasPatios]);

    // Componente de Overlay para feedback
    const Overlay = () => {
        if (!loading && !mapError && patios.length > 0) {
            return null; // Sem overlay se o mapa deve estar visível
        }

        let content;
        if (loading) {
            content = (
                <div className="text-center text-gray-600">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Carregando dados dos pátios...</p>
                </div>
            );
        } else if (mapError) {
            content = (
                <div className="text-center text-red-800">
                    <h3 className="text-lg font-semibold">⚠️ Erro ao carregar</h3>
                    <p className="text-sm">{mapError}</p>
                    <button onClick={fetchPatios} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Tentar Novamente
                    </button>
                </div>
            );
        } else { // !loading && patios.length === 0
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
            {/* O contêiner do mapa está sempre presente no DOM */}
            <div ref={mapRef} className="w-full h-full bg-gray-200" />
        </div>
    );
}
