'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ZonaService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { 
  MapPin, 
  Plus, 
  Search, 
  Eye,
  ArrowLeft,
  Building,
  LayoutGrid,
  Table
} from 'lucide-react';
import { MdAdd, MdSearch, MdVisibility, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import '@/styles/neumorphic.css';
import '@/types/styles/neumorphic.css';

function ZonaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Estados dos dados
  const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
  const [patioInfo, setPatioInfo] = useState<{id: number, nome: string, status: string} | null>(null);
  
  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    const patioId = searchParams.get('patioId');
    const patioStatus = searchParams.get('patioStatus');
    const patioNome = searchParams.get('patioNome');
    
    if (patioId && patioStatus) {
      setPatioInfo({
        id: parseInt(patioId),
        nome: patioNome || 'Pátio',
        status: patioStatus
      });
      loadZonas(parseInt(patioId), patioStatus);
    } else {
      // Se não há parâmetros, carregar todas as zonas
      loadAllZonas();
    }
  }, [searchParams]);

  const loadAllZonas = async () => {
    try {
      setLoading(true);
      setError(null);
      // Carregar todas as zonas sem filtro de pátio
      const response = await ZonaService.listarPaginadoFiltrado({}, 0, 100);
      setZonas(response.content || []);
    } catch (err: any) {
      setError('Erro ao carregar zonas: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const loadZonas = async (patioId: number, patioStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ZonaService.listarPorPatio(patioId, patioStatus, 0, 100);
      setZonas(response.content || []);
    } catch (err: any) {
      setError('Erro ao carregar zonas: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Ações de edição/exclusão foram removidas conforme solicitação

  const getFilteredData = () => {
    return zonas.filter((item: ZonaResponseDto) => {
      const searchFields = [item.nome, item.observacao];
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
  };

  // Ação de "ver boxes desta zona" removida

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
              <div className="p-3 rounded-lg bg-slate-700 text-green-400">
                <MapPin size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  Zonas{patioInfo ? ` - ${patioInfo.nome}` : ''}
                </h1>
                <p className="text-slate-300 mt-1">
                  {patioInfo ? 'Gerencie as zonas deste pátio' : 'Gerencie todas as zonas do sistema'}
                </p>
              </div>
            </div>

            <Link
              href="/gerenciamento-patio"
              className="btn btn-ghost"
            >
              <ArrowLeft size={18} className="text-blue-600" />
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
                title="Buscar zonas"
                aria-label="Buscar zonas"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {getPaginatedData().map((item: ZonaResponseDto) => (
                <div key={item.idZona} className="neumorphic-card-gradient p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                        ID: {item.idZona}
                      </span>
                      <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">
                        {item.nome}
                      </h2>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">
                      Status: <span className={`font-semibold ${item.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status === 'A' ? 'Ativa' : 'Inativa'}
                      </span>
                    </p>
                    
                    {item.observacao && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                    <Link 
                      href={`/zona/detalhes/${item.idZona}`}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100" 
                      title="Ver Detalhes"
                    >
                      <MdVisibility size={22}/>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Observação</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getPaginatedData().map((item: ZonaResponseDto) => (
                      <tr key={item.idZona} className="hover:bg-slate-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">{item.idZona}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.nome}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                          <span className={`font-semibold ${item.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.status === 'A' ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900 max-w-xs truncate">{item.observacao || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center gap-2">
                            <Link 
                              href={`/zona/detalhes/${item.idZona}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100" 
                              title="Ver Detalhes"
                            >
                              <MdVisibility size={18}/>
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <MdChevronLeft size={16} />
                  Anterior
                </button>

                {/* Números das páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                    let pageNum: number;
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === getTotalPages()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  Próximo
                  <MdChevronRight size={16} />
                </button>
              </div>

              {/* Pular para página específica */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Ir para página:</span>
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
                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-white"
                />
                <span>de {getTotalPages()}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {getFilteredData().length === 0 && (
            <div className="text-center py-12">
              <MapPin size={64} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-2">
                {searchTerm ? 'Nenhuma zona encontrada' : 'Nenhuma zona cadastrada'}
              </p>
              <p className="text-slate-400 text-sm">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando sua primeira zona'
                }
              </p>
            </div>
          )}
        </div>
      </main>
  );
}

export default function ZonaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen text-white p-4 md:p-8">
        <div className="container mx-auto neumorphic-container p-6 md:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Carregando zonas...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <ZonaContent />
    </Suspense>
  );
}

