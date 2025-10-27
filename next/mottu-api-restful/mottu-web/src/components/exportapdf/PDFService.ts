import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
  quality?: number;
}

export interface PDFData {
  title: string;
  subtitle?: string;
  content: string | HTMLElement;
  footer?: string;
  header?: string;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

export class PDFService {
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  private constructor() {}

  /**
   * Gera PDF a partir de um elemento HTML
   */
  async generateFromElement(
    element: HTMLElement,
    options: PDFOptions = {}
  ): Promise<void> {
    const {
      filename = 'relatorio.pdf',
      title = 'Relatório',
      orientation = 'portrait',
      format = 'a4',
      margin = 20,
      quality = 1.0
    } = options;

    try {
      // Função para converter cores oklch para hex
      const convertOklchToHex = (oklchColor: string): string => {
        // Se já for uma cor hex, retorna como está
        if (oklchColor.startsWith('#')) return oklchColor;
        
        // Se for oklch, converte para uma cor hex equivalente
        if (oklchColor.includes('oklch')) {
          // Mapeamento básico de cores oklch comuns para hex
          const oklchMap: { [key: string]: string } = {
            'oklch(0.7 0.15 180)': '#3B82F6', // blue-500
            'oklch(0.6 0.15 180)': '#1D4ED8', // blue-700
            'oklch(0.8 0.12 142)': '#10B981', // emerald-500
            'oklch(0.7 0.12 142)': '#059669', // emerald-600
            'oklch(0.9 0.05 142)': '#D1FAE5', // emerald-100
            'oklch(0.85 0.08 142)': '#A7F3D0', // emerald-200
            'oklch(0.95 0.02 142)': '#ECFDF5', // emerald-50
            'oklch(0.7 0.15 320)': '#EC4899', // pink-500
            'oklch(0.6 0.15 320)': '#DB2777', // pink-600
            'oklch(0.8 0.12 280)': '#8B5CF6', // violet-500
            'oklch(0.7 0.12 280)': '#7C3AED', // violet-600
            'oklch(0.9 0.05 280)': '#EDE9FE', // violet-100
            'oklch(0.85 0.08 280)': '#DDD6FE', // violet-200
            'oklch(0.95 0.02 280)': '#F5F3FF', // violet-50
            'oklch(0.2 0.01 142)': '#111827', // gray-900
            'oklch(0.3 0.01 142)': '#374151', // gray-700
            'oklch(0.4 0.01 142)': '#4B5563', // gray-600
            'oklch(0.5 0.01 142)': '#6B7280', // gray-500
            'oklch(0.6 0.01 142)': '#9CA3AF', // gray-400
            'oklch(0.7 0.01 142)': '#D1D5DB', // gray-300
            'oklch(0.8 0.01 142)': '#E5E7EB', // gray-200
            'oklch(0.9 0.01 142)': '#F3F4F6', // gray-100
            'oklch(0.95 0.01 142)': '#F9FAFB', // gray-50
            'oklch(1 0 0)': '#FFFFFF', // white
            'oklch(0 0 0)': '#000000'  // black
          };
          
          // Busca correspondência exata ou parcial
          for (const [oklch, hex] of Object.entries(oklchMap)) {
            if (oklchColor.includes(oklch.replace('oklch(', '').replace(')', ''))) {
              return hex;
            }
          }
          
          // Fallback para cores comuns
          if (oklchColor.includes('blue')) return '#3B82F6';
          if (oklchColor.includes('green') || oklchColor.includes('emerald')) return '#10B981';
          if (oklchColor.includes('red')) return '#EF4444';
          if (oklchColor.includes('yellow')) return '#F59E0B';
          if (oklchColor.includes('purple') || oklchColor.includes('violet')) return '#8B5CF6';
          if (oklchColor.includes('pink')) return '#EC4899';
          if (oklchColor.includes('gray') || oklchColor.includes('grey')) return '#6B7280';
          
          return '#6B7280'; // fallback gray
        }
        
        return oklchColor;
      };

      // Aplicar conversão de cores antes da captura
      const originalStyles = new Map();
      const elementsWithOklch = element.querySelectorAll('*');
      
      elementsWithOklch.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        const properties = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
        
        properties.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.includes('oklch')) {
            originalStyles.set(el, { element: el, property: prop, value: el.style[prop] });
            el.style[prop] = convertOklchToHex(value);
          }
        });
      });

      // Captura o elemento como canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        quality,
        ignoreElements: (element) => {
          // Ignora elementos que podem causar problemas
          return element.classList.contains('ignore-pdf') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'NOSCRIPT';
        }
      });

      // Restaurar estilos originais
      originalStyles.forEach(({ element, property, value }) => {
        element.style[property] = value;
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = format === 'a4' ? 210 : 216;
      const pageHeight = format === 'a4' ? 295 : 279;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Cria o documento PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Adiciona metadados
      pdf.setProperties({
        title,
        author: 'Mottu Sistema',
        creator: 'Mottu Sistema',
        subject: 'Relatório de Gestão'
      });

      // Adiciona título
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, margin);

      let position = margin + 10;

      // Adiciona a imagem
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth - (margin * 2), imgHeight);

      heightLeft -= pageHeight;

      // Adiciona páginas se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth - (margin * 2), imgHeight);
        heightLeft -= pageHeight;
      }

      // Adiciona rodapé
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
          margin,
          pdf.internal.pageSize.height - margin / 2
        );
      }

      // Salva o arquivo
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF. Tente novamente.');
    }
  }

  /**
   * Gera PDF com dados estruturados
   */
  async generateFromData(
    data: PDFData,
    options: PDFOptions = {}
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
        subject: data.metadata?.subject || 'Relatório de Gestão',
        keywords: data.metadata?.keywords || 'relatório, mottu, gestão'
      });

      let yPosition = margin;

      // Cabeçalho
      if (data.header) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.header, margin, yPosition);
        yPosition += 10;
      }

      // Título
      pdf.setFontSize(18);
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

      // Conteúdo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (typeof data.content === 'string') {
        const lines = pdf.splitTextToSize(data.content, pdf.internal.pageSize.width - (margin * 2));
        pdf.text(lines, margin, yPosition);
      }

      // Rodapé
      if (data.footer) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          data.footer,
          margin,
          pdf.internal.pageSize.height - margin
        );
      }

      // Salva o arquivo
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar PDF. Tente novamente.');
    }
  }

  /**
   * Gera PDF de relatório de ocupação
   */
  async generateOcupacaoReport(
    data: {
      totalBoxes: number;
      boxesOcupados: number;
      taxaOcupacao: number;
      patioNome?: string;
      periodo?: string;
    },
    options: PDFOptions = {}
  ): Promise<void> {
    const content = `
RELATÓRIO DE OCUPAÇÃO
${data.patioNome ? `Pátio: ${data.patioNome}` : ''}
${data.periodo ? `Período: ${data.periodo}` : ''}

RESUMO:
• Total de Boxes: ${data.totalBoxes}
• Boxes Ocupados: ${data.boxesOcupados}
• Taxa de Ocupação: ${data.taxaOcupacao}%

ANÁLISE:
${data.taxaOcupacao >= 80 ? 'Alta ocupação - Considerar expansão' : 
  data.taxaOcupacao >= 50 ? 'Ocupação moderada - Situação normal' : 
  'Baixa ocupação - Avaliar estratégias de atração'}

Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    `;

    await this.generateFromData({
      title: 'Relatório de Ocupação',
      subtitle: data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral',
      content,
      metadata: {
        author: 'Mottu Sistema',
        subject: 'Relatório de Ocupação de Boxes',
        keywords: 'ocupação, boxes, relatório, mottu'
      }
    }, {
      filename: `relatorio-ocupacao-${new Date().toISOString().split('T')[0]}.pdf`,
      ...options
    });
  }

  /**
   * Gera PDF de relatório de movimentação
   */
  async generateMovimentacaoReport(
    data: {
      totalMovimentacoes: number;
      entradas: number;
      saidas: number;
      patioNome?: string;
      periodo?: string;
    },
    options: PDFOptions = {}
  ): Promise<void> {
    const content = `
RELATÓRIO DE MOVIMENTAÇÃO
${data.patioNome ? `Pátio: ${data.patioNome}` : ''}
${data.periodo ? `Período: ${data.periodo}` : ''}

RESUMO:
• Total de Movimentações: ${data.totalMovimentacoes}
• Entradas: ${data.entradas}
• Saídas: ${data.saidas}
• Saldo Líquido: ${data.entradas - data.saidas}

ANÁLISE:
${data.entradas > data.saidas ? 'Saldo positivo - Mais entradas que saídas' :
  data.saidas > data.entradas ? 'Saldo negativo - Mais saídas que entradas' :
  'Saldo equilibrado - Entradas e saídas balanceadas'}

Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    `;

    await this.generateFromData({
      title: 'Relatório de Movimentação',
      subtitle: data.patioNome ? `Pátio: ${data.patioNome}` : 'Visão Geral',
      content,
      metadata: {
        author: 'Mottu Sistema',
        subject: 'Relatório de Movimentação de Veículos',
        keywords: 'movimentação, veículos, relatório, mottu'
      }
    }, {
      filename: `relatorio-movimentacao-${new Date().toISOString().split('T')[0]}.pdf`,
      ...options
    });
  }
}

export default PDFService.getInstance();
