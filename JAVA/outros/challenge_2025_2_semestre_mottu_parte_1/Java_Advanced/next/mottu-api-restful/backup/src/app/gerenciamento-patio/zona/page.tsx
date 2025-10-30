'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ZonaService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Building,
  LayoutGrid,
  Table
} from 'lucide-react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdVisibility, MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function ZonaPage() {
  const searchParams = useSearchParams();
  
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
      setError('Parâmetros de pátio não fornecidos');
      setLoading(false);
    }
  }, [searchParams]);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta zona?')) return;
    
    try {
      if (patioInfo) {
        await ZonaService.deletePorPatio(patioInfo.id, patioInfo.status, id);
        setZonas(zonas.filter(z => z.idZona !== id));
      }
    } catch (err: any) {
      setError('Erro ao excluir zona: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleZonaSelect = (zona: ZonaResponseDto) => {
    // Redireciona para a página principal de gerenciamento com a zona selecionada
    if (patioInfo) {
      router.push(`/gerenciamento-patio?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}&zonaId=${zona.idZona}`);
    }
  };

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

  if (!patioInfo) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
          <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
            <div className="text-center py-12">
              <Building size={64} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-2">Pátio não encontrado</p>
              <p className="text-slate-400 text-sm mb-4">Selecione um pátio para gerenciar suas zonas</p>
              <Link
                href="/gerenciamento-patio"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <ArrowLeft size={18} />
                Voltar ao Gerenciamento
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-700 text-green-400">
                <MapPin size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  Zonas - {patioInfo.nome}
                </h1>
                <p className="text-slate-300 mt-1">
                  Gerencie as zonas deste pátio
                </p>
              </div>
            </div>

            <Link
              href="/gerenciamento-patio"
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
            >
              <ArrowLeft size={18} />
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
          <div className="mb-8 p-4 bg-black/20 rounded-lg">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar zonas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

          {/* Action Button */}
          <div className="mb-8 flex justify-end">
            <Link
              href={`/zona/cadastrar?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors"
            >
              <MdAdd size={20} />
              Nova Zona
            </Link>
          </div>

          {/* Data List */}
          {viewType === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPaginatedData().map((item: ZonaResponseDto) => (
                <div key={item.idZona} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
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
                    <Link 
                      href={`/zona/alterar/${item.idZona}?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
                      className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" 
                      title="Editar"
                    >
                      <MdEdit size={20}/>
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.idZona)} 
                      className="p-2 rounded-full text-red-500 hover:bg-red-100" 
                      title="Excluir"
                    >
                      <MdDelete size={20}/>
                    </button>
                    
                    {/* Botão para ver boxes desta zona */}
                    <button
                      onClick={() => handleZonaSelect(item)}
                      className="p-2 rounded-full text-purple-600 hover:bg-purple-100"
                      title="Ver Boxes desta Zona"
                    >
                      <MapPin size={20}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                            <Link 
                              href={`/zona/alterar/${item.idZona}?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
                              className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100" 
                              title="Editar"
                            >
                              <MdEdit size={16}/>
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.idZona)} 
                              className="p-1 rounded-full text-red-500 hover:bg-red-100" 
                              title="Excluir"
                            >
                              <MdDelete size={16}/>
                            </button>
                            <button
                              onClick={() => handleZonaSelect(item)}
                              className="p-1 rounded-full text-purple-600 hover:bg-purple-100"
                              title="Ver Boxes desta Zona"
                            >
                              <MapPin size={16}/>
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
    </>
  );
}

