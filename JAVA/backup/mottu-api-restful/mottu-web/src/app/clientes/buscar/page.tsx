// src/app/clientes/buscar/page.tsx
"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
// Ícones removidos - usando Ionicons
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
    const [quickField, setQuickField] = useState<'nome'|'sobrenome'|'cpf'|'contatoEmail'|'enderecoCidade'|'enderecoEstado'>('nome');
    const [quickQuery, setQuickQuery] = useState('');
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

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (!quickQuery.trim()) {
            setClientes([]);
            setPageInfo(null);
            setHasSearched(false);
            return;
        }
        setCurrentPage(0);
        const built: any = { ...initialFilterState };
        built[quickField] = quickQuery.trim();
        fetchData(0, built);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setQuickQuery('');
        setQuickField('nome');
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
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto neumorphic-container p-6 md:p-8">
                  
                  {/* Header */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center mb-4 lg:mb-0">
                        <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                          <i className="ion-ios-search text-white text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Buscar Clientes
                        </h1>
                          <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Pesquise clientes por diferentes critérios
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href="/clientes/listar"
                        className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-4 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 w-full lg:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2 lg:gap-3">
                          <div className="p-1.5 lg:p-2 bg-white/25 rounded-full">
                            <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-sm lg:text-lg font-black">VOLTAR</div>
                            <div className="text-xs text-orange-100 font-semibold hidden lg:block">À Lista</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 text-center text-red-700 p-3 rounded-md bg-red-100">
                      {error}
                    </div>
                  )}

                  {/* Search Form - padrão input + seletor + botões */}
                  <form onSubmit={handleSearch} className="mb-8 neumorphic-container p-4 lg:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="flex-1">
                        <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                          <i className="ion-ios-search text-blue-400 text-sm lg:text-base"></i>
                          Valor
                        </label>
                        <input
                          type="text"
                          value={quickQuery}
                          onChange={(e) => setQuickQuery(e.target.value)}
                          className="neumorphic-input w-full text-sm lg:text-base"
                          placeholder={quickField === 'nome' ? 'Digite o nome...'
                            : quickField === 'sobrenome' ? 'Digite o sobrenome...'
                            : quickField === 'cpf' ? 'Digite o CPF...'
                            : quickField === 'contatoEmail' ? 'Digite o email...'
                            : quickField === 'enderecoCidade' ? 'Digite a cidade...'
                            : 'Digite o estado (UF)...'}
                        />
                      </div>
                      <div className="w-full md:w-52">
                        <label className="block text-xs lg:text-sm font-medium text-white mb-1 flex items-center gap-2">
                          <i className="ion-ios-funnel text-purple-400 text-sm lg:text-base"></i>
                          Filtrar por
                        </label>
                        <select
                          value={quickField}
                          onChange={(e) => setQuickField(e.target.value as any)}
                          className="neumorphic-input w-full text-sm lg:text-base"
                        >
                          <option value="nome">Nome</option>
                          <option value="sobrenome">Sobrenome</option>
                          <option value="cpf">CPF</option>
                          <option value="contatoEmail">Email do Contato</option>
                          <option value="enderecoCidade">Cidade do Endereço</option>
                          <option value="enderecoEstado">Estado do Endereço</option>
                        </select>
                      </div>
                      <div className="mt-2 md:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button 
                          type="submit" 
                          disabled={!quickQuery.trim()}
                          className={`group relative text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform transition-all duration-300 border-2 flex items-center justify-center gap-2 btn-buscar-turquesa ${!quickQuery.trim() ? 'cursor-not-allowed' : 'hover:scale-105'}`}
                          style={{
                            opacity: !quickQuery.trim() ? 0.5 : 1
                          }}
                          title="Buscar clientes"
                        >
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{backgroundColor: '#2BC49A'}}></div>
                          <div className="relative flex items-center gap-2">
                            <i className="ion-ios-search text-lg"></i>
                            <span className="text-sm lg:text-base font-black">BUSCAR</span>
                          </div>
                        </button>
                        <button 
                          type="button" 
                          onClick={handleClearFilters} 
                          className="group relative bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
                          title="Limpar filtros"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                          <div className="relative flex items-center gap-2">
                            <i className="ion-ios-close text-lg"></i>
                            <span className="text-sm lg:text-base font-black">LIMPAR</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </form>

                        {/* Toggle de Visualização */}
                  {!isLoading && clientes.length > 0 && (
                    <div className="flex justify-center mb-6">
                                <div className="flex bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewType('cards')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                            viewType === 'cards' 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                          title="Visualização em Cards"
                                    >
                          <i className="ion-ios-grid"></i>
                          Cards
                                    </button>
                                    <button
                                        onClick={() => setViewType('table')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                            viewType === 'table' 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                          title="Visualização em Tabela"
                                    >
                          <i className="ion-ios-list"></i>
                          Tabela
                                    </button>
                                </div>
                            </div>
                        )}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="neumorphic-container text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-loading text-4xl text-emerald-400 animate-spin"></i>
                        <p className="text-slate-300 font-montserrat">Buscando clientes...</p>
                      </div>
                            </div>
                        )}

                  {/* Empty State */}
                  {!isLoading && hasSearched && clientes.length === 0 && !error && (
                    <div className="neumorphic-container text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <i className="ion-ios-search text-4xl text-slate-400"></i>
                                                <div>
                          <h3 className="text-lg font-semibold text-slate-300 mb-2 font-montserrat">Nenhum cliente encontrado</h3>
                          <p className="text-slate-400 font-montserrat">Nenhum cliente encontrado para os critérios informados.</p>
                                                        </div>
                                                    </div>
                                                        </div>
                  )}

                  {/* Results */}
                  {!isLoading && clientes.length > 0 && (
                    viewType === 'cards' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {clientes.map((cliente) => (
                          <div key={cliente.idCliente} className="neumorphic-card-gradient p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                            <div>
                              <div className="flex items-center mb-3">
                                <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 py-0.5 rounded-full mr-2">
                                  ID: {cliente.idCliente}
                                </span>
                                <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate font-montserrat">
                                  {cliente.nome} {cliente.sobrenome}
                                </h2>
                              </div>
                              
                              <div className="text-sm text-slate-600 mt-2 space-y-1">
                                <p className="flex items-center">
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-10 sm:w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>CPF:</span> 
                                  <span className="text-slate-600 ml-1 sm:ml-2 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.cpf}</span>
                                </p>
                                <p className="flex items-center">
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-10 sm:w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>Email:</span> 
                                  <span className="text-slate-600 truncate ml-1 sm:ml-2 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.contatoResponseDto?.email || 'N/A'}</span>
                                </p>
                                <p className="flex items-center">
                                  <span className="font-semibold text-[var(--color-mottu-dark)] w-10 sm:w-12" style={{fontFamily: 'Montserrat, sans-serif'}}>Cidade:</span> 
                                  <span className="text-slate-600 ml-1 sm:ml-2 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>{cliente.enderecoResponseDto?.cidade || 'N/A'}</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-4">
                              <Link 
                                href={`/clientes/detalhes/${cliente.idCliente}`}
                                className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Ver Detalhes"
                              >
                                <i className="ion-ios-eye text-lg"></i>
                              </Link>
                              <Link 
                                href={`/clientes/alterar/${cliente.idCliente}`}
                                className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Editar"
                              >
                                <i className="ion-ios-create text-lg"></i>
                              </Link>
                              <Link 
                                href={`/clientes/deletar/${cliente.idCliente}`}
                                className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-1" 
                                title="Excluir"
                              >
                                <i className="ion-ios-trash text-lg"></i>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                                ) : (
                      <div className="neumorphic-container overflow-hidden mb-8">
                                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Nome</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">CPF</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Cidade</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider font-montserrat">Ações</th>
                                                    </tr>
                                                </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                                    {clientes.map((cliente) => (
                                <tr key={cliente.idCliente} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-montserrat">{cliente.nome} {cliente.sobrenome}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{cliente.cpf}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{cliente.contatoResponseDto?.email || '-'}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-montserrat">{cliente.enderecoResponseDto?.cidade || '-'}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center items-center gap-2">
                                      <Link 
                                        href={`/clientes/detalhes/${cliente.idCliente}`} 
                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Ver Detalhes"
                                      >
                                        <i className="ion-ios-eye text-lg"></i>
                                      </Link>
                                      <Link 
                                        href={`/clientes/alterar/${cliente.idCliente}`} 
                                        className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Editar Cliente"
                                      >
                                        <i className="ion-ios-create text-lg"></i>
                                      </Link>
                                      <Link 
                                        href={`/clientes/deletar/${cliente.idCliente}`} 
                                        className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-1" 
                                        title="Excluir Cliente"
                                      >
                                        <i className="ion-ios-trash text-lg"></i>
                                      </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                    )
                                )}

                                {/* Paginação */}
                  {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                    <div className="mt-8 flex justify-between items-center text-sm text-slate-100">
                      <span className="font-montserrat">
                        Página {pageInfo.number + 1} de {pageInfo.totalPages}
                      </span>
                      <div className="flex gap-2">
                                            <button
                          title="Página anterior" 
                                                onClick={() => handlePageChange(currentPage - 1)}
                          disabled={pageInfo.first} 
                          className="neumorphic-button text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1"
                                            >
                          <i className="ion-ios-arrow-back"></i>
                          Anterior
                                            </button>
                                            <button
                          title="Próxima página" 
                                                onClick={() => handlePageChange(currentPage + 1)}
                          disabled={pageInfo.last} 
                          className="neumorphic-button text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-1"
                                            >
                          Próximo
                          <i className="ion-ios-arrow-forward"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                </div>
            </main>
        </>
    );
}
