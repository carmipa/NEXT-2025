// src/app/box/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdClear, MdEdit, MdDelete, MdVisibility, MdErrorOutline } from 'react-icons/md';
import { Box as BoxIcon, Search as SearchIconLucide } from 'lucide-react';
import { BoxResponseDto, BoxFilter } from '@/types/box';
import { SpringPage } from '@/types/common';
import { BoxService } from '@/utils/api';

const initialFilterState: BoxFilter = {
    nome: '',
    status: undefined,
    dataEntradaInicio: '',
    dataEntradaFim: '',
    dataSaidaInicio: '',
    dataSaidaFim: '',
    observacao: '',
};

export default function BuscarBoxesPage() {
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<BoxResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<BoxFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idBox,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setBoxes([]);
            setPageInfo(null);
        }

        try {
            const data = await BoxService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setBoxes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar boxes.');
            setBoxes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value === "" ? undefined : e.target.value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setBoxes([]);
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
            <NavBar active="box" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} /> Buscar Boxes
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                            <input type="text" name="nome" value={filter.nome || ''} onChange={handleFilterChange} placeholder="Nome do Box..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <select name="status" value={filter.status || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900">
                                <option value="">Todos os Status</option>
                                <option value="L">Livre</option>
                                <option value="O">Ocupado</option>
                            </select>
                            <input type="text" name="observacao" value={filter.observacao || ''} onChange={handleFilterChange} placeholder="Observação..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <div>
                                <label className="text-xs text-slate-300">Data Entrada (Início):</label>
                                <input type="date" name="dataEntradaInicio" value={filter.dataEntradaInicio || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 date-input-fix"/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-300">Data Entrada (Fim):</label>
                                <input type="date" name="dataEntradaFim" value={filter.dataEntradaFim || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 date-input-fix"/>
                            </div>
                            <div className="flex gap-2 sm:col-span-full md:col-span-1 justify-center">
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md hover:bg-opacity-80">
                                    <MdSearch /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-medium text-slate-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    <MdClear /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && boxes.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum box encontrado.</p></div>
                    )}

                    {!isLoading && boxes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {boxes.map((box) => (
                                <div key={box.idBox} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {box.idBox}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{box.nome}</h2>
                                        </div>
                                        <p className={`text-sm font-bold ${box.status === 'L' ? 'text-green-600' : 'text-red-600'}`}>
                                            Status: {box.status === 'L' ? 'Livre' : 'Ocupado'}
                                        </p>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/box/detalhes/${box.idBox}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/box/alterar/${box.idBox}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Box"><MdEdit size={20}/></Link>
                                        <Link href={`/box/deletar/${box.idBox}`} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Box"><MdDelete size={20}/></Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; }
                input[type="date"] { color-scheme: dark; }
            `}</style>
        </>
    );
}