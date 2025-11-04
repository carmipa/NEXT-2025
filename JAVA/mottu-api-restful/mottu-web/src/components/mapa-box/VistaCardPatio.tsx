"use client";

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';
import { VagaCompleta } from '../../app/mapa-box/types/VagaCompleta';

interface VistaCardPatioProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
    veiculosEmManutencao?: number;
    placasVeiculosEmManutencao?: Set<string>;
}

interface StatusBox {
    ocupacao: number;
    status: 'growing' | 'decreasing' | 'stable';
    corTrend: 'text-red-500' | 'text-green-500' | 'text-blue-500';
    corBar: 'bg-red-500' | 'bg-yellow-500' | 'bg-blue-500';
    corTexto: 'Crescendo' | 'Diminuindo' | 'Estável';
}

// Array de cores para os headers dos cards (cores dinâmicas)
const CORES_HEADER = [
    'from-blue-500 via-blue-600 to-blue-700',
    'from-green-500 via-green-600 to-green-700',
    'from-purple-500 via-purple-600 to-purple-700',
    'from-orange-500 via-orange-600 to-orange-700',
    'from-cyan-500 via-cyan-600 to-cyan-700',
    'from-pink-500 via-pink-600 to-pink-700',
    'from-indigo-500 via-indigo-600 to-indigo-700',
    'from-emerald-500 via-emerald-600 to-emerald-700',
    'from-rose-500 via-rose-600 to-rose-700',
    'from-violet-500 via-violet-600 to-violet-700',
];

function calcularStatus(ocupacaoAtual: number, ocupacaoAnterior: number = 0): StatusBox {
    const diferenca = ocupacaoAtual - ocupacaoAnterior;
    
    if (diferenca > 5) {
        return {
            ocupacao: ocupacaoAtual,
            status: 'growing',
            corTrend: 'text-red-500',
            corBar: 'bg-red-500',
            corTexto: 'Crescendo'
        };
    } else if (diferenca < -5) {
        return {
            ocupacao: ocupacaoAtual,
            status: 'decreasing',
            corTrend: 'text-green-500',
            corBar: 'bg-yellow-500',
            corTexto: 'Diminuindo'
        };
    } else {
        return {
            ocupacao: ocupacaoAtual,
            status: 'stable',
            corTrend: 'text-blue-500',
            corBar: 'bg-blue-500',
            corTexto: 'Estável'
        };
    }
}

function getStatusIcon(status: 'growing' | 'decreasing' | 'stable') {
    switch (status) {
        case 'growing':
            return <TrendingUp size={20} className="text-red-500" />;
        case 'decreasing':
            return <TrendingDown size={20} className="text-green-500" />;
        case 'stable':
            return <Minus size={20} className="text-blue-500" />;
    }
}

