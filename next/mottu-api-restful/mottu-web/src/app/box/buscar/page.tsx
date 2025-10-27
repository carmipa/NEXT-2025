// src/app/box/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { BoxResponseDto, BoxFilter } from '@/types/box';
import { SpringPage } from '@/types/common';
import { BoxService } from '@/utils/api';
import '@/types/styles/neumorphic.css';

const initialFilterState: BoxFilter = {
    nome: '',
    status: undefined,
    dataEntradaInicio: '',
    dataEntradaFim: '',
    dataSaidaInicio: '',
    dataSaidaFim: '',
    observacao: '',
};

export default function BuscarBoxesPage() {
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<BoxResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [viewType, setViewType] = useState<'cards'|'table'>('cards');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<BoxFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idBox,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setBoxes([]);
            setPageInfo(null);
        }

        try {
            const data = await BoxService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setBoxes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar boxes.');
            setBoxes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value === "" ? undefined : e.target.value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setBoxes([]);
        setPageInfo(null);
        setCurrentPage(0);
        setHasSearched(false);
        setError(null);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    if (isLoading && !hasSearched) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-300">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8">
                <div className="container mx-auto neumorphic-container p-3 sm:p-6 md:p-8">
                  
                  {/* Header */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center mb-4 lg:mb-0">
                        <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                          <i className="ion-ios-search text-white text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Buscar Boxes
                          </h1>
                          <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Pesquise boxes por diferentes critérios
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href="/gerenciamento-patio"
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

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100">
                      {error}
                    </div>
                  )}

                  {/* Search Form */}
                  <form onSubmit={handleSearch} className="mb-6 sm:mb-8 neumorphic-container">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Primeira linha - Campos básicos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-square text-orange-500 text-sm"></i>
                                    Nome do Box
                                </label>
                                <input 
                                    type="text" 
                                    name="nome" 
                                    value={filter.nome || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome do box..." 
                                    className="neumorphic-input w-full h-10 sm:h-12 text-sm sm:text-base"
                                    title="Nome do box"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-pulse text-green-500 text-sm"></i>
                                    Status
                                </label>
                                <select 
                                    name="status" 
                                    value={filter.status || ''} 
                                    onChange={handleFilterChange} 
                                    className="neumorphic-select w-full h-10 sm:h-12 text-sm sm:text-base" 
                                    aria-label="Filtrar por status"
                                    title="Status do box"
                                >
                                    <option value="">Todos os status</option>
                                    <option value="L">Livre</option>
                                    <option value="O">Ocupado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-information-circle text-gray-500 text-sm"></i>
                                    Observação
                                </label>
                                <input 
                                    type="text" 
                                    name="observacao" 
                                    value={filter.observacao || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite uma observação..." 
                                    className="neumorphic-input w-full h-10 sm:h-12 text-sm sm:text-base"
                                    title="Observação do box"
                                />
                            </div>
                        </div>

                        {/* Segunda linha - Campos de data */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2" htmlFor="dataEntradaInicio">
                                    <i className="ion-ios-calendar text-blue-500 text-sm"></i>
                                    Data Entrada (Início)
                                </label>
                                <input 
                                    id="dataEntradaInicio" 
                                    type="date" 
                                    name="dataEntradaInicio" 
                                    value={filter.dataEntradaInicio || ''} 
                                    onChange={handleFilterChange} 
                                    className="neumorphic-input w-full h-10 sm:h-12 date-input-fix text-sm sm:text-base" 
                                    title="Data de entrada inicial"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2" htmlFor="dataEntradaFim">
                                    <i className="ion-ios-calendar text-blue-500 text-sm"></i>
                                    Data Entrada (Fim)
                                </label>
                                <input 
                                    id="dataEntradaFim" 
                                    type="date" 
                                    name="dataEntradaFim" 
                                    value={filter.dataEntradaFim || ''} 
                                    onChange={handleFilterChange} 
                                    className="neumorphic-input w-full h-10 sm:h-12 date-input-fix text-sm sm:text-base" 
                                    title="Data de entrada final"
                                />
                            </div>
                        </div>

                        {/* Terceira linha - Botões centralizados */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <button 
                                type="submit" 
                                className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2"
                                title="Buscar boxes"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-search text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">BUSCAR</span>
                                </div>
                            </button>
                            <button 
                                type="button" 
                                onClick={handleClearFilters} 
                                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-400 hover:border-gray-300 flex items-center justify-center gap-2"
                                title="Limpar filtros"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-close text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">LIMPAR</span>
                                </div>
                            </button>
                        </div>
                    </div>
                  </form>

                  {/* Toggle de Visualização */}
                  {!isLoading && boxes.length > 0 && (
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => setViewType('cards')}
                          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm ${
                            viewType === 'cards' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Visualização em Cards"
                        >
                          <i className="ion-ios-grid text-sm sm:text-base"></i>
                          <span className="hidden sm:inline">Cards</span>
                          <span className="sm:hidden">C</span>
                        </button>
                        <button
                          onClick={() => setViewType('table')}
                          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm ${
                            viewType === 'table' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Visualização em Tabela"
                        >
                          <i className="ion-ios-list text-sm sm:text-base"></i>
                          <span className="hidden sm:inline">Tabela</span>
                          <span className="sm:hidden">T</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="neumorphic-container text-center py-8 sm:py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-loading text-3xl sm:text-4xl text-emerald-400 animate-spin"></i>
                        <p className="text-slate-300 font-montserrat text-sm sm:text-base">Buscando boxes...</p>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && hasSearched && boxes.length === 0 && !error && (
                    <div className="neumorphic-container text-center py-8 sm:py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-search text-3xl sm:text-4xl text-slate-400"></i>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-slate-300 mb-2 font-montserrat">Nenhum box encontrado</h3>
                          <p className="text-slate-400 font-montserrat text-sm sm:text-base">Nenhum box encontrado para os critérios informados.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {!isLoading && boxes.length > 0 && (
                    viewType === 'cards' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                        {boxes.map((box) => (
                          <div key={box.idBox} className="neumorphic-card-gradient p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                            <div>
                              <div className="flex items-center mb-2 sm:mb-3">
                                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                                  ID: {box.idBox}
                                </span>
                                <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                                  {box.nome}
                                </h2>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-slate-600 mb-2">
                                Status: <span className={`font-semibold ${box.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                                  {box.status === 'L' ? 'Livre' : 'Ocupado'}
                                </span>
                              </p>
                              
                              {box.dataEntrada && (
                                <p className="text-xs sm:text-sm text-slate-500 mb-2">
                                  Entrada: {new Date(box.dataEntrada).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              
                              {box.observacao && (
                                <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2">{box.observacao}</p>
                              )}
                            </div>
                            
                            <div className="flex justify-end items-center gap-1 sm:gap-2 border-t border-slate-200 pt-2 sm:pt-3 mt-3 sm:mt-4">
                              <Link 
                                href={`/box/detalhes/${box.idBox}`}
                                className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Ver Detalhes"
                              >
                                <i className="ion-ios-eye text-sm sm:text-lg"></i>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="neumorphic-container overflow-hidden mb-6 sm:mb-8">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">ID</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Nome</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Status</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat hidden sm:table-cell">Data Entrada</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {boxes.map((box) => (
                                <tr key={box.idBox} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 font-montserrat">{box.idBox}</td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 font-montserrat truncate max-w-[120px] sm:max-w-none">{box.nome}</td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      box.status === 'L' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {box.status === 'L' ? 'Livre' : 'Ocupado'}
                                    </span>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600 font-montserrat hidden sm:table-cell">
                                    {box.dataEntrada ? new Date(box.dataEntrada).toLocaleDateString('pt-BR') : '-'}
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                                    <div className="flex justify-center items-center gap-1 sm:gap-2">
                                      <Link 
                                        href={`/box/detalhes/${box.idBox}`} 
                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Ver Detalhes"
                                      >
                                        <i className="ion-ios-eye text-sm sm:text-lg"></i>
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  )}

                  {/* Paginação */}
                  {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-100">
                      <span className="font-montserrat text-center sm:text-left">
                        Página {pageInfo.number + 1} de {pageInfo.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          title="Página anterior" 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={pageInfo.first} 
                          className="neumorphic-button text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1 px-3 sm:px-4 py-2"
                        >
                          <i className="ion-ios-arrow-back text-sm"></i>
                          <span className="hidden sm:inline ml-1">Anterior</span>
                        </button>
                        <button 
                          title="Próxima página" 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={pageInfo.last} 
                          className="neumorphic-button text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1 px-3 sm:px-4 py-2"
                        >
                          <span className="hidden sm:inline mr-1">Próximo</span>
                          <i className="ion-ios-arrow-forward text-sm"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; }
                input[type="date"] { color-scheme: dark; }
            `}</style>
        </>
    );
}