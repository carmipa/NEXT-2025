/**
 * Utilitários para filtros de relatórios
 */

export interface OcupacaoFilter {
  patioId?: number;
  nomePatio?: string;
  statusPatio?: string;
  taxaOcupacaoMin?: number;
  taxaOcupacaoMax?: number;
  totalBoxesMin?: number;
  totalBoxesMax?: number;
  boxesOcupadosMin?: number;
  boxesOcupadosMax?: number;
  dataInicio?: string;
  dataFim?: string;
  ordenacao?: string;
  direcaoOrdenacao?: 'ASC' | 'DESC';
}

export interface MovimentacaoFilter {
  patioId?: number;
  nomePatio?: string;
  veiculoId?: number;
  placaVeiculo?: string;
  tipoMovimentacao?: 'ENTRADA' | 'SAIDA';
  dataInicio?: string;
  dataFim?: string;
  horarioInicio?: string;
  horarioFim?: string;
  diaSemana?: string;
  ordenacao?: string;
  direcaoOrdenacao?: 'ASC' | 'DESC';
  limite?: number;
  offset?: number;
}

export interface ComportamentalFilter {
  patioId?: number;
  nomePatio?: string;
  tipoAnalise?: string;
  dataInicio?: string;
  dataFim?: string;
  horarioInicio?: string;
  horarioFim?: string;
  diaSemana?: string;
  categoriaVeiculo?: string;
  fabricanteVeiculo?: string;
  idadeMinima?: number;
  idadeMaxima?: number;
  sexoCliente?: string;
  ordenacao?: string;
  direcaoOrdenacao?: 'ASC' | 'DESC';
  limite?: number;
  offset?: number;
}

/**
 * Constrói query string para filtros de ocupação
 */
export function buildOcupacaoQueryString(filter: OcupacaoFilter): string {
  const params = new URLSearchParams();
  
  if (filter.patioId) params.append('patioId', filter.patioId.toString());
  if (filter.nomePatio) params.append('nomePatio', filter.nomePatio);
  if (filter.statusPatio) params.append('statusPatio', filter.statusPatio);
  if (filter.taxaOcupacaoMin !== undefined) params.append('taxaOcupacaoMin', filter.taxaOcupacaoMin.toString());
  if (filter.taxaOcupacaoMax !== undefined) params.append('taxaOcupacaoMax', filter.taxaOcupacaoMax.toString());
  if (filter.totalBoxesMin !== undefined) params.append('totalBoxesMin', filter.totalBoxesMin.toString());
  if (filter.totalBoxesMax !== undefined) params.append('totalBoxesMax', filter.totalBoxesMax.toString());
  if (filter.dataInicio) params.append('dataInicio', filter.dataInicio);
  if (filter.dataFim) params.append('dataFim', filter.dataFim);
  if (filter.ordenacao) params.append('ordenacao', filter.ordenacao);
  if (filter.direcaoOrdenacao) params.append('direcaoOrdenacao', filter.direcaoOrdenacao);
  
  return params.toString();
}

/**
 * Constrói query string para filtros de movimentação
 */
export function buildMovimentacaoQueryString(filter: MovimentacaoFilter): string {
  const params = new URLSearchParams();
  
  if (filter.patioId) params.append('patioId', filter.patioId.toString());
  if (filter.nomePatio) params.append('nomePatio', filter.nomePatio);
  if (filter.veiculoId) params.append('veiculoId', filter.veiculoId.toString());
  if (filter.placaVeiculo) params.append('placaVeiculo', filter.placaVeiculo);
  if (filter.tipoMovimentacao) params.append('tipoMovimentacao', filter.tipoMovimentacao);
  if (filter.dataInicio) params.append('dataInicio', filter.dataInicio);
  if (filter.dataFim) params.append('dataFim', filter.dataFim);
  if (filter.horarioInicio) params.append('horarioInicio', filter.horarioInicio);
  if (filter.horarioFim) params.append('horarioFim', filter.horarioFim);
  if (filter.diaSemana) params.append('diaSemana', filter.diaSemana);
  if (filter.ordenacao) params.append('ordenacao', filter.ordenacao);
  if (filter.direcaoOrdenacao) params.append('direcaoOrdenacao', filter.direcaoOrdenacao);
  if (filter.limite) params.append('limite', filter.limite.toString());
  if (filter.offset) params.append('offset', filter.offset.toString());
  
  return params.toString();
}

/**
 * Constrói query string para filtros comportamentais
 */
export function buildComportamentalQueryString(filter: ComportamentalFilter): string {
  const params = new URLSearchParams();
  
  if (filter.patioId) params.append('patioId', filter.patioId.toString());
  if (filter.nomePatio) params.append('nomePatio', filter.nomePatio);
  if (filter.tipoAnalise) params.append('tipoAnalise', filter.tipoAnalise);
  if (filter.dataInicio) params.append('dataInicio', filter.dataInicio);
  if (filter.dataFim) params.append('dataFim', filter.dataFim);
  if (filter.horarioInicio) params.append('horarioInicio', filter.horarioInicio);
  if (filter.horarioFim) params.append('horarioFim', filter.horarioFim);
  if (filter.diaSemana) params.append('diaSemana', filter.diaSemana);
  if (filter.categoriaVeiculo) params.append('categoriaVeiculo', filter.categoriaVeiculo);
  if (filter.fabricanteVeiculo) params.append('fabricanteVeiculo', filter.fabricanteVeiculo);
  if (filter.idadeMinima !== undefined) params.append('idadeMinima', filter.idadeMinima.toString());
  if (filter.idadeMaxima !== undefined) params.append('idadeMaxima', filter.idadeMaxima.toString());
  if (filter.sexoCliente) params.append('sexoCliente', filter.sexoCliente);
  if (filter.ordenacao) params.append('ordenacao', filter.ordenacao);
  if (filter.direcaoOrdenacao) params.append('direcaoOrdenacao', filter.direcaoOrdenacao);
  if (filter.limite) params.append('limite', filter.limite.toString());
  if (filter.offset) params.append('offset', filter.offset.toString());
  
  return params.toString();
}

/**
 * Exemplo de uso dos filtros
 */
export const exemploUsoFiltros = {
  // Filtro para ocupação - pátios com taxa de ocupação entre 50% e 90%
  ocupacao: {
    taxaOcupacaoMin: 50,
    taxaOcupacaoMax: 90,
    ordenacao: 'taxaOcupacao',
    direcaoOrdenacao: 'DESC' as const
  } as OcupacaoFilter,

  // Filtro para movimentação - entradas na última semana
  movimentacao: {
    tipoMovimentacao: 'ENTRADA' as const,
    dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    ordenacao: 'dataHoraMovimentacao',
    direcaoOrdenacao: 'DESC' as const
  } as MovimentacaoFilter,

  // Filtro para análise comportamental - padrões de horário de pico
  comportamental: {
    tipoAnalise: 'HORARIOS_PICO',
    horarioInicio: '07:00',
    horarioFim: '09:00',
    diaSemana: 'MONDAY'
  } as ComportamentalFilter
};
