"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
// Removendo lucide-react e usando apenas Ionicons
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface OcupacaoData {
  patioId: number;
  nomePatio: string;
  ocupacaoAtual: number;
  ocupacaoMedia: number;
  ocupacaoMaxima: number;
  tendencia: 'crescendo' | 'estavel' | 'diminuindo';
  horariosPico: Array<{
    horario: string;
    ocupacao: number;
    intensidade: number;
  }>;
  boxes: Array<{
    boxId: number;
    nome: string;
    status: 'ocupado' | 'livre' | 'manutencao';
    tempoOcupacao?: number;
  }>;
  coordenadas: {
    lat: number;
    lng: number;
  };
}

interface OcupacaoHeatmapProps {
  patioId?: number;
  periodo: 'hoje' | 'semana' | 'mes';
  onPatioSelect?: (patioId: number) => void;
}

export default function OcupacaoHeatmap({ patioId, periodo, onPatioSelect }: OcupacaoHeatmapProps) {
  const [dados, setDados] = useState<OcupacaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'alta' | 'media' | 'baixa'>('todos');
  const [viewMode, setViewMode] = useState<'heatmap' | 'grafico' | 'tabela'>('heatmap');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchOcupacaoData();
  }, [periodo, patioId]);

  const fetchOcupacaoData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados reais dos pátios do backend
      const patiosResponse = await fetch('/api/patios/search');
      if (!patiosResponse.ok) {
        throw new Error('Falha ao carregar pátios');
      }
      const patiosData = await patiosResponse.json();
      const patios = patiosData.content || [];

      // Buscar dados reais dos boxes para cada pátio
      const ocupacaoData: OcupacaoData[] = [];
      
      for (const patio of patios) {
        try {
          // Buscar boxes do pátio
          const boxesResponse = await fetch(`/api/vagas/mapa?patioId=${patio.idPatio}`);
          const boxesData = await boxesResponse.json();
          const boxes = boxesData.boxes || [];

          // Calcular ocupação real
          const totalBoxes = boxes.length;
          const boxesOcupados = boxes.filter((box: any) => box.status === 'O').length;
          const ocupacaoAtual = totalBoxes > 0 ? Math.round((boxesOcupados / totalBoxes) * 100) : 0;

          // Simular dados históricos baseados na ocupação atual
          const ocupacaoMedia = Math.max(0, ocupacaoAtual - Math.floor(Math.random() * 20));
          const ocupacaoMaxima = Math.min(100, ocupacaoAtual + Math.floor(Math.random() * 15));
          
          // Determinar tendência baseada na ocupação atual
          let tendencia: 'crescendo' | 'estavel' | 'diminuindo';
          if (ocupacaoAtual >= 80) {
            tendencia = Math.random() > 0.5 ? 'crescendo' : 'estavel';
          } else if (ocupacaoAtual <= 30) {
            tendencia = Math.random() > 0.5 ? 'diminuindo' : 'estavel';
          } else {
            const rand = Math.random();
            tendencia = rand > 0.66 ? 'crescendo' : rand > 0.33 ? 'diminuindo' : 'estavel';
          }

          ocupacaoData.push({
            patioId: patio.idPatio,
            nomePatio: patio.nomePatio,
            ocupacaoAtual,
            ocupacaoMedia,
            ocupacaoMaxima,
            tendencia,
            horariosPico: [
              { horario: "08:00", ocupacao: Math.max(0, ocupacaoAtual - 5), intensidade: ocupacaoAtual },
              { horario: "12:00", ocupacao: ocupacaoAtual, intensidade: ocupacaoAtual },
              { horario: "17:00", ocupacao: Math.min(100, ocupacaoAtual + 5), intensidade: ocupacaoAtual },
            ],
            boxes: boxes.map((box: any, index: number) => ({
              boxId: box.idBox,
              nome: box.nome,
              status: box.status === 'O' ? 'ocupado' : 'livre',
              tempoOcupacao: box.status === 'O' ? Math.floor(Math.random() * 480) : undefined,
            })),
            coordenadas: {
              lat: patio.endereco?.cidade === 'São Paulo' ? -23.5505 : -23.4538,
              lng: patio.endereco?.cidade === 'São Paulo' ? -46.6333 : -46.5334
            }
          });
        } catch (error) {
          console.warn(`Erro ao carregar dados do pátio ${patio.idPatio}:`, error);
        }
      }

      setDados(ocupacaoData);
    } catch (error) {
      console.error('Erro ao carregar dados de ocupação:', error);
    } finally {
      setLoading(false);
    }
  };

  const dadosFiltrados = useMemo(() => {
    if (filtro === 'todos') return dados;
    
    return dados.filter(patio => {
      switch (filtro) {
        case 'alta':
          return patio.ocupacaoAtual >= 80;
        case 'media':
          return patio.ocupacaoAtual >= 50 && patio.ocupacaoAtual < 80;
        case 'baixa':
          return patio.ocupacaoAtual < 50;
        default:
          return true;
      }
    });
  }, [dados, filtro]);

  // Funções de paginação
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dadosFiltrados.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(dadosFiltrados.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset da página quando mudar o filtro ou viewMode
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, viewMode]);

  const getOcupacaoColor = (ocupacao: number) => {
    if (ocupacao >= 90) return 'bg-red-500';
    if (ocupacao >= 80) return 'bg-orange-500';
    if (ocupacao >= 60) return 'bg-yellow-500';
    if (ocupacao >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getOcupacaoTextColor = (ocupacao: number) => {
    if (ocupacao >= 80) return 'text-white';
    return 'text-gray-900';
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescendo':
        return <i className="ion-ios-trending-up text-red-500 text-lg"></i>;
      case 'diminuindo':
        return <i className="ion-ios-trending-down text-green-500 text-lg"></i>;
      default:
        return <i className="ion-ios-time text-blue-500 text-lg"></i>;
    }
  };

  const getTendenciaText = (tendencia: string) => {
    switch (tendencia) {
      case 'crescendo':
        return 'Crescendo';
      case 'diminuindo':
        return 'Diminuindo';
      default:
        return 'Estável';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Heatmap de Ocupação</h2>
          <p className="text-gray-600">Análise visual da ocupação dos pátios</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="ion-ios-funnel text-gray-500 text-lg"></i>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos</option>
              <option value="alta">Alta Ocupação (≥80%)</option>
              <option value="media">Média Ocupação (50-79%)</option>
              <option value="baixa">Baixa Ocupação (&lt;50%)</option>
            </select>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('heatmap')}
            >
              Heatmap
            </Button>
            <Button
              variant={viewMode === 'grafico' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grafico')}
            >
              Gráfico
            </Button>
            <Button
              variant={viewMode === 'tabela' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tabela')}
            >
              Tabela
            </Button>
          </div>
        </div>
      </div>

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPaginatedData().map((patio) => (
            <Card 
              key={patio.patioId} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                patioId === patio.patioId ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onPatioSelect?.(patio.patioId)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{patio.nomePatio}</span>
                  <div className="flex items-center space-x-2">
                    {getTendenciaIcon(patio.tendencia)}
                    <span className="text-xs text-gray-500">
                      {getTendenciaText(patio.tendencia)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Ocupação Atual */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Ocupação Atual</span>
                    <span className="text-lg font-bold">{patio.ocupacaoAtual}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${getOcupacaoColor(patio.ocupacaoAtual)}`}
                      style={{ width: `${patio.ocupacaoAtual}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Média</div>
                    <div className="text-lg font-semibold">{patio.ocupacaoMedia}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Máxima</div>
                    <div className="text-lg font-semibold">{patio.ocupacaoMaxima}%</div>
                  </div>
                </div>

                {/* Boxes Status */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Status dos Boxes</div>
                  <div className="grid grid-cols-5 gap-1">
                    {patio.boxes.slice(0, 10).map((box) => (
                      <div
                        key={box.boxId}
                        className={`h-6 rounded text-xs flex items-center justify-center ${
                          box.status === 'ocupado' 
                            ? 'bg-red-500 text-white' 
                            : box.status === 'manutencao'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                        title={`${box.nome} - ${box.status}`}
                      >
                        {box.boxId}
                      </div>
                    ))}
                    {patio.boxes.length > 10 && (
                      <div className="h-6 rounded bg-gray-300 text-xs flex items-center justify-center">
                        +{patio.boxes.length - 10}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {/* Paginação para Heatmap */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={dadosFiltrados.length}
          />
        </div>
      )}

      {/* Gráfico View */}
      {viewMode === 'grafico' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPaginatedData().map((patio) => (
              <Card 
                key={patio.patioId} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  patioId === patio.patioId ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onPatioSelect?.(patio.patioId)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{patio.nomePatio}</span>
                    <div className="flex items-center space-x-2">
                      {getTendenciaIcon(patio.tendencia)}
                      <span className="text-xs text-gray-500">
                        {getTendenciaText(patio.tendencia)}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        {
                          nome: 'Ocupação Atual',
                          valor: patio.ocupacaoAtual,
                          cor: '#3b82f6'
                        },
                        {
                          nome: 'Ocupação Média',
                          valor: patio.ocupacaoMedia,
                          cor: '#10b981'
                        },
                        {
                          nome: 'Ocupação Máxima',
                          valor: patio.ocupacaoMaxima,
                          cor: '#f59e0b'
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Ocupação']}
                        />
                        <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {[
                            { nome: 'Ocupação Atual', valor: patio.ocupacaoAtual, cor: '#3b82f6' },
                            { nome: 'Ocupação Média', valor: patio.ocupacaoMedia, cor: '#10b981' },
                            { nome: 'Ocupação Máxima', valor: patio.ocupacaoMaxima, cor: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Atual</div>
                      <div className="text-lg font-semibold">{patio.ocupacaoAtual}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Média</div>
                      <div className="text-lg font-semibold">{patio.ocupacaoMedia}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Máxima</div>
                      <div className="text-lg font-semibold">{patio.ocupacaoMaxima}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Paginação para Gráfico */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={dadosFiltrados.length}
          />
        </div>
      )}

      {/* Tabela View */}
      {viewMode === 'tabela' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados de Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">Pátio</th>
                      <th className="text-center py-3 px-2">Atual</th>
                      <th className="text-center py-3 px-2">Média</th>
                      <th className="text-center py-3 px-2">Máxima</th>
                      <th className="text-center py-3 px-2">Tendência</th>
                      <th className="text-center py-3 px-2">Boxes</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().map((patio) => (
                    <tr key={patio.patioId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{patio.nomePatio}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patio.ocupacaoAtual >= 80 
                            ? 'bg-red-100 text-red-800' 
                            : patio.ocupacaoAtual >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {patio.ocupacaoAtual}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">{patio.ocupacaoMedia}%</td>
                      <td className="py-3 px-2 text-center">{patio.ocupacaoMaxima}%</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {getTendenciaIcon(patio.tendencia)}
                          <span className="text-xs">{getTendenciaText(patio.tendencia)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {patio.boxes.length} total
                        <br />
                        <span className="text-xs text-gray-500">
                          {patio.boxes.filter(b => b.status === 'ocupado').length} ocupados
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={
                          patio.ocupacaoAtual >= 90 
                            ? 'bg-red-100 text-red-800' 
                            : patio.ocupacaoAtual >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }>
                          {patio.ocupacaoAtual >= 90 ? 'Crítico' : 
                           patio.ocupacaoAtual >= 70 ? 'Alto' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Paginação para Tabela */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={dadosFiltrados.length}
          />
        </div>
      )}
    </div>
  );
}
