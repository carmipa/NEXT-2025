"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
// Ícones substituídos por Ionicons no markup
import '@/styles/neumorphic.css';
import { VeiculoResponseDto, VeiculoFilter } from '@/types/veiculo';
import { SpringPage } from '@/types/common';
import { VeiculoService } from '@/utils/api';

const initialFilterState: VeiculoFilter = {
    placa: '', renavam: '', chassi: '', fabricante: '', modelo: '', motor: '',
    ano: undefined, combustivel: '', clienteCpf: '', boxNome: '', patioNome: '', zonaNome: '',
    tagBleId: '',
};

export default function BuscarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<VeiculoResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<VeiculoFilter>(initialFilterState);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idVeiculo,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setVeiculos([]);
            setPageInfo(null);
        }

        try {
            const data = await VeiculoService.listarPaginadoFiltrado(currentFilters, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setVeiculos(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar veículos.');
            setVeiculos([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setVeiculos([]);
        setPageInfo(null);
        setCurrentPage(0);
        setHasSearched(false);
        setError(null);
        // Força uma nova busca com filtros limpos
        fetchData(0, initialFilterState);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    return (
        <main className="min-h-screen text-white p-4 md:p-8 pb-32">
                <div className="container mx-auto">
                    <div className="neumorphic-container p-6 md:p-8">
                        <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <Search size={32} className="text-[var(--color-mottu-dark)]" />
                            Buscar Veículos
                        </h1>

                    <fieldset className="neumorphic-fieldset mb-8">
                        <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Filtros de Busca</legend>
                        <form onSubmit={handleSearch} className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                                <input type="text" name="placa" value={filter.placa || ''} onChange={(e) => {
                                    const value = e.target.value.trim().toUpperCase();
                                    setFilter(prev => ({ ...prev, placa: value }));
                                }} className="neumorphic-input" placeholder="Placa" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                <input type="text" name="modelo" value={filter.modelo || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="Modelo" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                <input type="text" name="fabricante" value={filter.fabricante || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="Fabricante" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                <input type="number" name="ano" value={filter.ano || ''} onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                    setFilter(prev => ({ ...prev, ano: value }));
                                }} className="neumorphic-input" placeholder="Ano" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                <input type="text" name="clienteCpf" value={filter.clienteCpf || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="CPF do Cliente" style={{fontFamily: 'Montserrat, sans-serif'}}/>
                                <input type="text" name="tagBleId" value={filter.tagBleId || ''} onChange={handleFilterChange} className="neumorphic-input" placeholder="ID da Tag BLE" style={{fontFamily: 'Montserrat, sans-serif'}}/>

                                <div className="lg:col-span-full flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                                    <button type="submit" className="neumorphic-button-green">
                                        <Search size={16} className="mr-2 inline" /> Buscar
                                    </button>
                                    <button type="button" onClick={handleClearFilters} className="neumorphic-button">
                                        <i className="ion-ios-close mr-2"></i> Limpar Filtros
                                    </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>

                    {/* Toggle de Visualização */}
                    {hasSearched && !isLoading && (
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
                    )}

                    {isLoading && <p className="text-center text-slate-100 py-10">Buscando...</p>}
                    {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}

                    {!isLoading && hasSearched && veiculos.length === 0 && !error && (
                        <div className="text-center py-10"><p className="text-slate-300">Nenhum veículo encontrado.</p></div>
                    )}

                    {!isLoading && veiculos.length > 0 && (
                        <>
                            {viewType === 'cards' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {veiculos.map((veiculo) => (
                                        <div key={veiculo.idVeiculo} className="neumorphic-card-gradient p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105 transform hover:-translate-y-2 cursor-pointer">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {veiculo.idVeiculo}</span>
                                                        <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={veiculo.placa} style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.placa}</h2>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo:</span> 
                                                        <span className="text-slate-600 truncate ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-2 pt-4 mt-auto">
                                                <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye text-xl"></i></Link>
                                                <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo"><i className="ion-ios-create text-xl"></i></Link>
                                                <Link href={`/veiculo/deletar/${veiculo.idVeiculo}`} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo"><i className="ion-ios-trash text-xl"></i></Link>
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
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Placa</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Fabricante</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ano</th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {veiculos.map((veiculo) => (
                                                    <tr key={veiculo.idVeiculo} className="hover:bg-slate-50 transition-all duration-300 hover:shadow-lg">
                                                        <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.idVeiculo}</td>
                                                        <td className="px-4 py-3 font-mono font-semibold text-[var(--color-mottu-dark)]" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.placa}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-900" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.fabricante}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-center items-center gap-2">
                                                                <Link href={`/veiculo/detalhes/${veiculo.idVeiculo}`} className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalhes"><i className="ion-ios-eye"></i></Link>
                                                                <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="p-1 rounded text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Veículo"><i className="ion-ios-create"></i></Link>
                                                                <Link href={`/veiculo/deletar/${veiculo.idVeiculo}`} className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors" title="Excluir Veículo"><i className="ion-ios-trash"></i></Link>
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
                                <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4">
                                    <div className="flex items-center text-sm text-slate-300">
                                        <span>Mostrando {veiculos.length} de {pageInfo.totalElements} resultados</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        >
                                            <i className="ion-ios-arrow-back"></i>
                                            Anterior
                                        </button>
                                        <span className="px-3 py-2 text-sm text-slate-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            Página {currentPage + 1} de {pageInfo.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= pageInfo.totalPages - 1}
                                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        >
                                            Próxima
                                            <i className="ion-ios-arrow-forward"></i>
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
