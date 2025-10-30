// src/app/zona/buscar/page.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { MdClear, MdVisibility } from 'react-icons/md';
import { MapPin as ZonaIcon, Search as SearchIconLucide, ArrowLeft } from 'lucide-react';
import { ZonaResponseDto, ZonaFilter } from '@/types/zona';
import { SpringPage } from '@/types/common';
import { ZonaService } from '@/utils/api';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

const initialFilterState: ZonaFilter = {
    nome: '',
    dataEntradaInicio: '',
    dataEntradaFim: '',
    dataSaidaInicio: '',
    dataSaidaFim: '',
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
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-slate-700 text-green-400">
                            <SearchIconLucide size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                                Buscar Zonas
                            </h1>
                            <p className="text-slate-300 mt-1">
                                Pesquise zonas por diferentes critérios
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/gerenciamento-patio/zona"
                        className="btn btn-ghost"
                    >
                        <ArrowLeft size={18} className="text-blue-600" />
                        Voltar ao Gerenciamento
                    </Link>
                </div>

                {/* Search Form */}
                <div className="mb-8 neumorphic-container">
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-pricetag text-purple-500"></i>
                                    Nome da Zona
                                </label>
                                <input 
                                    type="text" 
                                    name="nome" 
                                    value={filter.nome || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome da zona..."
                                    className="neumorphic-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-business text-emerald-500"></i>
                                    Nome do Pátio
                                </label>
                                <input 
                                    type="text" 
                                    name="patioNome" 
                                    value={filter.patioNome || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome do pátio..."
                                    className="neumorphic-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-square text-orange-500"></i>
                                    Nome do Box
                                </label>
                                <input 
                                    type="text" 
                                    name="boxNome" 
                                    value={filter.boxNome || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome do box..."
                                    className="neumorphic-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-car text-blue-500"></i>
                                    Placa do Veículo
                                </label>
                                <input 
                                    type="text" 
                                    name="veiculoPlaca" 
                                    value={filter.veiculoPlaca || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite a placa do veículo..."
                                    className="neumorphic-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1 flex items-center gap-2">
                                    <i className="ion-ios-information-circle text-gray-500"></i>
                                    Observação
                                </label>
                                <input 
                                    type="text" 
                                    name="observacao" 
                                    value={filter.observacao || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite uma observação..."
                                    className="neumorphic-input w-full"
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary-green flex-1"
                                >
                                    <SearchIconLucide size={20} /> Buscar
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleClearFilters} 
                                    className="btn btn-ghost flex-1"
                                >
                                    <MdClear size={20} /> Limpar
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

                {/* Results */}
                {!isLoading && zonas.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {zonas.map((zona) => (
                                <div key={zona.idZona} className="neumorphic-card-gradient p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                                                ID: {zona.idZona}
                                            </span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">
                                                {zona.nome}
                                            </h2>
                                        </div>
                                        
                                        <p className="text-sm text-slate-600 mb-2">
                                            Status: <span className={`font-semibold ${zona.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                                {zona.status === 'A' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </p>
                                        
                                        {zona.patio?.nomePatio && (
                                            <p className="text-sm text-slate-500 mb-2">
                                                Pátio: {zona.patio.nomePatio}
                                            </p>
                                        )}
                                        
                                        {zona.observacao && (
                                            <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                                {zona.observacao}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link 
                                            href={`/zona/detalhes/${zona.idZona}`}
                                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100" 
                                            title="Ver Detalhes"
                                        >
                                            <MdVisibility size={22}/>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginação */}
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="mt-6 flex flex-col items-center gap-4">
                                {/* Informações da paginação */}
                                <div className="text-sm text-slate-400">
                                    Mostrando {((pageInfo.number) * ITEMS_PER_PAGE) + 1} a {Math.min((pageInfo.number + 1) * ITEMS_PER_PAGE, pageInfo.totalElements)} de {pageInfo.totalElements} itens
                                </div>
                                
                                {/* Controles de paginação */}
                                <div className="flex items-center gap-2">
                                    {/* Botão Anterior */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={pageInfo.first}
                                        className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                                            pageInfo.first
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:shadow-lg transform hover:-translate-y-1'
                                        }`}
                                    >
                                        <i className="ion-ios-arrow-back"></i>
                                        Anterior
                                    </button>

                                    {/* Números das páginas */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, pageInfo.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pageInfo.totalPages <= 5) {
                                                pageNum = i;
                                            } else if (pageInfo.number <= 2) {
                                                pageNum = i;
                                            } else if (pageInfo.number >= pageInfo.totalPages - 3) {
                                                pageNum = pageInfo.totalPages - 5 + i;
                                            } else {
                                                pageNum = pageInfo.number - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                                                        pageInfo.number === pageNum
                                                            ? 'neumorphic-button-primary'
                                                            : 'hover:shadow-lg transform hover:-translate-y-1'
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
                                        className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                                            pageInfo.last
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:shadow-lg transform hover:-translate-y-1'
                                        }`}
                                    >
                                        Próximo
                                        <i className="ion-ios-arrow-forward"></i>
                                    </button>
                                </div>

                                {/* Pular para página específica */}
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <span className="font-montserrat">Ir para página:</span>
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
                                        className="neumorphic-input w-16 px-2 py-1 text-center font-montserrat"
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
