"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Bike, Users, Filter, RefreshCw, Eye, EyeOff, Grid3X3, Layout, Navigation, Globe } from 'lucide-react';
import MapaVagasDinamico from '@/components/mapa-box/MapaVagasDinamico';
import EstatisticasVagas from '@/components/mapa-box/EstatisticasVagas';
import VistaPatio from '@/components/mapa-box/VistaPatio';
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
        const totalPages = Math.ceil(vagas.length / 6);
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
                itemsPerPage={6}
            />
            {/* Controles de paginação externos */}
            {(() => {
                const totalPages = Math.ceil(vagas.length / 6);
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
                                        pageNum = totalPages - 6 + i;
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
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [patioSelecionado, setPatioSelecionado] = useState<number | null>(null);
    const [visualizacaoLista, setVisualizacaoLista] = useState<'cards' | 'lista'>('cards');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina] = useState(5);
    const [paginaAtualCards, setPaginaAtualCards] = useState(1);
    const [itensPorPaginaCards] = useState(6);
    const [pesquisaPatio, setPesquisaPatio] = useState('');
    const [modoPesquisa, setModoPesquisa] = useState(false);

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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVagas();
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
                patiosMap.set(patioId, {
                    id: patioId,
                    nome: vaga.patio.nomePatio,
                    endereco: vaga.patio.endereco,
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
        
        return patios.filter(patio => 
            patio.nome.toLowerCase().includes(pesquisaPatio.toLowerCase()) ||
            patio.endereco.toLowerCase().includes(pesquisaPatio.toLowerCase())
        );
    }, [patios, pesquisaPatio]);

    // Calcular paginação
    const totalPaginas = Math.ceil(patiosFiltrados.length / itensPorPagina);
    const inicioIndice = (paginaAtual - 1) * itensPorPagina;
    const fimIndice = inicioIndice + itensPorPagina;
    const patiosPaginados = patiosFiltrados.slice(inicioIndice, fimIndice);

    // Calcular estatísticas
    const estatisticas = useMemo(() => {
        const total = vagasFiltradas.length;
        const livres = vagasFiltradas.filter(v => v.status === 'L').length;
        const ocupadas = vagasFiltradas.filter(v => v.status === 'O').length;
        const manutencao = vagasFiltradas.filter(v => v.status === 'M').length;
        
        return { total, livres, ocupadas, manutencao };
    }, [vagasFiltradas]);

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
                            {patios.map(patio => (
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

                    
                {/* Conteúdo do pátio selecionado - apenas para abas que não sejam global */}
                {visualizacao !== 'global' && (
                    <div className="neumorphic-container">
                        <h3 className="text-lg font-semibold mb-4">{patioAtual.nome}</h3>
                        <p className="text-sm text-gray-600 mb-4">{patioAtual.endereco}</p>
                    
                    {/* Renderizar o componente baseado no modo de visualização */}
                    {visualizacao === 'patio' && visualizacaoLista === 'cards' && (
                        <VistaCardPatio 
                            vagas={patioAtual.vagas}
                            vagaSelecionada={null}
                            onVagaSelect={() => {}}
                        />
                    )}
                    
                    {/* Modo Lista: Mostrar TODOS os pátios em cards com paginação */}
                    {visualizacao === 'patio' && visualizacaoLista === 'lista' && (
                        <VistaCardPatioWrapper 
                            vagas={vagasFiltradas}
                            paginaAtual={paginaAtualCards}
                            onPageChange={setPaginaAtualCards}
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

                    {/* Filtros simplificados - apenas para abas que não sejam global */}
                    {visualizacao !== 'global' && (
                        <div className="neumorphic-container">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={20} className="text-blue-600" />
                            <h3 className="text-lg font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Filtros
                            </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Select para tipo de filtro */}
                            <div className="flex-1 min-w-0">
                                <select
                                    value={filtros.tipoFiltro || 'patio'}
                                    onChange={(e) => setFiltros(prev => ({ 
                                        ...prev, 
                                        tipoFiltro: e.target.value,
                                        valorFiltro: '' // Limpa o valor quando muda o tipo
                                    }))}
                                    className="w-full neumorphic-select"
                                >
                                    <option value="patio">🏢 Por Pátio</option>
                                    <option value="status">📊 Por Status</option>
                                    <option value="placa">🚗 Por Placa</option>
                                    <option value="box">📦 Por Box</option>
                                </select>
                            </div>

                            {/* Campo de pesquisa com ícone */}
                            <div className="flex-1 min-w-0 relative">
                                <div className="relative">
                                    <Search 
                                        size={18} 
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                                    />
                                    <input
                                        type="text"
                                        value={filtros.valorFiltro || ''}
                                        onChange={(e) => setFiltros(prev => ({ 
                                            ...prev, 
                                            valorFiltro: e.target.value 
                                        }))}
                                        className="w-full pl-10 pr-4 neumorphic-input"
                                    />
                                </div>
                            </div>

                            {/* Botão de Atualizar */}
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => fetchVagas(true)}
                                    disabled={loading}
                                    className="neumorphic-button-advance flex items-center gap-2 px-4 py-2"
                                    title="Forçar atualização (ignora cache)"
                                >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    <span className="hidden sm:inline">Atualizar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

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
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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