"use client";

import { Notificacao } from "./NotificationService";

interface NotificationDetailModalProps {
  notificacao: Notificacao | null;
  isOpen: boolean;
  onClose: () => void;
  onMarcarLida?: (id: string) => void;
  onRemover?: (id: string) => void;
}

export default function NotificationDetailModal({
  notificacao,
  isOpen,
  onClose,
  onMarcarLida,
  onRemover,
}: NotificationDetailModalProps) {
  
  if (!isOpen || !notificacao) return null;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'ocupacao_alta':
        return <i className="ion-ios-warning text-red-500 text-4xl"></i>;
      case 'ocupacao_baixa':
        return <i className="ion-ios-information text-blue-500 text-4xl"></i>;
      case 'manutencao':
        return <i className="ion-ios-time text-yellow-500 text-4xl"></i>;
      case 'previsao':
        return <i className="ion-ios-trending-up text-purple-500 text-4xl"></i>;
      case 'sistema':
        return <i className="ion-ios-checkmark-circle text-emerald-600 text-4xl"></i>;
      case 'alerta':
        return <i className="ion-ios-alert text-red-600 text-4xl"></i>;
      default:
        return <i className="ion-ios-information text-gray-500 text-4xl"></i>;
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return (
          <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
            <i className="ion-ios-warning text-sm"></i>
            Alta Prioridade
          </span>
        );
      case 'media':
        return (
          <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
            <i className="ion-ios-time text-sm"></i>
            Média Prioridade
          </span>
        );
      case 'baixa':
        return (
          <span className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
            <i className="ion-ios-checkmark text-sm"></i>
            Baixa Prioridade
          </span>
        );
      default:
        return (
          <span className="bg-gray-500 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
            <i className="ion-ios-information text-sm"></i>
            Normal
          </span>
        );
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

  const formatDateTime = (timestamp: Date) => {
    return timestamp.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10001] p-4">
      <div className="neumorphic-container bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="neumorphic-container p-3 rounded-lg">
              {getIcon(notificacao.tipo)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 font-montserrat">
                {notificacao.titulo}
              </h3>
              <p className="text-gray-500 text-sm">
                {formatTimeAgo(notificacao.timestamp)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Fechar modal"
            aria-label="Fechar modal de detalhes"
          >
            <i className="ion-ios-close text-2xl"></i>
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6">
          {getPriorityBadge(notificacao.prioridade)}
          {notificacao.acaoRequerida && (
            <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
              <i className="ion-ios-alert text-sm"></i>
              Ação Necessária
            </span>
          )}
          {!notificacao.lida && (
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-2">
              <i className="ion-ios-mail text-sm"></i>
              Não Lida
            </span>
          )}
        </div>

        {/* Mensagem */}
        <div className="neumorphic-container p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="ion-ios-chatbubbles text-blue-500"></i>
            Descrição
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg">
            {notificacao.mensagem}
          </p>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {notificacao.patioNome && (
            <div className="neumorphic-container p-4">
              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <i className="ion-ios-location text-emerald-600"></i>
                Localização
              </h5>
              <p className="text-gray-600">{notificacao.patioNome}</p>
            </div>
          )}
          
          <div className="neumorphic-container p-4">
            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <i className="ion-ios-time text-purple-500"></i>
              Data e Hora
            </h5>
            <p className="text-gray-600">{formatDateTime(notificacao.timestamp)}</p>
          </div>
        </div>

        {/* Dados Técnicos */}
        {notificacao.dados && (
          <div className="neumorphic-container p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ion-ios-analytics text-indigo-500"></i>
              Dados Técnicos
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(notificacao.dados, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {!notificacao.lida && onMarcarLida && (
              <button
                onClick={() => {
                  onMarcarLida(notificacao.id);
                  onClose();
                }}
                className="neumorphic-button-primary px-6 py-2 font-medium flex items-center gap-2"
              >
                <i className="ion-ios-checkmark text-lg"></i>
                Marcar como Lida
              </button>
            )}
            
            {onRemover && (
              <button
                onClick={() => {
                  onRemover(notificacao.id);
                  onClose();
                }}
                className="neumorphic-button px-6 py-2 font-medium text-red-600 hover:text-red-800 flex items-center gap-2"
              >
                <i className="ion-ios-trash text-lg"></i>
                Remover
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="neumorphic-button px-6 py-2 font-medium"
          >
            <i className="ion-ios-close-circle mr-2"></i>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
