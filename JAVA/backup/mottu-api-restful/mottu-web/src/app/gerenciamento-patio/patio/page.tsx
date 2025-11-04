'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { Search } from 'lucide-react';
import ModernPagination from '@/components/ModernPagination';
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
    <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-32">
        <div className="container mx-auto neumorphic-container p-3 sm:p-6 md:p-8">
          
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center mb-4 lg:mb-0">
                <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                  <i className="ion-ios-business text-white text-2xl lg:text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    Gerenciar Pátios
                  </h1>
                  <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    Selecione um pátio para gerenciar suas zonas e boxes
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

          {/* Search */}
          <div className="mb-6 sm:mb-8 neumorphic-container">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
              <input
                type="text"
                placeholder=""
                title="Buscar pátios"
                aria-label="Buscar pátios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neumorphic-input pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Toggle de Visualização */}
          {getFilteredData().length > 0 && (
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setViewType('cards')}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm ${
                    viewType === 'cards' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
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
                >
                  <i className="ion-ios-list text-sm sm:text-base"></i>
                  <span className="hidden sm:inline">Tabela</span>
                  <span className="sm:hidden">T</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mb-6 sm:mb-8 flex justify-end">
            <Link
              href="/patio/novo-assistente"
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <i className="ion-ios-add text-lg"></i>
                <span className="text-sm lg:text-base font-black">NOVO PÁTIO</span>
              </div>
            </Link>
          </div>

          {/* Data List */}
          {viewType === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8 mb-8 sm:mb-12">
              {getPaginatedData().map((item: PatioResponseDto) => (
                <div key={item.idPatio} className="neumorphic-card-gradient p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                  <div>
                    <div className="flex items-center mb-2 sm:mb-3">
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                        ID: {item.idPatio}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                        {item.nomePatio}
                      </h2>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">
                      Cadastro: {item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}
                    </p>
                    
                    <div className="text-xs sm:text-sm text-slate-500 mt-2 space-y-1">
                      <p className="flex items-center gap-1"><i className="ion-ios-call text-sm"></i> Contatos: <strong>{item.contato ? 1 : 0}</strong></p>
                      <p className="flex items-center gap-1"><i className="ion-ios-pin text-sm"></i> Endereços: <strong>{item.endereco ? 1 : 0}</strong></p>
                    </div>
                    
                    {item.observacao && (
                      <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end items-center gap-1 sm:gap-2 border-t border-slate-200 pt-2 sm:pt-3 mt-3 sm:mt-4">
                    <Link 
                      href={`/patio/detalhes/${item.idPatio}`}
                      className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Ver Detalhes"
                    >
                      <i className="ion-ios-eye text-sm sm:text-lg text-blue-600"></i>
                    </Link>
                    <Link 
                      href={`/patio/alterar/${item.idPatio}`}
                      className="p-1.5 sm:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Editar"
                    >
                      <i className="ion-ios-create text-sm sm:text-lg text-yellow-500"></i>
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.idPatio)} 
                      className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                      title="Excluir"
                    >
                      <i className="ion-ios-trash text-sm sm:text-lg text-red-500"></i>
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
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">ID</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Nome</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat hidden sm:table-cell">Cadastro</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat hidden md:table-cell">Contatos</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat hidden md:table-cell">Endereços</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getPaginatedData().map((item: PatioResponseDto) => (
                      <tr key={item.idPatio} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-montserrat">{item.idPatio}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 font-montserrat truncate max-w-[150px] sm:max-w-none">{item.nomePatio}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-montserrat hidden sm:table-cell">
                          {item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-montserrat hidden md:table-cell">{item.contato ? 1 : 0}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 font-montserrat hidden md:table-cell">{item.endereco ? 1 : 0}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                          <div className="flex justify-center items-center gap-1 sm:gap-2">
                            <Link 
                              href={`/patio/detalhes/${item.idPatio}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Ver Detalhes"
                            >
                              <i className="ion-ios-eye text-sm sm:text-lg"></i>
                            </Link>
                            <Link 
                              href={`/patio/alterar/${item.idPatio}`}
                              className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Editar"
                            >
                              <i className="ion-ios-create text-sm sm:text-lg"></i>
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.idPatio)} 
                              className="p-1 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                              title="Excluir"
                            >
                              <i className="ion-ios-trash text-sm sm:text-lg"></i>
                            </button>
                            <button
                              onClick={() => handlePatioSelect(item)}
                              className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-all duration-300 transform hover:-translate-y-1"
                              title="Gerenciar Zonas e Boxes"
                            >
                              <i className="ion-ios-business text-sm sm:text-lg"></i>
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

          {/* Paginação Moderna */}
          {getTotalPages() > 1 && (
            <div className="mt-4 sm:mt-6">
              <ModernPagination
                currentPage={currentPage}
                totalPages={getTotalPages()}
                onPageChange={handlePageChange}
                showPageInput={true}
                className=""
              />
            </div>
          )}

          {/* Empty State */}
          {getFilteredData().length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <i className="ion-ios-business text-4xl sm:text-6xl text-slate-400 mx-auto mb-4 block"></i>
              <p className="text-slate-300 text-base sm:text-lg mb-2 font-montserrat">
                {searchTerm ? 'Nenhum pátio encontrado' : 'Nenhum pátio cadastrado'}
              </p>
              <p className="text-slate-400 text-sm sm:text-base font-montserrat">
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

