"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Brain,
  Bell,
  Eye,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

// Importar os novos componentes
import PredictiveDashboard from "@/components/dashboard/PredictiveDashboard";
import SmartNotifications from "@/components/notifications/SmartNotifications";
import OcupacaoHeatmap from "@/components/maps/OcupacaoHeatmap";
import BehavioralAnalysis from "@/components/analytics/BehavioralAnalysis";

type RelatorioTipo = 
  | 'dashboard' 
  | 'notificacoes' 
  | 'heatmap' 
  | 'comportamental' 
  | 'previsoes' 
  | 'tendencias';

interface RelatorioInfo {
  id: RelatorioTipo;
  nome: string;
  descricao: string;
  icon: React.ComponentType<{ className?: string }>;
  cor: string;
  badge: string;
}

const relatorios: RelatorioInfo[] = [
  {
    id: 'dashboard',
    nome: 'Dashboard Preditivo',
    descricao: 'Análise inteligente com previsões baseadas em dados históricos',
    icon: Brain,
    cor: 'bg-blue-500',
    badge: 'IA'
  },
  {
    id: 'notificacoes',
    nome: 'Notificações Inteligentes',
    descricao: 'Sistema de alertas automáticos e recomendações em tempo real',
    icon: Bell,
    cor: 'bg-orange-500',
    badge: 'Real-time'
  },
  {
    id: 'heatmap',
    nome: 'Heatmap de Ocupação',
    descricao: 'Visualização avançada da ocupação com análises temporais',
    icon: MapPin,
    cor: 'bg-red-500',
    badge: 'Visual'
  },
  {
    id: 'comportamental',
    nome: 'Análise Comportamental',
    descricao: 'Insights sobre padrões de uso e comportamento dos clientes',
    icon: Users,
    cor: 'bg-purple-500',
    badge: 'Analytics'
  },
  {
    id: 'previsoes',
    nome: 'Previsões de Demanda',
    descricao: 'Previsão de ocupação e otimização de recursos',
    icon: TrendingUp,
    cor: 'bg-green-500',
    badge: 'Predição'
  },
  {
    id: 'tendencias',
    nome: 'Análise de Tendências',
    descricao: 'Identificação de padrões e tendências de longo prazo',
    icon: BarChart3,
    cor: 'bg-indigo-500',
    badge: 'Trends'
  }
];

export default function RelatoriosAvancadosPage() {
  const [relatorioAtivo, setRelatorioAtivo] = useState<RelatorioTipo>('dashboard');
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('semana');
  const [filtroPatio, setFiltroPatio] = useState<number | undefined>(undefined);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const renderRelatorioAtivo = () => {
    switch (relatorioAtivo) {
      case 'dashboard':
        return <PredictiveDashboard patioId={filtroPatio} patioNome="Selecionado" />;
      case 'heatmap':
        return <OcupacaoHeatmap patioId={filtroPatio} periodo={periodo} />;
      case 'comportamental':
        return <BehavioralAnalysis periodo={periodo} />;
      case 'notificacoes':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Central de Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <SmartNotifications 
                  patioId={filtroPatio} 
                  autoRefresh={autoRefresh}
                />
              </div>
            </CardContent>
          </Card>
        );
      case 'previsoes':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Previsões de Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Previsões de Demanda
                </h3>
                <p className="text-gray-600">
                  Sistema de previsão baseado em algoritmos de machine learning
                  utilizando dados históricos de ocupação.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Funcionalidades:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Previsão de ocupação por hora/dia</li>
                    <li>• Identificação de padrões sazonais</li>
                    <li>• Recomendações de otimização</li>
                    <li>• Alertas de capacidade</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'tendencias':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Análise de Tendências
                </h3>
                <p className="text-gray-600">
                  Identificação de padrões de longo prazo e tendências
                  de crescimento ou declínio na utilização dos pátios.
                </p>
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">Métricas:</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Crescimento de ocupação por período</li>
                    <li>• Sazonalidade e padrões cíclicos</li>
                    <li>• Comparativo entre pátios</li>
                    <li>• Projeções de crescimento</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Relatórios Avançados
              </h1>
              <p className="text-gray-600 mt-1">
                Analytics inteligente e previsões baseadas em dados do sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="hoje">Hoje</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mês</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={filtroPatio || ''}
                  onChange={(e) => setFiltroPatio(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos os Pátios</option>
                  <option value="1">Pátio Centro</option>
                  <option value="2">Pátio Limão</option>
                  <option value="3">Pátio Guarulhos</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Relatórios */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Relatórios Disponíveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatorios.map((relatorio) => (
                  <button
                    key={relatorio.id}
                    onClick={() => setRelatorioAtivo(relatorio.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      relatorioAtivo === relatorio.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${relatorio.cor} text-white`}>
                        <relatorio.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm">{relatorio.nome}</h3>
                          <Badge className="text-xs">{relatorio.badge}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {relatorio.descricao}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-refresh</span>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {renderRelatorioAtivo()}
          </div>
        </div>
      </div>
    </div>
  );
}
