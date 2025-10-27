"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, Bike, Users, Navigation } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS } from '../../app/mapa-box/types/VagaCompleta';
import 'leaflet/dist/leaflet.css';

interface VistaMapaProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
    patioSelecionado?: number | null;
}

export default function VistaMapa({ vagas, vagaSelecionada, onVagaSelect, patioSelecionado }: VistaMapaProps) {
    const [mapaFoco, setMapaFoco] = useState<'todos' | number>('todos');
    const [isMapReady, setIsMapReady] = useState(false);
    const mapRef = useRef(null);
    const Lref = useRef(null);

    // Agrupar vagas por pátio
    const vagasPorPatio = useMemo(() => {
        const agrupadas = vagas.reduce((acc, vaga) => {
            const patioId = vaga.patio.idPatio;
            if (!acc[patioId]) {
                acc[patioId] = {
                    patio: vaga.patio,
                    vagas: []
                };
            }
            acc[patioId].vagas.push(vaga);
            return acc;
        }, {} as Record<number, { patio: VagaCompleta['patio']; vagas: VagaCompleta[] }>);

        return Object.values(agrupadas);
    }, [vagas]);

    // Coordenadas dos pátios para o mapa (com fallback para coordenadas baseadas no endereço)
    const coordenadasPatios = useMemo(() => {
        return vagasPorPatio.map(grupo => {
            // Se tem coordenadas reais, usar elas
            if (grupo.patio.endereco?.latitude && grupo.patio.endereco?.longitude) {
                return {
                    id: grupo.patio.idPatio,
                    nome: grupo.patio.nomePatio,
                    lat: grupo.patio.endereco.latitude,
                    lng: grupo.patio.endereco.longitude,
                    endereco: grupo.patio.endereco,
                    vagas: grupo.vagas,
                    estatisticas: {
                        total: grupo.vagas.length,
                        livres: grupo.vagas.filter(v => v.status === 'L').length,
                        ocupados: grupo.vagas.filter(v => v.status === 'O').length,
                        manutencao: grupo.vagas.filter(v => v.status === 'M').length
                    }
                };
            }
            
            // Fallback: coordenadas baseadas no endereço (São Paulo como centro)
            const endereco = grupo.patio.endereco;
            let lat = -23.5505; // Centro de São Paulo
            let lng = -46.6333;
            
            // Ajustar coordenadas baseado no bairro/cidade
            if (endereco?.cidade?.toLowerCase().includes('guarulhos')) {
                lat = -23.4538;
                lng = -46.5331;
            } else if (endereco?.bairro?.toLowerCase().includes('paulista')) {
                lat = -23.5613;
                lng = -46.6565;
            }
            
            return {
                id: grupo.patio.idPatio,
                nome: grupo.patio.nomePatio,
                lat,
                lng,
                endereco: endereco || {
                    logradouro: 'Endereço não informado',
                    numero: '',
                    bairro: '',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: ''
                },
                vagas: grupo.vagas,
                estatisticas: {
                    total: grupo.vagas.length,
                    livres: grupo.vagas.filter(v => v.status === 'L').length,
                    ocupados: grupo.vagas.filter(v => v.status === 'O').length,
                    manutencao: grupo.vagas.filter(v => v.status === 'M').length
                }
            };
        });
    }, [vagasPorPatio]);

    // Centro do mapa baseado no foco
    const centroMapa = useMemo(() => {
        if (mapaFoco === 'todos' && coordenadasPatios.length > 0) {
            // Calcular centro médio de todos os pátios
            const lat = coordenadasPatios.reduce((sum, p) => sum + p.lat, 0) / coordenadasPatios.length;
            const lng = coordenadasPatios.reduce((sum, p) => sum + p.lng, 0) / coordenadasPatios.length;
            return { lat, lng, zoom: 12 };
        } else if (typeof mapaFoco === 'number') {
            const patio = coordenadasPatios.find(p => p.id === mapaFoco);
            if (patio) {
                return { lat: patio.lat, lng: patio.lng, zoom: 15 };
            }
        }
        
        // Fallback para São Paulo
        return { lat: -23.5505, lng: -46.6333, zoom: 10 };
    }, [mapaFoco, coordenadasPatios]);

    // Inicializar mapa usando a mesma abordagem do MapFIAP
    useEffect(() => {
        (async () => {
            if (coordenadasPatios.length === 0) return;
            
            const L = (await import('leaflet')).default;

            // Corrigir ícones do Leaflet (mesma correção do MapFIAP)
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            if (!Lref.current && mapRef.current) {
                Lref.current = L.map(mapRef.current).setView([centroMapa.lat, centroMapa.lng], centroMapa.zoom);

                // Usar OpenStreetMap (mesma API do MapFIAP)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 20,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
                    subdomains: ['a', 'b', 'c']
                }).addTo(Lref.current);

                // Adicionar marcadores para cada pátio
                coordenadasPatios.forEach(patio => {
                    const marker = L.marker([patio.lat, patio.lng])
                        .addTo(Lref.current);
                    
                    // Popup com informações do pátio
                    const popupContent = `
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${patio.nome}</h3>
                            <p style="margin: 4px 0; color: #666; font-size: 14px;">
                                ${patio.endereco.logradouro}, ${patio.endereco.numero}<br/>
                                ${patio.endereco.bairro}, ${patio.endereco.cidade} - ${patio.endereco.estado}
                            </p>
                            <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
                                <div style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; text-align: center;">
                                    🟢 ${patio.estatisticas.livres} Livres
                                </div>
                                <div style="background: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px; text-align: center;">
                                    🔴 ${patio.estatisticas.ocupados} Ocupadas
                                </div>
                                <div style="background: #fefce8; color: #ca8a04; padding: 4px 8px; border-radius: 4px; text-align: center;">
                                    🟡 ${patio.estatisticas.manutencao} Manutenção
                                </div>
                                <div style="background: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 4px; text-align: center;">
                                    📍 ${patio.estatisticas.total} Total
                                </div>
                            </div>
                        </div>
                    `;
                    
                    marker.bindPopup(popupContent);
                });

                // Invalidar o tamanho do mapa após um pequeno delay
                setTimeout(() => {
                    if (Lref.current) {
                        Lref.current.invalidateSize();
                        setIsMapReady(true);
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
    }, [coordenadasPatios, centroMapa, mapaFoco]);

    // Atualizar centro do mapa quando o foco muda
    useEffect(() => {
        if (Lref.current && centroMapa) {
            Lref.current.setView([centroMapa.lat, centroMapa.lng], centroMapa.zoom);
        }
    }, [centroMapa]);

    // Atualizar foco do mapa quando pátio selecionado mudar
    useEffect(() => {
        if (patioSelecionado && patioSelecionado !== mapaFoco) {
            setMapaFoco(patioSelecionado);
        }
    }, [patioSelecionado, mapaFoco]);

    // Invalidar o mapa quando ele estiver pronto e quando o container mudar de tamanho
    useEffect(() => {
        if (isMapReady && Lref.current && mapRef.current) {
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
    }, [isMapReady]);

    return (
        <div className="space-y-6">
            {/* Controles da vista mapa */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Vista Geográfica</h3>
                    <p className="text-sm text-zinc-400">
                        Visualize a localização dos pátios e suas vagas no mapa
                    </p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={mapaFoco}
                        onChange={(e) => setMapaFoco(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
                        className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="todos">Todos os pátios</option>
                        {vagasPorPatio.map(grupo => (
                            <option key={grupo.patio.idPatio} value={grupo.patio.idPatio}>
                                {grupo.patio.nomePatio}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mapa Leaflet nativo */}
            <div className="bg-zinc-800/30 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {coordenadasPatios.length > 0 ? (
                    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Nenhum pátio com coordenadas disponível</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Para visualizar os pátios no mapa, é necessário que os endereços tenham coordenadas geográficas cadastradas.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de pátios com estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vagasPorPatio.map((grupo) => {
                    const temCoordenadas = grupo.patio.endereco?.latitude && grupo.patio.endereco?.longitude;
                    const estatisticas = {
                        total: grupo.vagas.length,
                        livres: grupo.vagas.filter(v => v.status === 'L').length,
                        ocupados: grupo.vagas.filter(v => v.status === 'O').length,
                        manutencao: grupo.vagas.filter(v => v.status === 'M').length
                    };

                    return (
                        <div key={grupo.patio.idPatio} className="neumorphic-container p-4">
                            {/* Header do pátio */}
                            <div className="flex items-center gap-3 mb-3">
                                <MapPin size={18} className="text-blue-400" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{grupo.patio.nomePatio}</h4>
                                    {grupo.patio.endereco && (
                                        <p className="text-sm text-gray-600">
                                            {grupo.patio.endereco.cidade}, {grupo.patio.endereco.estado}
                                        </p>
                                    )}
                                </div>
                                {temCoordenadas && (
                                    <button
                                        onClick={() => setMapaFoco(grupo.patio.idPatio)}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        title="Focar no mapa"
                                    >
                                        <Navigation size={16} className="text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-green-100 rounded p-2">
                                    <div className="text-green-700 text-xs">Livres</div>
                                    <div className="text-green-800 font-bold">{estatisticas.livres}</div>
                                </div>
                                <div className="bg-red-100 rounded p-2">
                                    <div className="text-red-700 text-xs">Ocupadas</div>
                                    <div className="text-red-800 font-bold">{estatisticas.ocupados}</div>
                                </div>
                                <div className="bg-yellow-100 rounded p-2">
                                    <div className="text-yellow-700 text-xs">Manutenção</div>
                                    <div className="text-yellow-800 font-bold">{estatisticas.manutencao}</div>
                                </div>
                                <div className="bg-blue-100 rounded p-2">
                                    <div className="text-blue-700 text-xs">Total</div>
                                    <div className="text-blue-800 font-bold">{estatisticas.total}</div>
                                </div>
                            </div>

                            {/* Lista de vagas (limitada) */}
                            <div className="space-y-1">
                                <div className="text-xs text-zinc-400 mb-2">Vagas disponíveis:</div>
                                <div className="grid grid-cols-3 gap-1">
                                    {grupo.vagas.slice(0, 6).map((vaga, index) => {
                                        const statusColors = STATUS_COLORS[vaga.status];
                                        return (
                                            <button
                                                key={`${grupo.patio.idPatio}-${vaga.idBox}-${index}`}
                                                onClick={() => onVagaSelect(vaga)}
                                                className={`
                                                    p-2 rounded text-xs font-medium transition-colors
                                                    ${statusColors.bg} ${statusColors.text}
                                                    hover:opacity-80
                                                `}
                                                title={`${vaga.nome} - ${STATUS_LABELS[vaga.status]}`}
                                            >
                                                {vaga.nome}
                                            </button>
                                        );
                                    })}
                                    {grupo.vagas.length > 6 && (
                                        <div className="p-2 rounded bg-zinc-700 text-zinc-400 text-xs text-center">
                                            +{grupo.vagas.length - 6}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Informações sobre coordenadas */}
            {coordenadasPatios.length === 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-300">Coordenadas não disponíveis</span>
                    </div>
                    <p className="text-sm text-yellow-200">
                        Para visualizar os pátios no mapa, é necessário que os endereços tenham coordenadas geográficas cadastradas.
                    </p>
                </div>
            )}
        </div>
    );
}
