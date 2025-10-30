// src/app/clientes/listar/page.tsx
"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
// ADICIONADO: IMaskInput para o filtro de CPF
import { Search } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');

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

    // Função para filtrar dados localmente como na página de pátios
    const getFilteredData = () => {
        return clientes.filter((item: ClienteResponseDto) => {
            const searchFields = [
                item.nome,
                item.sobrenome,
                `${item.nome} ${item.sobrenome}`.trim()
            ];
            return searchFields.some(field => 
                field && field.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    };

    // Funções de paginação para dados filtrados
    const getPaginatedData = () => {
        const filteredData = getFilteredData();
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        const filteredData = getFilteredData();
        return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    };

    // Reset da página quando mudar o filtro
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

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
        <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-people mr-2 sm:mr-3 text-2xl sm:text-3xl text-blue-500"></i>
                                <span className="hidden sm:inline">Clientes Cadastrados</span>
                                <span className="sm:hidden">Clientes</span>
                            </h1>
                            <Link href="/clientes/cadastrar" className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-person-add text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">NOVO CLIENTE</span>
                                </div>
                            </Link>
                        </div>

                    {successMessage && <div className="mb-4 text-center text-green-700 p-3 rounded-md bg-green-100"><MdCheckCircle className="inline mr-2" />{successMessage}</div>}
                    {error && <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100"><MdErrorOutline className="inline mr-2" />{error}</div>}

                    {/* Search */}
                    <div className="mb-6 sm:mb-8 neumorphic-container">
                        <div className="relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                            <input
                                type="text"
                                placeholder=""
                                title="Buscar clientes"
                                aria-label="Buscar clientes"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neumorphic-input pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base"
                            />
                        </div>
                    </div>

                    {/* Toggle de Visualização */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-apps text-sm sm:text-base"></i>
                                <span className="hidden sm:inline">Cards</span>
                                <span className="sm:hidden">Cards</span>
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                    viewType === 'table' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-list text-sm sm:text-base"></i>
                                <span className="hidden sm:inline">Tabela</span>
                                <span className="sm:hidden">Lista</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="text-center text-slate-100 py-10">Carregando...</p>
                    ) : clientes.length > 0 ? (
                        <>
                            {viewType === 'cards' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                    {clientes.map((cliente) => (
                                        <div key={cliente.idCliente} className="neumorphic-card-gradient p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                                            <div>
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {cliente.idCliente}</span>
                                                        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={`${cliente.nome} ${cliente.sobrenome}`} style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.nome} {cliente.sobrenome}</h2>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-10 sm:w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>CPF:</span> 
                                                        <span className="text-slate-600 ml-1 sm:ml-2 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.cpf}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-10 sm:w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>Email:</span> 
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.contatoResponseDto?.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-1 sm:gap-2 pt-3 sm:pt-4 mt-auto">
                                                <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Ver Detalhes"><i className="ion-ios-eye text-lg sm:text-xl"></i></Link>
                                                <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-1.5 sm:p-2 rounded-full text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Editar Cliente"><i className="ion-ios-create text-lg sm:text-xl"></i></Link>
                                                <button onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)} className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Excluir Cliente">
                                                    <i className="ion-ios-trash text-lg sm:text-xl"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="neumorphic-container p-4 sm:p-6 mb-6 sm:mb-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs sm:text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>ID</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Nome</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden sm:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>CPF</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)] hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>Email</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {clientes.map((cliente) => (
                                                    <tr key={cliente.idCliente} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.idCliente}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-[var(--color-mottu-dark)] text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.nome} {cliente.sobrenome}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-900 hidden sm:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.cpf}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-600 hidden md:table-cell" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.contatoResponseDto?.email || '-'}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                            <div className="flex justify-center items-center gap-1 sm:gap-2">
                                                                <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes">
                                                                    <i className="ion-ios-eye text-sm sm:text-base"></i>
                                                                </Link>
                                                                <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Cliente">
                                                                    <i className="ion-ios-create text-sm sm:text-base"></i>
                                                                </Link>
                                                                <button onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir Cliente">
                                                                    <i className="ion-ios-trash text-sm sm:text-base"></i>
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
                        <div className="text-center py-8 sm:py-10">
                            <i className="ion-ios-information-circle text-slate-300 mb-2 text-4xl sm:text-5xl"></i>
                            <p className="text-slate-300 text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>Nenhum cliente encontrado.</p>
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 text-xs sm:text-sm text-slate-100">
                            <span>Página {pageInfo.number + 1} de {pageInfo.totalPages}</span>
                            <div className="flex gap-1 sm:gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={pageInfo.first} className="px-2 sm:px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm" title="Página anterior" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-arrow-back text-sm sm:text-base"></i></button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={pageInfo.last} className="px-2 sm:px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm" title="Próxima página" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-arrow-forward text-sm sm:text-base"></i></button>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </main>
    );
}