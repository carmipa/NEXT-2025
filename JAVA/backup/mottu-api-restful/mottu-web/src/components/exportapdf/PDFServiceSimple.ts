import jsPDF from 'jspdf';

export interface SimplePDFOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

export interface SimplePDFData {
  title: string;
  subtitle?: string;
  content: string;
  footer?: string;
  metadata?: {
    author?: string;
    subject?: string;
  };
}

export class PDFServiceSimple {
  private static instance: PDFServiceSimple;

  static getInstance(): PDFServiceSimple {
    if (!PDFServiceSimple.instance) {
      PDFServiceSimple.instance = new PDFServiceSimple();
    }
    return PDFServiceSimple.instance;
  }

  private constructor() {}

  /**
   * Gera PDF simples com dados estruturados (sem html2canvas)
   */
  async generateSimplePDF(
    data: SimplePDFData,
    options: SimplePDFOptions = {}
  ): Promise<void> {
    const {
      filename = 'relatorio.pdf',
      orientation = 'portrait',
      format = 'a4',
      margin = 20
    } = options;

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Metadados
      pdf.setProperties({
        title: data.title,
        author: data.metadata?.author || 'Mottu Sistema',
        creator: 'Mottu Sistema',
        subject: data.metadata?.subject || 'Relatório de Gestão'
      });

      let yPosition = margin;

      // Título
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.title, margin, yPosition);
      yPosition += 15;

      // Subtítulo
      if (data.subtitle) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.subtitle, margin, yPosition);
        yPosition += 10;
      }

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pdf.internal.pageSize.width - margin, yPosition);
      yPosition += 10;

      // Conteúdo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Dividir conteúdo em linhas que cabem na página
      const lines = pdf.splitTextToSize(data.content, pdf.internal.pageSize.width - (margin * 2));
      
      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pdf.internal.pageSize.height - margin - 10) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(lines[i], margin, yPosition);
        yPosition += 7;
      }

      // Rodapé
      if (data.footer) {
        yPosition = pdf.internal.pageSize.height - margin;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(data.footer, margin, yPosition);
      }

      // Data de geração
      yPosition = pdf.internal.pageSize.height - margin - 5;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        margin,
        yPosition
      );

      // Salva o arquivo
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF simples:', error);
      throw new Error('Falha ao gerar PDF. Tente novamente.');
    }
  }

  /**
   * Gera PDF de relatório de ocupação (versão simples)
   */
  async generateOcupacaoReportSimple(
    data: {
      totalBoxes: number;
      boxesOcupados: number;
      taxaOcupacao: number;
      totalPatios: number;
      totalZonas: number;
      patioNome?: string;
      periodo?: string;
    },
    options: SimplePDFOptions = {}
  ): Promise<void> {
    const content = `
RELATÓRIO DE OCUPAÇÃO - MOTTU SISTEMA
${data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral de Todos os Pátios'}
${data.periodo ? `Período: ${data.periodo}` : 'Período Atual'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:
• Total de Pátios: ${data.totalPatios}
• Total de Zonas: ${data.totalZonas}
• Total de Boxes: ${data.totalBoxes}
• Boxes Ocupados: ${data.boxesOcupados}
• Boxes Livres: ${data.totalBoxes - data.boxesOcupados}
• Taxa de Ocupação: ${data.taxaOcupacao}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANÁLISE DE PERFORMANCE:
${data.taxaOcupacao >= 80 ? 
  '🟢 ALTA OCUPAÇÃO - Excelente utilização dos recursos. Considerar expansão para atender demanda crescente.' : 
  data.taxaOcupacao >= 60 ? 
  '🟡 OCUPAÇÃO MODERADA - Boa utilização dos recursos. Monitorar tendências de crescimento.' :
  data.taxaOcupacao >= 40 ?
  '🟠 OCUPAÇÃO BAIXA - Utilização abaixo do esperado. Avaliar estratégias de atração de clientes.' :
  '🔴 OCUPAÇÃO CRÍTICA - Utilização muito baixa. Revisar estratégias de negócio e marketing.'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMENDAÇÕES:
${data.taxaOcupacao >= 80 ? 
  '• Avaliar possibilidade de expansão\n• Considerar aumento de preços\n• Planejar novos pátios' :
  data.taxaOcupacao >= 60 ? 
  '• Manter estratégias atuais\n• Monitorar sazonalidade\n• Otimizar processos' :
  '• Revisar estratégias de marketing\n• Analisar concorrência\n• Considerar promoções\n• Avaliar localização'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este relatório foi gerado automaticamente pelo sistema Mottu.
Para mais informações, acesse o painel administrativo.
    `;

    await this.generateSimplePDF({
      title: 'Relatório de Ocupação',
      subtitle: data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral',
      content,
      metadata: {
        author: 'Mottu Sistema',
        subject: 'Relatório de Ocupação de Boxes'
      }
    }, {
      filename: `relatorio-ocupacao-${new Date().toISOString().split('T')[0]}.pdf`,
      ...options
    });
  }

  /**
   * Gera PDF de relatório de movimentação (versão simples)
   */
  async generateMovimentacaoReportSimple(
    data: {
      totalMovimentacoes: number;
      entradas: number;
      saidas: number;
      patioNome?: string;
      periodo?: string;
    },
    options: SimplePDFOptions = {}
  ): Promise<void> {
    const content = `
RELATÓRIO DE MOVIMENTAÇÃO - MOTTU SISTEMA
${data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral de Todos os Pátios'}
${data.periodo ? `Período: ${data.periodo}` : 'Período Atual'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:
• Total de Movimentações: ${data.totalMovimentacoes}
• Entradas: ${data.entradas}
• Saídas: ${data.saidas}
• Saldo Líquido: ${data.entradas - data.saidas}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANÁLISE DE MOVIMENTAÇÃO:
${data.entradas > data.saidas ? 
  '🟢 SALDO POSITIVO - Mais entradas que saídas. Indicador de crescimento.' :
  data.saidas > data.entradas ?
  '🟡 SALDO NEGATIVO - Mais saídas que entradas. Monitorar tendência.' :
  '🟠 SALDO EQUILIBRADO - Entradas e saídas balanceadas.'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TAXA DE ROTAÇÃO:
${data.totalMovimentacoes > 0 ? 
  `Taxa de Entrada: ${Math.round((data.entradas / data.totalMovimentacoes) * 100)}%\nTaxa de Saída: ${Math.round((data.saidas / data.totalMovimentacoes) * 100)}%` :
  'Sem movimentações no período'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMENDAÇÕES:
${data.entradas > data.saidas ? 
  '• Manter estratégias de atração\n• Monitorar capacidade\n• Otimizar processos de entrada' :
  data.saidas > data.entradas ?
  '• Analisar motivos de saída\n• Revisar políticas de retenção\n• Melhorar experiência do cliente' :
  '• Manter equilíbrio atual\n• Focar em retenção\n• Analisar sazonalidade'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este relatório foi gerado automaticamente pelo sistema Mottu.
Para mais informações, acesse o painel administrativo.
    `;

    await this.generateSimplePDF({
      title: 'Relatório de Movimentação',
      subtitle: data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral',
      content,
      metadata: {
        author: 'Mottu Sistema',
        subject: 'Relatório de Movimentação de Veículos'
      }
    }, {
      filename: `relatorio-movimentacao-${new Date().toISOString().split('T')[0]}.pdf`,
      ...options
    });
  }
}

export default PDFServiceSimple.getInstance();
