'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { 
  Building,
  LayoutGrid,
  Table
} from 'lucide-react';
import { MdEdit } from 'react-icons/md';
import ModernPagination from '@/components/ModernPagination';
import '@/styles/neumorphic.css';
import '@/types/styles/neumorphic.css';

export default function SelecionarPatioParaEditarBoxesPage() {
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
      const response = await PatioService.listarPaginadoFiltrado({}, 0, 1000);
      const patiosOrdenados = (response.content || []).sort((a, b) => 
        a.nomePatio.localeCompare(b.nomePatio, 'pt-BR', { sensitivity: 'base' })
      );
      setPatios(patiosOrdenados);
    } catch (err: any) {
      setError('Erro ao carregar pátios: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    return patios.filter((patio: PatioResponseDto) => {
      const passesSearch = [patio.nomePatio, patio.endereco?.cidade]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const passesStatus = mostrarInativos || patio.status === 'A';
      
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                <i className="ion-ios-cube text-white text-2xl lg:text-3xl"></i>
              </div>
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Editar Boxes em Lote
                </h1>
                <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Selecione um pátio para editar seus boxes em lote
                </p>
              </div>
            </div>
            
            <Link
              href="/gerenciamento-patio/box"
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

        {/* Filtros */}
        <div className="mb-8 neumorphic-container">
          <div className="flex flex-col gap-4">
            {/* Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar pátios"
                title="Buscar pátios"
                aria-label="Buscar pátios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neumorphic-input px-4 w-full"
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

        {/* Data List */}
        {viewType === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
            {getPaginatedData().map((patio: PatioResponseDto) => (
              <div 
                key={patio.idPatio} 
                className={`neumorphic-card-gradient p-4 lg:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 ${
                  patio.status === 'I' ? 'opacity-75 border-2 border-red-300' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-2 flex-1">
                      <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {patio.idPatio}</span>
                    </div>
                    {/* Badge de Status no canto superior direito */}
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      patio.status === 'A' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white animate-pulse'
                    }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                      {patio.status === 'A' ? '✓ ATIVO' : '✕ INATIVO'}
                    </span>
                  </div>
                  
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2 mb-3" title={patio.nomePatio} style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <i className="ion-ios-home text-purple-500 text-base sm:text-lg"></i>
                    {patio.nomePatio}
                  </h2>
                  
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                    
                    {patio.endereco?.cidade && (
                      <div className="flex items-center">
                        <i className="ion-ios-map text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Cidade:</span>
                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{patio.endereco.cidade}</span>
                      </div>
                    )}
                  </div>
                  
                </div>
                
                <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                  <Link 
                    href={`/box/alterar/${patio.idPatio}`}
                    className="p-1.5 lg:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1" 
                    title="Editar Boxes em Lote"
                  >
                    <MdEdit size={18} className="lg:w-6 lg:h-6"/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="neumorphic-container overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <div className="flex items-center gap-1">
                        <i className="ion-ios-information-circle text-purple-500 text-xs sm:text-sm" style={{ display: 'inline-block', visibility: 'visible', opacity: 1 }}></i>
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <div className="flex items-center gap-1">
                        <i className="ion-ios-home text-purple-500 text-xs sm:text-sm"></i>
                        <span>Pátio</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <div className="flex items-center gap-1">
                        <i className="ion-ios-map text-blue-500 text-xs sm:text-sm"></i>
                        <span>Cidade</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <div className="flex items-center gap-1">
                        <i className="ion-ios-checkmark-circle text-emerald-500 text-xs sm:text-sm"></i>
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      <div className="flex items-center justify-center gap-1">
                        <i className="ion-ios-settings text-gray-500 text-xs sm:text-sm"></i>
                        <span>Ação</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {getPaginatedData().map((patio: PatioResponseDto) => (
                    <tr key={patio.idPatio} className={`hover:bg-slate-50 ${patio.status === 'I' ? 'bg-red-50' : ''}`}>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <div className="flex items-center gap-1">
                          <i className="ion-ios-information-circle text-purple-500 text-xs"></i>
                          <span>{patio.idPatio}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <div className="flex items-center gap-1">
                          <i className="ion-ios-home text-purple-500 text-xs"></i>
                          <span>{patio.nomePatio}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <div className="flex items-center gap-1">
                          <i className="ion-ios-map text-blue-500 text-xs"></i>
                          <span>{patio.endereco?.cidade || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                          patio.status === 'A' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                          {patio.status === 'A' ? '✓ ATIVO' : '✕ INATIVO'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-center text-xs lg:text-sm font-medium">
                        <Link 
                          href={`/box/alterar/${patio.idPatio}`}
                          className="p-1 lg:p-1.5 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 transform hover:-translate-y-1 inline-block" 
                          title="Editar Boxes em Lote"
                        >
                          <MdEdit size={16} className="lg:w-5 lg:h-5"/>
                        </Link>
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
          <div className="mt-4 lg:mt-6">
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
          <div className="text-center py-12">
            <Building size={64} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 text-lg mb-2">
              {searchTerm ? 'Nenhum pátio encontrado' : 'Nenhum pátio cadastrado'}
            </p>
            <p className="text-slate-400 text-sm">
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
