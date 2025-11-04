'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInput?: boolean;
  className?: string;
}

export default function ModernPagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageInput = true,
  className = ''
}: ModernPaginationProps) {
  // Função para gerar os números das páginas a serem exibidos
  const getPageNumbers = () => {
    const delta = 2; // Número de páginas antes e depois da atual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 ${className}`}>
      {/* Informações da página */}
      <div className="text-xs sm:text-sm text-white font-montserrat">
        Página {currentPage} de {totalPages}
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Botão Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
            transition-all duration-200 hover:scale-105
            ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-500 text-gray-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:-translate-y-1'
            }
          `}
          title="Página anterior"
        >
          <ChevronLeft size={14} className="sm:hidden" />
          <ChevronLeft size={16} className="hidden sm:block" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="px-2 py-1">
                  <MoreHorizontal size={16} className="text-slate-300" />
                </div>
              );
            }

            const pageNum = page as number;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium
                  transition-all duration-200 hover:scale-110
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-lg transform hover:-translate-y-1'
                  }
                `}
                title={`Ir para página ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
            transition-all duration-200 hover:scale-105
            ${currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed bg-gray-500 text-gray-300'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg transform hover:-translate-y-1'
            }
          `}
          title="Próxima página"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight size={14} className="sm:hidden" />
          <ChevronRight size={16} className="hidden sm:block" />
        </button>
      </div>

      {/* Input para pular para página específica */}
      {showPageInput && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
          <span className="font-montserrat hidden sm:inline">Ir para:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-12 sm:w-16 px-2 py-1 text-center bg-white/20 border border-white/30 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            title="Digite o número da página"
          />
          <span className="font-montserrat">de {totalPages}</span>
        </div>
      )}
    </div>
  );
}
