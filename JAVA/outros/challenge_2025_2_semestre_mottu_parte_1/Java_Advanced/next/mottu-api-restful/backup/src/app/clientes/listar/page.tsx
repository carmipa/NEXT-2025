// src/app/clientes/listar/page.tsx
"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
// ADICIONADO: IMaskInput para o filtro de CPF
import { IMaskInput } from 'react-imask';
import '@/styles/neumorphic.css';

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
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

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
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-people mr-3 text-3xl"></i>
                            Clientes Cadastrados
                        </h1>
                <Link href="/clientes/cadastrar" className="neumorphic-button mt-4 sm:mt-0">
                    <i className="ion-ios-person-add mr-2"></i> Novo Cliente
                </Link>
                    </div>

                    {successMessage && <div className="mb-4 text-center text-green-700 p-3 rounded-md bg-green-100"><MdCheckCircle className="inline mr-2" />{successMessage}</div>}
                    {error && <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100"><MdErrorOutline className="inline mr-2" />{error}</div>}

                    <fieldset className="neumorphic-fieldset mb-8">
                        <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Filtros de Busca</legend>
                        <form onSubmit={handleFilterSubmit} className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                <input type="text" name="nome" value={filtros.nome || ''} onChange={handleFilterChange} placeholder="Filtrar por nome..." className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                {/* CORREÇÃO: Usando IMaskInput para o filtro de CPF */}
                                <IMaskInput
                                    mask="000.000.000-00"
                                    name="cpf"
                                    value={filtros.cpf || ''}
                                    onAccept={(value) => setFiltros(prev => ({ ...prev, cpf: value as string }))}
                                    placeholder="Filtrar por CPF..."
                                    className="neumorphic-input"
                                    style={{fontFamily: 'Montserrat, sans-serif'}}
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 neumorphic-button-green">
                                        <i className="ion-ios-search mr-1"></i> Buscar
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
                        <p className="text-center text-slate-100 py-10">Carregando...</p>
                    ) : clientes.length > 0 ? (
                        <>
                            {viewType === 'cards' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {clientes.map((cliente) => (
                                        <div key={cliente.idCliente} className="neumorphic-container p-6 flex flex-col justify-between transition-all hover:scale-105">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {cliente.idCliente}</span>
                                                        <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={`${cliente.nome} ${cliente.sobrenome}`} style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.nome} {cliente.sobrenome}</h2>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>CPF:</span> 
                                                        <span className="text-slate-600 ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.cpf}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>Email:</span> 
                                                        <span className="text-slate-600 truncate ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.contatoResponseDto?.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-2 pt-4 mt-auto">
                                                <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye text-xl"></i></Link>
                                                <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Cliente"><i className="ion-ios-create text-xl"></i></Link>
                                                <button onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Cliente">
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
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Nome</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>CPF</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Email</th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {clientes.map((cliente) => (
                                                    <tr key={cliente.idCliente} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.idCliente}</td>
                                                        <td className="px-4 py-3 font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.nome} {cliente.sobrenome}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.cpf}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.contatoResponseDto?.email || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-center items-center gap-2">
                                                                <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                                    <i className="ion-ios-eye"></i>
                                                                </Link>
                                                                <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Cliente">
                                                                    <i className="ion-ios-create"></i>
                                                                </Link>
                                                                <button onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir Cliente">
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
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <i className="ion-ios-information-circle text-slate-300 mb-2" style={{fontSize: '48px'}}></i>
                            <p className="text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>Nenhum cliente encontrado.</p>
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center text-sm text-slate-100">
                            <span>Página {pageInfo.number + 1} de {pageInfo.totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={pageInfo.first} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-all duration-300 hover:scale-105" title="Página anterior" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-arrow-back"></i></button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={pageInfo.last} className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-all duration-300 hover:scale-105" title="Próxima página" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-arrow-forward"></i></button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}