"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import NotificationService, { Notificacao } from "./NotificationService";


interface NotificationModalProps {
  patioId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  isOpen: boolean;
  onClose: () => void;
  initialNotification?: Notificacao;
}

export default function NotificationModal({ 
  patioId, 
  autoRefresh = true, 
  refreshInterval = 30000,
  isOpen,
  onClose,
  initialNotification
}: NotificationModalProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      
      // Subscrever às atualizações do serviço
      const unsubscribe = NotificationService.subscribe((newNotifications) => {
        setNotificacoes(newNotifications);
      });
      
      if (autoRefresh) {
        const interval = setInterval(fetchNotifications, refreshInterval);
        return () => {
          clearInterval(interval);
          unsubscribe();
        };
      }
      
      return unsubscribe;
    }
  }, [patioId, autoRefresh, refreshInterval, isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      await NotificationService.generateNotifications(patioId);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'ocupacao_alta':
        return <i className="ion-ios-warning text-red-500 text-xl"></i>;
      case 'manutencao':
        return <i className="ion-ios-time text-yellow-500 text-xl"></i>;
      case 'previsao':
        return <i className="ion-ios-information text-blue-500 text-xl"></i>;
      case 'sistema':
        return <i className="ion-ios-checkmark-circle text-emerald-600 text-xl"></i>;
      default:
        return <i className="ion-ios-information text-gray-500 text-xl"></i>;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'border-l-red-500 bg-red-50';
      case 'media':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'baixa':
        return 'border-l-emerald-500 bg-emerald-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const marcarComoLida = (id: string) => {
    NotificationService.marcarComoLida(id);
  };

  const removerNotificacao = (id: string) => {
    NotificationService.removerNotificacao(id);
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">Alta Prioridade</span>;
      case 'media':
        return <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium">Média Prioridade</span>;
      case 'baixa':
        return <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium">Baixa Prioridade</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-medium">Normal</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="ion-ios-notifications text-2xl"></i>
                <div>
                  <h2 className="text-xl font-bold font-montserrat">
                    Central de Notificações
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {notificacoesNaoLidas} não lidas de {notificacoes.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-blue-600"
                title="Fechar modal"
                aria-label="Fechar modal de notificações"
              >
                <i className="ion-ios-close text-2xl"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {initialNotification ? (
              // Mostrar detalhes da notificação específica
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0">
                    {getIcon(initialNotification.tipo)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {initialNotification.titulo}
                    </h3>
                    <div className="flex items-center space-x-3 mb-4">
                      {getPriorityBadge(initialNotification.prioridade)}
                      {initialNotification.acaoRequerida && (
                        <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium">
                          Ação Necessária
                        </span>
                      )}
                      {!initialNotification.lida && (
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                          Não Lida
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {initialNotification.mensagem}
                  </p>
                </div>

                {initialNotification.patioNome && (
                  <div className="flex items-center space-x-2 mb-4">
                    <i className="ion-ios-location text-blue-500"></i>
                    <span className="text-gray-600">
                      <strong>Localização:</strong> {initialNotification.patioNome}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-6">
                  <i className="ion-ios-time text-gray-500"></i>
                  <span className="text-gray-600">
                    <strong>Enviado:</strong> {formatTimeAgo(initialNotification.timestamp)}
                  </span>
                </div>

                {initialNotification.dados && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Detalhes Técnicos:</h4>
                    <pre className="text-sm text-blue-700 whitespace-pre-wrap">
                      {JSON.stringify(initialNotification.dados, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {!initialNotification.lida && (
                    <button
                      onClick={() => marcarComoLida(initialNotification.id)}
                      className="neumorphic-button-primary px-6 py-2 font-medium"
                    >
                      <i className="ion-ios-checkmark mr-2"></i>
                      Marcar como Lida
                    </button>
                  )}
                  <button
                    onClick={() => removerNotificacao(initialNotification.id)}
                    className="neumorphic-button px-6 py-2 font-medium text-red-600 hover:text-red-800"
                  >
                    <i className="ion-ios-trash mr-2"></i>
                    Remover Notificação
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando notificações...</p>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <i className="ion-ios-notifications text-6xl mx-auto mb-4 opacity-30 block"></i>
                <p className="text-lg font-medium">Nenhuma notificação</p>
                <p className="text-sm">Você está em dia com todas as atualizações!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-6 border-l-4 ${getPriorityColor(notificacao.prioridade)} transition-all duration-200 hover:bg-gray-50 ${
                      !notificacao.lida ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notificacao.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className={`text-lg font-semibold ${
                              !notificacao.lida ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notificacao.titulo}
                            </h4>
                            {notificacao.acaoRequerida && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs font-medium">
                                Ação Necessária
                              </Badge>
                            )}
                            {!notificacao.lida && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notificacao.mensagem}
                          </p>
                          
                          {notificacao.patioNome && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                              <i className="ion-ios-location text-blue-500"></i>
                              <span>{notificacao.patioNome}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                              {formatTimeAgo(notificacao.timestamp)}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              {!notificacao.lida && (
                                <button
                                  onClick={() => marcarComoLida(notificacao.id)}
                                  className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                >
                                  <i className="ion-ios-checkmark mr-1"></i>
                                  Marcar lida
                                </button>
                              )}
                              <button
                                onClick={() => removerNotificacao(notificacao.id)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors"
                                title="Remover notificação"
                                aria-label="Remover notificação"
                              >
                                <i className="ion-ios-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium"
                >
                  <i className="ion-ios-checkmark-circle mr-2"></i>
                  Marcar todas como lidas
                </button>
                
                <button
                  onClick={onClose}
                  className="neumorphic-button-primary px-6 py-2 font-medium"
                >
                  <i className="ion-ios-close mr-2"></i>
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
