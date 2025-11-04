"use client";

import { useState, useMemo, useEffect } from 'react';
import { Bike, MapPin, Users, Clock, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS } from '../../app/mapa-box/types/VagaCompleta';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface VistaAbasProps {
    vagas: VagaCompleta[];
    vagaSelecionada: VagaCompleta | null;
    onVagaSelect: (vaga: VagaCompleta) => void;
}

type TipoGrafico = 'pizza' | 'linha';

export default function VistaAbas({ vagas, vagaSelecionada, onVagaSelect }: VistaAbasProps) {
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('pizza');

    // Verificar se há vagas
    if (!vagas || vagas.length === 0) {
        return (
            <div className="neumorphic-container">
                <div className="text-center p-8">
                    <Bike size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma vaga encontrada</h3>
                    <p className="text-gray-500 text-sm">
                        Não há vagas disponíveis para exibir gráficos.
                    </p>
                </div>
            </div>
        );
    }

    // Pegar informações do pátio das vagas (assumindo que todas as vagas são do mesmo pátio)
    const patioInfo = vagas[0]?.patio;

    // Estatísticas do pátio atual (das vagas recebidas)
    const estatisticasPatio = useMemo(() => {
        return {
            total: vagas.length,
            livres: vagas.filter(v => v.status === 'L').length,
            ocupados: vagas.filter(v => v.status === 'O').length,
            manutencao: vagas.filter(v => v.status === 'M').length
        };
    }, [vagas]);

    return (
        <div className="space-y-6">
            {/* Header com informações do pátio */}
            {patioInfo && (
                <div className="neumorphic-container">
                    <div className="flex items-center gap-4 mb-4">
                        <MapPin size={24} className="text-blue-500" />
                        <div>
                            <h3 className="text-xl font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                {patioInfo.nomePatio}
                            </h3>
                            {patioInfo.endereco && (
                                <p className="text-sm text-gray-600">
                                    {typeof patioInfo.endereco === 'string'
                                        ? patioInfo.endereco
                                        : `${patioInfo.endereco.cidade || ''}, ${patioInfo.endereco.estado || ''}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Estatísticas do pátio */}
            <div className="neumorphic-container">
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

            {/* Abas de visualização - Apenas Gráficos */}
            <div className="neumorphic-container">
                {/* Controles de tipo de gráfico */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-semibold">Análise Gráfica</h4>
                        <p className="text-sm text-gray-600">Escolha o tipo de gráfico</p>
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

                {/* Gráficos - Atualiza automaticamente quando as vagas mudam */}
                <GraficoOcupacao
                    key={`grafico-${patioInfo?.idPatio || 'default'}-${vagas.length}`}
                    estatisticas={estatisticasPatio}
                    vagas={vagas}
                    tipoGrafico={tipoGrafico}
                />
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
                                key={vaga.idBox || `vaga-${vaga.nomeBox || vaga.nome}`}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                    isSelecionada ? 'bg-blue-50' : ''
                                }`}
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${statusColors.bg}`}></div>
                                        <span className="font-medium">{vaga.nomeBox || vaga.nome || `Box ${vaga.idBox}`}</span>
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
                                            <div className="text-sm text-gray-500">{vaga.veiculo.modelo || vaga.veiculo.fabricante || '-'}</div>
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

    // Gerar dados temporais baseados nas vagas reais do pátio atual
    // ATENÇÃO: Atualiza quando vagas ou estatisticas mudam (mudança de pátio)
    const dadosTemporais = useMemo(() => {
        // Usar dados atuais do pátio como referência
        const agora = new Date();
        const horas: Array<{hora: string; livres: number; ocupados: number; manutencao: number}> = [];
        
        // Calcular estatísticas reais das vagas do pátio atual
        const vagasLivres = estatisticas.livres;
        const vagasOcupadas = estatisticas.ocupados;
        const vagasManutencao = estatisticas.manutencao;
        
        // Gerar pontos para as últimas 24 horas usando dados reais do pátio atual
        // (sem histórico temporal completo, mas usando dados reais atuais)
        for (let i = 23; i >= 0; i--) {
            const hora = new Date(agora.getTime() - (i * 60 * 60 * 1000));
            const horaFormatada = hora.getHours().toString().padStart(2, '0') + ':00';
            
            // Usar dados reais atuais do pátio (sem simulação)
            horas.push({
                hora: horaFormatada,
                livres: vagasLivres,
                ocupados: vagasOcupadas,
                manutencao: vagasManutencao
            });
        }
        
        return horas;
    }, [estatisticas]); // Depende apenas de estatisticas, que já muda quando o pátio muda

    if (tipoGrafico === 'linha') {
        return (
            <div className="space-y-6">
                {/* Gráfico de Linha - Ocupação no Tempo */}
                <div className="neumorphic-container">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">Ocupação ao Longo do Tempo</h4>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            ⚠️ Dados de demonstração
                        </span>
                    </div>
                    <div className="bg-white rounded-lg p-6">
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dadosTemporais} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="hora" 
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        domain={[0, estatisticas.total || 1]}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px',
                                            padding: '10px'
                                        }}
                                        labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="line"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="livres" 
                                        name="Vagas Livres" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#10b981' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="ocupados" 
                                        name="Vagas Ocupadas" 
                                        stroke="#ef4444" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ef4444' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    {estatisticas.manutencao > 0 && (
                                        <Line 
                                            type="monotone" 
                                            dataKey="manutencao" 
                                            name="Manutenção" 
                                            stroke="#f59e0b" 
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#f59e0b' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                <strong>Nota:</strong> Este gráfico mostra dados atuais como referência. Para visualizar histórico completo de ocupação, 
                                é necessário implementar um endpoint de histórico temporal no backend ou usar dados de log de movimentações.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumo Estatístico Temporal - Dados Reais */}
                <div className="neumorphic-container">
                    <h4 className="text-lg font-semibold mb-4">Análise Temporal (Dados Atuais)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">
                                {estatisticas.livres}
                            </div>
                            <div className="text-sm text-gray-600">Vagas Livres (Atual)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">
                                {estatisticas.ocupados}
                            </div>
                            <div className="text-sm text-gray-600">Vagas Ocupadas (Atual)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">
                                {estatisticas.total > 0 ? Math.round((estatisticas.ocupados / estatisticas.total) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-600">Taxa de Ocupação (Atual)</div>
                        </div>
                    </div>
                    {dadosTemporais.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                * Gráfico mostra dados simulados para demonstração. Para dados históricos reais, consulte o histórico de estacionamentos.
                            </p>
                        </div>
                    )}
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

// Componente de Cards
function CardsVagas({ 
    vagas, 
    vagaSelecionada, 
    onVagaSelect 
}: { 
    vagas: VagaCompleta[]; 
    vagaSelecionada: VagaCompleta | null; 
    onVagaSelect: (vaga: VagaCompleta) => void; 
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vagas.map((vaga) => {
                const isSelecionada = vagaSelecionada?.idBox === vaga.idBox;
                const statusColors = STATUS_COLORS[vaga.status];
                
                return (
                    <button
                        key={vaga.idBox || `vaga-${vaga.nomeBox || vaga.nome}`}
                        onClick={() => onVagaSelect(vaga)}
                        className={`neumorphic-container hover:scale-105 transition-all duration-300 p-4 text-left ${
                            isSelecionada ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${statusColors.bg}`}></div>
                                <span className="font-semibold text-gray-800">
                                    {vaga.nomeBox || vaga.nome || `Box ${vaga.idBox}`}
                                </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                                {STATUS_LABELS[vaga.status]}
                            </span>
                        </div>
                        
                        {vaga.veiculo && (
                            <div className="space-y-1 text-sm">
                                <div className="text-gray-700">
                                    <span className="font-medium">Placa:</span> {vaga.veiculo.placa}
                                </div>
                                <div className="text-gray-600">
                                    <span className="font-medium">Modelo:</span> {vaga.veiculo.modelo || '-'}
                                </div>
                                {vaga.veiculo.fabricante && (
                                    <div className="text-gray-600">
                                        <span className="font-medium">Fabricante:</span> {vaga.veiculo.fabricante}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {!vaga.veiculo && (
                            <div className="text-sm text-gray-500 italic">
                                Vaga livre
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

