// Serviço de Notificações Inteligentes
// Gera notificações dinâmicas baseadas em dados reais do sistema

import { PatioService, BoxService, ZonaService } from '@/utils/api';

export interface Notificacao {
  id: string;
  tipo: 'ocupacao_alta' | 'ocupacao_baixa' | 'manutencao' | 'previsao' | 'sistema' | 'info' | 'alerta';
  titulo: string;
  mensagem: string;
  prioridade: 'alta' | 'media' | 'baixa';
  acaoRequerida: boolean;
  timestamp: Date;
  patioId?: number;
  patioNome?: string;
  lida: boolean;
  dados?: any; // Dados específicos da notificação
}

export class NotificationService {
  private static instance: NotificationService;
  private notificacoes: Notificacao[] = [];
  private subscribers: ((notificacoes: Notificacao[]) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Gerar notificações baseadas em dados reais
  async generateNotifications(patioId?: number): Promise<Notificacao[]> {
    try {
      const novasNotificacoes: Notificacao[] = [];

      // 1. Verificar ocupação dos pátios
      await this.checkOcupacaoPatios(novasNotificacoes, patioId);

      // 2. Verificar necessidade de manutenção
      await this.checkManutencao(novasNotificacoes, patioId);

      // 3. Gerar previsões baseadas em padrões
      await this.generatePrevisoes(novasNotificacoes, patioId);

      // 4. Verificar alertas do sistema
      await this.checkAlertasSistema(novasNotificacoes);

      // Adicionar novas notificações
      this.notificacoes = [...this.notificacoes, ...novasNotificacoes];

      // Notificar subscribers
      this.notifySubscribers();

      return novasNotificacoes;
    } catch (error) {
      console.error('Erro ao gerar notificações:', error);
      return [];
    }
  }

  // Verificar ocupação dos pátios
  private async checkOcupacaoPatios(notificacoes: Notificacao[], patioId?: number) {
    try {
      const patiosResponse = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      const patios = patiosResponse.content || [];

      for (const patio of patios) {
        if (patioId && patio.idPatio !== patioId) continue;

        try {
          const boxesResponse = await BoxService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
          const boxes = boxesResponse.content || [];
          
          if (boxes.length === 0) continue;

          const boxesOcupados = boxes.filter(box => box.status === 'O').length;
          const taxaOcupacao = (boxesOcupados / boxes.length) * 100;

          // Alta ocupação (>90%)
          if (taxaOcupacao >= 90) {
            notificacoes.push({
              id: `ocupacao_alta_${patio.idPatio}_${Date.now()}`,
              tipo: 'ocupacao_alta',
              titulo: 'Alta Ocupação Detectada',
              mensagem: `${patio.nomePatio} atingiu ${Math.round(taxaOcupacao)}% de ocupação (${boxesOcupados}/${boxes.length} boxes). Previsão de esgotamento em breve.`,
              prioridade: 'alta',
              acaoRequerida: true,
              timestamp: new Date(),
              patioId: patio.idPatio,
              patioNome: patio.nomePatio,
              lida: false,
              dados: { taxaOcupacao, boxesOcupados, totalBoxes: boxes.length }
            });
          }
          // Baixa ocupação (<20%) - apenas se não houver notificação recente
          else if (taxaOcupacao <= 20) {
            const ultimaNotificacao = this.notificacoes.find(
              n => n.tipo === 'ocupacao_baixa' && n.patioId === patio.idPatio
            );
            
            if (!ultimaNotificacao || this.isOlderThan(ultimaNotificacao.timestamp, 2)) {
              notificacoes.push({
                id: `ocupacao_baixa_${patio.idPatio}_${Date.now()}`,
                tipo: 'ocupacao_baixa',
                titulo: 'Baixa Ocupação',
                mensagem: `${patio.nomePatio} com apenas ${Math.round(taxaOcupacao)}% de ocupação (${boxesOcupados}/${boxes.length} boxes). Considere otimizar recursos.`,
                prioridade: 'baixa',
                acaoRequerida: false,
                timestamp: new Date(),
                patioId: patio.idPatio,
                patioNome: patio.nomePatio,
                lida: false,
                dados: { taxaOcupacao, boxesOcupados, totalBoxes: boxes.length }
              });
            }
          }
        } catch (err) {
          console.warn(`Erro ao verificar ocupação do pátio ${patio.idPatio}:`, err);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar ocupação dos pátios:', error);
    }
  }

  // Verificar necessidade de manutenção
  private async checkManutencao(notificacoes: Notificacao[], patioId?: number) {
    try {
      const patiosResponse = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      const patios = patiosResponse.content || [];

      for (const patio of patios) {
        if (patioId && patio.idPatio !== patioId) continue;

        try {
          // Simular verificação de manutenção baseada em tempo
          const ultimaManutencao = this.getUltimaManutencao(patio.idPatio);
          const diasDesdeManutencao = this.getDaysDifference(ultimaManutencao, new Date());

          if (diasDesdeManutencao >= 30) {
            notificacoes.push({
              id: `manutencao_${patio.idPatio}_${Date.now()}`,
              tipo: 'manutencao',
              titulo: 'Manutenção Preventiva Necessária',
              mensagem: `${patio.nomePatio} não recebe manutenção há ${diasDesdeManutencao} dias. Agende uma verificação preventiva.`,
              prioridade: 'media',
              acaoRequerida: true,
              timestamp: new Date(),
              patioId: patio.idPatio,
              patioNome: patio.nomePatio,
              lida: false,
              dados: { diasDesdeManutencao }
            });
          }
        } catch (err) {
          console.warn(`Erro ao verificar manutenção do pátio ${patio.idPatio}:`, err);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar manutenção:', error);
    }
  }

  // Gerar previsões baseadas em padrões
  private async generatePrevisoes(notificacoes: Notificacao[], patioId?: number) {
    try {
      const patiosResponse = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      const patios = patiosResponse.content || [];

      for (const patio of patios) {
        if (patioId && patio.idPatio !== patioId) continue;

        // Simular análise de padrões de uso
        const horaAtual = new Date().getHours();
        const diaSemana = new Date().getDay();

        // Previsão de pico de demanda (horário comercial)
        if (horaAtual >= 14 && horaAtual <= 16 && diaSemana >= 1 && diaSemana <= 5) {
          notificacoes.push({
            id: `previsao_${patio.idPatio}_${Date.now()}`,
            tipo: 'previsao',
            titulo: 'Pico de Demanda Previsto',
            mensagem: `Alta demanda prevista para ${patio.nomePatio} entre 14h-16h. Considere preparar equipe adicional.`,
            prioridade: 'media',
            acaoRequerida: false,
            timestamp: new Date(),
            patioId: patio.idPatio,
            patioNome: patio.nomePatio,
            lida: false,
            dados: { horaPrevista: '14h-16h' }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao gerar previsões:', error);
    }
  }

  // Verificar alertas do sistema
  private async checkAlertasSistema(notificacoes: Notificacao[]) {
    try {
      // Verificar se há muitos boxes com problemas
      const patiosResponse = await PatioService.listarPaginadoFiltrado({}, 0, 100);
      const patios = patiosResponse.content || [];

      let totalBoxesComProblemas = 0;
      let totalBoxes = 0;

      for (const patio of patios) {
        try {
          const boxesResponse = await BoxService.listarPorPatio(patio.idPatio, patio.status, 0, 100);
          const boxes = boxesResponse.content || [];
          
          totalBoxes += boxes.length;
          // Simular boxes com problemas (status 'M' para manutenção)
          const boxesComProblemas = boxes.filter(box => box.status === 'M').length;
          totalBoxesComProblemas += boxesComProblemas;
        } catch (err) {
          console.warn(`Erro ao verificar boxes do pátio ${patio.idPatio}:`, err);
        }
      }

      const percentualProblemas = totalBoxes > 0 ? (totalBoxesComProblemas / totalBoxes) * 100 : 0;

      if (percentualProblemas >= 10) {
        notificacoes.push({
          id: `alerta_sistema_${Date.now()}`,
          tipo: 'alerta',
          titulo: 'Alerta do Sistema',
          mensagem: `${Math.round(percentualProblemas)}% dos boxes estão com problemas de manutenção (${totalBoxesComProblemas}/${totalBoxes}). Ação urgente necessária.`,
          prioridade: 'alta',
          acaoRequerida: true,
          timestamp: new Date(),
          lida: false,
          dados: { percentualProblemas, totalBoxesComProblemas, totalBoxes }
        });
      }
    } catch (error) {
      console.error('Erro ao verificar alertas do sistema:', error);
    }
  }

  // Utilitários
  private isOlderThan(date: Date, hours: number): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff > hours * 60 * 60 * 1000;
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getUltimaManutencao(patioId: number): Date {
    // Simular data da última manutenção (30 dias atrás)
    const ultimaManutencao = new Date();
    ultimaManutencao.setDate(ultimaManutencao.getDate() - 30);
    return ultimaManutencao;
  }

  // Gerenciar notificações
  marcarComoLida(id: string): void {
    this.notificacoes = this.notificacoes.map(notif => 
      notif.id === id ? { ...notif, lida: true } : notif
    );
    this.notifySubscribers();
  }

  removerNotificacao(id: string): void {
    this.notificacoes = this.notificacoes.filter(notif => notif.id !== id);
    this.notifySubscribers();
  }

  marcarTodasComoLidas(): void {
    this.notificacoes = this.notificacoes.map(notif => ({ ...notif, lida: true }));
    this.notifySubscribers();
  }

  getNotificacoes(): Notificacao[] {
    return [...this.notificacoes];
  }

  getNotificacoesNaoLidas(): Notificacao[] {
    return this.notificacoes.filter(n => !n.lida);
  }

  getNotificacoesPorPatio(patioId: number): Notificacao[] {
    return this.notificacoes.filter(n => !n.patioId || n.patioId === patioId);
  }

  // Sistema de subscribers
  subscribe(callback: (notificacoes: Notificacao[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getNotificacoes()));
  }

  // Limpar notificações antigas (mais de 7 dias)
  limparAntigas(): void {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    this.notificacoes = this.notificacoes.filter(
      notif => notif.timestamp > seteDiasAtras
    );
    this.notifySubscribers();
  }
}

export default NotificationService.getInstance();





