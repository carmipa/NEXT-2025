"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import NotificationModal from "./NotificationModal";
import NotificationDetailModal from "./NotificationDetailModal";
import NotificationCards from "./NotificationCards";
import NotificationList from "./NotificationList";
import NotificationPagination from "./NotificationPagination";
import NotificationService, { Notificacao } from "./NotificationService";

interface NotificationCenterProps {
  patioId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAsCards?: boolean; // Propriedade para controlar visualização inicial
}

export default function NotificationCenter({ 
  patioId, 
  autoRefresh = true, 
  refreshInterval = 30000,
  showAsCards = true
}: NotificationCenterProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(showAsCards ? 'cards' : 'list');
  const [selectedNotification, setSelectedNotification] = useState<Notificacao | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const itemsPerPage = 5;

  useEffect(() => {
    // Carregar notificações iniciais
    loadNotifications();
    
    // Configurar auto-refresh
    if (autoRefresh) {
      const interval = setInterval(loadNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [patioId, autoRefresh, refreshInterval]);

  useEffect(() => {
    // Subscrever às atualizações do serviço
    const unsubscribe = NotificationService.subscribe((newNotifications) => {
      setNotificacoes(newNotifications);
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await NotificationService.generateNotifications(patioId);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = (id: string) => {
    NotificationService.marcarComoLida(id);
  };

  const removerNotificacao = (id: string) => {
    NotificationService.removerNotificacao(id);
  };

  const marcarTodasComoLidas = () => {
    NotificationService.marcarTodasComoLidas();
  };

  const verDetalhes = (notificacao: Notificacao) => {
    setSelectedNotification(notificacao);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  // Calcular notificações da página atual
  const totalPages = Math.ceil(notificacoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const notificacoesPagina = notificacoes.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 font-montserrat">
            <i className="ion-ios-notifications text-blue-500"></i>
            Central de Notificações
            {notificacoesNaoLidas > 0 && (
              <Badge className="bg-red-500 text-white animate-pulse">
                {notificacoesNaoLidas}
              </Badge>
            )}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          {/* Botão de troca de visualização */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300 mr-2 font-montserrat">Visualização:</span>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                title="Visualização em cards"
              >
                <i className="ion-ios-grid"></i>
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                title="Visualização em lista"
              >
                <i className="ion-ios-list"></i>
                Tabela
              </button>
            </div>
          </div>

          {/* Botão para marcar todas como lidas */}
          {notificacoesNaoLidas > 0 && (
            <button
              onClick={marcarTodasComoLidas}
              className="neumorphic-button px-4 py-2 text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              <i className="ion-ios-checkmark-circle mr-2"></i>
              Marcar todas como lidas
            </button>
          )}

          {/* Botão de atualizar */}
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="neumorphic-button p-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            title="Atualizar notificações"
          >
            <i className={`text-lg ${loading ? 'ion-ios-refresh animate-spin' : 'ion-ios-refresh'}`}></i>
          </button>
        </div>
      </div>

      {/* Conteúdo das notificações */}
      <div className="neumorphic-container p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando notificações...</p>
          </div>
        ) : (
          <>
            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <i className="ion-ios-notifications text-2xl text-blue-500 mb-2"></i>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-800">{notificacoes.length}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <i className="ion-ios-warning text-2xl text-red-500 mb-2"></i>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-xl font-bold text-gray-800">{notificacoesNaoLidas}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <i className="ion-ios-alert text-2xl text-yellow-500 mb-2"></i>
                <p className="text-sm text-gray-600">Ações Necessárias</p>
                <p className="text-xl font-bold text-gray-800">
                  {notificacoes.filter(n => n.acaoRequerida && !n.lida).length}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <i className="ion-ios-checkmark-circle text-2xl text-emerald-600 mb-2"></i>
                <p className="text-sm text-gray-600">Lidas</p>
                <p className="text-xl font-bold text-gray-800">{notificacoes.length - notificacoesNaoLidas}</p>
              </div>
            </div>

            {/* Visualização das notificações */}
            {viewMode === 'cards' ? (
              <NotificationCards
                notificacoes={notificacoesPagina}
                onMarcarLida={marcarComoLida}
                onRemover={removerNotificacao}
                onVerDetalhes={verDetalhes}
              />
            ) : (
              <NotificationList
                notificacoes={notificacoesPagina}
                onVerDetalhes={verDetalhes}
              />
            )}

            {/* Paginação */}
            <NotificationPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={notificacoes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Modal de detalhes */}
      <NotificationDetailModal
        notificacao={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarcarLida={marcarComoLida}
        onRemover={removerNotificacao}
      />

      {/* Modal completo (para compatibilidade) */}
      <NotificationModal
        patioId={patioId}
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
