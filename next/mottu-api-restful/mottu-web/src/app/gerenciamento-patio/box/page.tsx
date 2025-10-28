'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BoxService, PatioService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { PatioResponseDto } from '@/types/patio';
import { 
  Grid3X3, 
  Search, 
  ArrowLeft,
  Building,
  CheckCircle,
  XCircle,
  LayoutGrid,
  Table
} from 'lucide-react';
import { MdVisibility } from 'react-icons/md';
import ModernPagination from '@/components/ModernPagination';
import '@/styles/neumorphic.css';

function BoxPageContent() {
  const searchParams = useSearchParams();
  
  // Estados dos dados
  const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
  const [patioInfo, setPatioInfo] = useState<{id: number, nome: string, status: string} | null>(null);
  const [availablePatios, setAvailablePatios] = useState<Array<{ idPatio: number; nomePatio: string; status: string }>>([]);
  
  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [selectedPatioId, setSelectedPatioId] = useState<number | 'all'>('all');
  const normalize = (s: any) =>
    (s ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .trim();

  useEffect(() => {
    // Carregar lista de pátios para montar abas dinâmicas
    const loadPatios = async () => {
      try {
        const patiosPage = await PatioService.listarPaginadoFiltrado({}, 0, 1000);
        const patios = (patiosPage.content || []).map((p: PatioResponseDto) => ({ idPatio: p.idPatio, nomePatio: p.nomePatio, status: p.status }));
        setAvailablePatios(patios);
      } catch {}
    };

    const patioId = searchParams.get('patioId');
    const patioStatus = searchParams.get('patioStatus');
    const patioNome = searchParams.get('patioNome');

    if (patioId && patioStatus) {
      setPatioInfo({ id: parseInt(patioId), nome: patioNome || 'Pátio', status: patioStatus });
      setSelectedPatioId(parseInt(patioId));
      loadBoxes(parseInt(patioId), patioStatus);
    } else {
      // Carregar todos os boxes (todas as páginas)
      loadAllBoxes();
    }

    loadPatios();
  }, [searchParams]);

  const loadAllBoxes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Buscar em lotes até acabar (páginas)
      const pageSize = 200;
      let page = 0;
      let all: BoxResponseDto[] = [];
      // Limite de segurança de 20 páginas (4000 itens)
      for (let i = 0; i < 20; i++) {
        const response = await BoxService.listarPaginadoFiltrado({}, page, pageSize);
        const content = response.content || [];
        all = all.concat(content);
        if (response.last || content.length < pageSize) break;
        page += 1;
      }
      setBoxes(all);
    } catch (err: any) {
      setError('Erro ao carregar boxes: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const loadBoxes = async (patioId: number, patioStatus: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BoxService.listarPorPatio(patioId, patioStatus, 0, 100);
      setBoxes(response.content || []);
    } catch (err: any) {
      setError('Erro ao carregar boxes: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Função de exclusão removida conforme solicitação

  const getFilteredData = () => {
    const q = normalize(searchTerm);
    return boxes.filter((item: BoxResponseDto) => {
      const haystack = [
        item.nome,
        item.observacao,
        item.patio?.nomePatio,
        item.status,
        String(item.idBox)
      ]
        .map(normalize)
        .join(' ');
      const passesSearch = q.length === 0 || haystack.includes(q);
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

  // Reset da página quando mudar o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Abas virão da lista de pátios carregada do backend
  const patiosDisponiveis = availablePatios;

  // Reagir à troca de aba
  useEffect(() => {
    if (selectedPatioId === 'all') {
      loadAllBoxes();
    } else {
      const patio = availablePatios.find(p => p.idPatio === selectedPatioId);
      if (patio) {
        setPatioInfo({ id: patio.idPatio, nome: patio.nomePatio, status: patio.status });
        loadBoxes(patio.idPatio, patio.status);
      } else if (typeof selectedPatioId === 'number') {
        // fallback sem status
        loadBoxes(selectedPatioId, 'A');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatioId]);

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
                  <i className="ion-ios-grid text-white text-2xl lg:text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    Boxes{patioInfo ? ` - ${patioInfo.nome}` : ''}
                  </h1>
                  <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    {patioInfo ? 'Gerencie os boxes deste pátio' : 'Gerencie todos os boxes do sistema'}
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
          <div className="mb-6 sm:mb-8 neumorphic-container">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                <input
                  type="text"
                  placeholder=""
                  title="Buscar boxes"
                  aria-label="Buscar boxes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neumorphic-input pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base"
                />
              </div>
              {/* Abas de pátio (dinâmicas) */}
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
                      title={`Filtrar boxes do ${p.nomePatio}`}
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
                  <LayoutGrid size={14} className="sm:w-4 sm:h-4" />
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
                  <Table size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tabela</span>
                  <span className="sm:hidden">T</span>
                </button>
              </div>
            </div>
          )}

          {viewType === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {getPaginatedData().map((item: BoxResponseDto) => (
                <div key={item.idBox} className="neumorphic-card-gradient p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                  <div>
                    <div className="flex items-center mb-2 sm:mb-3">
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                        ID: {item.idBox}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate">
                        {item.nome}
                      </h2>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">
                      Status: <span className={`font-semibold flex items-center gap-1 ${item.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status === 'L' ? (
                          <>
                            <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                            Livre
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                            Ocupado
                          </>
                        )}
                      </span>
                    </p>
                    
                    {item.dataEntrada && (
                      <p className="text-xs sm:text-sm text-slate-500 mb-1">
                        Entrada: {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    
                    {item.dataSaida && (
                      <p className="text-xs sm:text-sm text-slate-500 mb-1">
                        Saída: {new Date(item.dataSaida).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    
                    {item.observacao && (
                      <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                    )}

                    {/* Pátio do box */}
                    {item.patio?.nomePatio && (
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          <Building size={14} /> {item.patio.nomePatio}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end items-center gap-1 sm:gap-2 border-t border-slate-200 pt-2 sm:pt-3 mt-3 sm:mt-4">
                    <Link 
                      href={`/box/detalhes/${item.idBox}`}
                      className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100" 
                      title="Ver Detalhes"
                    >
                      <MdVisibility size={18} className="sm:w-5 sm:h-5"/>
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
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pátio</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Observação</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getPaginatedData().map((item: BoxResponseDto) => (
                      <tr key={item.idBox} className="hover:bg-slate-50">
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">{item.idBox}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">{item.nome}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">
                          <span className={`font-semibold ${item.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.status === 'L' ? 'Livre' : 'Ocupado'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-slate-900">{item.patio?.nomePatio || '-'}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 max-w-xs truncate hidden sm:table-cell">{item.observacao || '-'}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                          <div className="flex justify-center items-center gap-1 sm:gap-2">
                            <Link 
                              href={`/box/detalhes/${item.idBox}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100" 
                              title="Ver Detalhes"
                            >
                              <MdVisibility size={16} className="sm:w-4 sm:h-4"/>
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
              <Grid3X3 size={48} className="text-slate-400 mx-auto mb-4 sm:w-16 sm:h-16" />
              <p className="text-slate-300 text-base sm:text-lg mb-2">
                {searchTerm ? 'Nenhum box encontrado' : 'Nenhum box cadastrado'}
              </p>
              <p className="text-slate-400 text-sm sm:text-base">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro box ou gerando em lote'
                }
              </p>
            </div>
          )}
        </div>
      </main>
  );
}

export default function BoxPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    }>
      <BoxPageContent />
    </Suspense>
  );
}
