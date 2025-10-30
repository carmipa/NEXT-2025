"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import NotificationModal from "./NotificationModal";
import NotificationService, { Notificacao } from "./NotificationService";

interface SmartNotificationsProps {
  patioId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function SmartNotifications({ 
  patioId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: SmartNotificationsProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
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
  }, [patioId, autoRefresh, refreshInterval]);

  const fetchNotifications = async () => {
    try {
      await NotificationService.generateNotifications(patioId);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <>
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="neumorphic-button relative p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <i className="ion-ios-notifications text-2xl text-blue-500"></i>
        {notificacoesNaoLidas > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            {notificacoesNaoLidas}
          </Badge>
        )}
      </button>

      {/* Modal de Notificações */}
      <NotificationModal
        patioId={patioId}
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}