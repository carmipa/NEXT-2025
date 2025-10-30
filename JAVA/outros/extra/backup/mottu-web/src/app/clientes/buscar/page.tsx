// src/app/clientes/buscar/page.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdClear, MdEdit, MdDelete, MdVisibility, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Search as SearchIconLucide } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common';
import { ClienteService } from '@/utils/api';

const initialFilterState: ClienteFilter = {
    nome: '', sobrenome: '', cpf: '', sexo: undefined, profissao: '', estadoCivil: undefined,
    dataCadastroInicio: '', dataCadastroFim: '', dataNascimentoInicio: '', dataNascimentoFim: '',
    enderecoCidade: '', enderecoEstado: '', contatoEmail: '', contatoCelular: '',
    veiculoPlaca: '', veiculoModelo: '',
};

export default function BuscarClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ClienteResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<ClienteFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idCliente,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setClientes([]);
            setPageInfo(null);
        }

        const cleanedCpf = currentFilters.cpf ? currentFilters.cpf.replace(/\D/g, '') : undefined;
        const cleanedCelular = currentFilters.contatoCelular ? currentFilters.contatoCelular.replace(/\D/g, '') : undefined;

        const filtersToSubmit = {
            ...currentFilters,
            cpf: cleanedCpf,
            contatoCelular: cleanedCelular,
        };

        try {
            const data = await ClienteService.listarPaginadoFiltrado(filtersToSubmit, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setClientes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar clientes.');
            setClientes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value === "" ? undefined : e.target.value }));
    };

    const handleMaskedFilterChange = (name: keyof ClienteFilter, value: string) => {
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setClientes([]);
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
            <NavBar active="clientes" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} /> Buscar Clientes
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                            {/* Linha 1 */}
                            <input type="text" name="nome" value={filter.nome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Nome" />
                            <input type="text" name="sobrenome" value={filter.sobrenome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Sobrenome" />
                            <IMaskInput mask="000.000.000-00" name="cpf" value={filter.cpf || ''} onAccept={(value) => handleMaskedFilterChange('cpf', value)} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="CPF" />
                            <input type="email" name="contatoEmail" value={filter.contatoEmail || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Email do contato" />

                            {/* Linha 2 */}
                            <input type="text" name="enderecoCidade" value={filter.enderecoCidade || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Cidade" />
                            <input type="text" name="enderecoEstado" value={filter.enderecoEstado || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Estado (UF)" maxLength={2}/>
                            <input type="text" name="veiculoPlaca" value={filter.veiculoPlaca || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Placa do Veículo" />
                            <input type="text" name="veiculoModelo" value={filter.veiculoModelo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900" placeholder="Modelo do Veículo" />

                            <div className="lg:col-span-4 flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 h-10">
                                    <MdSearch size={20} /> Buscar Clientes
                                </button>
                                <button type="button" onClick={handleClearFilters} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-slate-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 h-10">
                                    <MdClear size={20} /> Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && clientes.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum cliente encontrado.</p></div>
                    )}

                    {!isLoading && clientes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {clientes.map((cliente) => (
                                <div key={cliente.idCliente} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {cliente.idCliente}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{cliente.nome} {cliente.sobrenome}</h2>
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">CPF: {cliente.cpf}</p>
                                        <p className="text-sm text-slate-600 truncate">Email: {cliente.contatoResponseDto?.email || '-'}</p>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Cliente"><MdEdit size={20}/></Link>
                                        <Link href={`/clientes/deletar/${cliente.idCliente}`} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Cliente"><MdDelete size={20}/></Link>
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