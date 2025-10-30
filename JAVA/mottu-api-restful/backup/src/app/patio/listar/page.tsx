// Caminho: src/app/patio/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { PatioService } from '@/utils/api';
import { PatioResponseDto, PatioFilter } from '@/types/patio';
import { SpringPage } from '@/types/common';
import { MdSearch, MdClear, MdAdd, MdChevronLeft, MdChevronRight, MdEdit, MdDelete, MdVisibility, MdErrorOutline } from 'react-icons/md';
import { Building, MapPin, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const initialFilterState: PatioFilter = { nomePatio: "" };

// Função para calcular dados de ocupação simulados (em produção viria da API)
const calcularDadosOcupacao = (patio: PatioResponseDto) => {
    // Simulação de dados - em produção, estes dados viriam de APIs específicas
    const totalBoxes = Math.floor(Math.random() * 50) + 20; // 20-70 boxes
    const ocupados = Math.floor(Math.random() * totalBoxes);
    const livres = totalBoxes - ocupados;
    const taxaOcupacao = Math.round((ocupados / totalBoxes) * 100);
    
    // Simular tendência
    const tendencias = ['crescendo', 'diminuindo', 'estavel'];
    const tendencia = tendencias[Math.floor(Math.random() * tendencias.length)];
    
    // Simular estatísticas
    const media = Math.max(0, taxaOcupacao + Math.floor(Math.random() * 20) - 10);
    const maxima = Math.min(100, taxaOcupacao + Math.floor(Math.random() * 30));
    
    return {
        totalBoxes,
        ocupados,
        livres,
        taxaOcupacao,
        tendencia,
        media,
        maxima
    };
};

// Função para obter cor da taxa de ocupação
const getOcupacaoColor = (taxa: number) => {
    if (taxa >= 90) return 'bg-red-500';
    if (taxa >= 70) return 'bg-orange-500';
    if (taxa >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
};

// Função para obter ícone de tendência
const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
        case 'crescendo': return <TrendingUp className="w-4 h-4 text-red-500" />;
        case 'diminuindo': return <TrendingDown className="w-4 h-4 text-green-500" />;
        default: return <Minus className="w-4 h-4 text-blue-500" />;
    }
};

// Função para obter texto de tendência
const getTendenciaText = (tendencia: string) => {
    switch (tendencia) {
        case 'crescendo': return 'Crescendo';
        case 'diminuindo': return 'Diminuindo';
        default: return 'Estável';
    }
};

