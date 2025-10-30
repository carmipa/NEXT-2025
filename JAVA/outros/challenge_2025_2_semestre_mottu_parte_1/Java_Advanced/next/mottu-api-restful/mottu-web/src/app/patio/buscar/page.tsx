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
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-slate-700 text-blue-400">
                        <i className="ion-ios-search text-2xl"></i>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-montserrat">
                          Buscar Pátios
                        </h1>
                        <p className="text-slate-300 mt-1 font-montserrat">
                          Pesquise pátios por diferentes critérios
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/gerenciamento-patio"
                      className="neumorphic-button hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <i className="ion-ios-arrow-back"></i>
                      Voltar ao Gerenciamento
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100">
                      {error}
                    </div>
                  )}

                  {/* Search Form */}
                  <form onSubmit={handleSearch} className="mb-8 neumorphic-container">
                    <div className="space-y-6">
                        {/* Primeira linha - Campos básicos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-business text-emerald-500"></i>
                                    Nome do Pátio
                                </label>
                                <input 
                                    type="text" 
                                    name="nomePatio" 
                                    value={filter.nomePatio || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome do pátio..." 
                                    className="neumorphic-input w-full h-12"
                                    title="Nome do pátio"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-car text-blue-500"></i>
                                    Placa do Veículo
                                </label>
                                <input 
                                    type="text" 
                                    name="veiculoPlaca" 
                                    value={filter.veiculoPlaca || ''} 
                                    onChange={(e) => {
                                        const value = e.target.value.trim().toUpperCase();
                                        handleFilterChange({...e, target: {...e.target, value}});
                                    }} 
                                    placeholder="Digite a placa do veículo..." 
                                    className="neumorphic-input w-full h-12"
                                    title="Placa do veículo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-home text-red-500"></i>
                                    Cidade do Endereço
                                </label>
                                <input 
                                    type="text" 
                                    name="enderecoCidade" 
                                    value={filter.enderecoCidade || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite a cidade..." 
                                    className="neumorphic-input w-full h-12"
                                    title="Cidade do endereço"
                                />
                            </div>
                        </div>

                        {/* Segunda linha - Campos adicionais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-mail text-purple-500"></i>
                                    Email do Contato
                                </label>
                                <input 
                                    type="text" 
                                    name="contatoEmail" 
                                    value={filter.contatoEmail || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o email do contato..." 
                                    className="neumorphic-input w-full h-12"
                                    title="Email do contato"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <i className="ion-ios-map text-orange-500"></i>
                                    Nome da Zona
                                </label>
                                <input 
                                    type="text" 
                                    name="zonaNome" 
                                    value={filter.zonaNome || ''} 
                                    onChange={handleFilterChange} 
                                    placeholder="Digite o nome da zona..." 
                                    className="neumorphic-input w-full h-12"
                                    title="Nome da zona"
                                />
                            </div>
                        </div>

                        {/* Terceira linha - Botões centralizados */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button 
                                type="submit" 
                                className="neumorphic-button-green flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                title="Buscar pátios"
                            >
                                <i className="ion-ios-search"></i>
                                Buscar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleClearFilters} 
                                className="neumorphic-button flex items-center justify-center gap-2 px-8 py-3 text-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                title="Limpar filtros"
                            >
                                <i className="ion-ios-close"></i>
                                Limpar
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {patios.map((patio) => (
                          <div key={patio.idPatio} className="neumorphic-container text-slate-800 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                            <div>
                              <div className="flex items-center mb-3">
                                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                                  ID: {patio.idPatio}
                                </span>
                                <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                                  {patio.nomePatio}
                                </h2>
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-2">
                                Status: <span className={`font-semibold ${patio.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                  {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                </span>
                              </p>
                              
                              <div className="text-sm text-slate-500 mt-2 space-y-1">
                                <p className="flex items-center gap-1">
                                  <i className="ion-ios-call"></i> Contatos: <strong>{patio.contatos?.length || 0}</strong>
                                </p>
                                <p className="flex items-center gap-1">
                                  <i className="ion-ios-pin"></i> Endereços: <strong>{patio.enderecos?.length || 0}</strong>
                                </p>
                              </div>
                              
                              {patio.observacao && (
                                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{patio.observacao}</p>
                              )}
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Nome</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Contatos</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Endereços</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {patios.map((patio) => (
                                <tr key={patio.idPatio} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-montserrat">{patio.nomePatio}</td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      patio.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {patio.status === 'A' ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{patio.idPatio}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{patio.contatos?.length || 0}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{patio.enderecos?.length || 0}</td>
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