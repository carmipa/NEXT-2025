"use client";

import { useState, useMemo } from 'react';
import { Bike, MapPin, Users, Clock, BarChart3, Table, Grid3X3, ChevronLeft, ChevronRight, PieChart, TrendingUp } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS } from '../../app/mapa-box/types/VagaCompleta';
import VistaGrade from './VistaGrade';

interface VistaAbasProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
}

type TipoVisualizacao = 'cards' | 'tabela' | 'grafico';
type TipoGrafico = 'pizza' | 'linha';

export default function VistaAbas({ vagas, vagaSelecionada, onVagaSelect }: VistaAbasProps) {
    const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('grafico');
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('pizza');
    const [patioAtual, setPatioAtual] = useState<number>(0);

    // Debug: Log para verificar se o componente está sendo renderizado
    console.log('VistaAbas renderizada:', { vagas: vagas.length, tipoVisualizacao, patioAtual });

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

    // Pátio atual
    const patioSelecionado = vagasPorPatio[patioAtual];
    const totalPatios = vagasPorPatio.length;

    // Navegação entre pátios
    const handlePatioAnterior = () => {
        setPatioAtual(prev => prev > 0 ? prev - 1 : totalPatios - 1);
    };

    const handlePatioProximo = () => {
        setPatioAtual(prev => prev < totalPatios - 1 ? prev + 1 : 0);
    };

    // Estatísticas do pátio atual
    const estatisticasPatio = useMemo(() => {
        if (!patioSelecionado) return { total: 0, livres: 0, ocupados: 0, manutencao: 0 };
        
        const vagas = patioSelecionado.vagas;
        return {
            total: vagas.length,
            livres: vagas.filter(v => v.status === 'L').length,
            ocupados: vagas.filter(v => v.status === 'O').length,
            manutencao: vagas.filter(v => v.status === 'M').length
        };
    }, [patioSelecionado]);

    if (!patioSelecionado) {
        return (
            <div className="neumorphic-container">
                <div className="text-center p-8">
                    <Bike size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum pátio encontrado</h3>
                    <p className="text-gray-500 text-sm">
                        Não há vagas disponíveis para exibir.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com navegação de pátios */}
            <div className="neumorphic-container">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <MapPin size={24} className="text-blue-500" />
                        <div>
                            <h3 className="text-xl font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                {patioSelecionado.patio.nomePatio}
                            </h3>
                            {patioSelecionado.patio.endereco && (
                                <p className="text-sm text-gray-600">
                                    {patioSelecionado.patio.endereco.cidade}, {patioSelecionado.patio.endereco.estado}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePatioAnterior}
                            className="neumorphic-button p-2"
                            disabled={totalPatios <= 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-600 px-3">
                            {patioAtual + 1} de {totalPatios}
                        </span>
                        <button
                            onClick={handlePatioProximo}
                            className="neumorphic-button p-2"
                            disabled={totalPatios <= 1}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Estatísticas do pátio */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Bike size={20} className="text-blue-500" />
                            <span className="text-sm text-gray-500 font-medium">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-500">{estatisticasPatio.total}</div>
                    </div>
                    <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Bike size={20} className="text-green-500" />
                            <span className="text-sm text-gray-500 font-medium">Livres</span>
                        </div>
                        <div className="text-2xl font-bold text-green-500">{estatisticasPatio.livres}</div>
                    </div>
                    <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={20} className="text-red-500" />
                            <span className="text-sm text-gray-500 font-medium">Ocupadas</span>
                        </div>
                        <div className="text-2xl font-bold text-red-500">{estatisticasPatio.ocupados}</div>
                    </div>
                    <div className="neumorphic-container hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={20} className="text-yellow-500" />
                            <span className="text-sm text-gray-500 font-medium">Manutenção</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-500">{estatisticasPatio.manutencao}</div>
                    </div>
                </div>
            </div>

            {/* Abas de visualização */}
            <div className="neumorphic-container">
                {/* Título da seção de gráficos */}
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 size={24} className="text-blue-500" />
                    <div>
                        <h4 className="text-lg font-semibold">Análise Gráfica</h4>
                        <p className="text-sm text-gray-600">Visualização em gráficos das estatísticas do pátio</p>
                    </div>
                </div>

                {/* Controles de tipo de gráfico */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-semibold">Análise Gráfica</h4>
                        <p className="text-sm text-gray-600">Escolha o tipo de visualização</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTipoGrafico('pizza')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                tipoGrafico === 'pizza'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <PieChart size={16} />
                            <span>Pizza</span>
                        </button>
                        <button
                            onClick={() => setTipoGrafico('linha')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                tipoGrafico === 'linha'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <TrendingUp size={16} />
                            <span>Linha</span>
                        </button>
                    </div>
                </div>

                {/* Gráficos */}
                <div>
                    <GraficoOcupacao
                        estatisticas={estatisticasPatio}
                        vagas={patioSelecionado.vagas}
                        tipoGrafico={tipoGrafico}
                    />
                </div>
            </div>
        </div>
    );
}

// Componente de Tabela
function TabelaVagas({ 
    vagas, 
    vagaSelecionada, 
    onVagaSelect 
}: { 
    vagas: VagaCompleta[]; 
    vagaSelecionada: VagaCompleta | null; 
    onVagaSelect: (vaga: VagaCompleta) => void; 
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Vaga</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Veículo</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Entrada</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Saída</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {vagas.map((vaga) => {
                        const isSelecionada = vagaSelecionada?.idBox === vaga.idBox;
                        const statusColors = STATUS_COLORS[vaga.status];
                        
                        return (
                            <tr 
                                key={vaga.idBox || `vaga-${index}`}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                    isSelecionada ? 'bg-blue-50' : ''
                                }`}
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${statusColors.bg}`}></div>
                                        <span className="font-medium">{vaga.nome}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                        {STATUS_LABELS[vaga.status]}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {vaga.veiculo ? (
                                        <div>
                                            <div className="font-medium">{vaga.veiculo.placa}</div>
                                            <div className="text-sm text-gray-500">{vaga.veiculo.modelo}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {vaga.veiculo ? (
                                        <div>
                                            <div className="font-medium">{vaga.veiculo.cliente.nome}</div>
                                            <div className="text-sm text-gray-500">{vaga.veiculo.cliente.telefone}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(vaga.dataEntrada).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                    {new Date(vaga.dataSaida).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => onVagaSelect(vaga)}
                                        className="neumorphic-button text-xs px-3 py-1"
                                    >
                                        Ver Detalhes
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// Componente de Gráfico
function GraficoOcupacao({ 
    estatisticas, 
    vagas,
    tipoGrafico = 'pizza'
}: { 
    estatisticas: { total: number; livres: number; ocupados: number; manutencao: number };
    vagas: VagaCompleta[];
    tipoGrafico?: 'pizza' | 'linha';
}) {
    const porcentagemLivres = estatisticas.total > 0 ? (estatisticas.livres / estatisticas.total) * 100 : 0;
    const porcentagemOcupados = estatisticas.total > 0 ? (estatisticas.ocupados / estatisticas.total) * 100 : 0;
    const porcentagemManutencao = estatisticas.total > 0 ? (estatisticas.manutencao / estatisticas.total) * 100 : 0;

    // Gerar dados simulados para o gráfico de linha (ocupação ao longo do tempo)
    const dadosTemporais = useMemo(() => {
        const horas = [];
        const agora = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const hora = new Date(agora.getTime() - (i * 60 * 60 * 1000));
            const horaFormatada = hora.getHours().toString().padStart(2, '0') + ':00';
            
            // Simular variação de ocupação ao longo do dia
            const baseOcupacao = 0.3 + (Math.sin((hora.getHours() - 6) * Math.PI / 12) * 0.4);
            const ocupados = Math.round(estatisticas.total * baseOcupacao);
            const livres = estatisticas.total - ocupados - estatisticas.manutencao;
            
            horas.push({
                hora: horaFormatada,
                livres: Math.max(0, livres),
                ocupados: Math.max(0, ocupados),
                manutencao: estatisticas.manutencao
            });
        }
        
        return horas;
    }, [estatisticas]);

    if (tipoGrafico === 'linha') {
        return (
            <div className="space-y-6">
                {/* Gráfico de Linha - Ocupação no Tempo */}
                <div className="neumorphic-container">
                    <h4 className="text-lg font-semibold mb-4">Ocupação ao Longo do Tempo (Últimas 24h)</h4>
                    <div className="bg-white rounded-lg p-6">
                        <div className="h-80 w-full">
                            <svg viewBox="0 0 800 300" className="w-full h-full">
                                {/* Eixos */}
                                <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                                <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="2"/>
                                
                                {/* Grid horizontal */}
                                {[0, 25, 50, 75, 100].map((percent, i) => (
                                    <g key={i}>
                                        <line 
                                            x1="50" 
                                            y1={250 - (percent * 2)} 
                                            x2="750" 
                                            y2={250 - (percent * 2)} 
                                            stroke="#f3f4f6" 
                                            strokeWidth="1"
                                        />
                                        <text x="40" y={255 - (percent * 2)} textAnchor="end" className="text-xs fill-gray-500">
                                            {percent}%
                                        </text>
                                    </g>
                                ))}
                                
                                {/* Linha de vagas livres */}
                                <polyline
                                    points={dadosTemporais.map((dado, i) => {
                                        const x = 50 + (i * 700 / 23);
                                        const y = 250 - (dado.livres / estatisticas.total * 200);
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                />
                                
                                {/* Linha de vagas ocupadas */}
                                <polyline
                                    points={dadosTemporais.map((dado, i) => {
                                        const x = 50 + (i * 700 / 23);
                                        const y = 250 - (dado.ocupados / estatisticas.total * 200);
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                />
                                
                                {/* Pontos de dados */}
                                {dadosTemporais.map((dado, i) => {
                                    const x = 50 + (i * 700 / 23);
                                    const yLivres = 250 - (dado.livres / estatisticas.total * 200);
                                    const yOcupados = 250 - (dado.ocupados / estatisticas.total * 200);
                                    
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={yLivres} r="4" fill="#10b981"/>
                                            <circle cx={x} cy={yOcupados} r="4" fill="#ef4444"/>
                                        </g>
                                    );
                                })}
                                
                                {/* Labels do eixo X */}
                                {dadosTemporais.filter((_, i) => i % 4 === 0).map((dado, i) => {
                                    const x = 50 + (i * 4 * 700 / 23);
                                    return (
                                        <text key={i} x={x} y="270" textAnchor="middle" className="text-xs fill-gray-500">
                                            {dado.hora}
                                        </text>
                                    );
                                })}
                            </svg>
                        </div>
                        
                        {/* Legenda */}
                        <div className="flex justify-center mt-4 space-x-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Vagas Livres</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Vagas Ocupadas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumo Estatístico Temporal */}
                <div className="neumorphic-container">
                    <h4 className="text-lg font-semibold mb-4">Análise Temporal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">
                                {Math.round(dadosTemporais.reduce((acc, d) => acc + d.livres, 0) / dadosTemporais.length)}
                            </div>
                            <div className="text-sm text-gray-600">Média de Vagas Livres</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">
                                {Math.round(dadosTemporais.reduce((acc, d) => acc + d.ocupados, 0) / dadosTemporais.length)}
                            </div>
                            <div className="text-sm text-gray-600">Média de Vagas Ocupadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">
                                {Math.round((dadosTemporais.reduce((acc, d) => acc + d.ocupados, 0) / dadosTemporais.length) / estatisticas.total * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Taxa Média de Ocupação</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Gráfico de Barras */}
            <div className="neumorphic-container">
                <h4 className="text-lg font-semibold mb-4">Distribuição de Ocupação</h4>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Livres</span>
                            <span className="text-sm text-gray-600">{estatisticas.livres} ({porcentagemLivres.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${porcentagemLivres}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Ocupadas</span>
                            <span className="text-sm text-gray-600">{estatisticas.ocupados} ({porcentagemOcupados.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className="bg-red-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${porcentagemOcupados}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Manutenção</span>
                            <span className="text-sm text-gray-600">{estatisticas.manutencao} ({porcentagemManutencao.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className="bg-yellow-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${porcentagemManutencao}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="neumorphic-container">
                <h4 className="text-lg font-semibold mb-4">Status das Vagas</h4>
                <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Fundo do círculo */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                            />
                            
                            {/* Segmento Livres */}
                            {porcentagemLivres > 0 && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="8"
                                    strokeDasharray={`${(porcentagemLivres / 100) * 251.2} 251.2`}
                                    strokeDashoffset="0"
                                />
                            )}
                            
                            {/* Segmento Ocupados */}
                            {porcentagemOcupados > 0 && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="8"
                                    strokeDasharray={`${(porcentagemOcupados / 100) * 251.2} 251.2`}
                                    strokeDashoffset={`-${(porcentagemLivres / 100) * 251.2}`}
                                />
                            )}
                            
                            {/* Segmento Manutenção */}
                            {porcentagemManutencao > 0 && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="8"
                                    strokeDasharray={`${(porcentagemManutencao / 100) * 251.2} 251.2`}
                                    strokeDashoffset={`-${((porcentagemLivres + porcentagemOcupados) / 100) * 251.2}`}
                                />
                            )}
                        </svg>
                        
                        {/* Texto central */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-700">{estatisticas.total}</div>
                                <div className="text-sm text-gray-500">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Legenda */}
                <div className="flex justify-center mt-4 space-x-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Livres ({porcentagemLivres.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Ocupadas ({porcentagemOcupados.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Manutenção ({porcentagemManutencao.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>

            {/* Resumo Estatístico */}
            <div className="neumorphic-container">
                <h4 className="text-lg font-semibold mb-4">Resumo Estatístico</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{porcentagemLivres.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Taxa de Disponibilidade</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{porcentagemOcupados.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Taxa de Ocupação</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">{porcentagemManutencao.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Taxa de Manutenção</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
