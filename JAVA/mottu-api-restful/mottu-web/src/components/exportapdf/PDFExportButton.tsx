"use client";

import React, { useState } from 'react';
import { MdPictureAsPdf } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import PDFService from './PDFService';
import '@/types/styles/neumorphic.css';

interface PDFExportButtonProps {
  elementId?: string;
  filename?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onExport?: () => void;
  onError?: (error: string) => void;
}

export default function PDFExportButton({
  elementId,
  filename = 'relatorio.pdf',
  title = 'Relatório',
  className = '',
  children,
  disabled = false,
  onExport,
  onError
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    
    try {
      onExport?.();

      if (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error('Elemento não encontrado para exportação');
        }

        await PDFService.generateFromElement(element, {
          filename,
          title
        });
      } else {
        // Exportação genérica sem elemento específico
        await PDFService.generateFromData({
          title,
          content: 'Relatório gerado com sucesso',
          metadata: {
            author: 'Mottu Sistema',
            subject: title
          }
        }, {
          filename
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro na exportação PDF:', error);
      onError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`neumorphic-button flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={`Exportar ${title} em PDF`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Gerando PDF...</span>
        </>
      ) : (
        <>
          <MdPictureAsPdf className="w-5 h-5 text-red-600" />
          {children || 'Exportar PDF'}
        </>
      )}
    </button>
  );
}





