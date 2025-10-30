// src/app/patio/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdClear, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { Building, Search as SearchIconLucide, Phone, Home } from 'lucide-react';
import { PatioResponseDto, PatioFilter } from '@/types/patio';
import { SpringPage } from '@/types/common';
import { PatioService } from '@/utils/api';

const initialFilterState: PatioFilter = {
    nomePatio: '',
    veiculoPlaca: '',
    enderecoCidade: '',
    contatoEmail: '',
    zonaNome: '',
};

export default function BuscarPatiosPage() {
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<PatioResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<PatioFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setPatios([]);
            setPageInfo(null);
        }

        try {
            const data = await PatioService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE);
            setPatios(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar pátios.');
            setPatios([]);
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
        setPatios([]);
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
            <NavBar active="patio" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} /> Buscar Pátios
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            <input type="text" name="nomePatio" value={filter.nomePatio || ''} onChange={handleFilterChange} placeholder="Nome do Pátio..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="veiculoPlaca" value={filter.veiculoPlaca || ''} onChange={(e) => {
                                const value = e.target.value.trim().toUpperCase();
                                handleFilterChange({...e, target: {...e.target, value}});
                            }} placeholder="Placa do Veículo..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="enderecoCidade" value={filter.enderecoCidade || ''} onChange={handleFilterChange} placeholder="Cidade do Endereço..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="contatoEmail" value={filter.contatoEmail || ''} onChange={handleFilterChange} placeholder="Email do Contato..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            <input type="text" name="zonaNome" value={filter.zonaNome || ''} onChange={handleFilterChange} placeholder="Nome da Zona..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>

                            <div className="flex gap-2 justify-center">
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md hover:bg-opacity-80">
                                    <SearchIconLucide size={16} /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="flex-1 flex items-center justify-center gap-2 h-10 px-4 font-medium text-slate-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    <MdClear /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando pátios...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && patios.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum pátio encontrado para os critérios informados.</p></div>
                    )}

                    {!isLoading && patios.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {patios.map((patio) => (
                                <div key={patio.idPatio} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {patio.idPatio}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{patio.nomePatio}</h2>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2 space-y-1">
                                            <p className="flex items-center gap-1"><Phone size={14} /> Contatos: <strong>{patio.contatos?.length || 0}</strong></p>
                                            <p className="flex items-center gap-1"><Home size={14} /> Endereços: <strong>{patio.enderecos?.length || 0}</strong></p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/patio/detalhes/${patio.idPatio}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/patio/alterar/${patio.idPatio}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Pátio"><MdEdit size={20}/></Link>
                                        <Link href={`/patio/deletar/${patio.idPatio}`} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Pátio"><MdDelete size={20}/></Link>
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