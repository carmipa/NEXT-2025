'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { Search } from 'lucide-react';
import ModernPagination from '@/components/ModernPagination';
import '@/styles/neumorphic.css';
import {
    ResourceInUseException,
    ResourceNotFoundException,
    OperationNotAllowedException,
    ApiException,
} from '@/utils/exceptions';

export default function PatioPage() {
  const router = useRouter();
  
  // Estados dos dados
  const [patios, setPatios] = useState<PatioResponseDto[]>([]);
  
  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  const [mostrarInativos, setMostrarInativos] = useState(true);
  
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

  const handleToggleStatus = async (patio: PatioResponseDto) => {
    const novoStatus = patio.status === 'A' ? 'I' : 'A';
    const statusTexto = novoStatus === 'A' ? 'ATIVAR' : 'DESATIVAR';
    const statusAtual = patio.status === 'A' ? 'ATIVO' : 'INATIVO';
    
    const confirmacao = window.confirm(
      `🔄 Tem certeza que deseja ${statusTexto} o pátio "${patio.nomePatio}"?\n\n` +
      `Status atual: ${statusAtual}\n` +
      `Novo status: ${novoStatus === 'A' ? 'ATIVO' : 'INATIVO'}\n\n` +
      `Clique em OK para confirmar.`
    );
    
    if (!confirmacao) return;
    
    try {
      // Atualizar apenas o status usando o novo endpoint
      await PatioService.updateStatus(patio.idPatio, novoStatus);
      
      // Atualizar a lista local
      setPatios(patios.map(p => 
        p.idPatio === patio.idPatio 
          ? { ...p, status: novoStatus } 
          : p
      ));
      
      setError(null);
      
      // Mostrar mensagem de sucesso
      alert(`✅ Pátio "${patio.nomePatio}" ${statusTexto === 'ATIVAR' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Erro ao ${statusTexto.toLowerCase()} pátio.`;
      setError(errorMessage);
      alert(`❌ Erro: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pátio?')) return;
    
    try {
      await PatioService.delete(id);
      setPatios(patios.filter(p => p.idPatio !== id));
      setError(null); // Limpar erro anterior em caso de sucesso
    } catch (err: any) {
      let errorMessage = 'Erro ao excluir pátio.';
      
      if (err instanceof ResourceInUseException) {
        errorMessage = err.message;
      } else if (err instanceof ResourceNotFoundException) {
        errorMessage = err.message;
      } else if (err instanceof OperationNotAllowedException) {
        errorMessage = err.message;
      } else if (err instanceof ApiException) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    }
  };

  const handlePatioSelect = (patio: PatioResponseDto) => {
    // Redireciona para a página principal de gerenciamento com o pátio selecionado
    router.push(`/gerenciamento-patio?patioId=${patio.idPatio}&patioStatus=${patio.status}`);
  };

  const getFilteredData = () => {
    return patios.filter((item: PatioResponseDto) => {
      const searchFields = [item.nomePatio, item.observacao];
      const passesSearch = searchFields.some(field => 
        field && field.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const passesStatus = mostrarInativos || item.status === 'A';
      
      return passesSearch && passesStatus;
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

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 neumorphic-container">
            <div className="flex flex-col gap-4">
              {/* Search */}
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
              
              {/* Filtro de Status */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <i className="ion-ios-eye text-blue-600 text-xl"></i>
                  <span className="text-sm font-semibold text-slate-700">Exibir pátios inativos</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarInativos}
                    onChange={(e) => setMostrarInativos(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Contador de Pátios */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{patios.filter(p => p.status === 'A').length} Ativos</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>{patios.filter(p => p.status === 'I').length} Inativos</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>{getFilteredData().length} Exibidos</span>
                </div>
              </div>
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
                <div 
                  key={item.idPatio} 
                  className={`neumorphic-card-gradient p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer ${
                    item.status === 'I' ? 'opacity-75 border-2 border-red-300' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-1 sm:gap-2 flex-1">
                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {item.idPatio}</span>
                      </div>
                      {/* Badge de Status */}
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        item.status === 'A' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white animate-pulse'
                      }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                        {item.status === 'A' ? '✓ ATIVO' : '✕ INATIVO'}
                      </span>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2 mb-3" title={item.nomePatio} style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <i className="ion-ios-home text-blue-500 text-base sm:text-lg"></i>
                      {item.nomePatio}
                    </h2>
                    
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                      <div className="flex items-center">
                        <i className="ion-ios-calendar text-indigo-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Cadastro:</span>
                        <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="ion-ios-call text-green-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Contatos:</span>
                        <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>{item.contato ? 1 : 0}</strong></span>
                      </div>
                      
                      <div className="flex items-center">
                        <i className="ion-ios-pin text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Endereços:</span>
                        <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>{item.endereco ? 1 : 0}</strong></span>
                      </div>
                      
                      {item.observacao && (
                        <div className="flex items-center">
                          <i className="ion-ios-document text-orange-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                          <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Obs:</span>
                          <span className="text-slate-500 truncate ml-1 sm:ml-2 text-xs sm:text-sm line-clamp-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{item.observacao}</span>
                        </div>
                      )}
                    </div>
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
                      onClick={() => handleToggleStatus(item)} 
                      className={`p-1.5 sm:p-2 rounded-full hover:scale-110 transition-all duration-300 transform hover:-translate-y-1 ${
                        item.status === 'A' 
                          ? 'text-orange-500 hover:bg-orange-100' 
                          : 'text-green-500 hover:bg-green-100'
                      }`}
                      title={item.status === 'A' ? 'Desativar Pátio' : 'Ativar Pátio'}
                    >
                      <i className={`text-sm sm:text-lg ${
                        item.status === 'A' 
                          ? 'ion-ios-power text-orange-500' 
                          : 'ion-ios-power text-green-500'
                      }`}></i>
                    </button>
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
                          <i className="ion-ios-calendar text-indigo-500 text-xs sm:text-sm"></i>
                          <span>Cadastro</span>
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
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <div className="flex items-center gap-1">
                          <i className="ion-ios-checkmark-circle text-emerald-500 text-xs sm:text-sm"></i>
                          <span>Status</span>
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
                    {getPaginatedData().map((item: PatioResponseDto) => (
                      <tr key={item.idPatio} className={`hover:bg-slate-50 transition-all duration-300 hover:shadow-lg ${item.status === 'I' ? 'bg-red-50' : ''}`}>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{item.idPatio}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[150px] sm:max-w-none" style={{fontFamily: 'Montserrat, sans-serif'}}>
                          <div className="flex items-center gap-1">
                            <i className="ion-ios-home text-blue-500 text-xs"></i>
                            <span>{item.nomePatio}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 hidden sm:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                          <div className="flex items-center gap-1">
                            <i className="ion-ios-calendar text-indigo-500 text-xs"></i>
                            <span>{item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                          <div className="flex items-center gap-1">
                            <i className="ion-ios-call text-green-500 text-xs"></i>
                            <span>{item.contato ? 1 : 0}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900 hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                          <div className="flex items-center gap-1">
                            <i className="ion-ios-pin text-blue-500 text-xs"></i>
                            <span>{item.endereco ? 1 : 0}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                            item.status === 'A' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                            {item.status === 'A' ? '✓ ATIVO' : '✕ INATIVO'}
                          </span>
                        </td>
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
                              onClick={() => handleToggleStatus(item)} 
                              className={`p-1 rounded-full hover:scale-110 transition-all duration-300 transform hover:-translate-y-1 ${
                                item.status === 'A' 
                                  ? 'text-orange-500 hover:bg-orange-100' 
                                  : 'text-green-500 hover:bg-green-100'
                              }`}
                              title={item.status === 'A' ? 'Desativar Pátio' : 'Ativar Pátio'}
                            >
                              <i className={`text-sm sm:text-lg ${
                                item.status === 'A' 
                                  ? 'ion-ios-power text-orange-500' 
                                  : 'ion-ios-power text-green-500'
                              }`}></i>
                            </button>
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

