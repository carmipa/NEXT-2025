// src/app/box/listar/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoxService } from '@/utils/api';
import { BoxResponseDto, BoxFilter } from '@/types/box';
import { SpringPage } from '@/types/common';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

const initialFilterState: BoxFilter = { nome: "", status: undefined };

export default function ListarBoxesPage() {
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<BoxResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtros, setFiltros] = useState<BoxFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

    const ITEMS_PER_PAGE = 9;

    const fetchData = async (page = 0, currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await BoxService.listarPaginadoFiltrado(currentFilters, page, ITEMS_PER_PAGE);
            setBoxes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar boxes.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Funções de filtro simplificadas - busca em tempo real

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filtros);
    };

    const getFilteredData = () => {
        return boxes.filter((item: BoxResponseDto) => {
            const searchFields = [item.nome, item.observacao];
            return searchFields.some(field => 
                field && field.toLowerCase().includes(filtros.nome?.toLowerCase() || '')
            );
        });
    };

    if (isLoading) {
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
        <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto neumorphic-container p-6 md:p-8">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-slate-700 text-blue-400">
                        <i className="ion-ios-grid text-2xl"></i>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-montserrat">
                          Gerenciar Boxes
                        </h1>
                        <p className="text-slate-300 mt-1 font-montserrat">
                          Visualize e gerencie todos os boxes do sistema
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/gerenciamento-patio"
                      className="neumorphic-button hover:shadow-lg hover:scale-105 transition-all duration-300 transform hover:-translate-y-1"
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

                  {/* Search */}
                  <div className="mb-8 neumorphic-container">
                    <div className="relative">
                      <i className="ion-ios-search absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10"></i>
                      <input
                        type="text"
                        placeholder=""
                        title="Buscar boxes"
                        aria-label="Buscar boxes"
                        value={filtros.nome}
                        onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                        className="neumorphic-input pl-14 pr-4"
                      />
                    </div>
                  </div>

                  {/* Toggle de Visualização */}
                  {getFilteredData().length > 0 && (
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
                        >
                          <i className="ion-ios-list"></i>
                          Tabela
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Data List */}
                  {viewType === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredData().map((item: BoxResponseDto) => (
                        <div key={item.idBox} className="neumorphic-card-gradient p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                          <div>
                            <div className="flex items-center mb-3">
                              <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                                ID: {item.idBox}
                              </span>
                              <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                                {item.nome}
                              </h2>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-2">
                              Status: <span className={`font-semibold ${item.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.status === 'L' ? 'Livre' : 'Ocupado'}
                              </span>
                            </p>
                            
                            {item.dataEntrada && (
                              <p className="text-sm text-slate-500 mb-2">
                                Entrada: {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                            
                            {item.observacao && (
                              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                            )}
                          </div>
                          
                          <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                            <Link 
                              href={`/box/detalhes/${item.idBox}`}
                              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Ver Detalhes"
                            >
                              <i className="ion-ios-eye text-lg"></i>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="neumorphic-container overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Nome</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Data Entrada</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {getFilteredData().map((item: BoxResponseDto) => (
                              <tr key={item.idBox} className="hover:bg-slate-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{item.idBox}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-montserrat">{item.nome}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    item.status === 'L' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status === 'L' ? 'Livre' : 'Ocupado'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">
                                  {item.dataEntrada ? new Date(item.dataEntrada).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                  <div className="flex justify-center items-center gap-2">
                                    <Link 
                                      href={`/box/detalhes/${item.idBox}`} 
                                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                      title="Ver Detalhes"
                                    >
                                      <i className="ion-ios-eye text-lg"></i>
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

                  {/* Empty State */}
                  {getFilteredData().length === 0 && (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-grid text-4xl text-slate-400"></i>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-300 mb-2 font-montserrat">Nenhum box encontrado</h3>
                          <p className="text-slate-400 font-montserrat">
                            {filtros.nome || filtros.status ? 'Nenhum box encontrado com os filtros aplicados.' : 'Nenhum box cadastrado ainda.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paginação */}
                  {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
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
                </div>
            </main>
    );
}