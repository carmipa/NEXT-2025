"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { VeiculoService } from '@/utils/api';
import { VeiculoResponseDto, VeiculoFilter } from '@/types/veiculo';
import { SpringPage } from '@/types/common';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Search } from 'lucide-react';
// Ícones substituídos por Ionicons no markup
import '@/styles/neumorphic.css';

const initialFilterState: VeiculoFilter = {
    placa: '',
    modelo: '',
    fabricante: '',
    ano: undefined,
};

export default function ListarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<VeiculoResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtros, setFiltros] = useState<VeiculoFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idVeiculo,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);
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

    useEffect(() => {
        fetchData(0, initialFilterState);
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filtros);
    };

    const handleClearFilters = () => {
        setFiltros(initialFilterState);
        setCurrentPage(0);
        fetchData(0, initialFilterState);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filtros);
    };

    // Função para filtrar dados localmente como na página de pátios
    const getFilteredData = () => {
        return veiculos.filter((item: VeiculoResponseDto) => {
            const searchFields = [
                item.placa,
                item.modelo,
                item.fabricante
            ];
            return searchFields.some(field => 
                field && field.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    };

    // Funções de paginação para dados filtrados
    const getPaginatedData = () => {
        const filteredData = getFilteredData();
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        const filteredData = getFilteredData();
        return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    };

    // Reset da página quando mudar o filtro
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const handleDeleteVeiculo = async (veiculoId: number, placa: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o veículo de placa "${placa}" (ID: ${veiculoId})?`)) {
            try {
                await VeiculoService.delete(veiculoId);
                setSuccessMessage(`Veículo "${placa}" excluído com sucesso!`);
                const pageToFetchAfterDelete = (pageInfo?.first && veiculos.length === 1 && currentPage > 0) ? currentPage - 1 : currentPage;
                fetchData(pageToFetchAfterDelete, filtros);
                setTimeout(() => setSuccessMessage(null), 4000);
            } catch (err: any) {
                setError(err.response?.data?.message || `Erro ao excluir veículo "${placa}".`);
            }
        }
    };

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
    }

    return (
        <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-3 sm:p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-bicycle mr-2 sm:mr-3 text-2xl sm:text-4xl text-emerald-500"></i>
                                <span className="hidden sm:inline">Motos Cadastradas</span>
                                <span className="sm:hidden">Motos</span>
                            </h1>
                            <Link href="/veiculo/cadastrar" className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center gap-2 mt-4 sm:mt-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-add text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">NOVA MOTO</span>
                                </div>
                            </Link>
                        </div>

                    {successMessage && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                            <MdCheckCircle className="text-xl" /> <span>{successMessage}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300" role="alert">
                            <MdErrorOutline className="text-xl" /> <span>{error}</span>
                        </div>
                    )}

                    {/* Search */}
                    <div className="mb-6 sm:mb-8 neumorphic-container">
                        <div className="relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                            <input
                                type="text"
                                placeholder=""
                                title="Buscar veículos"
                                aria-label="Buscar veículos"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neumorphic-input pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Toggle de Visualização */}
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

                    {isLoading ? (
                        <p className="text-center text-slate-100 py-10">Carregando veículos...</p>
                    ) : veiculos.length > 0 ? (
                        viewType === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {veiculos.map((veiculo) => (
                                    <div key={veiculo.idVeiculo} className="neumorphic-card-gradient p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
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
                                            <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                <i className="ion-ios-eye text-lg sm:text-xl"></i>
                                            </Link>
                                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1.5 sm:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo">
                                                <i className="ion-ios-create text-lg sm:text-xl"></i>
                                            </Link>
                                            <button onClick={() => handleDeleteVeiculo(veiculo.idVeiculo, veiculo.placa)} className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo">
                                                <i className="ion-ios-trash text-lg sm:text-xl"></i>
                                            </button>
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
                                                <tr key={veiculo.idVeiculo} className="hover:bg-slate-50 transition-colors">
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
                                                            <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                                <i className="ion-ios-eye text-sm"></i>
                                                            </Link>
                                                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar">
                                                                <i className="ion-ios-create text-sm"></i>
                                                            </Link>
                                                            <button onClick={() => handleDeleteVeiculo(veiculo.idVeiculo, veiculo.placa)} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir">
                                                                <i className="ion-ios-trash text-sm"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-10">
                            <i className="ion-ios-information-circle text-slate-300 mb-2" style={{fontSize: '48px'}}></i>
                            <p className="text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>Nenhum veículo encontrado.</p>
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-slate-100">
                            <div className="mb-2 sm:mb-0 text-center sm:text-left" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Página <strong>{pageInfo.number + 1}</strong> de <strong>{pageInfo.totalPages}</strong> 
                                <span className="hidden sm:inline"> (Total: {pageInfo.totalElements} veículos)</span>
                                <span className="sm:hidden"> ({pageInfo.totalElements})</span>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={isLoading || pageInfo.first} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-arrow-back text-sm"></i> 
                                    <span className="hidden sm:inline">Anterior</span>
                                    <span className="sm:hidden">Ant</span>
                                </button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={isLoading || pageInfo.last} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <span className="hidden sm:inline">Próxima</span>
                                    <span className="sm:hidden">Próx</span>
                                    <i className="ion-ios-arrow-forward text-sm"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </main>
    );
}
