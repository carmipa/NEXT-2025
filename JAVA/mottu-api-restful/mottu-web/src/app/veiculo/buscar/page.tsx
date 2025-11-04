"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
// Ícones substituídos por Ionicons no markup
import '@/styles/neumorphic.css';
import { VeiculoResponseDto, VeiculoFilter } from '@/types/veiculo';
import { SpringPage } from '@/types/common';
import { VeiculoService } from '@/utils/api';

const initialFilterState: VeiculoFilter = {
    placa: '', renavam: '', chassi: '', fabricante: '', modelo: '', motor: '',
    ano: undefined, combustivel: '', clienteCpf: '', boxNome: '', patioNome: '', zonaNome: '',
    tagBleId: '',
};

export default function BuscarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<VeiculoResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<VeiculoFilter>(initialFilterState);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

    const getStatusChip = (status: string | undefined) => {
        switch (status) {
            case 'OPERACIONAL':
                return <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Operacional</span>;
            case 'EM_MANUTENCAO':
                return <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Manutenção</span>;
            case 'INATIVO':
                return <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-0.5 rounded-full">Inativo</span>;
            default:
                return <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">N/A</span>;
        }
    };
    
    // Estados para busca rápida
    const [quickQuery, setQuickQuery] = useState('');
    const [quickField, setQuickField] = useState<keyof VeiculoFilter>('placa');

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idVeiculo,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setVeiculos([]);
            setPageInfo(null);
        }

        try {
            const data = await VeiculoService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setVeiculos(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar veículos.');
            setVeiculos([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        
        // Criar filtro baseado na busca rápida
        const searchFilter: VeiculoFilter = {
            ...initialFilterState,
            [quickField]: quickQuery.trim()
        };
        
        fetchData(0, searchFilter);
    };

    const handleClearFilters = () => {
        setQuickQuery('');
        setQuickField('placa');
        setVeiculos([]);
        setPageInfo(null);
        setCurrentPage(0);
        setHasSearched(false);
        setError(null);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    return (
        <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-3 sm:p-6 md:p-8">
                        <h1 className="flex items-center justify-center gap-1 sm:gap-2 text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <Search size={24} className="text-blue-500 sm:hidden" />
                            <Search size={32} className="text-blue-500 hidden sm:block" />
                            <span className="hidden sm:inline">Buscar Veículos</span>
                            <span className="sm:hidden">Buscar</span>
                        </h1>

                    <fieldset className="neumorphic-fieldset mb-6 sm:mb-8">
                        <legend className="neumorphic-legend text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>Filtros de Busca</legend>
                        
                        {/* Search Form - padrão input + seletor + botões */}
                        <form onSubmit={handleSearch} className="mt-4 sm:mt-6">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="flex-1">
                                    <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                                        <i className="ion-ios-search text-blue-400 text-sm lg:text-base"></i>
                                        Valor
                                    </label>
                                    <input
                                        type="text"
                                        value={quickQuery}
                                        onChange={(e) => setQuickQuery(e.target.value.toUpperCase())}
                                        style={{ textTransform: 'uppercase' }}
                                        className="neumorphic-input w-full text-sm lg:text-base"
                                        placeholder={quickField === 'placa' ? 'Digite a placa...'
                                            : quickField === 'modelo' ? 'Digite o modelo...'
                                            : quickField === 'fabricante' ? 'Digite o fabricante...'
                                            : quickField === 'ano' ? 'Digite o ano...'
                                            : 'Digite o ID da tag BLE...'}
                                    />
                                </div>
                                <div className="w-full md:w-52">
                                    <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                                        <i className="ion-ios-funnel text-purple-400 text-sm lg:text-base"></i>
                                        Filtrar por
                                    </label>
                                    <select
                                        value={quickField}
                                        onChange={(e) => setQuickField(e.target.value as keyof VeiculoFilter)}
                                        className="neumorphic-input w-full text-sm lg:text-base"
                                    >
                                        <option value="placa">Placa</option>
                                        <option value="modelo">Modelo</option>
                                        <option value="fabricante">Fabricante</option>
                                        <option value="ano">Ano</option>
                                        <option value="tagBleId">ID da Tag BLE</option>
                                    </select>
                                </div>

                                <div className="mt-2 md:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                    <button 
                                        type="submit" 
                                        className={`group relative text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform transition-all duration-300 border-2 flex items-center justify-center gap-2 btn-buscar-turquesa hover:scale-105`}
                                        title="Buscar veículos"
                                    >
                                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300" style={{backgroundColor: '#2BC49A'}}></div>
                                        <div className="relative flex items-center gap-2">
                                            <i className="ion-ios-search text-lg"></i>
                                            <span className="text-sm lg:text-base font-black">BUSCAR</span>
                                        </div>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleClearFilters} 
                                        className="group relative bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
                                        title="Limpar filtros"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                        <div className="relative flex items-center gap-2">
                                            <i className="ion-ios-close text-lg"></i>
                                            <span className="text-sm lg:text-base font-black">LIMPAR</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>

                    {/* Toggle de Visualização */}
                    {hasSearched && !isLoading && (
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="flex bg-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewType('cards')}
                                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
                                        viewType === 'cards' 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                    style={{fontFamily: 'Montserrat, sans-serif'}}
                                >
                                    <i className="ion-ios-apps text-sm sm:text-base"></i>
                                    <span className="hidden sm:inline">Cards</span>
                                    <span className="sm:hidden">Cards</span>
                                </button>
                                <button
                                    onClick={() => setViewType('table')}
                                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
                                        viewType === 'table' 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                    style={{fontFamily: 'Montserrat, sans-serif'}}
                                >
                                    <i className="ion-ios-list text-sm sm:text-base"></i>
                                    <span className="hidden sm:inline">Tabela</span>
                                    <span className="sm:hidden">Tabela</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && veiculos.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum veículo encontrado.</p></div>
                    )}

                    {!isLoading && veiculos.length > 0 && (
                        <>
                            {viewType === 'cards' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                    {veiculos.map((veiculo) => (
                                        <div key={veiculo.idVeiculo} className="neumorphic-card-gradient p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                                            <div>
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {veiculo.idVeiculo}</span>
                                                        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2" title={veiculo.placa} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                            <i className="ion-ios-pricetag text-blue-500 text-base sm:text-lg"></i>
                                                            {veiculo.placa}
                                                        </h2>
                                                    </div>
                                                    {getStatusChip(veiculo.status)}
                                                </div>
                                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-bicycle text-red-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo:</span> 
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-build text-orange-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Fabricante:</span> 
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.fabricante}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-calendar text-indigo-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Ano:</span> 
                                                        <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</span>
                                                    </div>
                                                    {veiculo.tagBleId && (
                                                        <div className="flex items-center">
                                                            <i className="ion-ios-bluetooth text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                            <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Tag:</span> 
                                                            <span className="text-slate-600 truncate ml-1 sm:ml-2 font-mono" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.tagBleId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-1 sm:gap-2 pt-3 sm:pt-4 mt-auto">
                                                <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye text-lg sm:text-xl"></i></Link>
                                                <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1.5 sm:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo"><i className="ion-ios-create text-lg sm:text-xl"></i></Link>
                                                <Link href={`/veiculo/deletar/${veiculo.idVeiculo}`} className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo"><i className="ion-ios-trash text-lg sm:text-xl"></i></Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="neumorphic-container p-3 sm:p-6 mb-6 sm:mb-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-information-circle text-purple-500 text-xs sm:text-sm"></i>
                                                            <span>ID</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-pricetag text-blue-500 text-xs sm:text-sm"></i>
                                                            <span>Placa</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden sm:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-bicycle text-red-500 text-xs sm:text-sm"></i>
                                                            <span>Modelo</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-build text-orange-500 text-xs sm:text-sm"></i>
                                                            <span>Fabricante</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden lg:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-calendar text-indigo-500 text-xs sm:text-sm"></i>
                                                            <span>Ano</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden lg:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-bluetooth text-blue-500 text-xs sm:text-sm"></i>
                                                            <span>Tag</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center gap-1">
                                                            <i className="ion-ios-checkmark-circle text-emerald-500 text-xs sm:text-sm"></i>
                                                            <span>Status</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <i className="ion-ios-settings text-gray-500 text-xs sm:text-sm"></i>
                                                            <span>Ações</span>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {veiculos.map((veiculo) => (
                                                    <tr key={veiculo.idVeiculo} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.idVeiculo}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono font-semibold text-[var(--color-mottu-dark)] text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.placa}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 hidden sm:table-cell truncate max-w-[120px]" style={{fontFamily: 'Montserrat, sans-serif'}} title={veiculo.modelo}>{veiculo.modelo}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 hidden md:table-cell truncate max-w-[120px]" style={{fontFamily: 'Montserrat, sans-serif'}} title={veiculo.fabricante}>{veiculo.fabricante}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 hidden lg:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 hidden lg:table-cell font-mono" style={{fontFamily: 'Montserrat, sans-serif'}} title={veiculo.tagBleId || 'Sem tag'}>
                                                            {veiculo.tagBleId ? (
                                                                <span className="flex items-center gap-1">
                                                                    <i className="ion-ios-bluetooth text-blue-500 text-xs"></i>
                                                                    {veiculo.tagBleId}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                            {getStatusChip(veiculo.status)}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                            <div className="flex justify-center items-center gap-1">
                                                                <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye text-sm"></i></Link>
                                                                <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo"><i className="ion-ios-create text-sm"></i></Link>
                                                                <Link href={`/veiculo/deletar/${veiculo.idVeiculo}`} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo"><i className="ion-ios-trash text-sm"></i></Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Paginação */}
                            {pageInfo && pageInfo.totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-800 rounded-lg p-3 sm:p-4 gap-3 sm:gap-0">
                                    <div className="flex items-center text-xs sm:text-sm text-slate-300 text-center sm:text-left">
                                        <span>Mostrando {veiculos.length} de {pageInfo.totalElements} resultados</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        >
                                            <i className="ion-ios-arrow-back text-sm"></i>
                                            <span className="hidden sm:inline">Anterior</span>
                                            <span className="sm:hidden">Ant</span>
                                        </button>
                                        <span className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            {currentPage + 1}/{pageInfo.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= pageInfo.totalPages - 1}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        >
                                            <span className="hidden sm:inline">Próxima</span>
                                            <span className="sm:hidden">Próx</span>
                                            <i className="ion-ios-arrow-forward text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    </div>
                </div>
            </main>
    );
}
