'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { BoxService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { 
  Grid3X3, 
  Plus, 
  Search, 
  ArrowLeft,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';

export default function BoxPage() {
  const searchParams = useSearchParams();
  
  // Estados dos dados
  const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
  const [patioInfo, setPatioInfo] = useState<{id: number, nome: string, status: string} | null>(null);
  
  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
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
      loadBoxes(parseInt(patioId), patioStatus);
    } else {
      setError('Parâmetros de pátio não fornecidos');
      setLoading(false);
    }
  }, [searchParams]);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este box?')) return;
    
    try {
      if (patioInfo) {
        await BoxService.deletePorPatio(patioInfo.id, patioInfo.status, id);
        setBoxes(boxes.filter(b => b.idBox !== id));
      }
    } catch (err: any) {
      setError('Erro ao excluir box: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const getFilteredData = () => {
    return boxes.filter((item: BoxResponseDto) => {
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
              <p className="text-slate-400 text-sm mb-4">Selecione um pátio para gerenciar seus boxes</p>
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
              <div className="p-3 rounded-lg bg-slate-700 text-purple-400">
                <Grid3X3 size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  Boxes - {patioInfo.nome}
                </h1>
                <p className="text-slate-300 mt-1">
                  Gerencie os boxes deste pátio
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
                placeholder="Buscar boxes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex justify-end gap-4">
            <Link
              href={`/box/gerar?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition-colors"
            >
              <Plus size={20} />
              Gerar em Lote
            </Link>
            <Link
              href={`/box/cadastrar?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors"
            >
              <MdAdd size={20} />
              Novo Box
            </Link>
          </div>

          {/* Data List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredData().map((item: BoxResponseDto) => (
              <div key={item.idBox} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">
                      ID: {item.idBox}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">
                      {item.nome}
                    </h2>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    Status: <span className={`font-semibold flex items-center gap-1 ${item.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.status === 'L' ? (
                        <>
                          <CheckCircle size={14} />
                          Livre
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Ocupado
                        </>
                      )}
                    </span>
                  </p>
                  
                  {item.dataEntrada && (
                    <p className="text-sm text-slate-500 mb-1">
                      Entrada: {new Date(item.dataEntrada).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  
                  {item.dataSaida && (
                    <p className="text-sm text-slate-500 mb-1">
                      Saída: {new Date(item.dataSaida).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  
                  {item.observacao && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.observacao}</p>
                  )}
                </div>
                
                <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                  <Link 
                    href={`/box/detalhes/${item.idBox}`}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100" 
                    title="Ver Detalhes"
                  >
                    <MdVisibility size={22}/>
                  </Link>
                  <Link 
                    href={`/box/alterar/${item.idBox}?patioId=${patioInfo.id}&patioStatus=${patioInfo.status}`}
                    className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" 
                    title="Editar"
                  >
                    <MdEdit size={20}/>
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.idBox)} 
                    className="p-2 rounded-full text-red-500 hover:bg-red-100" 
                    title="Excluir"
                  >
                    <MdDelete size={20}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {getFilteredData().length === 0 && (
            <div className="text-center py-12">
              <Grid3X3 size={64} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-2">
                {searchTerm ? 'Nenhum box encontrado' : 'Nenhum box cadastrado'}
              </p>
              <p className="text-slate-400 text-sm">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro box ou gerando em lote'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

