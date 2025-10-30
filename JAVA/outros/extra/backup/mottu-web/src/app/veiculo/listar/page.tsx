"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { VeiculoService } from '@/utils/api';
import { VeiculoResponseDto, VeiculoFilter } from '@/types/veiculo';
import { SpringPage } from '@/types/common';
import { MdSearch, MdClear, MdAdd, MdChevronLeft, MdChevronRight, MdEdit, MdDelete, MdVisibility, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Car, ShieldCheck } from 'lucide-react';

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
        <>
            <NavBar active="veiculo" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <Car size={32} className="mr-3" />
                            Veículos Cadastrados
                        </h1>
                        <Link href="/veiculo/cadastrar" className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors duration-200">
                            <MdAdd size={20} /> Novo Veículo
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

                    <form onSubmit={handleFilterSubmit} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                            <input type="text" name="placa" value={filtros.placa || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Filtrar por placa..." />
                            <input type="text" name="modelo" value={filtros.modelo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Filtrar por modelo..." />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md hover:bg-opacity-80">
                                    <MdSearch /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-medium text-slate-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    <MdClear /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading ? (
                        <p className="text-center text-slate-100 py-10">Carregando veículos...</p>
                    ) : veiculos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {veiculos.map((veiculo) => (
                                <div key={veiculo.idVeiculo} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">ID: {veiculo.idVeiculo}</span>
                                                <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={veiculo.placa}>{veiculo.placa}</h2>
                                            </div>
                                            {getStatusChip(veiculo.status)}
                                        </div>
                                        <div className="space-y-2 text-sm mb-4">
                                            <p className="flex items-center"><strong className="w-24">Modelo:</strong> <span className="text-slate-600 truncate">{veiculo.modelo}</span></p>
                                            <p className="flex items-center"><strong className="w-24">Fabricante:</strong> <span className="text-slate-600 truncate">{veiculo.fabricante}</span></p>
                                            <p className="flex items-center"><strong className="w-24">Ano:</strong> <span className="text-slate-600">{veiculo.ano}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-auto">
                                        <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                            <MdVisibility size={22} />
                                        </Link>
                                        <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo">
                                            <MdEdit size={20} />
                                        </Link>
                                        <button onClick={() => handleDeleteVeiculo(veiculo.idVeiculo, veiculo.placa)} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo">
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <MdErrorOutline size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-300">Nenhum veículo encontrado.</p>
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-100">
                            <div className="mb-2 sm:mb-0">
                                Página <strong>{pageInfo.number + 1}</strong> de <strong>{pageInfo.totalPages}</strong> (Total: {pageInfo.totalElements} veículos)
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={isLoading || pageInfo.first} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                    <MdChevronLeft size={18} /> Anterior
                                </button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={isLoading || pageInfo.last} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                    Próxima <MdChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