export default function VistaCardPatio({ vagas, vagaSelecionada, onVagaSelect, itemsPerPage = 20, currentPage = 1, veiculosEmManutencao = 0, placasVeiculosEmManutencao = new Set() }: VistaCardPatioProps & { itemsPerPage?: number; currentPage?: number }) {
    
    // Agrupar vagas por pátio e calcular estatísticas
    const patiosComStatus = useMemo(() => {
        if (vagas.length === 0) return [];
        
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

        return Object.values(agrupadas).map(grupo => {
            const totalVagas = grupo.vagas.length;
            const ocupadas = grupo.vagas.filter(v => v.status === 'O').length;
            const ocupacaoPorcentagem = Math.round((ocupadas / totalVagas) * 100);
            
            // Simular ocupação anterior para calcular tendência
            const ocupacaoAnterior = ocupacaoPorcentagem + Math.floor(Math.random() * 20) - 10;
            
            return {
                ...grupo,
                ocupacao: ocupacaoPorcentagem,
                ocupadas,
                livres: grupo.vagas.filter(v => v.status === 'L').length,
                manutencao: grupo.vagas.filter(v => v.status === 'M').length,
                statusInfo: calcularStatus(ocupacaoPorcentagem, ocupacaoAnterior),
                // Calcular média e máxima (simulado)
                media: Math.round(ocupacaoPorcentagem * 0.8),
                maxima: Math.min(100, Math.round(ocupacaoPorcentagem * 1.1))
            };
        });
    }, [vagas]);

    if (vagas.length === 0) {
        return (
            <div className="neumorphic-container text-center py-8">
                <p className="text-gray-600">Nenhuma vaga encontrada para este pátio.</p>
            </div>
        );
    }

    // Calcular paginação
    const totalPages = Math.ceil(patiosComStatus.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const patiosPaginados = patiosComStatus.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {patiosPaginados.map((patioInfo, index) => {
                const { patio, vagas: vagasPatio, ocupacao, ocupadas, livres, manutencao, statusInfo, media, maxima } = patioInfo;
                // Mostrar mais boxes visíveis (12 em vez de 10) para compensar o tamanho maior
                const boxesVisiveis = vagasPatio.slice(0, 12);
                const boxesRestantes = vagasPatio.length - boxesVisiveis.length;
                
                // Cor dinâmica baseada no ID do pátio (não no índice da paginação)
                // Isso garante que cada pátio sempre terá a mesma cor, independente da página
                const corHeader = CORES_HEADER[patio.idPatio % CORES_HEADER.length];

                return (
                    <div
                        key={patio.idPatio}
                        className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] border border-gray-200 min-h-[450px] sm:min-h-[500px]"
                    >
                        {/* Informações do Topo (antes do header) */}
                        {patio.endereco && (
                            <div className="px-5 pt-4 pb-3 bg-gray-50">
                                <p className="text-xs text-gray-600 font-medium mb-1">{patio.nomePatio}</p>
                                <p className="text-xs text-gray-500">
                                    {typeof patio.endereco === 'string' 
                                        ? patio.endereco
                                        : (patio.endereco.cidade && patio.endereco.estado
                                            ? `${patio.endereco.cidade}, ${patio.endereco.estado}`
                                            : patio.endereco.cidade || patio.endereco.estado || 'Endereço não informado')}
                                </p>
                            </div>
                        )}
                        
                        {/* Header do Card com Cor Dinâmica */}
                        <div className={`bg-gradient-to-r ${corHeader} p-4 sm:p-5`}>
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-sm break-words">{patio.nomePatio}</h3>
                            </div>
                            
                            {/* Indicador de Tendência */}
                            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm w-fit">
                                {getStatusIcon(statusInfo.status)}
                                <span className="font-bold text-white drop-shadow-sm text-xs sm:text-sm">
                                    {statusInfo.corTexto}
                                </span>
                            </div>
                        </div>

                        {/* Corpo do Card */}
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {/* Ocupação Atual */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Ocupação Atual</span>
                                    <span className="text-base sm:text-lg font-bold text-gray-800">{ocupacao}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`${statusInfo.corBar} h-2.5 rounded-full transition-all duration-500`}
                                        style={{ width: `${ocupacao}%`, minWidth: ocupacao === 0 ? '0px' : '4px' }}
                                    />
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 sm:p-3 rounded-lg border border-blue-300">
                                    <p className="text-xs text-blue-700 font-medium">Média</p>
                                    <p className="text-xl sm:text-2xl font-bold text-blue-800">{media}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-2 sm:p-3 rounded-lg border border-purple-300">
                                    <p className="text-xs text-purple-700 font-medium">Máxima</p>
                                    <p className="text-xl sm:text-2xl font-bold text-purple-800">{maxima}%</p>
                                </div>
                            </div>

                            {/* Status dos Boxes */}
                            <div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Status dos Boxes</p>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 mb-2">
                                    {boxesVisiveis.map((vaga, index) => {
                                        // Verificar se o veículo está em manutenção (mesma lógica da VistaGrade)
                                        // Comparar placas de forma case-insensitive e sem espaços
                                        const placaNormalizada = vaga.veiculo?.placa?.toUpperCase().trim().replace(/\s+/g, '') || '';
                                        const veiculoEmManutencao = vaga.veiculo && placasVeiculosEmManutencao.size > 0 && 
                                            Array.from(placasVeiculosEmManutencao).some(placa => 
                                                placa.toUpperCase().trim().replace(/\s+/g, '') === placaNormalizada
                                            );
                                        const statusEfetivo: 'L' | 'O' | 'M' = veiculoEmManutencao ? 'M' : vaga.status;
                                        
                                        // Determinar cor baseada no status efetivo: 'O' = ocupado (vermelho), 'L' = livre (verde), 'M' = manutenção (amarelo)
                                        const corBox = 
                                            statusEfetivo === 'O' ? 'bg-red-500 hover:bg-red-600' :
                                            statusEfetivo === 'L' ? 'bg-green-500 hover:bg-green-600' :
                                            'bg-yellow-500 hover:bg-yellow-600';
                                        
                                        // Debug: log para verificar status
                                        if (index === 0) {
                                            console.log('🎨 VistaCardPatio - Primeira vaga:', {
                                                idBox: vaga.idBox,
                                                nomeBox: vaga.nomeBox,
                                                statusOriginal: vaga.status,
                                                statusEfetivo: statusEfetivo,
                                                veiculoEmManutencao: veiculoEmManutencao,
                                                placa: vaga.veiculo?.placa,
                                                corAplicada: corBox
                                            });
                                        }
                                        
                                        return (
                                            <button
                                                key={`${patio.idPatio}-${vaga.idBox}-${index}`}
                                                onClick={() => onVagaSelect(vaga)}
                                                className={`${corBox} text-white text-xs sm:text-sm font-bold rounded-md sm:rounded-lg p-2.5 sm:p-3 min-h-[48px] sm:min-h-[56px] flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${vagaSelecionada?.idBox === vaga.idBox ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : ''}`}
                                                title={`Box ${vaga.nomeBox || index + 1} - ${statusEfetivo === 'L' ? 'Livre' : statusEfetivo === 'O' ? 'Ocupado' : 'Manutenção'}${veiculoEmManutencao ? ' (Veículo em manutenção)' : ''}${vaga.veiculo ? ` - ${vaga.veiculo.placa}` : ''}`}
                                            >
                                                <span className="truncate max-w-full">{vaga.nomeBox || index + 1}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                                                 {boxesRestantes > 0 && (
                                    <div className="flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-2 border border-gray-300">
                                        <span className="text-sm font-bold text-gray-700">+{boxesRestantes} boxes</span>
                                    </div>
                                )}
                            </div>

                            {/* Informações Adicionais - Footer */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t-2 border-gray-100">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {typeof patio.endereco === 'string'
                                        ? patio.endereco
                                        : (patio.endereco?.cidade || 'N/A')}
                                </span>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>

            {/* Informação de paginação */}
            {totalPages > 1 && (
                <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, patiosComStatus.length)} de {patiosComStatus.length} pátios
                </div>
            )}
        </div>
    );
}
