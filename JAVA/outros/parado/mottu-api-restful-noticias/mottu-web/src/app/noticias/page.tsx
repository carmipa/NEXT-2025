'use client';

import { useState, useEffect } from 'react';
import { Calendar, Eye, ExternalLink, RefreshCw, Grid3X3, Layout } from 'lucide-react';
import Link from 'next/link';
import ParticleBackground from '@/components/particula/ParticleBackground';
import '@/types/styles/neumorphic.css';

interface Noticia {
  id: number;
  titulo: string;
  resumo: string;
  urlOrigem: string;
  urlImagem?: string;
  fonte: string;
  autor: string;
  dataPublicacao: string;
  dataCaptura: string;
  visualizacoes: number;
  ativo: boolean;
}

// Interface simplificada - apenas notícias

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [lastSync, setLastSync] = useState('--:--:--');
  const [visualizacao, setVisualizacao] = useState<'lista' | 'cards'>('lista');

  const ITEMS_PER_PAGE = 10;

  // Buscar notícias
  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: ITEMS_PER_PAGE.toString(),
        sort: 'dataCaptura,desc'
      });

      const response = await fetch(`http://localhost:8080/api/noticias?${params}`);
      const data = await response.json();
      
      setNoticias(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };


  // Capturar notícias
  const capturarNoticias = async (fonte?: string) => {
    try {
      setCapturing(true);
      const endpoint = fonte ? `/capturar/${fonte.toLowerCase().replace(' ', '-')}` : '/capturar/todas';
      const response = await fetch(`http://localhost:8080/api/noticias${endpoint}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchNoticias();
        setLastSync(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao capturar notícias:', error);
    } finally {
      setCapturing(false);
    }
  };

  // Incrementar visualizações
  const incrementarVisualizacoes = async (id: number) => {
    try {
      await fetch(`http://localhost:8080/api/noticias/${id}/visualizar`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  };

  // Efeitos
  useEffect(() => {
    fetchNoticias();
  }, [currentPage]);

  const handleNoticiaClick = (noticia: Noticia) => {
    incrementarVisualizacoes(noticia.id);
    window.open(noticia.urlOrigem, '_blank');
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black relative" style={{backgroundColor: '#000000'}}>
      <ParticleBackground />
      
      <div className="relative z-20 container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="neumorphic-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  📰 Central de Notícias Mottu
                </h1>
                <p className="text-gray-600 text-sm">
                  Acompanhe as últimas notícias sobre a Mottu em tempo real
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Botões de Visualização */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setVisualizacao('lista')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      visualizacao === 'lista'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Layout size={16} />
                    <span>Lista</span>
                  </button>
                  <button
                    onClick={() => setVisualizacao('cards')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      visualizacao === 'cards'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    <span>Cards</span>
                  </button>
                </div>

                {/* Botão de Captura */}
                <button
                  onClick={() => capturarNoticias()}
                  disabled={capturing}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start transition-colors"
                  title="Capturar notícias de todas as fontes"
                >
                  <RefreshCw size={16} className={capturing ? 'animate-spin' : ''} />
                  <span>{capturing ? 'Capturando...' : 'Atualizar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          {loading ? (
            <div className="neumorphic-container">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando notícias...</p>
                </div>
              </div>
            </div>
          ) : noticias.length === 0 ? (
            <div className="neumorphic-container">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-gray-500 text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma notícia encontrada</h3>
                  <p className="text-gray-600 mb-4">Clique no botão abaixo para capturar novas notícias</p>
                  <button
                    onClick={() => capturarNoticias()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Capturar Notícias
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={visualizacao === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {noticias.map((noticia) => (
                <div
                  key={noticia.id}
                  className={`neumorphic-container hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    visualizacao === 'cards' ? 'p-4' : 'p-6'
                  }`}
                  onClick={() => handleNoticiaClick(noticia)}
                >
                  {visualizacao === 'cards' ? (
                    // Visualização em Cards
                    <div className="space-y-3">
                      {noticia.urlImagem && (
                        <img
                          src={noticia.urlImagem}
                          alt={noticia.titulo}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {noticia.titulo}
                        </h3>
                        {noticia.resumo && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {noticia.resumo}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatarData(noticia.dataPublicacao)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {noticia.visualizacoes}
                          </div>
                          <span className="font-medium">{noticia.fonte}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Visualização em Lista
                    <div className="flex gap-4">
                      {/* Imagem */}
                      {noticia.urlImagem && (
                        <div className="flex-shrink-0">
                          <img
                            src={noticia.urlImagem}
                            alt={noticia.titulo}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            {noticia.titulo}
                          </h3>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>

                        {noticia.resumo && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {noticia.resumo}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatarData(noticia.dataPublicacao)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {noticia.visualizacoes}
                          </div>
                          <span className="font-medium">{noticia.fonte}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="neumorphic-container">
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dicas de Uso */}
          <div className="neumorphic-container">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <h3 className="text-lg font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Dicas de Uso
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-sm">Captura Automática:</strong>
                  <span className="text-xs text-gray-600 block mt-1">
                    O sistema captura notícias automaticamente das fontes configuradas a cada 30 minutos.
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-sm">Clique para Ler:</strong>
                  <span className="text-xs text-gray-600 block mt-1">
                    Clique nas notícias para abrir o link original e ler o conteúdo completo.
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-sm">Atualização Manual:</strong>
                  <span className="text-xs text-gray-600 block mt-1">
                    Use o botão "Atualizar" para capturar notícias imediatamente das fontes.
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong className="text-sm">Fontes Confiáveis:</strong>
                  <span className="text-xs text-gray-600 block mt-1">
                    LinkedIn, Facebook, YouTube, Instagram e sites oficiais da Mottu.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
