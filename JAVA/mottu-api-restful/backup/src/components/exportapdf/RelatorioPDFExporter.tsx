"use client";

import React, { useState } from 'react';
import { MdPictureAsPdf, MdDownload, MdAnalytics } from 'react-icons/md';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import PDFService from './PDFService';
import '@/types/styles/neumorphic.css';

export interface RelatorioData {
  tipo: 'ocupacao' | 'movimentacao' | 'geral';
  titulo: string;
  dados: any;
  patioNome?: string;
  periodo?: string;
  elementoId?: string; // ID do elemento HTML para captura
}

interface RelatorioPDFExporterProps {
  relatorio: RelatorioData;
  className?: string;
  showSuccessMessage?: boolean;
  onExport?: () => void;
  onError?: (error: string) => void;
}

export default function RelatorioPDFExporter({
  relatorio,
  className = '',
  showSuccessMessage = true,
  onExport,
  onError
}: RelatorioPDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      onExport?.();

      const filename = `relatorio-${relatorio.tipo}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (relatorio.elementoId) {
        // Exporta elemento HTML específico
        const element = document.getElementById(relatorio.elementoId);
        if (!element) {
          throw new Error('Elemento não encontrado para exportação');
        }

        await PDFService.generateFromElement(element, {
          filename,
          title: relatorio.titulo
        });
      } else {
        // Exporta dados estruturados
        switch (relatorio.tipo) {
          case 'ocupacao':
            await PDFService.generateOcupacaoReport({
              totalBoxes: relatorio.dados.totalBoxes || 0,
              boxesOcupados: relatorio.dados.boxesOcupados || 0,
              taxaOcupacao: relatorio.dados.taxaOcupacao || 0,
              patioNome: relatorio.patioNome,
              periodo: relatorio.periodo
            }, { filename });
            break;

          case 'movimentacao':
            await PDFService.generateMovimentacaoReport({
              totalMovimentacoes: relatorio.dados.totalMovimentacoes || 0,
              entradas: relatorio.dados.entradas || 0,
              saidas: relatorio.dados.saidas || 0,
              patioNome: relatorio.patioNome,
              periodo: relatorio.periodo
            }, { filename });
            break;

          default:
            // Relatório genérico
            const content = `
RELATÓRIO: ${relatorio.titulo}
${relatorio.patioNome ? `Pátio: ${relatorio.patioNome}` : ''}
${relatorio.periodo ? `Período: ${relatorio.periodo}` : ''}

DADOS:
${JSON.stringify(relatorio.dados, null, 2)}

Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            `;

            await PDFService.generateFromData({
              title: relatorio.titulo,
              content,
              metadata: {
                author: 'Mottu Sistema',
                subject: relatorio.titulo
              }
            }, { filename });
        }
      }

      if (showSuccessMessage) {
        setMessage({
          type: 'success',
          text: 'PDF gerado com sucesso!'
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro na exportação PDF:', error);
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
      
      onError?.(errorMessage);
      
      if (showSuccessMessage) {
        setTimeout(() => setMessage(null), 5000);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getIcon = () => {
    switch (relatorio.tipo) {
      case 'ocupacao':
        return <MdAnalytics className="w-5 h-5 text-blue-600" />;
      case 'movimentacao':
        return <MdDownload className="w-5 h-5 text-green-600" />;
      default:
        return <MdPictureAsPdf className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="neumorphic-button flex items-center gap-3 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200"
        title={`Exportar ${relatorio.titulo} em PDF`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span>Gerando PDF...</span>
          </>
        ) : (
          <>
            {getIcon()}
            <span>Exportar {relatorio.titulo}</span>
          </>
        )}
      </button>

      {message && showSuccessMessage && (
        <div className={`neumorphic-container p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
}





