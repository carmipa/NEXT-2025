"use client";

interface NotificationPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function NotificationPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: NotificationPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se total <= 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas com muitos resultados
      if (currentPage <= 3) {
        // Primeiras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Últimas páginas
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas do meio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
      <div className="text-sm text-gray-700">
        {totalItems} notificação{totalItems !== 1 ? 'ões' : ''} total
      </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
      <div className="text-sm text-gray-700">
        Mostrando {startItem} a {endItem} de {totalItems} notificação{totalItems !== 1 ? 'ões' : ''}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Botão Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="neumorphic-button px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200"
          title="Página anterior"
        >
          <i className="ion-ios-arrow-back text-sm"></i>
        </button>

        {/* Números das páginas */}
        <div className="flex items-center space-x-1">
          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                page === currentPage
                  ? 'neumorphic-button-primary text-white font-semibold'
                  : page === '...'
                  ? 'text-gray-500 cursor-default'
                  : 'neumorphic-button hover:shadow-md'
              }`}
              title={typeof page === 'number' ? `Ir para página ${page}` : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="neumorphic-button px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200"
          title="Próxima página"
        >
          <i className="ion-ios-arrow-forward text-sm"></i>
        </button>
      </div>
    </div>
  );
}
