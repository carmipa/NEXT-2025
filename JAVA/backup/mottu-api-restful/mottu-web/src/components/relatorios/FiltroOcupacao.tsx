'use client';

import React, { useState } from 'react';
import { OcupacaoFilter } from '@/utils/relatorioFilters';

interface FiltroOcupacaoProps {
  onFiltroChange: (filtro: OcupacaoFilter) => void;
  onLimparFiltros: () => void;
}

export default function FiltroOcupacao({ onFiltroChange, onLimparFiltros }: FiltroOcupacaoProps) {
  const [filtro, setFiltro] = useState<OcupacaoFilter>({});

  const handleInputChange = (campo: keyof OcupacaoFilter, valor: any) => {
    const novoFiltro = { ...filtro, [campo]: valor };
    setFiltro(novoFiltro);
    onFiltroChange(novoFiltro);
  };

  const handleLimparFiltros = () => {
    setFiltro({});
    onLimparFiltros();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros de Ocupação</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro por ID do Pátio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID do Pátio
          </label>
          <input
            type="number"
            value={filtro.patioId || ''}
            onChange={(e) => handleInputChange('patioId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o ID do pátio"
          />
        </div>

        {/* Filtro por Nome do Pátio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Pátio
          </label>
          <input
            type="text"
            value={filtro.nomePatio || ''}
            onChange={(e) => handleInputChange('nomePatio', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome do pátio"
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filtro.statusPatio || ''}
            onChange={(e) => handleInputChange('statusPatio', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="A">Ativo</option>
            <option value="I">Inativo</option>
            <option value="M">Manutenção</option>
          </select>
        </div>

        {/* Filtro por Taxa de Ocupação Mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Ocupação Mínima (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filtro.taxaOcupacaoMin || ''}
            onChange={(e) => handleInputChange('taxaOcupacaoMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Filtro por Taxa de Ocupação Máxima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Ocupação Máxima (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filtro.taxaOcupacaoMax || ''}
            onChange={(e) => handleInputChange('taxaOcupacaoMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
          />
        </div>

        {/* Filtro por Total de Boxes Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total de Boxes Mínimo
          </label>
          <input
            type="number"
            min="1"
            value={filtro.totalBoxesMin || ''}
            onChange={(e) => handleInputChange('totalBoxesMin', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
        </div>

        {/* Filtro por Total de Boxes Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total de Boxes Máximo
          </label>
          <input
            type="number"
            min="1"
            value={filtro.totalBoxesMax || ''}
            onChange={(e) => handleInputChange('totalBoxesMax', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1000"
          />
        </div>

        {/* Filtro por Data de Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Início
          </label>
          <input
            type="date"
            value={filtro.dataInicio || ''}
            onChange={(e) => handleInputChange('dataInicio', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro por Data de Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Fim
          </label>
          <input
            type="date"
            value={filtro.dataFim || ''}
            onChange={(e) => handleInputChange('dataFim', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro por Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            value={filtro.ordenacao || ''}
            onChange={(e) => handleInputChange('ordenacao', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="nomePatio">Nome do Pátio</option>
            <option value="taxaOcupacao">Taxa de Ocupação</option>
            <option value="totalBoxes">Total de Boxes</option>
            <option value="boxesOcupados">Boxes Ocupados</option>
            <option value="dataCadastro">Data de Cadastro</option>
          </select>
        </div>

        {/* Filtro por Direção de Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direção
          </label>
          <select
            value={filtro.direcaoOrdenacao || 'ASC'}
            onChange={(e) => handleInputChange('direcaoOrdenacao', e.target.value as 'ASC' | 'DESC')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ASC">Crescente</option>
            <option value="DESC">Decrescente</option>
          </select>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleLimparFiltros}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Limpar Filtros
        </button>
        <button
          onClick={() => onFiltroChange(filtro)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
