'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// ParticleBackground removido - está no layout global
import { PatioService, ZonaService, BoxService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { BoxResponseDto } from '@/types/box';
import Pagination from '@/components/ui/pagination';
import '@/types/styles/neumorphic.css';

// Charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

type ViewType = 'cards' | 'table';
type ChartTab = 'patios' | 'zonas' | 'boxes';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-emerald-500 to-emerald-700',
    orange: 'from-orange-500 to-orange-700',
    purple: 'from-purple-500 to-purple-700',
    red: 'from-red-500 to-red-700'
  };

  return (
    <div className="neumorphic-container hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {trend === 'up' && <i className="ion-ios-trending-up text-green-500 mr-1"></i>}
              {trend === 'down' && <i className="ion-ios-trending-down text-red-500 mr-1"></i>}
              <span className={`text-sm ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]} text-white transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="neumorphic-container">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 font-montserrat">{title}</h3>
    {children}
  </div>
);

export default function GerenciamentoPatioPage() {
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<ViewType>('cards');
  const [activeTab, setActiveTab] = useState<ChartTab>('patios');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados dos dados
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);

  // Estados das métricas
  const [metrics, setMetrics] = useState({
    totalPatios: 0,
    totalZonas: 0,
    totalBoxes: 0,
    boxesOcupados: 0,
    taxaOcupacao: 0,
    patiosAtivos: 0,
    patiosInativos: 0
  });

  // Funções de paginação
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset da página quando mudar de aba
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
      
      // Carregar pátios
      const patiosResponse = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      const patiosData = patiosResponse.content || [];
      
      // Carregar zonas (de todos os pátios)
      let allZonas: ZonaResponseDto[] = [];
      for (const patio of patiosData) {
        try {
          const zonasResponse = await ZonaService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
          allZonas = [...allZonas, ...(zonasResponse.content || [])];
        } catch (err) {
          console.warn(`Erro ao carregar zonas do pátio ${patio.idPatio}:`, err);
        }
      }
      setZonas(allZonas);
      
      // Carregar boxes (de todos os pátios)
      let allBoxes: BoxResponseDto[] = [];
      for (const patio of patiosData) {
        try {
          const boxesResponse = await BoxService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
          allBoxes = [...allBoxes, ...(boxesResponse.content || [])];
        } catch (err) {
          console.warn(`Erro ao carregar boxes do pátio ${patio.idPatio}:`, err);
        }
      }
      setBoxes(allBoxes);
      
      // Calcular métricas
      const boxesOcupados = allBoxes.filter(box => box.status === 'O').length;
      const taxaOcupacao = allBoxes.length > 0 ? Math.round((boxesOcupados / allBoxes.length) * 100) : 0;
      
      setMetrics({
        totalPatios: patiosData.length,
        totalZonas: allZonas.length,
        totalBoxes: allBoxes.length,
        boxesOcupados,
        taxaOcupacao,
        patiosAtivos: patiosData.filter(p => p.status === 'ATIVO').length,
        patiosInativos: patiosData.filter(p => p.status !== 'ATIVO').length
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError('Erro ao carregar dados: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
    loadData();
  }, [loadData]);

  // Dados para gráficos de Pátios - cores vibrantes com cálculo logarítmico
  const patiosData = [metrics.patiosAtivos, metrics.patiosInativos, metrics.totalPatios - metrics.patiosAtivos - metrics.patiosInativos];
  const maxPatios = Math.max(...patiosData);
  const logPatiosData = patiosData.map(value => value > 0 ? Math.log(value + 1) * (maxPatios / Math.log(maxPatios + 1)) : 0);
  
  const patiosChartData = {
    labels: ['Ativos', 'Inativos', 'Manutenção'],
    datasets: [{
      data: logPatiosData,
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'], // Verde, Vermelho, Amarelo
      borderColor: ['#059669', '#DC2626', '#D97706'],
      borderWidth: 2
    }]
  };

  // Dados para gráficos de Zonas - cores vibrantes
  const zonasChartData = {
    labels: zonas.slice(0, 10).map(z => z.nome),
    datasets: [{
      label: 'Número de Boxes',
      data: zonas.slice(0, 10).map(z => boxes.filter(b => b.patio?.idPatio === z.patio?.idPatio).length),
      backgroundColor: [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ], // Azul, Vermelho, Verde, Amarelo, Roxo, Ciano, Lima, Laranja, Rosa, Índigo
      borderColor: [
        '#1D4ED8', '#DC2626', '#059669', '#D97706', '#7C3AED',
        '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
      ],
      borderWidth: 2
    }]
  };

  // Dados para gráficos de Boxes - cores vibrantes com cálculo logarítmico
  const boxesData = [
    boxes.filter(b => b.status === 'O').length,
    boxes.filter(b => b.status === 'L').length
  ];
  const maxBoxes = Math.max(...boxesData);
  const logBoxesData = boxesData.map(value => value > 0 ? Math.log(value + 1) * (maxBoxes / Math.log(maxBoxes + 1)) : 0);
  
  const boxesChartData = {
    labels: ['Ocupados', 'Livres'],
    datasets: [{
      data: logBoxesData,
      backgroundColor: ['#EF4444', '#10B981'], // Vermelho, Verde
      borderColor: ['#DC2626', '#059669'],
      borderWidth: 2
    }]
  };

  // Configurações dos gráficos - fundo branco e cores vibrantes
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'white',
    plugins: {
      legend: {
        labels: {
          color: '#333333',
          font: {
            family: 'Montserrat, sans-serif',
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#666666',
          font: {
            family: 'Montserrat, sans-serif',
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#666666',
          font: {
            family: 'Montserrat, sans-serif',
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'white',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            family: 'Montserrat, sans-serif',
            size: 12
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center relative">
        {/* ParticleBackground removido - está no layout global */}
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-montserrat">Carregando dashboard...</p>
        </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center relative">
        {/* ParticleBackground removido - está no layout global */}
        <div className="text-center relative z-10">
          <div className="text-red-400 text-6xl mb-4">
            <i className="ion-ios-warning"></i>
                                </div>
          <p className="text-white text-lg mb-4 font-montserrat">{error}</p>
          <button 
            onClick={loadData}
            className="neumorphic-button-green text-white"
          >
            <i className="ion-ios-refresh mr-2"></i>
            Tentar Novamente
                                    </button>
        </div>
                </div>
            );
        }

  return (
    <div className="min-h-screen  relative">
      {/* ParticleBackground removido - está no layout global */}
      
      <main className="p-6 space-y-8 relative z-10 pb-32">
        {/* Header Section */}
        <div className="neumorphic-container bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
          <div className="flex flex-col gap-4">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-2 font-montserrat">
                <i className="ion-ios-business mr-3"></i>
                Gerenciamento de Pátios
              </h1>
              <p className="text-emerald-100 text-lg font-montserrat">
                Dashboard executivo e controle operacional completo
              </p>
            </div>
            <Link
              href="/patio/novo-assistente"
              className="relative group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 hover:border-red-300 w-full sm:w-2/3 lg:w-2/5 self-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="relative flex items-center gap-3 justify-center">
                <div className="p-2 bg-white/25 rounded-full">
                  <i className="ion-ios-add text-xl"></i>
                </div>
                <div className="text-left">
                  <div className="text-lg font-black">NOVO PÁTIO</div>
                  <div className="text-xs text-red-100 font-semibold">Criar novo pátio</div>
                </div>
                <div className="ml-2">
                  <i className="ion-ios-arrow-forward text-lg group-hover:translate-x-1.5 transition-transform duration-300"></i>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            </Link>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <MetricCard
            title="Total de Pátios"
            value={metrics.totalPatios}
            change="+12%"
            icon="ion-ios-business"
            color="blue"
            trend="up"
          />
          <MetricCard
            title="Zonas Ativas"
            value={metrics.totalZonas}
            change="+8%"
            icon="ion-ios-map"
            color="green"
            trend="up"
          />
          <MetricCard
            title="Boxes Ocupados"
            value={`${metrics.boxesOcupados}/${metrics.totalBoxes}`}
            change="-5%"
            icon="ion-ios-grid"
            color="orange"
            trend="down"
          />
          <MetricCard
            title="Taxa de Ocupação"
            value={`${metrics.taxaOcupacao}%`}
            change="+3%"
            icon="ion-ios-pulse"
            color="purple"
            trend="up"
          />
                </div>

        {/* Controles de Visualização */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white font-montserrat">
              <i className="ion-ios-analytics mr-2"></i>
              Análises e Gráficos
            </h2>
                </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300 mr-2 font-montserrat">Visualização:</span>
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewType('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 ${
                  viewType === 'cards' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <i className="ion-ios-grid"></i>
                Cards
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 ${
                  viewType === 'table' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <i className="ion-ios-list"></i>
                Tabela
              </button>
            </div>
          </div>
                    </div>

        {/* Abas de Gráficos */}
        <div className="neumorphic-container">
          {/* Navegação das Abas */}
          <div className="flex border-b border-gray-300 mb-6">
            {[
              { key: 'patios', label: 'Pátios', icon: 'ion-ios-business' },
              { key: 'zonas', label: 'Zonas', icon: 'ion-ios-map' },
              { key: 'boxes', label: 'Boxes', icon: 'ion-ios-grid' }
            ].map((tab) => (
                                    <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ChartTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 font-montserrat hover:scale-105 ${
                  activeTab === tab.key
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-500 hover:bg-gray-50'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
                                    </button>
            ))}
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {activeTab === 'patios' && (
              <div>
                {viewType === 'cards' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Status dos Pátios">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Pie data={patiosChartData} options={pieChartOptions} />
                      </div>
                    </ChartCard>
                    <ChartCard title="Distribuição por Status">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Doughnut data={patiosChartData} options={pieChartOptions} />
                      </div>
                    </ChartCard>
                  </div>
                ) : (
        <div className="overflow-x-auto">
                    <table className="w-full rounded-lg neu-table">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Nome do Pátio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Zonas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Ações</th>
                    </tr>
                </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData(Array.from({ length: 50 }, (_, i) => ({ id: i + 1, nome: `Pátio ${i + 1}`, status: i % 2 === 0 ? 'Ativo' : 'Manutenção' }))).map((patio) => (
                          <tr key={patio.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-montserrat">
                              {patio.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                patio.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {patio.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-montserrat">
                              {Math.floor(Math.random() * 10) + 1} zonas
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/patio/detalhes/${patio.id}`} className="text-emerald-600 hover:text-emerald-900 mr-3">
                                <i className="ion-ios-eye"></i>
                                    </Link>
                              <Link href={`/patio/alterar/${patio.id}`} className="text-blue-600 hover:text-blue-900">
                                <i className="ion-ios-create"></i>
                                    </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                )}
                
                {/* Paginação para Pátios */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={getTotalPages(Array.from({ length: 50 }, (_, i) => ({ id: i + 1, nome: `Pátio ${i + 1}`, status: i % 2 === 0 ? 'Ativo' : 'Manutenção' })))}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={50}
                />
              </div>
            )}

            {activeTab === 'zonas' && (
              <div>
                {viewType === 'cards' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Boxes por Zona">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Bar data={zonasChartData} options={chartOptions} />
                      </div>
                    </ChartCard>
                    <ChartCard title="Distribuição de Zonas">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Pie data={patiosChartData} options={pieChartOptions} />
                      </div>
                    </ChartCard>
                  </div>
                ) : (
        <div className="overflow-x-auto">
                    <table className="w-full rounded-lg neu-table">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Nome da Zona</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Pátio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Boxes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Ações</th>
                    </tr>
                </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData(zonas).map((zona) => (
                          <tr key={zona.idZona} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-montserrat">
                              {zona.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-montserrat">
                              {zona.patio?.nomePatio || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-montserrat">
                              {boxes.filter(b => b.patio?.idPatio === zona.patio?.idPatio).length} boxes
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/zona/detalhes/${zona.idZona}`} className="text-emerald-600 hover:text-emerald-900 mr-3">
                                <i className="ion-ios-eye"></i>
                                    </Link>
                              <Link href={`/zona/alterar/${zona.idZona}`} className="text-blue-600 hover:text-blue-900">
                                <i className="ion-ios-create"></i>
                                    </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                )}
                
                {/* Paginação para Zonas */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={getTotalPages(zonas)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={zonas.length}
                />
                            </div>
                        )}
                        
            {activeTab === 'boxes' && (
              <div>
                {viewType === 'cards' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Status dos Boxes">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Pie data={boxesChartData} options={pieChartOptions} />
                      </div>
                    </ChartCard>
                    <ChartCard title="Ocupação por Status">
                      <div className="h-64 bg-white rounded-lg p-4">
                        <Bar 
                          data={{
                            labels: ['Ocupados', 'Livres'],
                            datasets: [{
                              label: 'Quantidade',
                              data: [
                                boxes.filter(b => b.status === 'O').length,
                                boxes.filter(b => b.status === 'L').length
                              ],
                              backgroundColor: ['#EF4444', '#10B981'] // Vermelho, Verde
                            }]
                          }} 
                          options={chartOptions} 
                        />
                      </div>
                    </ChartCard>
                  </div>
                ) : (
        <div className="overflow-x-auto">
                    <table className="w-full rounded-lg neu-table">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Pátio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Ações</th>
                    </tr>
                </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData(boxes).map((box) => (
                          <tr key={box.idBox} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-montserrat">{box.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                box.status === 'O' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {box.status === 'O' ? 'Ocupado' : 'Livre'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-montserrat">{box.patio?.nomePatio || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/box/detalhes/${box.idBox}`} className="text-emerald-600 hover:text-emerald-900 mr-3">
                                <i className="ion-ios-eye"></i>
                                    </Link>
                              <Link href={`/box/alterar/${box.idBox}`} className="text-blue-600 hover:text-blue-900">
                                <i className="ion-ios-create"></i>
                                    </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
                                )}
                
                {/* Paginação para Boxes */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={getTotalPages(boxes)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={boxes.length}
                />
                            </div>
                                )}
                            </div>
                                </div>
                                
        {/* Ações Rápidas */}
        <div className="neumorphic-container">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 font-montserrat">
            <i className="ion-ios-flash mr-2 text-yellow-500"></i>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'ion-ios-business', label: 'Pátios', href: '/gerenciamento-patio/patio' },
              { icon: 'ion-ios-map', label: 'Zonas', href: '/gerenciamento-patio/zona' },
              { icon: 'ion-ios-grid', label: 'Boxes', href: '/gerenciamento-patio/box' },
              { icon: 'ion-ios-analytics', label: 'Relatórios', href: '/relatorios' }
            ].map((action) => {
              return (
                                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-center font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors"
                >
                  <i className={`${action.icon} text-lg`}></i>
                  {action.label}
                                </Link>
              );
            })}
                            </div>
                        </div>
                        
        {/* Informações do Sistema */}
        <div className="neumorphic-container bg-gradient-to-r from-gray-800 to-gray-900 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <i className="ion-ios-flash text-emerald-400 text-xl"></i>
            <span className="text-sm font-medium text-emerald-400 font-montserrat">Sistema Atualizado</span>
                    </div>
          <p className="text-gray-300 text-sm font-montserrat">
            Dados atualizados em tempo real • Última sincronização: {new Date().toLocaleTimeString('pt-BR')}
          </p>
                </div>
            </main>
    </div>
    );
}