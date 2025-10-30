"use client";

import { useState, useMemo } from 'react';
import { Bike, MapPin, Users, Clock, Info } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS } from '../../app/mapa-box/types/VagaCompleta';

interface VistaGradeProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
}

interface HoverInfo {
    vaga: VagaCompleta;
    x: number;
    y: number;
}

export default function VistaGrade({ vagas, vagaSelecionada, onVagaSelect }: VistaGradeProps) {
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<string>('');

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

    // Filtrar vagas por status se necessário
    const vagasFiltradas = useMemo(() => {
        if (!filtroStatus) return vagasPorPatio;
        
        return vagasPorPatio.map(grupo => ({
            ...grupo,
            vagas: grupo.vagas.filter(vaga => vaga.status === filtroStatus)
        })).filter(grupo => grupo.vagas.length > 0);
    }, [vagasPorPatio, filtroStatus]);

    // Estatísticas rápidas
    const estatisticas = useMemo(() => {
        const total = vagas.length;
        const livres = vagas.filter(v => v.status === 'L').length;
        const ocupados = vagas.filter(v => v.status === 'O').length;
        const manutencao = vagas.filter(v => v.status === 'M').length;
        
        return { total, livres, ocupados, manutencao };
    }, [vagas]);

    const handleMouseEnter = (vaga: VagaCompleta, event: React.MouseEvent) => {
        setHoverInfo({
            vaga,
            x: (event as React.MouseEvent).clientX,
            y: (event as React.MouseEvent).clientY - 12
        });
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        setHoverInfo(prev => prev ? ({ ...prev, x: event.clientX, y: event.clientY - 12 }) : prev);
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    return (
        <div className="space-y-6">
            {/* Controles da vista grade */}
            <div className="neumorphic-container">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Vista em Grade
                        </h3>
                        <p className="text-sm text-gray-600">
                            Visualização em grade das vagas - passe o mouse para ver detalhes
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="neumorphic-select"
                        >
                            <option value="">Todos os status</option>
                            <option value="L">🟢 Apenas Livres</option>
                            <option value="O">🔴 Apenas Ocupadas</option>
                            <option value="M">🟡 Apenas Manutenção</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Bike size={20} className="text-blue-500" />
                        <span className="text-sm text-gray-500 font-medium">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-500">{estatisticas.total}</div>
                </div>
                <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Bike size={20} className="text-green-500" />
                        <span className="text-sm text-gray-500 font-medium">Livres</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">{estatisticas.livres}</div>
                </div>
                <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={20} className="text-red-500" />
                        <span className="text-sm text-gray-500 font-medium">Ocupadas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{estatisticas.ocupados}</div>
                </div>
                <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={20} className="text-orange-500" />
                        <span className="text-sm text-gray-500 font-medium">Manutenção</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">{estatisticas.manutencao}</div>
                </div>
            </div>

            {/* Lista de pátios com suas grades de vagas */}
            <div className="space-y-8">
                {vagasFiltradas.length === 0 ? (
                    <div className="neumorphic-container">
                        <div className="text-center p-8">
                            <Bike size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma vaga encontrada</h3>
                            <p className="text-gray-500 text-sm">
                                Tente ajustar os filtros para encontrar vagas disponíveis.
                            </p>
                        </div>
                    </div>
                ) : (
                    vagasFiltradas.map((grupo) => {
                        // Calcular dimensões da grade (mín 8 colunas para evitar inflar uma única vaga)
                        const totalVagas = grupo.vagas.length;
                        const colunas = Math.min(20, Math.max(8, Math.ceil(Math.sqrt(totalVagas))));

                        return (
                            <div key={grupo.patio.idPatio} className="neumorphic-container">
                                {/* Header do pátio */}
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin size={24} className="text-blue-500" />
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold">{grupo.patio.nomePatio}</h4>
                                        {grupo.patio.endereco && (
                                            <p className="text-sm text-gray-600">
                                                {grupo.patio.endereco.cidade}, {grupo.patio.endereco.estado}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {grupo.vagas.length} vagas
                                    </div>
                                </div>

                                {/* Grade de vagas */}
                                <div 
                                    className="grid gap-1 p-4 bg-gray-50 rounded-lg"
                                    style={{
                                        gridTemplateColumns: `repeat(${colunas}, 1fr)`
                                    }}
                                >
                                    {grupo.vagas.map((vaga, index) => {
                                        const isSelecionada = vagaSelecionada?.idBox === vaga.idBox;
                                        const statusColors = STATUS_COLORS[vaga.status];
                                        
                                        // Gerar chave única que evita duplicatas
                                        const uniqueKey = `${grupo.patio.idPatio}-${vaga.idBox || 'undefined'}-${index}`;
                                        
                                        return (
                                            <button
                                                key={uniqueKey}
                                                onClick={() => onVagaSelect(vaga)}
                                                onMouseEnter={(e) => handleMouseEnter(vaga, e)}
                                                onMouseLeave={handleMouseLeave}
                                                onMouseMove={handleMouseMove}
                                                className={`
                                                    relative w-full aspect-square rounded border-2 transition-all duration-200
                                                    ${statusColors.bg} ${statusColors.border}
                                                    ${isSelecionada 
                                                        ? 'ring-2 ring-white scale-110 shadow-lg' 
                                                        : 'hover:scale-105 hover:shadow-md'
                                                    }
                                                    ${vaga.status === 'L' ? 'cursor-pointer' : 'cursor-default'}
                                                    flex items-center justify-center
                                                `}
                                                title={`${vaga.nome} - ${STATUS_LABELS[vaga.status]}`}
                                            >
                                                {/* Ícone baseado no status */}
                                                <div className="text-white text-lg font-bold">
                                                    {vaga.status === 'L' && 'L'}
                                                    {vaga.status === 'O' && '🚫'}
                                                    {vaga.status === 'M' && '🔧'}
                                                </div>

                                                {/* Indicador de veículo */}
                                                {vaga.veiculo && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                        <Bike size={8} className="text-gray-800" />
                                                    </div>
                                                )}

                                                {/* Indicador de seleção */}
                                                {isSelecionada && (
                                                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legenda */}
                                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-gray-600">Livre</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        <span className="text-gray-600">Ocupado</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                        <span className="text-gray-600">Manutenção</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Tooltip de hover */}
            {hoverInfo && (
                <div 
                    className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm pointer-events-none"
                    style={{
                        left: hoverInfo.x - 150,
                        top: hoverInfo.y - 10,
                        transform: 'translateY(-100%)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                            hoverInfo.vaga.status === 'L' ? 'bg-green-500' :
                            hoverInfo.vaga.status === 'O' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="font-semibold text-gray-800">{hoverInfo.vaga.nome}</span>
                        <span className="text-sm text-gray-500">({STATUS_LABELS[hoverInfo.vaga.status]})</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Pátio:</strong> {hoverInfo.vaga.patio.nomePatio}</p>
                        {hoverInfo.vaga.veiculo && (
                            <>
                                <p><strong>Veículo:</strong> {hoverInfo.vaga.veiculo.placa}</p>
                                <p><strong>Modelo:</strong> {hoverInfo.vaga.veiculo.modelo}</p>
                                <p><strong>Cliente:</strong> {hoverInfo.vaga.veiculo.cliente.nome}</p>
                            </>
                        )}
                        <p><strong>Entrada:</strong> {new Date(hoverInfo.vaga.dataEntrada).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Saída:</strong> {new Date(hoverInfo.vaga.dataSaida).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            )}

            {/* Dicas de uso */}
            <div className="neumorphic-container">
                <div className="flex items-center gap-2 mb-4">
                    <Info size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        Como Usar a Vista em Grade
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-sm">Hover para Detalhes:</strong>
                            <span className="text-xs text-gray-600 block mt-1">
                                Passe o mouse sobre qualquer vaga para ver informações detalhadas.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-sm">Clique para Selecionar:</strong>
                            <span className="text-xs text-gray-600 block mt-1">
                                Clique em uma vaga para ver detalhes completos no modal.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-sm">Cores Intuitivas:</strong>
                            <span className="text-xs text-gray-600 block mt-1">
                                Verde = Livre, Vermelho = Ocupado, Laranja = Manutenção.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-sm">Grade Responsiva:</strong>
                            <span className="text-xs text-gray-600 block mt-1">
                                A grade se adapta automaticamente ao número de vagas.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
