'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataTableRequest, DataTableResponse } from '@/types/datatable';
import { OcupacaoAtualDto } from '@/types/relatorios';

interface DataTableOcupacaoProps {
  apiEndpoint: string;
  onRowClick?: (row: OcupacaoAtualDto) => void;
}

export default function DataTableOcupacao({ apiEndpoint, onRowClick }: DataTableOcupacaoProps) {
  const [data, setData] = useState<OcupacaoAtualDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draw, setDraw] = useState(1);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordsFiltered, setRecordsFiltered] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const request: DataTableRequest = {
        draw,
        start: currentPage * pageSize,
        length: pageSize,
        searchValue: searchValue || undefined,
        searchRegex: false,
        orderColumn: sortColumn ? 0 : undefined,
        orderDirection: sortDirection,
        columns: [
          {
            data: 'nomePatio',
            name: 'Nome do Pátio',
            searchable: true,
            orderable: true,
            searchValue: '',
            searchRegex: false
          },
          {
            data: 'taxaOcupacao',
            name: 'Taxa de Ocupação',
            searchable: true,
            orderable: true,
            searchValue: '',
            searchRegex: false
          },
          {
            data: 'totalBoxes',
            name: 'Total de Boxes',
            searchable: true,
            orderable: true,
            searchValue: '',
            searchRegex: false
          },
          {
            data: 'boxesOcupados',
            name: 'Boxes Ocupados',
            searchable: true,
            orderable: true,
            searchValue: '',
            searchRegex: false
          },
          {
            data: 'statusPatio',
            name: 'Status',
            searchable: true,
            orderable: true,
            searchValue: '',
            searchRegex: false
          }
        ],
        additionalParams: {}
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result: DataTableResponse<OcupacaoAtualDto> = await response.json();
      
      setData(result.data || []);
      setRecordsTotal(result.recordsTotal || 0);
      setRecordsFiltered(result.recordsFiltered || 0);
      
      if (result.error) {
        setError(result.error);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, draw, currentPage, pageSize, searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(0);
    setDraw(prev => prev + 1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(0);
    setDraw(prev => prev + 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setDraw(prev => prev + 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    setDraw(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'A': { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      'I': { label: 'Inativo', color: 'bg-red-100 text-red-800' },
      'M': { label: 'Manutenção', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getOcupacaoColor = (taxa: number) => {
    if (taxa >= 90) return 'text-red-600 font-bold';
    if (taxa >= 70) return 'text-yellow-600 font-semibold';
    if (taxa >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  const totalPages = Math.ceil(recordsFiltered / pageSize);

  return (
    <div className="bg-white shadow-md rounded-lg">
      {/* Header com busca */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar pátios..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Por página:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Erro: {error}</p>
        </div>
      )}

      {/* Tabela */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nomePatio')}
                >
                  Nome do Pátio
                  {sortColumn === 'nomePatio' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('taxaOcupacao')}
                >
                  Taxa de Ocupação
                  {sortColumn === 'taxaOcupacao' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalBoxes')}
                >
                  Total de Boxes
                  {sortColumn === 'totalBoxes' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('boxesOcupados')}
                >
                  Boxes Ocupados
                  {sortColumn === 'boxesOcupados' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('statusPatio')}
                >
                  Status
                  {sortColumn === 'statusPatio' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr 
                  key={row.patioId || index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.nomePatio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${getOcupacaoColor(row.taxaOcupacao || 0)}`}>
                      {row.taxaOcupacao?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.totalBoxes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.boxesOcupados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(row.statusPatio || 'A')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {!loading && !error && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, recordsFiltered)} de {recordsFiltered} registros
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Primeira
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
