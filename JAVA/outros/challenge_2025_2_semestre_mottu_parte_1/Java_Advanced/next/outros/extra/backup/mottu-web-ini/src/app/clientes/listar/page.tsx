// src/app/clientes/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common'; // Certifique-se que este caminho está correto
import { IMaskInput } from 'react-imask';
import {
    MdSearch, MdClear, MdAdd, MdChevronLeft, MdChevronRight, MdEdit, MdDelete, MdVisibility, MdErrorOutline, MdCheckCircle, MdPerson, MdEmail, MdPhoneAndroid, MdCalendarToday, MdBadge
} from 'react-icons/md';
import { UserCircle } from 'lucide-react';

// Estado inicial para os filtros
const initialFilterState: ClienteFilter = {
    nome: "",
    cpf: "",
    // Adicione outros campos de filtro que você queira ter disponíveis
};

// Estado inicial para informações da página
const initialPageInfo: SpringPage<any> | null = null;

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ClienteResponseDto> | null>(initialPageInfo);
    const [currentPage, setCurrentPage] = useState(0); // Spring Page é 0-indexed
    const [filtros, setFiltros] = useState<ClienteFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 9; // Ajuste para melhor visualização dos cards (ex: 3x3)
    const SORT_ORDER = 'idCliente,asc'; // Ordenar por ID ascendentemente

    // Função para buscar os dados
    const fetchData = async (pageToFetch = currentPage, currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await ClienteService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
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

    // Busca inicial de dados
    useEffect(() => {
        fetchData(0, initialFilterState);
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleCpfFilterChange = (value: string) => {
        setFiltros(prev => ({ ...prev, cpf: value }));
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

    const handleDeleteCliente = async (clienteId: number, nomeCliente: string) => {
        // Idealmente, substitua window.confirm por um modal customizado
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}" (ID: ${clienteId})?`)) {
            setIsLoading(true);
            try {
                await ClienteService.delete(clienteId);
                setSuccessMessage(`Cliente "${nomeCliente}" excluído com sucesso!`);
                // Ajusta a página se o último item da página for excluído
                const pageToFetchAfterDelete = (pageInfo?.first && clientes.length === 1 && currentPage > 0) ? currentPage - 1 : currentPage;
                fetchData(pageToFetchAfterDelete, filtros);
                setTimeout(() => setSuccessMessage(null), 4000);
            } catch (err: any) {
                setError(err.response?.data?.message || `Erro ao excluir cliente "${nomeCliente}".`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <NavBar active="clientes-listar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <UserCircle size={32} className="mr-3" />
                            Clientes Cadastrados
                        </h1>
                        <Link href="/clientes/cadastrar"
                              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors duration-200">
                            <MdAdd size={20} /> Novo Cliente
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
                            <div>
                                <label htmlFor="filtro-nome" className="block text-sm font-medium text-slate-100 mb-1">Nome:</label>
                                <input
                                    type="text"
                                    id="filtro-nome"
                                    name="nome"
                                    value={filtros.nome || ''}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 h-10 placeholder:text-gray-400"
                                    placeholder="Filtrar por nome..."
                                />
                            </div>
                            <div>
                                <label htmlFor="filtro-cpf" className="block text-sm font-medium text-slate-100 mb-1">CPF:</label>
                                <IMaskInput
                                    mask="000.000.000-00"
                                    id="filtro-cpf"
                                    name="cpf"
                                    value={filtros.cpf || ''}
                                    onAccept={handleCpfFilterChange}
                                    className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 h-10 placeholder:text-gray-400"
                                    placeholder="Filtrar por CPF..."
                                />
                            </div>
                            <div className="flex gap-2 sm:col-span-2 md:col-span-1 md:self-end pt-2 sm:pt-0">
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-[var(--color-mottu-default)] transition-colors duration-200 h-10">
                                    <MdSearch size={20} /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-slate-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 transition-colors duration-200 h-10">
                                    <MdClear size={20} /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading ? (
                        <p className="text-center text-slate-100 py-10">Carregando clientes...</p>
                    ) : clientes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clientes.map((cliente) => (
                                <div key={cliente.idCliente} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {cliente.idCliente}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={`${cliente.nome} ${cliente.sobrenome}`}>
                                                {cliente.nome} {cliente.sobrenome}
                                            </h2>
                                        </div>
                                        <div className="space-y-2 text-sm mb-4">
                                            <p className="flex items-center"><MdBadge className="mr-2 text-slate-500" /> CPF: <span className="text-slate-600 ml-1">{cliente.cpf}</span></p>
                                            <p className="flex items-center truncate"><MdEmail className="mr-2 text-slate-500" /> Email: <span className="text-slate-600 ml-1 truncate" title={cliente.contatoResponseDto?.email}>{cliente.contatoResponseDto?.email || '-'}</span></p>
                                            <p className="flex items-center"><MdPhoneAndroid className="mr-2 text-slate-500" /> Celular: <span className="text-slate-600 ml-1">{cliente.contatoResponseDto?.celular || '-'}</span></p>
                                            <p className="flex items-center"><MdCalendarToday className="mr-2 text-slate-500" /> Cadastro: <span className="text-slate-600 ml-1">{cliente.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : '-'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-auto">
                                        <Link href={`/clientes/detalhes/${cliente.idCliente}`}
                                              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                              title="Ver Detalhes">
                                            <MdVisibility size={22}/>
                                        </Link>
                                        <Link href={`/clientes/editar/${cliente.idCliente}`}
                                              className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors"
                                              title="Editar Cliente">
                                            <MdEdit size={20}/>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)}
                                            className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                                            title="Excluir Cliente"
                                        >
                                            <MdDelete size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <MdErrorOutline size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-300">Nenhum cliente encontrado com os filtros atuais.</p>
                            {Object.values(filtros).some(val => val && val.length > 0) && ( // Mostra o botão apenas se houver filtros ativos
                                <button onClick={handleClearFilters} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-md">
                                    Limpar Filtros e Ver Todos
                                </button>
                            )}
                        </div>
                    )}

                    {pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-100">
                            <div className="mb-2 sm:mb-0">
                                Página <strong>{pageInfo.number + 1}</strong> de <strong>{pageInfo.totalPages}</strong> (Total: {pageInfo.totalElements} clientes)
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={isLoading || pageInfo.first}
                                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <MdChevronLeft size={18}/> Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={isLoading || pageInfo.last}
                                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Próxima <MdChevronRight size={18}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
