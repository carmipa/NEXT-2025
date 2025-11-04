"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { buildApiUrl } from '@/config/api';
import { Search, MapPin, Users, Filter, RefreshCw, Grid3X3, Layout, Globe, Eye } from 'lucide-react';
import { VeiculoService } from '@/utils/api';
import MapaVagasDinamico from '@/components/mapa-box/MapaVagasDinamico';
import EstatisticasVagas from '@/components/mapa-box/EstatisticasVagas';
import VistaCardPatio from '@/components/mapa-box/VistaCardPatio';
import MapaGlobal from '@/components/mapa-box/MapaGlobal';

// Wrapper para VistaCardPatio com controle de paginação
function VistaCardPatioWrapper({ vagas, paginaAtual, onPageChange }: { 
    vagas: VagaCompleta[]; 
    paginaAtual: number; 
    onPageChange: (page: number) => void;
}) {
    const [localPage, setLocalPage] = React.useState(paginaAtual);

    const handlePageChange = (newPage: number) => {
        setLocalPage(newPage);
        onPageChange(newPage);
    };

    const handlePrevPage = () => {
        if (localPage > 1) {
            handlePageChange(localPage - 1);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(vagas.length / 20);
        if (localPage < totalPages) {
            handlePageChange(localPage + 1);
        }
    };

    return (
        <div>
            <VistaCardPatio 
                vagas={vagas}
                vagaSelecionada={null}
                onVagaSelect={() => {}}
                currentPage={localPage}
                itemsPerPage={20}
                placasVeiculosEmManutencao={placasVeiculosEmManutencao}
                veiculosEmManutencao={veiculosEmManutencao}
            />
            {/* Controles de paginação externos */}
            {(() => {
                const totalPages = Math.ceil(vagas.length / 20);
                if (totalPages <= 1) return null;
                
                return (
                    <div className="mt-6">
                        {/* Paginação para mobile */}
                        <div className="flex flex-col sm:hidden items-center gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={localPage === 1}
                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    ‹ Anterior
                                </button>
                                
                                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                                    {localPage} / {totalPages}
                                </span>
                                
                                <button
                                    onClick={handleNextPage}
                                    disabled={localPage === totalPages}
                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    Próximo ›
                                </button>
                            </div>
                        </div>

                        {/* Paginação para desktop */}
                        <div className="hidden sm:flex items-center justify-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={localPage === 1}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>
                            
                            <div className="flex items-center gap-1 flex-wrap justify-center max-w-md">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 7) {
                                        pageNum = i + 1;
                                    } else if (localPage <= 4) {
                                        pageNum = i + 1;
                                    } else if (localPage >= totalPages - 3) {
                                        pageNum = totalPages - 7 + i;
                                    } else {
                                        pageNum = localPage - 3 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 rounded text-sm transition-all ${
                                                localPage === pageNum
                                                    ? 'bg-blue-600 text-white font-bold'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={handleNextPage}
                                disabled={localPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
import { VagaCompleta } from './types/VagaCompleta';
import ParticleBackground from '@/components/particula/ParticleBackground';
import { fetchMapas, invalidateCache } from '@/utils/cache';
import '@/types/styles/neumorphic.css';

export default function MapaBoxPage() {
    const [vagas, setVagas] = useState<VagaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtros, setFiltros] = useState({
        tipoFiltro: 'patio',
        valorFiltro: ''
    });
    const [visualizacao, setVisualizacao] = useState<'patio' | 'mapa' | 'grade' | 'abas' | 'global'>('patio');
    const [patioSelecionado, setPatioSelecionado] = useState<number | null>(null);
    const [visualizacaoLista, setVisualizacaoLista] = useState<'cards' | 'lista'>('cards');
    const [paginaAtualCards, setPaginaAtualCards] = useState(1);
    const [pesquisaPatio, setPesquisaPatio] = useState('');
    const [modoPesquisa, setModoPesquisa] = useState(false);
    const [paginaAtualPatios, setPaginaAtualPatios] = useState(1);
    const itemsPorPaginaPatios = 20;

    const [sseActive, setSseActive] = useState(false);
    const [veiculosEmManutencao, setVeiculosEmManutencao] = useState(0);
    const [placasVeiculosEmManutencao, setPlacasVeiculosEmManutencao] = useState<Set<string>>(new Set());

    const fetchVeiculosEmManutencao = async () => {
        try {
            // Buscar veículos com status EM_MANUTENCAO
            const response = await VeiculoService.listarPaginadoFiltrado(
                { status: 'EM_MANUTENCAO' },
                0,
                1000 // Buscar muitos para pegar todos
            );
            setVeiculosEmManutencao(response.totalElements || 0);
            // Armazenar as placas dos veículos em manutenção (normalizadas: maiúsculas e sem espaços)
            const placas = new Set(
                response.content
                    .map(v => v.placa?.toUpperCase().trim().replace(/\s+/g, ''))
                    .filter(placa => placa) // Filtrar placas vazias ou undefined
            );
            console.log('🔧 Veículos em manutenção encontrados:', response.totalElements, 'Placas:', Array.from(placas));
            setPlacasVeiculosEmManutencao(placas);
        } catch (err) {
            console.error('Erro ao buscar veículos em manutenção:', err);
            setVeiculosEmManutencao(0);
            setPlacasVeiculosEmManutencao(new Set());
        }
    };

    const fetchVagas = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);
            
            if (forceRefresh) {
                // Limpar cache e buscar dados frescos
                invalidateCache('mapas');
            }
            
            // Usar sistema de cache para vagas/mapa (TTL: 1 minuto)
            const data = await fetchMapas<VagaCompleta[]>('/api/vagas');
            setVagas(data);
            
            // Buscar veículos em manutenção em paralelo
            fetchVeiculosEmManutencao();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVagas();
        // SSE: ouvir movimentações e invalidar cache com debouncing
        let es: EventSource | null = null;
        const lastUpdateRef = { current: 0 } as any as React.MutableRefObject<number>;
        lastUpdateRef.current = 0;
        try {
            es = new EventSource(buildApiUrl('/api/relatorios/movimentacao/stream'));
            es.onopen = () => setSseActive(true);
            es.onmessage = () => {
                const now = Date.now();
                if (now - lastUpdateRef.current > 5000) { // debouncing 5s
                    lastUpdateRef.current = now;
                    fetchVagas(true);
                }
            };
            es.onerror = () => setSseActive(false);
        } catch {}
        return () => { if (es) es.close(); };
    }, []);

    // Limpar pesquisa quando mudar de visualização
    useEffect(() => {
        if (visualizacaoLista !== 'lista') {
            setPesquisaPatio('');
            setModoPesquisa(false);
        }
    }, [visualizacaoLista]);


    // Filtrar vagas baseado nos filtros
    const vagasFiltradas = useMemo(() => {
        if (!filtros.valorFiltro) return vagas;
        
        return vagas.filter(vaga => {
            const valor = filtros.valorFiltro.toLowerCase();
            
            switch (filtros.tipoFiltro) {
                case 'patio':
                    return vaga.patio.nomePatio.toLowerCase().includes(valor);
                case 'status':
                    return vaga.status.toLowerCase() === valor;
                case 'placa':
                    return vaga.veiculo?.placa && vaga.veiculo.placa.toLowerCase().includes(valor);
                case 'box':
                    return vaga.nomeBox.toLowerCase().includes(valor);
                default:
                    return true;
            }
        });
    }, [vagas, filtros]);

    // Agrupar vagas por pátio
    const patios = useMemo(() => {
        const patiosMap = new Map();
        
        vagasFiltradas.forEach(vaga => {
            const patioId = vaga.patio.idPatio;
            if (!patiosMap.has(patioId)) {
                // Formatar endereço como string para compatibilidade
                const enderecoObj = vaga.patio.endereco || {};
                const enderecoStr = enderecoObj.cidade && enderecoObj.estado
                    ? `${enderecoObj.cidade}, ${enderecoObj.estado}`
                    : enderecoObj.cidade || enderecoObj.estado || '';
                
                patiosMap.set(patioId, {
                    id: patioId,
                    nome: vaga.patio.nomePatio,
                    endereco: enderecoStr, // String formatada
                    enderecoObj: enderecoObj, // Objeto também disponível se necessário
                    vagas: []
                });
            }
            patiosMap.get(patioId).vagas.push(vaga);
        });
        
        return Array.from(patiosMap.values());
    }, [vagasFiltradas]);

    // Selecionar primeiro pátio automaticamente
    useEffect(() => {
        if (patios.length > 0 && patioSelecionado === null) {
            setPatioSelecionado(patios[0].id);
        }
    }, [patios, patioSelecionado]);

    // Filtrar pátios por pesquisa
    const patiosFiltrados = useMemo(() => {
        if (!pesquisaPatio.trim()) return patios;
        
        const pesquisaLower = pesquisaPatio.toLowerCase();
        return patios.filter(patio => {
            const nomeMatch = patio.nome.toLowerCase().includes(pesquisaLower);
            const enderecoMatch = typeof patio.endereco === 'string' 
                ? patio.endereco.toLowerCase().includes(pesquisaLower)
                : (patio.endereco?.cidade || '').toLowerCase().includes(pesquisaLower) ||
                  (patio.endereco?.estado || '').toLowerCase().includes(pesquisaLower);
            return nomeMatch || enderecoMatch;
        });
    }, [patios, pesquisaPatio]);

    // Calcular pátios paginados para o modo lista
    const patiosPaginados = useMemo(() => {
        const inicio = (paginaAtualPatios - 1) * itemsPorPaginaPatios;
        const fim = inicio + itemsPorPaginaPatios;
        return patiosFiltrados.slice(inicio, fim);
    }, [patiosFiltrados, paginaAtualPatios]);

    const totalPaginasPatios = Math.ceil(patiosFiltrados.length / itemsPorPaginaPatios);

    // Calcular estatísticas - usar todas as vagas, não apenas as filtradas
    // Para manutenção, usar a contagem de veículos em manutenção (status EM_MANUTENCAO)
    const estatisticas = useMemo(() => {
        const total = vagas.length;
        const livres = vagas.filter(v => v.status === 'L').length;
        const ocupadas = vagas.filter(v => v.status === 'O').length;
        // Usar veículos em manutenção em vez de vagas com status 'M'
        const manutencao = veiculosEmManutencao;
        const totalPatios = patios.length;
        
        return { total, livres, ocupadas, manutencao, patios: totalPatios };
    }, [vagas, patios, veiculosEmManutencao]);

    const renderVisualizacao = () => {
        // Sistema de abas dinâmico para todos os modos
        const patioAtual = patios.find(p => p.id === patioSelecionado);
        if (!patioAtual) {
            return (
                <div className="neumorphic-container text-center py-8">
                    <p className="text-gray-600">Nenhum pátio selecionado.</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-6">
                {/* Controles de visualização - apenas para abas que não sejam global */}
                {visualizacao !== 'global' && (
                    <div className="neumorphic-container">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Pátios Disponíveis</h3>
                                <p className="text-sm text-gray-600">
                                    {patios.length} pátios encontrados
                                </p>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setVisualizacaoLista('cards')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                                        visualizacaoLista === 'cards'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Grid3X3 size={16} />
                                    <span className="text-sm">Cards</span>
                                </button>
                                <button
                                    onClick={() => setVisualizacaoLista('lista')}
                                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                                        visualizacaoLista === 'lista'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Users size={16} />
                                    <span className="text-sm">Lista</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visualização em Cards */}
                {visualizacao !== 'global' && visualizacaoLista === 'cards' && (
                    <div className="neumorphic-container">
                        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                            {(() => {
                                const totalPatios = patiosFiltrados.length;
                                const totalPagesPatios = Math.ceil(totalPatios / itemsPorPaginaPatios);
                                const startIndexPatios = (paginaAtualPatios - 1) * itemsPorPaginaPatios;
                                const endIndexPatios = startIndexPatios + itemsPorPaginaPatios;
                                const patiosPaginadosCards = patiosFiltrados.slice(startIndexPatios, endIndexPatios);
                                
                                return (
                                    <>
                                        {patiosPaginadosCards.map(patio => (
                                            <button
                                                key={patio.id}
                                                onClick={() => setPatioSelecionado(patio.id)}
                                                className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                                                    patio.id === patioSelecionado
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                <span className="text-xs sm:text-sm font-medium">{patio.nome}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${patio.id === patioSelecionado ? 'bg-white/20' : 'bg-gray-300'}`}>
                                                    {patio.vagas.length}
                                                </span>
                                            </button>
                                        ))}
                                        
                                        {/* Navegação de páginas se houver mais de 20 pátios */}
                                        {totalPagesPatios > 1 && (
                                            <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-3">
                                                <div className="text-sm text-gray-600">
                                                    Mostrando {startIndexPatios + 1} a {Math.min(endIndexPatios, totalPatios)} de {totalPatios} pátios
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setPaginaAtualPatios(Math.max(1, paginaAtualPatios - 1))}
                                                        disabled={paginaAtualPatios === 1}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        ‹ Anterior
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: Math.min(totalPagesPatios, 7) }, (_, i) => {
                                                            let pageNum;
                                                            if (totalPagesPatios <= 7) {
                                                                pageNum = i + 1;
                                                            } else if (paginaAtualPatios <= 4) {
                                                                pageNum = i + 1;
                                                            } else if (paginaAtualPatios >= totalPagesPatios - 3) {
                                                                pageNum = totalPagesPatios - 7 + i;
                                                            } else {
                                                                pageNum = paginaAtualPatios - 3 + i;
                                                            }
                                                            
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setPaginaAtualPatios(pageNum)}
                                                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                                        paginaAtualPatios === pageNum
                                                                            ? 'bg-blue-600 text-white shadow-md'
                                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                    }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <button
                                                        onClick={() => setPaginaAtualPatios(Math.min(totalPagesPatios, paginaAtualPatios + 1))}
                                                        disabled={paginaAtualPatios === totalPagesPatios}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        Próximo ›
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Controles de Pesquisa para Modo Lista */}
                {visualizacao !== 'global' && visualizacaoLista === 'lista' && (
                    <div className="neumorphic-container mb-6">
                        {/* Controles de pesquisa */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => setModoPesquisa(!modoPesquisa)}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                        modoPesquisa
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Search size={16} />
                                    <span>Pesquisar Pátio</span>
                                </button>
                                {modoPesquisa && (
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Search 
                                                size={18} 
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                                            />
                                            <input
                                                type="text"
                                                value={pesquisaPatio}
                                                onChange={(e) => setPesquisaPatio(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Digite o nome do pátio..."
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPesquisaPatio('');
                                                setModoPesquisa(false);
                                            }}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {pesquisaPatio && (
                                <div className="text-sm text-gray-600 mb-4">
                                    {patiosFiltrados.length} pátio(s) encontrado(s) para "{pesquisaPatio}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lista de Pátios - Modo Lista (mostra em todas as abas exceto global) */}
                {visualizacao !== 'global' && visualizacaoLista === 'lista' && (
                    <div className="neumorphic-container">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {patiosPaginados.map(patio => {
                                const livres = patio.vagas.filter(v => v.status === 'L').length;
                                const ocupadas = patio.vagas.filter(v => v.status === 'O').length;
                                const manutencao = patio.vagas.filter(v => v.status === 'M').length;
                                const totalVagas = patio.vagas.length;
                                
                                // Construir endereço completo (agora é string, não objeto)
                                const enderecoCompleto = typeof patio.endereco === 'string'
                                    ? patio.endereco
                                    : (patio.enderecoObj?.cidade && patio.enderecoObj?.estado
                                        ? `${patio.enderecoObj.cidade}, ${patio.enderecoObj.estado}`
                                        : `${patio.enderecoObj?.cidade || ''}, ${patio.enderecoObj?.estado || ''}`.trim() || 'Endereço não informado');
                                
                                return (
                                    <div 
                                        key={patio.id} 
                                        className="neumorphic-container hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                                    {patio.nome}
                                                </h4>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {enderecoCompleto || 'Endereço não informado'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setPatioSelecionado(patio.id);
                                                    setVisualizacaoLista('cards');
                                                    setVisualizacao('mapa');
                                                }}
                                                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                                                title="Ver mapa do pátio"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-green-50 rounded-lg p-2">
                                                <div className="text-xs text-gray-600 mb-1">Livres</div>
                                                <div className="text-lg font-bold text-green-600">{livres}</div>
                                            </div>
                                            <div className="bg-red-50 rounded-lg p-2">
                                                <div className="text-xs text-gray-600 mb-1">Ocupadas</div>
                                                <div className="text-lg font-bold text-red-600">{ocupadas}</div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-lg p-2">
                                                <div className="text-xs text-gray-600 mb-1">Manutenção</div>
                                                <div className="text-lg font-bold text-yellow-600">{manutencao}</div>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-2">
                                                <div className="text-xs text-gray-600 mb-1">Total</div>
                                                <div className="text-lg font-bold text-blue-600">{totalVagas}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setPatioSelecionado(patio.id);
                                                    setVisualizacaoLista('cards');
                                                }}
                                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginação para lista de pátios */}
                        {totalPaginasPatios > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                                <button
                                    onClick={() => setPaginaAtualPatios(p => Math.max(1, p - 1))}
                                    disabled={paginaAtualPatios === 1}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <span>‹</span> Anterior
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Página {paginaAtualPatios} de {totalPaginasPatios}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({patiosFiltrados.length} pátio{patiosFiltrados.length !== 1 ? 's' : ''})
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => setPaginaAtualPatios(p => Math.min(totalPaginasPatios, p + 1))}
                                    disabled={paginaAtualPatios === totalPaginasPatios}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    Próximo <span>›</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                    
                {/* Conteúdo do pátio selecionado - apenas para modo Cards, Mapa, Grade e Abas */}
                {visualizacao !== 'global' && visualizacaoLista === 'cards' && (
                    <div className="neumorphic-container">
                        <h3 className="text-lg font-semibold mb-4">{patioAtual.nome}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {typeof patioAtual.endereco === 'string'
                                ? patioAtual.endereco || 'Endereço não informado'
                                : (patioAtual.enderecoObj?.cidade && patioAtual.enderecoObj?.estado
                                    ? `${patioAtual.enderecoObj.cidade}, ${patioAtual.enderecoObj.estado}`
                                    : patioAtual.enderecoObj?.cidade || patioAtual.enderecoObj?.estado || 'Endereço não informado')}
                        </p>
                    
                    {/* Renderizar o componente baseado no modo de visualização */}
                    {visualizacao === 'patio' && (
                        <VistaCardPatio 
                            vagas={patioAtual.vagas}
                            vagaSelecionada={null}
                            onVagaSelect={() => {}}
                            placasVeiculosEmManutencao={placasVeiculosEmManutencao}
                            veiculosEmManutencao={veiculosEmManutencao}
                        />
                    )}
                    
                    {visualizacao === 'mapa' && (
                        <MapaVagasDinamico 
                            vagas={patioAtual.vagas}
                            viewMode="mapa"
                            loading={loading}
                            patioSelecionado={patioSelecionado}
                        />
                    )}
                    
                    {visualizacao === 'grade' && (
                        <MapaVagasDinamico 
                            vagas={patioAtual.vagas}
                            viewMode="grade"
                            loading={loading}
                            veiculosEmManutencao={veiculosEmManutencao}
                            placasVeiculosEmManutencao={placasVeiculosEmManutencao}
                        />
                    )}
                    
                    {visualizacao === 'abas' && (
                        <MapaVagasDinamico 
                            vagas={patioAtual.vagas}
                            viewMode="abas"
                            loading={loading}
                        />
                    )}
                    </div>
                )}

                {visualizacao === 'global' && (
                    <>
                        {/* Título para o Mapa Global */}
                        <div className="neumorphic-container text-center">
                            <h2 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                🗺️ Mapa Global de Pátios MOTTU
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Visualize a localização de todos os pátios em tempo real
                            </p>
                        </div>
                        
                        <MapaGlobal 
                            patios={patios}
                            onPatioSelect={setPatioSelecionado}
                            patioSelecionado={patioSelecionado}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black relative" style={{backgroundColor: '#000000'}}>
            <ParticleBackground />
            
            <div className="relative z-20 container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Cabeçalho */}
                    <div className="neumorphic-container">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    🏢 Sistema de Gestão de Vagas
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Visualize e gerencie as vagas de motos em tempo real
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {/* Chip Tempo Real */}
                                <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-full border text-xs ${sseActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${sseActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    <span>Tempo Real</span>
                                </div>

                                {/* Botões de Visualização */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setVisualizacao('patio')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                            visualizacao === 'patio'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Layout size={16} />
                                        <span>Pátio</span>
                                    </button>
                                    <button
                                        onClick={() => setVisualizacao('mapa')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                            visualizacao === 'mapa'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <MapPin size={16} />
                                        <span>Mapa</span>
                                    </button>
                                    <button
                                        onClick={() => setVisualizacao('grade')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                            visualizacao === 'grade'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Grid3X3 size={16} />
                                        <span>Grade</span>
                                    </button>
                                    <button
                                        onClick={() => setVisualizacao('abas')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                            visualizacao === 'abas'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Layout size={16} />
                                        <span>Gráficos</span>
                                    </button>
                                    <button
                                        onClick={() => setVisualizacao('global')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                            visualizacao === 'global'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <Globe size={16} />
                                        <span>Vista Global</span>
                                    </button>
                                </div>

                                {/* Botão de Atualizar */}
                                <button
                                    onClick={() => fetchVagas(true)}
                                    disabled={loading}
                                    className="neumorphic-button-advance flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                                    title="Forçar atualização (ignora cache)"
                                >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    <span>Atualizar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <EstatisticasVagas 
                        estatisticas={estatisticas}
                        loading={loading}
                    />

                    {/* Conteúdo principal */}
                    {loading ? (
                        <div className="neumorphic-container">
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Carregando vagas...</p>
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="neumorphic-container">
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar dados</h3>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => fetchVagas(true)}
                                        className="neumorphic-button-advance"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderVisualizacao()
                    )}

                {/* Dicas de Uso - apenas para abas que não sejam global */}
                {visualizacao !== 'global' && (
                    <div className="neumorphic-container">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-lg">💡</span>
                            </div>
                            <h3 className="text-lg font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Dicas de Uso
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <strong className="text-sm">Filtros Inteligentes:</strong>
                                    <span className="text-xs text-gray-600 block mt-1">
                                        Use os filtros para encontrar vagas específicas por pátio, status ou placa.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <strong className="text-sm">Visualização Dinâmica:</strong>
                                    <span className="text-xs text-gray-600 block mt-1">
                                        "Pátio" = assentos, "Mapa" = geográfica, "Grade" = quadros, "Gráficos" = abas dinâmicas por pátio.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <strong className="text-sm">Status das Vagas:</strong>
                                    <span className="text-xs text-gray-600 block mt-1">
                                        🟢 Livres, 🔴 Ocupadas, 🟡 Manutenção. Clique para ver detalhes completos.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <strong className="text-sm">Navegação Intuitiva:</strong>
                                    <span className="text-xs text-gray-600 block mt-1">
                                        Sistema responsivo que se adapta automaticamente ao número de vagas.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}