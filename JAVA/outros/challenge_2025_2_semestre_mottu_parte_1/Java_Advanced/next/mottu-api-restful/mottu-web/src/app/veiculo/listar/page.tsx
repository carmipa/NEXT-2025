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
        <main className="min-h-screen text-white p-4 md:p-8 pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-bicycle mr-3 text-4xl text-[var(--color-mottu-dark)]"></i>
                                Motos Cadastradas
                            </h1>
                            <Link href="/veiculo/cadastrar" className="neumorphic-button mt-4 sm:mt-0">
                                <i className="ion-ios-add mr-2"></i> Nova Moto
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

                    <fieldset className="neumorphic-fieldset mb-8">
                        <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Filtros de Busca</legend>
                        <form onSubmit={handleFilterSubmit} className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                <input type="text" name="placa" value={filtros.placa || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="Filtrar por placa..." style={{fontFamily: 'Montserrat, sans-serif'}} />
                                <input type="text" name="modelo" value={filtros.modelo || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="Filtrar por modelo..." style={{fontFamily: 'Montserrat, sans-serif'}} />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 neumorphic-button-green">
                                        <Search size={16} className="mr-1 inline" /> Buscar
                                    </button>
                                    <button type="button" onClick={handleClearFilters} className="flex-1 neumorphic-button">
                                        <i className="ion-ios-close mr-1"></i> Limpar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>

                    {/* Toggle de Visualização */}
                    <div className="flex justify-center mb-6">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-apps"></i>
                                Cards
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'table' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-list"></i>
                                Tabela
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="text-center text-slate-100 py-10">Carregando veículos...</p>
                    ) : veiculos.length > 0 ? (
                        viewType === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {veiculos.map((veiculo) => (
                                    <div key={veiculo.idVeiculo} className="neumorphic-card-gradient p-6 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {veiculo.idVeiculo}</span>
                                                    <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={veiculo.placa} style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.placa}</h2>
                                                </div>
                                                {getStatusChip(veiculo.status)}
                                            </div>
                                            <div className="space-y-3 text-sm mb-4">
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-[var(--color-mottu-dark)] w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo:</span> 
                                                    <span className="text-slate-600 truncate ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-[var(--color-mottu-dark)] w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Fabricante:</span> 
                                                    <span className="text-slate-600 truncate ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.fabricante}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-[var(--color-mottu-dark)] w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Ano:</span> 
                                                    <span className="text-slate-600 ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center gap-2 pt-4 mt-auto">
                                            <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                <i className="ion-ios-eye text-xl"></i>
                                            </Link>
                                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo">
                                                <i className="ion-ios-create text-xl"></i>
                                            </Link>
                                            <button onClick={() => handleDeleteVeiculo(veiculo.idVeiculo, veiculo.placa)} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo">
                                                <i className="ion-ios-trash text-xl"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="neumorphic-container p-6 mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Placa</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Fabricante</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ano</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Status</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {veiculos.map((veiculo) => (
                                                <tr key={veiculo.idVeiculo} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.idVeiculo}</td>
                                                    <td className="px-4 py-3 font-mono font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.placa}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.fabricante}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</td>
                                                    <td className="px-4 py-3">
                                                        {getStatusChip(veiculo.status)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center items-center gap-1">
                                                            <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                                <i className="ion-ios-eye"></i>
                                                            </Link>
                                                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar">
                                                                <i className="ion-ios-create"></i>
                                                            </Link>
                                                            <button onClick={() => handleDeleteVeiculo(veiculo.idVeiculo, veiculo.placa)} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir">
                                                                <i className="ion-ios-trash"></i>
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
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-100">
                            <div className="mb-2 sm:mb-0" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                Página <strong>{pageInfo.number + 1}</strong> de <strong>{pageInfo.totalPages}</strong> (Total: {pageInfo.totalElements} veículos)
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={isLoading || pageInfo.first} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-arrow-back"></i> Anterior
                                </button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={isLoading || pageInfo.last} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Próxima <i className="ion-ios-arrow-forward"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </main>
    );
}
