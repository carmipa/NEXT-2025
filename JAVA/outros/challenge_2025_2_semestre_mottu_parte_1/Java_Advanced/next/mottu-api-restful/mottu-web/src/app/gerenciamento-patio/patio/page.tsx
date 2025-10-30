'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { Search, Edit, Trash2, Eye, Building, LayoutGrid, Table } from 'lucide-react';
import Pagination from '@/components/ui/pagination';
import '@/styles/neumorphic.css';

export default function PatioPage() {
  const router = useRouter();
  
  // Estados dos dados
  const [patios, setPatios] = useState<PatioResponseDto[]>([]);
  
  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    loadPatios();
  }, []);

  const loadPatios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      setPatios(response.content || []);
    } catch (err: any) {
      setError('Erro ao carregar pátios: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pátio?')) return;
    
    try {
      await PatioService.delete(id);
      setPatios(patios.filter(p => p.idPatio !== id));
    } catch (err: any) {
      setError('Erro ao excluir pátio: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handlePatioSelect = (patio: PatioResponseDto) => {
    // Redireciona para a página principal de gerenciamento com o pátio selecionado
    router.push(`/gerenciamento-patio?patioId=${patio.idPatio}&patioStatus=${patio.status}`);
  };

  const getFilteredData = () => {
    return patios.filter((item: PatioResponseDto) => {
      const searchFields = [item.nomePatio, item.observacao];
      return searchFields.some(field => 
        field && field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Funções de paginação
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredData = getFilteredData();
    return Math.ceil(filteredData.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset da página quando mudar o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
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
    <main className="min-h-screen text-white p-4 md:p-8 pb-32">
        <div className="container mx-auto neumorphic-container p-6 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-700 text-blue-400">
                <i className="ion-ios-business text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-montserrat">
                  Gerenciar Pátios
                </h1>
                <p className="text-slate-300 mt-1 font-montserrat">
                  Selecione um pátio para gerenciar suas zonas e boxes
                </p>
              </div>
            </div>

            <Link
              href="/gerenciamento-patio"
              className="btn btn-ghost"
            >
              <i className="ion-ios-arrow-back text-blue-600"></i>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder=""
                title="Buscar pátios"
                aria-label="Buscar pátios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Action Button */}
          <div className="mb-8 flex justify-end">
            <Link
              href="/patio/novo-assistente"
              className="neumorphic-button-green hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <i className="ion-ios-add"></i>
              Novo Pátio
            </Link>
          </div>

          {/* Data List */}
          {viewType === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {getPaginatedData().map((item: PatioResponseDto) => (
                <div key={item.idPatio} className="neumorphic-card-gradient p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                        ID: {item.idPatio}
                      </span>
                      <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                        {item.nomePatio}
                      </h2>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">
                      Cadastro: {item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}
                    </p>
                    
                    <div className="text-sm text-slate-500 mt-2 space-y-1">
                      <p className="flex items-center gap-1"><i className="ion-ios-call"></i> Contatos: <strong>{item.contato ? 1 : 0}</strong></p>
                      <p className="flex items-center gap-1"><i className="ion-ios-pin"></i> Endereços: <strong>{item.endereco ? 1 : 0}</strong></p>
                    </div>
                    
                    {item.observacao && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                    <Link 
                      href={`/patio/detalhes/${item.idPatio}`}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Ver Detalhes"
                    >
                      <i className="ion-ios-eye text-lg text-blue-600"></i>
                    </Link>
                    <Link 
                      href={`/patio/alterar/${item.idPatio}`}
                      className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Editar"
                    >
                      <i className="ion-ios-create text-lg text-yellow-500"></i>
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.idPatio)} 
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Excluir"
                    >
                      <i className="ion-ios-trash text-lg text-red-500"></i>
                    </button>
                    
                    {/* Botão 'Gerenciar Zonas e Boxes' removido conforme solicitação */}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Cadastro</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Contatos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Endereços</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getPaginatedData().map((item: PatioResponseDto) => (
                      <tr key={item.idPatio} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-montserrat">{item.idPatio}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-montserrat">{item.nomePatio}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-montserrat">
                          {item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-montserrat">{item.contato ? 1 : 0}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 font-montserrat">{item.endereco ? 1 : 0}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center gap-2">
                            <Link 
                              href={`/patio/detalhes/${item.idPatio}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Ver Detalhes"
                            >
                              <i className="ion-ios-eye text-lg"></i>
                            </Link>
                            <Link 
                              href={`/patio/alterar/${item.idPatio}`}
                              className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Editar"
                            >
                              <i className="ion-ios-create text-lg"></i>
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.idPatio)} 
                              className="p-1 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Excluir"
                            >
                              <i className="ion-ios-trash text-lg"></i>
                            </button>
                            <button
                              onClick={() => handlePatioSelect(item)}
                              className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-all duration-300 transform hover:-translate-y-1"
                              title="Gerenciar Zonas e Boxes"
                            >
                              <i className="ion-ios-business text-lg"></i>
                            </button>
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
          {getTotalPages() > 1 && (
            <div className="mt-6 flex flex-col items-center gap-4">
              {/* Informações da paginação */}
              <div className="text-sm text-slate-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, getFilteredData().length)} de {getFilteredData().length} itens
              </div>
              
              {/* Controles de paginação */}
              <div className="flex items-center gap-2">
                {/* Botão Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  <i className="ion-ios-arrow-back"></i>
                  Anterior
                </button>

                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                    let pageNum;
                    if (getTotalPages() <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= getTotalPages() - 2) {
                      pageNum = getTotalPages() - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'neumorphic-button-primary'
                            : 'hover:shadow-lg transform hover:-translate-y-1'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botão Próximo */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === getTotalPages()}
                  className={`neumorphic-button text-sm font-medium transition-all duration-300 ${
                    currentPage === getTotalPages()
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
                  max={getTotalPages()}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= getTotalPages()) {
                      handlePageChange(page);
                    }
                  }}
                  placeholder="Página"
                  title="Digite o número da página"
                  className="neumorphic-input w-16 px-2 py-1 text-center font-montserrat"
                />
                <span className="font-montserrat">de {getTotalPages()}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {getFilteredData().length === 0 && (
            <div className="text-center py-12">
              <i className="ion-ios-business text-6xl text-slate-400 mx-auto mb-4 block"></i>
              <p className="text-slate-300 text-lg mb-2 font-montserrat">
                {searchTerm ? 'Nenhum pátio encontrado' : 'Nenhum pátio cadastrado'}
              </p>
              <p className="text-slate-400 text-sm font-montserrat">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro pátio'
                }
              </p>
            </div>
          )}
        </div>
      </main>
  );
}