export default function ListarPatiosPage() {
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<PatioResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtros, setFiltros] = useState<PatioFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 12;

    const fetchData = async (page = 0, currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await PatioService.listarPaginadoFiltrado(currentFilters, page, ITEMS_PER_PAGE);
            setPatios(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar pátios.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchData(0, filtros);
    };

    const handleClearFilters = () => {
        setFiltros(initialFilterState);
        fetchData(0, initialFilterState);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filtros);
    };

    return (
        <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto">
                    {/* Header com estatísticas */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center mb-2">
                                    <Building size={36} className="mr-3" />
                                    Pátios Cadastrados
                                </h1>
                                <p className="text-blue-100">Gerencie e monitore todos os pátios do sistema</p>
                            </div>
                            <Link href="/patio/cadastrar" className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 font-semibold text-blue-600 bg-white rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 hover:-translate-y-1">
                                <MdAdd size={20} /> Novo Pátio
                            </Link>
                        </div>
                        
                        {/* Estatísticas rápidas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-2xl font-bold">{patios.length}</div>
                                <div className="text-blue-100 text-sm">Total de Pátios</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-2xl font-bold">
                                    {patios.reduce((acc, patio) => {
                                        const dados = calcularDadosOcupacao(patio);
                                        return acc + dados.totalBoxes;
                                    }, 0)}
                                </div>
                                <div className="text-blue-100 text-sm">Total de Boxes</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-2xl font-bold">
                                    {patios.length > 0 ? Math.round(patios.reduce((acc, patio) => {
                                        const dados = calcularDadosOcupacao(patio);
                                        return acc + dados.taxaOcupacao;
                                    }, 0) / patios.length) : 0}%
                                </div>
                                <div className="text-blue-100 text-sm">Ocupação Média</div>
                            </div>
                        </div>
                    </div>

                    {error && <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100"><MdErrorOutline className="inline mr-2" />{error}</div>}

                    {/* Filtros modernos */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MdSearch className="mr-2" />
                            Filtros de Busca
                        </h3>
                        <form onSubmit={handleFilterSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Pátio</label>
                                    <input 
                                        type="text" 
                                        name="nomePatio" 
                                        value={filtros.nomePatio || ''} 
                                        onChange={handleFilterChange} 
                                        placeholder="Digite o nome do pátio..." 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="submit" 
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <MdSearch size={20} /> Buscar
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleClearFilters} 
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <MdClear size={20} /> Limpar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            <span className="ml-3 text-white">Carregando pátios...</span>
                        </div>
                    ) : patios.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {patios.map((patio) => {
                                const dadosOcupacao = calcularDadosOcupacao(patio);
                                
                                return (
                                    <div key={patio.idPatio} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                                        {/* Header do Card */}
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-gray-800 truncate">{patio.nomePatio}</h3>
                                                <div className="flex items-center gap-1 text-sm">
                                                    {getTendenciaIcon(dadosOcupacao.tendencia)}
                                                    <span className="text-gray-600">{getTendenciaText(dadosOcupacao.tendencia)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>ID: {patio.idPatio}</span>
                                                <span className="text-gray-400">•</span>
                                                <span>{patio.enderecos?.[0]?.cidade || 'Cidade não informada'}</span>
                                            </div>
                                        </div>

                                        {/* Taxa de Ocupação */}
                                        <div className="p-4">
                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">Ocupação Atual</span>
                                                    <span className="text-lg font-bold text-gray-800">{dadosOcupacao.taxaOcupacao}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-500 ${getOcupacaoColor(dadosOcupacao.taxaOcupacao)}`}
                                                        style={{ width: `${dadosOcupacao.taxaOcupacao}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Estatísticas */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-600 mb-1">Média</div>
                                                    <div className="text-sm font-bold text-gray-800">{dadosOcupacao.media}%</div>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-600 mb-1">Máxima</div>
                                                    <div className="text-sm font-bold text-gray-800">{dadosOcupacao.maxima}%</div>
                                                </div>
                                            </div>

                                            {/* Status dos Boxes */}
                                            <div className="mb-4">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Status dos Boxes</div>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {Array.from({ length: Math.min(10, dadosOcupacao.totalBoxes) }, (_, i) => {
                                                        const isOcupado = i < dadosOcupacao.ocupados;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold ${
                                                                    isOcupado 
                                                                        ? 'bg-red-500 text-white' 
                                                                        : 'bg-green-500 text-white'
                                                                }`}
                                                            >
                                                                {i + 1}
                                                            </div>
                                                        );
                                                    })}
                                                    {dadosOcupacao.totalBoxes > 10 && (
                                                        <div className="w-6 h-6 bg-gray-300 rounded text-xs flex items-center justify-center font-bold text-gray-600">
                                                            +{dadosOcupacao.totalBoxes - 10}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações do Pátio */}
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Building className="w-3 h-3" />
                                                    <span>{dadosOcupacao.totalBoxes} boxes</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{patio.dataCadastro ? new Date(patio.dataCadastro).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex gap-1">
                                                <Link 
                                                    href={`/patio/detalhes/${patio.idPatio}`} 
                                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors" 
                                                    title="Ver Detalhes"
                                                >
                                                    <MdVisibility size={18}/>
                                                </Link>
                                                <Link 
                                                    href={`/patio/alterar/${patio.idPatio}`} 
                                                    className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 transition-colors" 
                                                    title="Editar Pátio"
                                                >
                                                    <MdEdit size={18}/>
                                                </Link>
                                                <Link 
                                                    href={`/patio/deletar/${patio.idPatio}`} 
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors" 
                                                    title="Excluir Pátio"
                                                >
                                                    <MdDelete size={18}/>
                                                </Link>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {dadosOcupacao.ocupados}/{dadosOcupacao.totalBoxes} ocupados
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Nenhum pátio encontrado.</p>
                            <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros de busca.</p>
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center text-sm text-slate-100">
                            <span>Página {pageInfo.number + 1} de {pageInfo.totalPages}</span>
                            <div className="flex gap-2">
                                <button title="Página anterior" onClick={() => handlePageChange(currentPage - 1)} disabled={pageInfo.first} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 hover:scale-110 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"><MdChevronLeft/></button>
                                <button title="Próxima página" onClick={() => handlePageChange(currentPage + 1)} disabled={pageInfo.last} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 hover:scale-110 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"><MdChevronRight/></button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
    );
}