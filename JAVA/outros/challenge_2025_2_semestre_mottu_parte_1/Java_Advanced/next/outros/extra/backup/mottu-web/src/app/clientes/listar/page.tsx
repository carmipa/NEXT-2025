// src/app/clientes/listar/page.tsx
"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common';
import { MdSearch, MdClear, MdAdd, MdChevronLeft, MdChevronRight, MdEdit, MdDelete, MdVisibility, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { UserCircle } from 'lucide-react';
// ADICIONADO: IMaskInput para o filtro de CPF
import { IMaskInput } from 'react-imask';

// CORREÇÃO: Usar undefined para filtros não aplicados é mais limpo.
const initialFilterState: ClienteFilter = { nome: undefined, cpf: undefined };
const initialPageInfo: SpringPage<any> | null = null;
const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ClienteResponseDto> | null>(initialPageInfo);
    const [currentPage, setCurrentPage] = useState(0);
    const [filtros, setFiltros] = useState<ClienteFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idCliente,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);

        // CORREÇÃO: Limpa a máscara do CPF antes de enviar para a API.
        const filtersToSubmit = {
            ...currentFilters,
            cpf: currentFilters.cpf ? cleanMaskedValue(currentFilters.cpf) : undefined,
        };

        try {
            const data = await ClienteService.listarPaginadoFiltrado(filtersToSubmit, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setClientes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar clientes.');
            setClientes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(0, initialFilterState);
    }, []);

    // CORREÇÃO: Define o valor como 'undefined' se o campo estiver vazio.
    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value === "" ? undefined : value }));
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

    // ADICIONADO: Lógica segura para exclusão de cliente.
    const handleDeleteCliente = async (clienteId: number, nomeCliente: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}" (ID: ${clienteId})?`)) {
            try {
                await ClienteService.delete(clienteId);
                setSuccessMessage(`Cliente "${nomeCliente}" excluído com sucesso!`);

                // Lógica para voltar uma página se o último item da página atual for excluído
                const pageToFetchAfterDelete = (pageInfo?.first && clientes.length === 1 && currentPage > 0)
                    ? currentPage - 1
                    : currentPage;

                fetchData(pageToFetchAfterDelete, filtros);
                setTimeout(() => setSuccessMessage(null), 4000);
            } catch (err: any) {
                setError(err.response?.data?.message || `Erro ao excluir cliente "${nomeCliente}".`);
            }
        }
    };

    return (
        <>
            <NavBar active="clientes" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <UserCircle size={32} className="mr-3" />
                            Clientes Cadastrados
                        </h1>
                        <Link href="/clientes/cadastrar" className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors duration-200">
                            <MdAdd size={20} /> Novo Cliente
                        </Link>
                    </div>

                    {successMessage && <div className="mb-4 text-center text-green-700 p-3 rounded-md bg-green-100"><MdCheckCircle className="inline mr-2" />{successMessage}</div>}
                    {error && <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100"><MdErrorOutline className="inline mr-2" />{error}</div>}

                    <form onSubmit={handleFilterSubmit} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                            <input type="text" name="nome" value={filtros.nome || ''} onChange={handleFilterChange} placeholder="Filtrar por nome..." className="w-full p-2 h-10 rounded bg-white text-slate-900"/>
                            {/* CORREÇÃO: Usando IMaskInput para o filtro de CPF */}
                            <IMaskInput
                                mask="000.000.000-00"
                                name="cpf"
                                value={filtros.cpf || ''}
                                onAccept={(value) => setFiltros(prev => ({ ...prev, cpf: value as string }))}
                                placeholder="Filtrar por CPF..."
                                className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            />
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

                    {isLoading ? <p className="text-center text-slate-100 py-10">Carregando...</p> : clientes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {clientes.map((cliente) => (
                                <div key={cliente.idCliente} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-105">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {cliente.idCliente}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate">{cliente.nome} {cliente.sobrenome}</h2>
                                        </div>
                                        <p className="text-sm text-slate-600">CPF: {cliente.cpf}</p>
                                        <p className="text-sm text-slate-600 truncate">Email: {cliente.contatoResponseDto?.email || '-'}</p>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                                        <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100" title="Ver Detalhes"><MdVisibility size={22}/></Link>
                                        <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="Editar Cliente"><MdEdit size={20}/></Link>
                                        {/* CORREÇÃO: Botão para exclusão segura */}
                                        <button onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Excluir Cliente">
                                            <MdDelete size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum cliente encontrado.</p></div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center text-sm text-slate-100">
                            <span>Página {pageInfo.number + 1} de {pageInfo.totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={pageInfo.first} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50"><MdChevronLeft/></button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={pageInfo.last} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50"><MdChevronRight/></button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}