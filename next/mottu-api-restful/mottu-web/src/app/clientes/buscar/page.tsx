// src/app/clientes/buscar/page.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
// Ícones removidos - usando Ionicons
import { IMaskInput } from 'react-imask';
import { Search } from 'lucide-react';
import { ClienteResponseDto, ClienteFilter } from '@/types/cliente';
import { SpringPage } from '@/types/common';
import { ClienteService } from '@/utils/api';
import '@/styles/neumorphic.css';

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
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<ClienteFilter>(initialFilterState);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

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
            const data = await ClienteService.listarPaginadoFiltrado(
                filtersToSubmit,
                pageToFetch,
                ITEMS_PER_PAGE,
                SORT_ORDER
            );
            setClientes(data.content);
            setPageInfo(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar clientes.');
            setClientes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value === '' ? undefined : value }));
    };

    const handleMaskedFilterChange = (name: string, value: string) => {
        setFilter(prev => ({ ...prev, [name]: value === '' ? undefined : value }));
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setCurrentPage(0);
        setClientes([]);
        setPageInfo(null);
        setHasSearched(false);
        setError(null);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    return (
        <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-4 sm:p-6 md:p-8">
                        <h1 className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <Search size={24} className="text-blue-500 sm:hidden" />
                            <Search size={28} className="text-blue-500 hidden sm:block md:hidden" />
                            <Search size={32} className="text-blue-500 hidden md:block" />
                            <span className="hidden sm:inline">Buscar Clientes</span>
                            <span className="sm:hidden">Buscar</span>
                        </h1>

                        <fieldset className="neumorphic-fieldset mb-6 sm:mb-8">
                            <legend className="neumorphic-legend text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>Filtros de Busca</legend>
                            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                                    {/* Linha 1 */}
                                    <input type="text" name="nome" value={filter.nome || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Nome" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <input type="text" name="sobrenome" value={filter.sobrenome || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Sobrenome" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <IMaskInput mask="000.000.000-00" name="cpf" value={filter.cpf || ''} onAccept={(value) => handleMaskedFilterChange('cpf', value)} className="neumorphic-input text-sm sm:text-base" placeholder="CPF" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <input type="email" name="contatoEmail" value={filter.contatoEmail || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Email do contato" style={{fontFamily: 'Montserrat, sans-serif'}} />

                                    {/* Linha 2 */}
                                    <input type="text" name="enderecoCidade" value={filter.enderecoCidade || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Cidade" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <input type="text" name="enderecoEstado" value={filter.enderecoEstado || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Estado (UF)" maxLength={2} style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                    <input type="text" name="veiculoPlaca" value={filter.veiculoPlaca || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Placa do Veículo" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    <input type="text" name="veiculoModelo" value={filter.veiculoModelo || ''} onChange={handleFilterChange} className="neumorphic-input text-sm sm:text-base" placeholder="Modelo do Veículo" style={{fontFamily: 'Montserrat, sans-serif'}} />

                                    <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 pt-2">
                                        <button type="submit" className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                            <div className="relative flex items-center gap-2">
                                                <Search size={16} />
                                                <span className="text-sm lg:text-base font-black">BUSCAR CLIENTES</span>
                                            </div>
                                        </button>
                                        <button type="button" onClick={handleClearFilters} className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-400 hover:border-gray-300 flex items-center justify-center gap-2">
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                            <div className="relative flex items-center gap-2">
                                                <i className="ion-ios-close text-lg"></i>
                                                <span className="text-sm lg:text-base font-black">LIMPAR FILTROS</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </fieldset>

                        {/* Toggle de Visualização */}
                        {hasSearched && !isLoading && (
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
                        )}

                        {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                        {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                        {!isLoading && hasSearched && clientes.length === 0 && !error && (
                            <div className="text-center py-10">
                                <i className="ion-ios-information-circle text-slate-300 mb-2" style={{fontSize: '48px'}}></i>
                                <p className="text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>Nenhum cliente encontrado.</p>
                            </div>
                        )}

                        {!isLoading && clientes.length > 0 && (
                            <>
                                {viewType === 'cards' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        {clientes.map((cliente) => (
                                            <div key={cliente.idCliente} className="neumorphic-card-gradient p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
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
                                                    <Link href={`/clientes/deletar/${cliente.idCliente}`} className="p-1.5 sm:p-2 rounded-full text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Excluir Cliente"><i className="ion-ios-trash text-lg sm:text-xl"></i></Link>
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
                                                                    <Link href={`/clientes/detalhes/${cliente.idCliente}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Ver Detalhes"><i className="ion-ios-eye text-sm sm:text-base"></i></Link>
                                                                    <Link href={`/clientes/alterar/${cliente.idCliente}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Editar Cliente"><i className="ion-ios-create text-sm sm:text-base"></i></Link>
                                                                    <Link href={`/clientes/deletar/${cliente.idCliente}`} className="p-1 rounded text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-300 hover:-translate-y-1" title="Excluir Cliente"><i className="ion-ios-trash text-sm sm:text-base"></i></Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Paginação */}
                                {pageInfo && pageInfo.totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-800 rounded-lg p-3 sm:p-4 gap-3 sm:gap-0">
                                        <div className="flex items-center text-xs sm:text-sm text-slate-300">
                                            <span>Mostrando {clientes.length} de {pageInfo.totalElements} resultados</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{fontFamily: 'Montserrat, sans-serif'}}
                                            >
                                                <i className="ion-ios-arrow-back text-sm sm:text-base"></i>
                                                <span className="hidden sm:inline">Anterior</span>
                                                <span className="sm:hidden">Ant</span>
                                            </button>
                                            <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                {currentPage + 1} de {pageInfo.totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= pageInfo.totalPages - 1}
                                                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{fontFamily: 'Montserrat, sans-serif'}}
                                            >
                                                <span className="hidden sm:inline">Próxima</span>
                                                <span className="sm:hidden">Próx</span>
                                                <i className="ion-ios-arrow-forward text-sm sm:text-base"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
    );
}