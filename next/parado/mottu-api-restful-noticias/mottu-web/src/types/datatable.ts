export interface DataTableRequest {
  draw: number;
  start?: number;
  length?: number;
  searchValue?: string;
  searchRegex?: boolean;
  orderColumn?: number;
  orderDirection?: 'asc' | 'desc';
  columns?: DataTableColumn[];
  additionalParams?: Record<string, any>;
}

export interface DataTableColumn {
  data: string;
  name: string;
  searchable: boolean;
  orderable: boolean;
  searchValue?: string;
  searchRegex?: boolean;
}

export interface DataTableResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
  error?: string;
  processingTime?: number;
}

export interface DataTableConfig {
  pageSize: number;
  pageSizes: number[];
  sortable: boolean;
  searchable: boolean;
  pagination: boolean;
  serverSide: boolean;
}

export interface DataTableState {
  currentPage: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  searchValue: string;
  loading: boolean;
  error: string | null;
}











