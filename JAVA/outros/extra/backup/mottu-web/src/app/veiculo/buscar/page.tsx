"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdClear, MdEdit, MdDelete, MdVisibility, MdErrorOutline } from 'react-icons/md';
import { Car, Search as SearchIconLucide } from 'lucide-react';
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
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
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
        <>
            <NavBar active="veiculo" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} /> Buscar Veículos
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                            <input type="text" name="placa" value={filter.placa || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Placa"/>
                            <input type="text" name="modelo" value={filter.modelo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Modelo"/>
                            <input type="text" name="fabricante" value={filter.fabricante || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Fabricante"/>
                            <input type="number" name="ano" value={filter.ano || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Ano"/>
                            <input type="text" name="clienteCpf" value={filter.clienteCpf || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="CPF do Cliente"/>
                            <input type="text" name="tagBleId" value={filter.tagBleId || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="ID da Tag BLE"/>

                            <div className="lg:col-span-full flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 h-10">
                                    <MdSearch size={20} /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-slate-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 h-10">
                                    <MdClear size={20} /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && veiculos.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum veículo encontrado.</p></div>
                    )}

                    {!isLoading && veiculos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {veiculos.map((veiculo) => (
                                <div key={veiculo.idVeiculo} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {veiculo.idVeiculo}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{veiculo.placa}</h2>
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">Modelo: {veiculo.modelo}</p>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Veículo"><MdEdit size={20}/></Link>
                                        <Link href={`/veiculo/deletar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Veículo"><MdDelete size={20}/></Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
