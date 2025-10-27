// src/app/zona/buscar/page.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdClear, MdEdit, MdDelete, MdVisibility, MdErrorOutline } from 'react-icons/md';
import { MapPin as ZonaIcon, Search as SearchIconLucide } from 'lucide-react';
import { ZonaResponseDto, ZonaFilter } from '@/types/zona';
import { SpringPage } from '@/types/common';
import { ZonaService } from '@/utils/api';

const initialFilterState: ZonaFilter = {
    nome: '',
    dataEntradaInicio: '',
    dataEntradaFim: '',
    dataSaidaInicio: '',
    dataSaidaFim: '',
    observacao: '',
    boxNome: '',
    veiculoPlaca: '',
    patioNome: '',
};

export default function BuscarZonasPage() {
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ZonaResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<ZonaFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idZona,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setZonas([]);
            setPageInfo(null);
        }

        try {
            const data = await ZonaService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setZonas(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar zonas.');
            setZonas([]);
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
        setZonas([]);
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
            <NavBar active="zona" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} /> Buscar Zonas
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                            <input type="text" name="nome" value={filter.nome || ''} onChange={handleFilterChange} placeholder="Nome da Zona..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="patioNome" value={filter.patioNome || ''} onChange={handleFilterChange} placeholder="Nome do Pátio..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="boxNome" value={filter.boxNome || ''} onChange={handleFilterChange} placeholder="Nome do Box..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="veiculoPlaca" value={filter.veiculoPlaca || ''} onChange={handleFilterChange} placeholder="Placa do Veículo..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>

                            <div className="md:col-span-full flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
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

                    {!isLoading && hasSearched && zonas.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhuma zona encontrada.</p></div>
                    )}

                    {!isLoading && zonas.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {zonas.map((zona) => (
                                <div key={zona.idZona} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {zona.idZona}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{zona.nome}</h2>
                                        </div>
                                        <p className="text-sm text-slate-600">Entrada: {new Date(zona.dataEntrada).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/zona/detalhes/${zona.idZona}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/zona/alterar/${zona.idZona}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Zona"><MdEdit size={20}/></Link>
                                        <Link href={`/zona/deletar/${zona.idZona}`} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Zona"><MdDelete size={20}/></Link>
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