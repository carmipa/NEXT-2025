"use client";

import { useState, useMemo } from 'react';
import { Bike, MapPin, Users, Clock } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS } from '../../app/mapa-box/types/VagaCompleta';

interface VistaPatioProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
}

export default function VistaPatio({ vagas, vagaSelecionada, onVagaSelect }: VistaPatioProps) {
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
        
        return vagasPorPatio.map((grupo: { patio: VagaCompleta['patio']; vagas: VagaCompleta[] }) => ({
            ...grupo,
            vagas: grupo.vagas.filter((vaga: VagaCompleta) => vaga.status === filtroStatus)
        })).filter((grupo: { vagas: VagaCompleta[] }) => grupo.vagas.length > 0);
    }, [vagasPorPatio, filtroStatus]);

    // Estatísticas rápidas
    const estatisticas = useMemo(() => {
        const total = vagas.length;
        const livres = vagas.filter(v => v.status === 'L').length;
        const ocupados = vagas.filter(v => v.status === 'O').length;
        const manutencao = vagas.filter(v => v.status === 'M').length;
        
        return { total, livres, ocupados, manutencao };
    }, [vagas]);

    const handleStatusChange = (status: string) => {
        setFiltroStatus(prev => (prev === status ? '' : status));
    };

    if (vagas.length === 0) {
        return (
            <div className="neumorphic-container text-center py-8">
                <p className="text-gray-600">Nenhuma vaga encontrada para este pátio.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Tente ajustar os filtros para encontrar vagas disponíveis.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Bike size={16} className="text-blue-400" />
                        <span className="text-sm font-medium text-zinc-300">Total</span>
                    </div>
                    <p className="text-xl font-bold text-white">{estatisticas.total}</p>
                </div>
                <div className="bg-green-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={16} className="text-green-400" />
                        <span className="text-sm font-medium text-zinc-300">Livres</span>
                    </div>
                    <p className="text-xl font-bold text-white">{estatisticas.livres}</p>
                </div>
                <div className="bg-red-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-red-400" />
                        <span className="text-sm font-medium text-zinc-300">Ocupadas</span>
                    </div>
                    <p className="text-xl font-bold text-white">{estatisticas.ocupados}</p>
                </div>
                <div className="bg-yellow-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium text-zinc-300">Manutenção</span>
                    </div>
                    <p className="text-xl font-bold text-white">{estatisticas.manutencao}</p>
                </div>
            </div>

            {/* Filtros de Status */}
            <div className="flex flex-wrap gap-2">
                {['L', 'O', 'M'].map(status => (
                    <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                            ${filtroStatus === status ? STATUS_COLORS[status as keyof typeof STATUS_COLORS].bg + ' text-white shadow-md' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}
                        `}
                    >
                        {STATUS_LABELS[status as keyof typeof STATUS_LABELS]} ({vagas.filter(v => v.status === status).length})
                    </button>
                ))}
                <button
                    onClick={() => handleStatusChange('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${filtroStatus === '' ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}
                    `}
                >
                    Todos ({vagas.length})
                </button>
            </div>

            {/* Renderizar pátios e suas vagas */}
            {vagasFiltradas.map(grupo => {
                // Calcular colunas e linhas para a grade
                const numVagas = grupo.vagas.length;
                const colunas = Math.ceil(Math.sqrt(numVagas));
                const linhas = Math.ceil(numVagas / colunas);

                return (
                    <div key={grupo.patio.idPatio} className="neumorphic-container">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white">{grupo.patio.nomePatio}</h4>
                                {grupo.patio.endereco && (
                                    <p className="text-sm text-zinc-400">
                                        {grupo.patio.endereco.cidade}, {grupo.patio.endereco.estado}
                                    </p>
                                )}
                            </div>
                            <div className="text-sm text-zinc-400">
                                {grupo.vagas.length} vagas
                            </div>
                        </div>

                        {/* Grade de vagas */}
                        <div 
                            className="grid gap-2 p-4 bg-zinc-900/50 rounded-lg"
                            style={{
                                gridTemplateColumns: `repeat(${colunas}, 1fr)`,
                                gridTemplateRows: `repeat(${linhas}, 1fr)`,
                                aspectRatio: `${colunas}/${linhas}`
                            }}
                        >
                            {grupo.vagas.map((vaga: VagaCompleta, index: number) => {
                                const isSelecionada = vagaSelecionada?.idBox === vaga.idBox;
                                const statusColors = STATUS_COLORS[vaga.status];
                                
                                return (
                                    <button
                                        key={`${grupo.patio.idPatio}-${vaga.idBox}-${index}`}
                                        onClick={() => onVagaSelect(vaga)}
                                        className={`
                                            relative w-full h-full rounded-lg border-2 transition-all duration-200
                                            ${statusColors.bg} ${statusColors.border}
                                            ${isSelecionada 
                                                ? 'ring-2 ring-white scale-110 shadow-lg' 
                                                : 'hover:scale-105 hover:shadow-md'
                                            }
                                            flex items-center justify-center text-white text-xs font-bold
                                        `}
                                    >
                                        {vaga.nomeBox}
                                        {vaga.veiculo && (
                                            <span className="absolute bottom-1 text-[8px] text-white/80">
                                                {vaga.veiculo.placa}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
