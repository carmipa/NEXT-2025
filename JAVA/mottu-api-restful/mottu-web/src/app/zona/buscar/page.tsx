// src/app/zona/buscar/page.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { MdVisibility } from 'react-icons/md';
import { MapPin as ZonaIcon, Building } from 'lucide-react';
import { LayoutGrid, Table } from 'lucide-react';
import { ZonaResponseDto, ZonaFilter } from '@/types/zona';
import { SpringPage } from '@/types/common';
import { ZonaService } from '@/utils/api';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

const initialFilterState: ZonaFilter = {
    nome: '',
    observacao: '',
    boxNome: '',
    veiculoPlaca: '',
    patioNome: '',
};

export default function BuscarZonasPage() {
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ZonaResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<ZonaFilter>(initialFilterState);
    const [quickField, setQuickField] = useState<'nome'|'observacao'|'patioNome'>('nome');
    const [quickQuery, setQuickQuery] = useState('');
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idZona,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setZonas([]);
            setPageInfo(null);
        }

        try {
            const data = await ZonaService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setZonas(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar zonas.');
            setZonas([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        // Montar filtro a partir do select + input rápido
        const f: any = { ...initialFilterState };
        if (quickQuery && quickQuery.trim().length > 0) {
            f[quickField] = quickQuery.trim();
        } else {
            Object.assign(f, filter);
        }
        fetchData(0, f);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setQuickQuery('');
        setQuickField('nome');
        setZonas([]);
        setPageInfo(null);
        setCurrentPage(0);
        setHasSearched(false);
        setError(null);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    return (
        <main className="min-h-screen text-white p-4 md:p-8">
            <div className="container mx-auto neumorphic-container p-6 md:p-8">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center mb-4 lg:mb-0">
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                                <i className="ion-ios-search text-white text-2xl lg:text-3xl"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Buscar Zonas
                                </h1>
                                <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Pesquise zonas por diferentes critérios
                                </p>
                            </div>
                        </div>
                        
                        <Link
                            href="/gerenciamento-patio/zona"
                            className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-4 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 w-full lg:w-auto"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-2 lg:gap-3">
                                <div className="p-1.5 lg:p-2 bg-white/25 rounded-full">
                                    <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                                </div>
                                <div className="text-left flex-1">
                                    <div className="text-sm lg:text-lg font-black">VOLTAR</div>
                                    <div className="text-xs text-orange-100 font-semibold hidden lg:block">Ao Gerenciamento</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Search Form */}
                <div className="mb-6 lg:mb-8 neumorphic-container p-4 lg:p-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex-1">
                                <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-search text-blue-400 text-sm lg:text-base"></i>
                                    Valor
                                </label>
                                <input
                                    type="text"
                                    value={quickQuery}
                                    onChange={(e) => setQuickQuery(e.target.value)}
                                    className="neumorphic-input w-full text-sm lg:text-base"
                                    placeholder={quickField === 'nome' ? 'Digite o nome da zona...'
                                        : quickField === 'observacao' ? 'Digite uma observação...'
                                        : 'Digite o nome do pátio...'}
                                />
                            </div>
                            <div className="w-full md:w-52">
                                <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-funnel text-purple-400 text-sm lg:text-base"></i>
                                    Filtrar por
                                </label>
                                <select 
                                    value={quickField} 
                                    onChange={(e) => setQuickField(e.target.value as any)} 
                                    className="neumorphic-input w-full text-sm lg:text-base"
                                >
                                    <option value="nome">Nome da Zona</option>
                                    <option value="observacao">Observação</option>
                                    <option value="patioNome">Nome do Pátio</option>
                                </select>
                            </div>
                      <div className="mt-2 md:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button 
                                    type="submit" 
                                    className="group relative text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 flex items-center justify-center gap-2 btn-buscar-turquesa"
                                    title="Buscar zonas"
                                >
                                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{backgroundColor: '#2BC49A'}}></div>
                                    <div className="relative flex items-center gap-2">
                                        <i className="ion-ios-search text-lg"></i>
                                        <span className="text-sm lg:text-base font-black">BUSCAR</span>
                                    </div>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleClearFilters} 
                                    className="group relative bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
                                    title="Limpar filtros"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center gap-2">
                                        <i className="ion-ios-close text-lg"></i>
                                        <span className="text-sm lg:text-base font-black">LIMPAR</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-slate-300">Buscando...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md mb-8">
                        {error}
                    </div>
                )}

                {/* No Results */}
                {!isLoading && hasSearched && zonas.length === 0 && !error && (
                    <div className="text-center py-12">
                        <ZonaIcon size={64} className="text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-300 text-lg mb-2">Nenhuma zona encontrada</p>
                        <p className="text-slate-400 text-sm">
                            Tente ajustar os critérios de busca
                        </p>
                    </div>
                )}

                {/* Toggle de Visualização */}
                {!isLoading && zonas.length > 0 && (
                    <div className="flex justify-center mb-6">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid size={16} />
                                Cards
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'table' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Table size={16} />
                                Tabela
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {!isLoading && zonas.length > 0 && (
                    <>
                        {viewType === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
                                {zonas.map((zona) => (
                                    <div key={zona.idZona} className="neumorphic-card-gradient p-4 lg:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                                        <div>
                                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {zona.idZona}</span>
                                                    <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2" title={zona.nome} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <i className="ion-ios-map text-purple-500 text-base sm:text-lg"></i>
                                                        {zona.nome}
                                                    </h2>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                                
                                                <div className="flex items-center">
                                                    <i className={`ion-ios-checkmark-circle text-sm sm:text-base mr-1 sm:mr-2 ${zona.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                                    <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Status:</span>
                                                    <span className={`font-semibold ml-1 sm:ml-2 ${zona.status === 'A' ? 'text-green-600' : 'text-red-600'}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        {zona.status === 'A' ? 'Ativa' : 'Inativa'}
                                                    </span>
                                                </div>
                                                
                                                {zona.patio?.nomePatio && (
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-home text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Pátio:</span>
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{zona.patio.nomePatio}</span>
                                                    </div>
                                                )}
                                                
                                                {zona.observacao && (
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-document text-orange-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Obs:</span>
                                                        <span className="text-slate-500 truncate ml-1 sm:ml-2 text-xs sm:text-sm line-clamp-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{zona.observacao}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                            <Link 
                                                href={`/zona/detalhes/${zona.idZona}`}
                                                className="p-1.5 lg:p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                                                title="Ver Detalhes"
                                            >
                                                <MdVisibility size={18} className="lg:w-6 lg:h-6"/>
                                            </Link>
                                            <Link 
                                                href={`/zona/editar/${zona.idZona}`}
                                                className="p-1.5 lg:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                                                title="Editar Zona"
                                            >
                                                <i className="ion-ios-create text-sm lg:text-lg"></i>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="neumorphic-container overflow-hidden mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center gap-1">
                                                        <i className="ion-ios-information-circle text-purple-500 text-xs sm:text-sm"></i>
                                                        <span>ID</span>
                                                    </div>
                                                </th>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center gap-1">
                                                        <i className="ion-ios-map text-purple-500 text-xs sm:text-sm"></i>
                                                        <span>Zona</span>
                                                    </div>
                                                </th>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center gap-1">
                                                        <i className="ion-ios-checkmark-circle text-emerald-500 text-xs sm:text-sm"></i>
                                                        <span>Status</span>
                                                    </div>
                                                </th>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center gap-1">
                                                        <i className="ion-ios-home text-blue-500 text-xs sm:text-sm"></i>
                                                        <span>Pátio</span>
                                                    </div>
                                                </th>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center gap-1">
                                                        <i className="ion-ios-document text-orange-500 text-xs sm:text-sm"></i>
                                                        <span>Observação</span>
                                                    </div>
                                                </th>
                                                <th className="px-3 lg:px-4 py-2 lg:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <i className="ion-ios-settings text-gray-500 text-xs sm:text-sm"></i>
                                                        <span>Ações</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {zonas.map((zona) => (
                                                <tr key={zona.idZona} className="hover:bg-slate-50">
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{zona.idZona}</td>
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-map text-purple-500 text-xs"></i>
                                                            <span>{zona.nome}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                                                        <div className="flex items-center gap-1">
                                                            <i className={`ion-ios-checkmark-circle text-xs ${zona.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                                            <span className={`font-semibold ${zona.status === 'A' ? 'text-green-600' : 'text-red-600'}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                {zona.status === 'A' ? 'Ativa' : 'Inativa'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-home text-blue-500 text-xs"></i>
                                                            <span>{zona.patio?.nomePatio || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 text-xs lg:text-sm text-slate-900 max-w-xs truncate hidden lg:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-document text-orange-500 text-xs"></i>
                                                            <span className="truncate">{zona.observacao || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-center text-xs lg:text-sm font-medium">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <Link 
                                                                href={`/zona/detalhes/${zona.idZona}`}
                                                                className="p-1 lg:p-1.5 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                                                                title="Ver Detalhes"
                                                            >
                                                                <MdVisibility size={16} className="lg:w-5 lg:h-5"/>
                                                            </Link>
                                                            <Link 
                                                                href={`/zona/editar/${zona.idZona}`}
                                                                className="p-1 lg:p-1.5 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                                                                title="Editar Zona"
                                                            >
                                                                <i className="ion-ios-create text-xs lg:text-sm"></i>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Paginação */}
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="mt-4 lg:mt-6 flex flex-col items-center gap-3 lg:gap-4">
                                {/* Informações da paginação */}
                                <div className="text-xs lg:text-sm text-slate-400 text-center">
                                    Mostrando {((pageInfo.number) * ITEMS_PER_PAGE) + 1} a {Math.min((pageInfo.number + 1) * ITEMS_PER_PAGE, pageInfo.totalElements)} de {pageInfo.totalElements} itens
                                </div>
                                
                                {/* Controles de paginação */}
                                <div className="flex items-center gap-1 lg:gap-2">
                                    {/* Botão Anterior */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={pageInfo.first}
                                        className={`text-xs lg:text-sm font-medium transition-all duration-300 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg ${
                                            pageInfo.first
                                                ? 'opacity-50 cursor-not-allowed bg-gray-500 text-gray-300'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                                        }`}
                                    >
                                        <i className="ion-ios-arrow-back text-sm lg:text-base"></i>
                                        <span className="hidden sm:inline ml-1">Anterior</span>
                                    </button>

                                    {/* Números das páginas */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(3, pageInfo.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pageInfo.totalPages <= 3) {
                                                pageNum = i;
                                            } else if (pageInfo.number <= 1) {
                                                pageNum = i;
                                            } else if (pageInfo.number >= pageInfo.totalPages - 2) {
                                                pageNum = pageInfo.totalPages - 3 + i;
                                            } else {
                                                pageNum = pageInfo.number - 1 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`text-xs lg:text-sm font-medium transition-all duration-300 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg ${
                                                        pageInfo.number === pageNum
                                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                                                            : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-lg transform hover:-translate-y-1'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Botão Próximo */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={pageInfo.last}
                                        className={`text-xs lg:text-sm font-medium transition-all duration-300 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg ${
                                            pageInfo.last
                                                ? 'opacity-50 cursor-not-allowed bg-gray-500 text-gray-300'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                                        }`}
                                    >
                                        <span className="hidden sm:inline mr-1">Próximo</span>
                                        <i className="ion-ios-arrow-forward text-sm lg:text-base"></i>
                                    </button>
                                </div>

                                {/* Pular para página específica */}
                                <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-400">
                                    <span className="font-montserrat hidden sm:inline">Ir para página:</span>
                                    <span className="font-montserrat sm:hidden">Página:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={pageInfo.totalPages}
                                        value={pageInfo.number + 1}
                                        onChange={(e) => {
                                            const page = parseInt(e.target.value) - 1;
                                            if (page >= 0 && page < pageInfo.totalPages) {
                                                handlePageChange(page);
                                            }
                                        }}
                                        placeholder="Página"
                                        title="Digite o número da página"
                                        className="neumorphic-input w-12 lg:w-16 px-1 lg:px-2 py-1 text-center font-montserrat text-xs lg:text-sm"
                                    />
                                    <span className="font-montserrat">de {pageInfo.totalPages}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
