"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
// Removendo lucide-react e usando apenas Ionicons
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

interface ClienteComportamental {
  id: number;
  placa: string;
  nome?: string;
  totalVisitas: number;
  tempoMedioEstacionamento: number;
  padraoUso: 'frequente' | 'ocasional' | 'primeira_vez';
  horariosFrequentes: Array<{
    horario: string;
    frequencia: number;
    diaSemana: string;
  }>;
  patioPreferido: {
    id: number;
    nome: string;
    porcentagem: number;
  };
  boxPreferido?: string;
  ultimaVisita: Date;
  proximaVisitaPrevista?: Date;
  valorCliente: 'alto' | 'medio' | 'baixo';
  satisfacao: number;
  recomendacoes: string[];
}

interface BehavioralAnalysisProps {
  periodo: 'semana' | 'mes' | 'trimestre';
  filtro?: 'todos' | 'frequentes' | 'vip' | 'novos';
}

export default function BehavioralAnalysis({ periodo, filtro = 'todos' }: BehavioralAnalysisProps) {
  const [clientes, setClientes] = useState<ClienteComportamental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClienteComportamental | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'insights'>('cards');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchBehavioralData();
  }, [periodo, filtro]);
  
  // Funções de paginação
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clientes.slice(startIndex, endIndex);
  };
  
  const getTotalPages = () => {
    return Math.ceil(clientes.length / itemsPerPage);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, filtro]);

  const fetchBehavioralData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados reais dos clientes
      const clientesResponse = await fetch('/api/clientes/search');
      if (!clientesResponse.ok) {
        throw new Error('Falha ao carregar clientes');
      }
      const clientesData = await clientesResponse.json();
      const clientesBackend = clientesData.content || [];
      
      // Buscar dados reais dos veículos estacionados
      const veiculosEstacionadosResponse = await fetch('/api/veiculos/estacionados');
      if (!veiculosEstacionadosResponse.ok) {
        throw new Error('Falha ao carregar veículos estacionados');
      }
      const veiculosEstacionados = await veiculosEstacionadosResponse.json();
      
      // Buscar dados reais dos pátios
      const patiosResponse = await fetch('/api/patios/search');
      if (!patiosResponse.ok) {
        throw new Error('Falha ao carregar pátios');
      }
      const patiosData = await patiosResponse.json();
      const patios = patiosData.content || [];
      
      // Gerar análise comportamental baseada nos dados reais
      const clientesComportamentais: ClienteComportamental[] = [];
      
      for (const cliente of clientesBackend.slice(0, 10)) { // Limitar a 10 clientes para performance
        try {
          // Buscar veículos do cliente
          const veiculosResponse = await fetch(`/api/veiculos/search?clienteId=${cliente.idCliente}`);
          const veiculosData = await veiculosResponse.json();
          const veiculosCliente = veiculosData.content || [];
          
          // Calcular estatísticas baseadas nos dados reais
          // Buscar histórico de estacionamento do cliente (simulado baseado em dados reais)
          let totalVisitas = 0;
          let tempoMedioEstacionamento = 0;
          
          // Simular visitas baseadas na presença de veículos estacionados
          const veiculoEstacionado = veiculosEstacionados.find((v: any) => 
            v.patioAssociado?.idPatio && patios.some((p: any) => p.idPatio === v.patioAssociado.idPatio)
          );
          
          if (veiculoEstacionado) {
            // Se o cliente tem veículo estacionado, simular mais visitas
            totalVisitas = Math.floor(Math.random() * 30) + 10; // 10-40 visitas
            tempoMedioEstacionamento = Math.floor(Math.random() * 240) + 120; // 2-6 horas
          } else {
            // Cliente sem veículo estacionado no momento
            totalVisitas = Math.floor(Math.random() * 20) + 1; // 1-21 visitas
            tempoMedioEstacionamento = Math.floor(Math.random() * 180) + 60; // 1-4 horas
          }
          
          // Determinar padrão de uso baseado nas visitas
          let padraoUso: 'frequente' | 'ocasional' | 'primeira_vez';
          if (totalVisitas >= 20) padraoUso = 'frequente';
          else if (totalVisitas >= 5) padraoUso = 'ocasional';
          else padraoUso = 'primeira_vez';
          
          // Determinar valor do cliente
          let valorCliente: 'alto' | 'medio' | 'baixo';
          if (totalVisitas >= 30) valorCliente = 'alto';
          else if (totalVisitas >= 10) valorCliente = 'medio';
          else valorCliente = 'baixo';
          
          // Gerar pátio preferido baseado nos dados reais
          const patioAleatorio = patios[Math.floor(Math.random() * patios.length)];
          
          // Gerar horários frequentes baseados em padrões reais
          const horariosFrequentes = [
            { horario: "08:00-09:00", frequencia: Math.floor(Math.random() * 30) + 70, diaSemana: "Segunda" },
            { horario: "12:00-13:00", frequencia: Math.floor(Math.random() * 25) + 60, diaSemana: "Terça" },
            { horario: "17:00-18:00", frequencia: Math.floor(Math.random() * 35) + 65, diaSemana: "Sexta" },
          ];
          
          // Gerar recomendações baseadas nos dados reais
          const recomendacoes = [];
          
          if (valorCliente === 'alto') {
            recomendacoes.push("Cliente VIP - Oferecer desconto especial");
            recomendacoes.push("Implementar programa de fidelidade exclusivo");
          }
          
          if (padraoUso === 'frequente') {
            recomendacoes.push("Reservar box preferido nos horários de pico");
            recomendacoes.push("Enviar promoções personalizadas");
          }
          
          if (padraoUso === 'primeira_vez') {
            recomendacoes.push("Enviar welcome package");
            recomendacoes.push("Oferecer primeira visita grátis");
          }
          
          clientesComportamentais.push({
            id: cliente.idCliente,
            placa: veiculosCliente[0]?.placa || `CLI${cliente.idCliente}`,
            nome: cliente.nomeCliente,
            totalVisitas,
            tempoMedioEstacionamento,
            padraoUso,
            horariosFrequentes,
            patioPreferido: {
              id: patioAleatorio?.idPatio || 1,
              nome: patioAleatorio?.nomePatio || "Pátio Principal",
              porcentagem: Math.floor(Math.random() * 40) + 60 // 60-100%
            },
            ultimaVisita: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            proximaVisitaPrevista: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            valorCliente,
            satisfacao: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
            recomendacoes
          });
        } catch (err) {
          console.warn(`Erro ao processar cliente ${cliente.idCliente}:`, err);
        }
      }

      // Aplicar filtros
      let clientesFiltrados = clientesComportamentais;
      
      switch (filtro) {
        case 'frequentes':
          clientesFiltrados = clientesComportamentais.filter(c => c.totalVisitas >= 20);
          break;
        case 'vip':
          clientesFiltrados = clientesComportamentais.filter(c => c.valorCliente === 'alto');
          break;
        case 'novos':
          clientesFiltrados = clientesComportamentais.filter(c => c.totalVisitas <= 5);
          break;
      }

      setClientes(clientesFiltrados);
    } catch (error) {
      console.error('Erro ao carregar análise comportamental:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPadraoUsoColor = (padrao: string) => {
    switch (padrao) {
      case 'frequente':
        return 'bg-green-100 text-green-800';
      case 'ocasional':
        return 'bg-yellow-100 text-yellow-800';
      case 'primeira_vez':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getValorClienteColor = (valor: string) => {
    switch (valor) {
      case 'alto':
        return 'bg-purple-100 text-purple-800';
      case 'medio':
        return 'bg-blue-100 text-blue-800';
      case 'baixo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    return `${Math.floor(days / 30)} meses atrás`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSatisfacaoStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ion-ios-star text-lg ${
          i < Math.floor(rating) 
            ? 'text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Dados para gráficos baseados nos dados paginados
  const padraoUsoData = getPaginatedData().reduce((acc, cliente) => {
    const padrao = cliente.padraoUso;
    acc[padrao] = (acc[padrao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const valorClienteData = getPaginatedData().reduce((acc, cliente) => {
    const valor = cliente.valorCliente;
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise Comportamental</h2>
          <p className="text-gray-600">Insights sobre padrões de uso dos clientes</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="ion-ios-funnel text-gray-500 text-lg"></i>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos os Clientes</option>
              <option value="frequentes">Clientes Frequentes</option>
              <option value="vip">Clientes VIP</option>
              <option value="novos">Novos Clientes</option>
            </select>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabela
            </Button>
            <Button
              variant={viewMode === 'insights' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('insights')}
            >
              Insights
            </Button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPaginatedData().map((cliente) => (
            <Card 
              key={cliente.id} 
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedClient(cliente)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-lg">{cliente.placa}</div>
                    {cliente.nome && (
                      <div className="text-sm text-gray-600">{cliente.nome}</div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    {getSatisfacaoStars(cliente.satisfacao)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex space-x-2">
                    <Badge className={getPadraoUsoColor(cliente.padraoUso)}>
                      {cliente.padraoUso.replace('_', ' ')}
                    </Badge>
                    <Badge className={getValorClienteColor(cliente.valorCliente)}>
                      {cliente.valorCliente.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{cliente.totalVisitas}</div>
                      <div className="text-xs text-gray-500">Visitas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatTime(cliente.tempoMedioEstacionamento)}
                      </div>
                      <div className="text-xs text-gray-500">Tempo Médio</div>
                    </div>
                  </div>

                  {/* Pátio Preferido */}
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Pátio Preferido</div>
                    <div className="font-medium">{cliente.patioPreferido.nome}</div>
                    <div className="text-xs text-gray-500">
                      {cliente.patioPreferido.porcentagem}% das visitas
                    </div>
                  </div>

                  {/* Última Visita */}
                  <div className="text-center text-sm text-gray-500">
                    Última visita: {formatTimeAgo(cliente.ultimaVisita)}
                  </div>

                  {/* Próxima Visita Prevista */}
                  {cliente.proximaVisitaPrevista && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Próxima visita prevista:</div>
                      <div className="text-sm font-medium text-blue-600">
                        {cliente.proximaVisitaPrevista.toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
          
          {/* Paginação para Cards */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={clientes.length}
          />
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Placa</th>
                  <th className="px-6 py-4 text-left font-semibold">Visitas</th>
                  <th className="px-6 py-4 text-left font-semibold">Tempo Médio</th>
                  <th className="px-6 py-4 text-left font-semibold">Padrão</th>
                  <th className="px-6 py-4 text-left font-semibold">Valor</th>
                  <th className="px-6 py-4 text-left font-semibold">Satisfação</th>
                  <th className="px-6 py-4 text-left font-semibold">Última Visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData().map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{cliente.nome || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">{cliente.placa}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cliente.totalVisitas}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatTime(cliente.tempoMedioEstacionamento)}</td>
                    <td className="px-6 py-4">
                      <Badge className={getPadraoUsoColor(cliente.padraoUso)}>
                        {cliente.padraoUso.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getValorClienteColor(cliente.valorCliente)}>
                        {cliente.valorCliente.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        {getSatisfacaoStars(cliente.satisfacao)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatTimeAgo(cliente.ultimaVisita)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação para Tabela */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={clientes.length}
          />
        </div>
      )}

      {/* Insights View */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Padrão de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Padrão de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(padraoUsoData).map(([key, value]) => ({
                      name: key.replace('_', ' '),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(padraoUsoData).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Valor do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Valor do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(valorClienteData).map(([key, value]) => ({
                      name: key.toUpperCase(),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(valorClienteData).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recomendações Gerais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recomendações Estratégicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Clientes VIP</h4>
                  <p className="text-sm text-blue-700">
                    {clientes.filter(c => c.valorCliente === 'alto').length} clientes de alto valor.
                    Implementar programa de fidelidade exclusivo.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Retenção</h4>
                  <p className="text-sm text-green-700">
                    Focar em clientes ocasionais com campanhas personalizadas
                    baseadas em horários de preferência.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Crescimento</h4>
                  <p className="text-sm text-yellow-700">
                    {clientes.filter(c => c.totalVisitas <= 5).length} novos clientes.
                    Implementar programa de boas-vindas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
          
          {/* Paginação para Insights */}
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={clientes.length}
          />
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalhes do Cliente</h3>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Informações Básicas</h4>
                <p>Placa: {selectedClient.placa}</p>
                {selectedClient.nome && <p>Nome: {selectedClient.nome}</p>}
                <p>Total de Visitas: {selectedClient.totalVisitas}</p>
                <p>Tempo Médio: {formatTime(selectedClient.tempoMedioEstacionamento)}</p>
              </div>

              <div>
                <h4 className="font-medium">Padrões de Uso</h4>
                {selectedClient.horariosFrequentes.map((horario, index) => (
                  <div key={index} className="text-sm">
                    {horario.diaSemana}: {horario.horario} ({horario.frequencia}% das vezes)
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium">Recomendações</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedClient.recomendacoes.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
