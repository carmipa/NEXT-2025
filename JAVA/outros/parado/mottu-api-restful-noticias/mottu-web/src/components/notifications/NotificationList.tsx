"use client";

import { Notificacao } from "./NotificationService";

interface NotificationListProps {
  notificacoes: Notificacao[];
  onVerDetalhes: (notificacao: Notificacao) => void;
}

export default function NotificationList({ 
  notificacoes, 
  onVerDetalhes 
}: NotificationListProps) {
  
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'ocupacao_alta':
        return <i className="ion-ios-warning text-red-500 text-xl"></i>;
      case 'ocupacao_baixa':
        return <i className="ion-ios-information text-blue-500 text-xl"></i>;
      case 'manutencao':
        return <i className="ion-ios-time text-yellow-500 text-xl"></i>;
      case 'previsao':
        return <i className="ion-ios-trending-up text-purple-500 text-xl"></i>;
      case 'sistema':
        return <i className="ion-ios-checkmark-circle text-emerald-600 text-xl"></i>;
      case 'alerta':
        return <i className="ion-ios-alert text-red-600 text-xl"></i>;
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
    <div className="space-y-2">
      {/* Cabeçalho da tabela */}
      <div className="neumorphic-container p-3 bg-gray-100">
        <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-1">
            <i className="ion-ios-information text-gray-500"></i>
          </div>
          <div className="col-span-4">Título</div>
          <div className="col-span-4">Descrição</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Tempo</div>
        </div>
      </div>
      
      {notificacoes.map((notificacao) => (
        <div
          key={notificacao.id}
          className={`neumorphic-container border-l-4 ${getPriorityColor(notificacao.prioridade)} transition-all duration-200 hover:shadow-lg cursor-pointer ${
            !notificacao.lida ? 'bg-blue-50' : 'bg-white'
          }`}
          onClick={() => onVerDetalhes(notificacao)}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notificacao.tipo)}
              </div>
              
              <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <h4 className={`text-sm font-semibold truncate ${
                    !notificacao.lida ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notificacao.titulo}
                  </h4>
                </div>
                
                <div className="col-span-4">
                  <p className="text-gray-600 text-sm truncate">
                    {notificacao.mensagem}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    {notificacao.acaoRequerida && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                        Ação
                      </span>
                    )}
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(notificacao.timestamp)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerDetalhes(notificacao);
                      }}
                      className="text-blue-600 hover:text-blue-800 ml-2 transition-colors"
                      title="Ver detalhes da notificação"
                    >
                      <i className="ion-ios-eye text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
