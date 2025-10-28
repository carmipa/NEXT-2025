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
import ModernPagination from '@/components/ModernPagination';
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
  const [selectedPatioId, setSelectedPatioId] = useState<number | 'all'>('all');

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
      const passesSearch = [item.nome, item.observacao, item.patio?.nomePatio]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
      const passesPatio = selectedPatioId === 'all' || item.patio?.idPatio === selectedPatioId;
      return passesSearch && passesPatio;
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

  // Derivar lista de pátios a partir das zonas carregadas
  const patiosDisponiveis = Array.from(new Map(
    zonas
      .filter(z => z.patio && z.patio.idPatio != null)
      .map(z => [z.patio!.idPatio, { idPatio: z.patio!.idPatio, nomePatio: z.patio!.nomePatio }])
  ).values()).sort((a, b) => a.nomePatio.localeCompare(b.nomePatio));

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
                  <i className="ion-ios-map text-white text-2xl lg:text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    Zonas{patioInfo ? ` - ${patioInfo.nome}` : ''}
                  </h1>
                  <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    {patioInfo ? 'Gerencie as zonas deste pátio' : 'Gerencie todas as zonas do sistema'}
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

          {/* Filtros */}
          <div className="mb-8 neumorphic-container">
            <div className="flex flex-col gap-3">
              {/* Busca */}
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
              {/* Abas de pátio (abaixo da busca, em linha com wrap) */}
              {patiosDisponiveis.length > 0 && (
                <div className="flex flex-row flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedPatioId('all')}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selectedPatioId === 'all' ? 'bg-emerald-600 text-white border-emerald-500' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  >
                    Todos os pátios
                  </button>
                  {patiosDisponiveis.map(p => (
                    <button
                      key={p.idPatio}
                      onClick={() => setSelectedPatioId(p.idPatio)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${selectedPatioId === p.idPatio ? 'bg-emerald-600 text-white border-emerald-500' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      title={`Filtrar zonas do ${p.nomePatio}`}
                    >
                      {p.nomePatio}
                    </button>
                  ))}
                </div>
              )}
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
              {getPaginatedData().map((item: ZonaResponseDto) => (
                <div key={item.idZona} className="neumorphic-card-gradient p-4 lg:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                        ID: {item.idZona}
                      </span>
                      <h2 className="text-base lg:text-xl font-bold text-[var(--color-mottu-dark)] truncate">
                        {item.nome}
                      </h2>
                    </div>
                    
                    <p className="text-xs lg:text-sm text-slate-600 mb-2">
                      Status: <span className={`font-semibold ${item.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status === 'A' ? 'Ativa' : 'Inativa'}
                      </span>
                    </p>
                    
                    {item.observacao && (
                      <p className="text-xs lg:text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                    )}
                    {/* Pátio da zona */}
                    {item.patio?.nomePatio && (
                      <div className="mt-2 text-xs lg:text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          <Building size={14} /> {item.patio.nomePatio}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                    <Link 
                      href={`/zona/detalhes/${item.idZona}`}
                      className="p-1.5 lg:p-2 rounded-full text-blue-600 hover:bg-blue-100" 
                      title="Ver Detalhes"
                    >
                      <MdVisibility size={18} className="lg:w-6 lg:h-6"/>
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
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pátio</th>
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Observação</th>
                      <th className="px-3 lg:px-4 py-2 lg:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getPaginatedData().map((item: ZonaResponseDto) => (
                      <tr key={item.idZona} className="hover:bg-slate-50">
                        <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900">{item.idZona}</td>
                        <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-slate-900">{item.nome}</td>
                        <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                          <span className={`font-semibold ${item.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.status === 'A' ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                          {item.patio?.nomePatio || '-'}
                        </td>
                        <td className="px-3 lg:px-4 py-3 lg:py-4 text-xs lg:text-sm text-slate-900 max-w-xs truncate hidden lg:table-cell">{item.observacao || '-'}</td>
                        <td className="px-3 lg:px-4 py-3 lg:py-4 whitespace-nowrap text-center text-xs lg:text-sm font-medium">
                          <div className="flex justify-center items-center gap-2">
                            <Link 
                              href={`/zona/detalhes/${item.idZona}`}
                              className="p-1 lg:p-1.5 rounded-full text-blue-600 hover:bg-blue-100" 
                              title="Ver Detalhes"
                            >
                              <MdVisibility size={16} className="lg:w-5 lg:h-5"/>
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

