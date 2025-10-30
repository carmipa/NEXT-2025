"use client";

import { Notificacao } from "./NotificationService";

interface NotificationCardsProps {
  notificacoes: Notificacao[];
  onMarcarLida: (id: string) => void;
  onRemover: (id: string) => void;
  onVerDetalhes: (notificacao: Notificacao) => void;
}

export default function NotificationCards({ 
  notificacoes, 
  onMarcarLida, 
  onRemover, 
  onVerDetalhes 
}: NotificationCardsProps) {
  
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'ocupacao_alta':
        return <i className="ion-ios-warning text-red-500 text-2xl"></i>;
      case 'ocupacao_baixa':
        return <i className="ion-ios-information text-blue-500 text-2xl"></i>;
      case 'manutencao':
        return <i className="ion-ios-time text-yellow-500 text-2xl"></i>;
      case 'previsao':
        return <i className="ion-ios-trending-up text-purple-500 text-2xl"></i>;
      case 'sistema':
        return <i className="ion-ios-checkmark-circle text-emerald-600 text-2xl"></i>;
      case 'alerta':
        return <i className="ion-ios-alert text-red-600 text-2xl"></i>;
      default:
        return <i className="ion-ios-information text-gray-500 text-2xl"></i>;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'border-red-500 bg-red-50 hover:bg-red-100';
      case 'media':
        return 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'baixa':
        return 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100';
      default:
        return 'border-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Alta</span>;
      case 'media':
        return <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">Média</span>;
      case 'baixa':
        return <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">Baixa</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">Normal</span>;
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

  if (notificacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="ion-ios-notifications text-6xl text-gray-300 mb-4 block"></i>
        <p className="text-gray-500 text-lg">Nenhuma notificação</p>
        <p className="text-gray-400 text-sm">Você está em dia com todas as atualizações!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notificacoes.map((notificacao) => (
        <div
          key={notificacao.id}
          className={`neumorphic-container border-l-4 ${getPriorityColor(notificacao.prioridade)} transition-all duration-300 transform hover:scale-105 cursor-pointer relative`}
          onClick={() => onVerDetalhes(notificacao)}
        >
          {/* Badge de não lida */}
          {!notificacao.lida && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          )}

          {/* Header do Card */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getIcon(notificacao.tipo)}
              <div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(notificacao.prioridade)}
                  {notificacao.acaoRequerida && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Ação
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {!notificacao.lida && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarcarLida(notificacao.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
                  title="Marcar como lida"
                >
                  <i className="ion-ios-checkmark text-sm"></i>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(notificacao.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-100 transition-colors"
                title="Remover notificação"
              >
                <i className="ion-ios-close text-sm"></i>
              </button>
            </div>
          </div>

          {/* Conteúdo do Card */}
          <div className="mb-4">
            <h4 className={`font-semibold text-lg mb-2 ${
              !notificacao.lida ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notificacao.titulo}
            </h4>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {notificacao.mensagem}
            </p>

            {notificacao.patioNome && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <i className="ion-ios-location text-blue-500"></i>
                <span>{notificacao.patioNome}</span>
              </div>
            )}
          </div>

          {/* Footer do Card */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatTimeAgo(notificacao.timestamp)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVerDetalhes(notificacao);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
              title="Ver detalhes da notificação"
            >
              <i className="ion-ios-eye text-sm"></i>
              Ver detalhes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
