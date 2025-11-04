// src/app/patio/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { PatioResponseDto, PatioFilter } from '@/types/patio';
import { SpringPage } from '@/types/common';
import { PatioService } from '@/utils/api';
import '@/types/styles/neumorphic.css';

const initialFilterState: PatioFilter = {
    nomePatio: '',
    veiculoPlaca: '',
    enderecoCidade: '',
    contatoEmail: '',
    zonaNome: '',
};

export default function BuscarPatiosPage() {
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<PatioResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<PatioFilter>(initialFilterState);
    const [quickField, setQuickField] = useState<'nomePatio'|'veiculoPlaca'|'enderecoCidade'|'contatoEmail'|'zonaNome'|'boxNome'|'observacao'>('nomePatio');
    const [quickQuery, setQuickQuery] = useState('');
    const [viewType, setViewType] = useState<'cards'|'table'>('cards');

    const ITEMS_PER_PAGE = 9;

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setPatios([]);
            setPageInfo(null);
        }

        try {
            const data = await PatioService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE);
            setPatios(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar pátios.');
            setPatios([]);
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
        if (!quickQuery.trim()) {
            setPatios([]);
            setPageInfo(null);
            setHasSearched(false);
            return;
        }
        setCurrentPage(0);
        const built: any = { ...initialFilterState };
        if (quickField === 'veiculoPlaca') {
            built[quickField] = quickQuery.trim().toUpperCase();
        } else {
            built[quickField] = quickQuery.trim();
        }
        fetchData(0, built);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setQuickQuery('');
        setQuickField('nomePatio');
        setPatios([]);
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
                            Buscar Pátios
                          </h1>
                          <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Pesquise pátios por diferentes critérios
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

                  {/* Search Form - padrão input + seletor + botões */}
                  <form onSubmit={handleSearch} className="mb-8 neumorphic-container p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
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
                          placeholder={quickField === 'nomePatio' ? 'Digite o nome do pátio...'
                            : quickField === 'veiculoPlaca' ? 'Digite a placa do veículo...'
                            : quickField === 'enderecoCidade' ? 'Digite a cidade...'
                            : quickField === 'contatoEmail' ? 'Digite o email do contato...'
                            : quickField === 'zonaNome' ? 'Digite o nome da zona...'
                            : quickField === 'boxNome' ? 'Digite o nome do box...'
                            : 'Digite uma observação...'}
                        />
                      </div>
                      <div className="w-full lg:w-52">
                        <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                          <i className="ion-ios-funnel text-purple-400 text-sm lg:text-base"></i>
                          Filtrar por
                        </label>
                        <select
                          value={quickField}
                          onChange={(e) => setQuickField(e.target.value as any)}
                          className="neumorphic-input w-full text-sm lg:text-base"
                        >
                          <option value="nomePatio">Nome do Pátio</option>
                          <option value="veiculoPlaca">Placa do Veículo</option>
                          <option value="enderecoCidade">Cidade do Endereço</option>
                          <option value="contatoEmail">Email do Contato</option>
                          <option value="zonaNome">Nome da Zona</option>
                          <option value="boxNome">Nome do Box</option>
                          <option value="observacao">Observação</option>
                        </select>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button 
                          type="submit" 
                          disabled={!quickQuery.trim()}
                          className={`group relative text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform transition-all duration-300 border-2 flex items-center justify-center gap-2 overflow-hidden
                          ${!quickQuery.trim() 
                            ? 'cursor-not-allowed opacity-50 bg-gray-600 border-gray-500' 
                            : 'hover:scale-105 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-400 hover:border-emerald-300'
                          }`}
                          title="Buscar pátios"
                        >
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

                  {/* Toggle de Visualização */}
                  {!isLoading && patios.length > 0 && (
                    <div className="flex justify-center mb-6">
                      <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => setViewType('cards')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewType === 'cards' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Visualização em Cards"
                        >
                          <i className="ion-ios-grid"></i>
                          Cards
                        </button>
                        <button
                          onClick={() => setViewType('table')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                            viewType === 'table' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Visualização em Tabela"
                        >
                          <i className="ion-ios-list"></i>
                          Tabela
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="neumorphic-container text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-loading text-4xl text-emerald-400 animate-spin"></i>
                        <p className="text-slate-300 font-montserrat">Buscando pátios...</p>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && hasSearched && patios.length === 0 && !error && (
                    <div className="neumorphic-container text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-search text-4xl text-slate-400"></i>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-300 mb-2 font-montserrat">Nenhum pátio encontrado</h3>
                          <p className="text-slate-400 font-montserrat">Nenhum pátio encontrado para os critérios informados.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {!isLoading && patios.length > 0 && (
                    viewType === 'cards' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8 mb-8 sm:mb-12">
                        {patios.map((patio) => (
                          <div key={patio.idPatio} className="neumorphic-card-gradient p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                            <div>
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {patio.idPatio}</span>
                                  <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2" title={patio.nomePatio} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-home text-blue-500 text-base sm:text-lg"></i>
                                    {patio.nomePatio}
                                  </h2>
                                </div>
                              </div>
                              
                              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                <div className="flex items-center">
                                  <i className={`ion-ios-checkmark-circle text-sm sm:text-base mr-1 sm:mr-2 ${patio.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Status:</span>
                                  <span className={`ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    patio.status === 'A' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <i className="ion-ios-call text-green-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Contatos:</span>
                                  <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>{patio.contatos?.length || 0}</strong></span>
                                </div>
                                
                                <div className="flex items-center">
                                  <i className="ion-ios-pin text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Endereços:</span>
                                  <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>{patio.enderecos?.length || 0}</strong></span>
                                </div>
                                
                                {patio.observacao && (
                                  <div className="flex items-center">
                                    <i className="ion-ios-document text-orange-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                    <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Obs:</span>
                                    <span className="text-slate-500 truncate ml-1 sm:ml-2 text-xs sm:text-sm line-clamp-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{patio.observacao}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                              <Link 
                                href={`/patio/detalhes/${patio.idPatio}`}
                                className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Ver Detalhes"
                              >
                                <i className="ion-ios-eye text-lg"></i>
                              </Link>
                              <Link 
                                href={`/patio/alterar/${patio.idPatio}`}
                                className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Editar"
                              >
                                <i className="ion-ios-create text-lg"></i>
                              </Link>
                              <Link 
                                href={`/patio/deletar/${patio.idPatio}`}
                                className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Excluir"
                              >
                                <i className="ion-ios-trash text-lg"></i>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="neumorphic-container overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center gap-1">
                                    <i className="ion-ios-information-circle text-purple-500 text-xs sm:text-sm"></i>
                                    <span>ID</span>
                                  </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center gap-1">
                                    <i className="ion-ios-home text-blue-500 text-xs sm:text-sm"></i>
                                    <span>Pátio</span>
                                  </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center gap-1">
                                    <i className="ion-ios-checkmark-circle text-emerald-500 text-xs sm:text-sm"></i>
                                    <span>Status</span>
                                  </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center gap-1">
                                    <i className="ion-ios-call text-green-500 text-xs sm:text-sm"></i>
                                    <span>Contatos</span>
                                  </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center gap-1">
                                    <i className="ion-ios-pin text-blue-500 text-xs sm:text-sm"></i>
                                    <span>Endereços</span>
                                  </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                  <div className="flex items-center justify-center gap-1">
                                    <i className="ion-ios-settings text-gray-500 text-xs sm:text-sm"></i>
                                    <span>Ações</span>
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {patios.map((patio) => (
                                <tr key={patio.idPatio} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{patio.idPatio}</td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[150px] sm:max-w-none" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <div className="flex items-center gap-1">
                                      <i className="ion-ios-home text-blue-500 text-xs"></i>
                                      <span>{patio.nomePatio}</span>
                                    </div>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                                    <div className="flex items-center gap-1">
                                      <i className={`ion-ios-checkmark-circle text-xs ${patio.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        patio.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <div className="flex items-center gap-1">
                                      <i className="ion-ios-call text-green-500 text-xs"></i>
                                      <span>{patio.contatos?.length || 0}</span>
                                    </div>
                                  </td>
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <div className="flex items-center gap-1">
                                      <i className="ion-ios-pin text-blue-500 text-xs"></i>
                                      <span>{patio.enderecos?.length || 0}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center items-center gap-2">
                                      <Link 
                                        href={`/patio/detalhes/${patio.idPatio}`} 
                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Ver Detalhes"
                                      >
                                        <i className="ion-ios-eye text-lg"></i>
                                      </Link>
                                      <Link 
                                        href={`/patio/alterar/${patio.idPatio}`} 
                                        className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Editar Pátio"
                                      >
                                        <i className="ion-ios-create text-lg"></i>
                                      </Link>
                                      <Link 
                                        href={`/patio/deletar/${patio.idPatio}`} 
                                        className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Excluir Pátio"
                                      >
                                        <i className="ion-ios-trash text-lg"></i>
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
                    <div className="mt-8 flex justify-between items-center text-sm text-slate-100">
                      <span className="font-montserrat">
                        Página {pageInfo.number + 1} de {pageInfo.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          title="Página anterior" 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={pageInfo.first} 
                          className="neumorphic-button text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1"
                        >
                          <i className="ion-ios-arrow-back"></i>
                          Anterior
                        </button>
                        <button 
                          title="Próxima página" 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={pageInfo.last} 
                          className="neumorphic-button text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1"
                        >
                          Próximo
                          <i className="ion-ios-arrow-forward"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </main>
        </>
    );
}
