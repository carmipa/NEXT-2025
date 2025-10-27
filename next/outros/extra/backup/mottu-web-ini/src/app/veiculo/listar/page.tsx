// src/app/veiculo/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { VeiculoService } from '@/utils/api';
import NavBar from '@/components/nav-bar';
import {
    MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete,
    MdFilterList, MdCalendarToday, MdInfo, MdCheckCircle, MdDirectionsCar, MdBadge
} from 'react-icons/md';
import { Car, Hash, Palette, Calendar, User, Building, Settings, Info, Search as SearchIcon, Filter, ScanLine as ScanLicense } from 'lucide-react';

// Interfaces dos DTOs e Filtro
import { VeiculoResponseDto, VeiculoFilter, VeiculoLocalizacaoResponseDto } from '@/types/veiculo';

export default function ListarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [localizacaoModal, setLocalizacaoModal] = useState<VeiculoLocalizacaoResponseDto | null>(null);
    const [isLoadingLocalizacao, setIsLoadingLocalizacao] = useState(false);
    const [errorLocalizacao, setErrorLocalizacao] = useState<string | null>(null);

    // Estado para os filtros
    const [filter, setFilter] = useState<VeiculoFilter>({
        placa: '',
        renavam: '',
        chassi: '',
        fabricante: '',
        modelo: '',
        motor: '',
        ano: undefined,
        combustivel: '',
        clienteCpf: '',
        boxNome: '',
        patioNome: '',
        zonaNome: '',
    });

    // Funções de formatação
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return 'Inválida';
        }
    };

    // Função para buscar os veículos da API com filtros
    const fetchVeiculos = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const data = await VeiculoService.getAll(filter);
            setVeiculos(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao carregar veículos. Tente novamente.');
            console.error("Erro detalhado:", err);
            setVeiculos([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para buscar a localização de um veículo
    const fetchLocalizacaoVeiculo = async (id: number) => {
        setIsLoadingLocalizacao(true);
        setErrorLocalizacao(null);
        setLocalizacaoModal(null);
        try {
            const data = await VeiculoService.getLocalizacao(id);
            setLocalizacaoModal(data);
        } catch (err: any) {
            setErrorLocalizacao(err.response?.data?.message || err.message || 'Erro ao buscar localização do veículo.');
            console.error("Erro detalhado na localização:", err);
        } finally {
            setIsLoadingLocalizacao(false);
        }
    };

    useEffect(() => {
        fetchVeiculos();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    const handleDelete = async (id: number, placaVeiculo: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Veículo "${placaVeiculo}" (ID: ${id})?`)) {
            setIsLoading(true);
            setError(null);
            try {
                await VeiculoService.delete(id);
                setSuccessMessage(`Veículo "${placaVeiculo}" (ID: ${id}) deletado com sucesso!`);
                fetchVeiculos(); // Recarrega a lista
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar veículo.');
                console.error("Erro detalhado:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <NavBar active="veiculo-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdDirectionsCar className="text-3xl text-sky-400" /> Lista de Veículos
                    </h1>
                    <Link href="/veiculo/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                            <MdAdd size={18} /> Novo Veículo
                        </button>
                    </Link>
                </div>

                {/* Formulário de Filtros */}
                <form onSubmit={fetchVeiculos} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="placa" className="text-sm text-slate-300 block mb-1">Placa:</label>
                        <input type="text" id="placa" name="placa" value={filter.placa} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Placa" maxLength={10} />
                    </div>
                    <div>
                        <label htmlFor="renavam" className="text-sm text-slate-300 block mb-1">RENAVAM:</label>
                        <input type="text" id="renavam" name="renavam" value={filter.renavam} onChange={handleFilterChange} maxLength={11} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="RENAVAM" />
                    </div>
                    <div>
                        <label htmlFor="chassi" className="text-sm text-slate-300 block mb-1">Chassi:</label>
                        <input type="text" id="chassi" name="chassi" value={filter.chassi} onChange={handleFilterChange} maxLength={17} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Chassi" />
                    </div>
                    <div>
                        <label htmlFor="fabricante" className="text-sm text-slate-300 block mb-1">Fabricante:</label>
                        <input type="text" id="fabricante" name="fabricante" value={filter.fabricante} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Fabricante" />
                    </div>
                    <div>
                        <label htmlFor="modelo" className="text-sm text-slate-300 block mb-1">Modelo:</label>
                        <input type="text" id="modelo" name="modelo" value={filter.modelo} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Modelo" />
                    </div>
                    <div>
                        <label htmlFor="ano" className="text-sm text-slate-300 block mb-1">Ano:</label>
                        <input type="number" id="ano" name="ano" value={filter.ano || ''} onChange={handleFilterChange} min={1900} max={2100} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Ano" />
                    </div>
                    {/* Filtros por associação */}
                    <div>
                        <label htmlFor="clienteCpf" className="text-sm text-slate-300 block mb-1">CPF Cliente:</label>
                        <input type="text" id="clienteCpf" name="clienteCpf" value={filter.clienteCpf} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="CPF de cliente associado" />
                    </div>
                    <div>
                        <label htmlFor="patioNome" className="text-sm text-slate-300 block mb-1">Nome Pátio:</label>
                        <input type="text" id="patioNome" name="patioNome" value={filter.patioNome} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Nome de pátio associado" />
                    </div>
                    <div>
                        <label htmlFor="zonaNome" className="text-sm text-slate-300 block mb-1">Nome Zona:</label>
                        <input type="text" id="zonaNome" name="zonaNome" value={filter.zonaNome} onChange={handleFilterChange} className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Nome de zona associada" />
                    </div>
                    <div className="md:col-span-3 flex justify-center">
                        <button type="submit" className="p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center gap-2 px-4">
                            <SearchIcon size={20} /> Aplicar Filtros
                        </button>
                    </div>
                </form>

                {/* Mensagens de Feedback */}
                {isLoading && <p className="text-center text-sky-300 py-10">Carregando veículos...</p>}
                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}
                {successMessage && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <MdCheckCircle className="inline mr-2" />{successMessage}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccessMessage(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}

                {/* Tabela de Veículos */}
                {!isLoading && !error && veiculos.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum veículo encontrado para os critérios informados.</p>
                )}
                {!isLoading && veiculos.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Placa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Modelo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fabricante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ano</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {veiculos.map((veiculo) => (
                                <tr key={veiculo.idVeiculo} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.idVeiculo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.placa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.modelo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.fabricante}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.ano}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex items-center justify-center">
                                        <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`}>
                                            <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(veiculo.idVeiculo, veiculo.placa)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                        {/* Botão para ver localização */}
                                        <button
                                            onClick={() => fetchLocalizacaoVeiculo(veiculo.idVeiculo)}
                                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"
                                        >
                                            <MdInfo size={14} /> Localização
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal de Localização */}
                {localizacaoModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-sky-500" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-semibold text-sky-400 mb-4">Localização do Veículo</h3>
                            {isLoadingLocalizacao ? (
                                <p className="text-center text-sky-300 py-4 flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Carregando localização...</p>
                            ) : errorLocalizacao ? (
                                <p className="text-red-400 mb-4">{errorLocalizacao}</p>
                            ) : (
                                <>
                                    <p><strong>ID:</strong> {localizacaoModal.idVeiculo}</p>
                                    <p><strong>Placa:</strong> {localizacaoModal.placa}</p>
                                    <p><strong>Modelo:</strong> {localizacaoModal.modelo} ({localizacaoModal.fabricante})</p>
                                    <hr className="my-4 border-slate-700"/>
                                    <h4 className="font-semibold text-slate-300 mb-2">Último Rastreamento:</h4>
                                    {localizacaoModal.ultimoRastreamento ? (
                                        <div>
                                            <p><strong>IPS X:</strong> {localizacaoModal.ultimoRastreamento.ipsX}</p>
                                            <p><strong>IPS Y:</strong> {localizacaoModal.ultimoRastreamento.ipsY}</p>
                                            <p><strong>IPS Z:</strong> {localizacaoModal.ultimoRastreamento.ipsZ}</p>
                                            <p><strong>GPRS Lat:</strong> {localizacaoModal.ultimoRastreamento.gprsLatitude}</p>
                                            <p><strong>GPRS Long:</strong> {localizacaoModal.ultimoRastreamento.gprsLongitude}</p>
                                            <p><strong>GPRS Alt:</strong> {localizacaoModal.ultimoRastreamento.gprsAltitude}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm">Nenhum rastreamento encontrado.</p>
                                    )}
                                    <hr className="my-4 border-slate-700"/>
                                    <h4 className="font-semibold text-slate-300 mb-2">Associações Atuais:</h4>
                                    <p><strong>Pátio:</strong> {localizacaoModal.patioAssociado?.nomePatio || 'N/A'}</p>
                                    <p><strong>Zona:</strong> {localizacaoModal.zonaAssociada?.nome || 'N/A'}</p>
                                    <p><strong>Box:</strong> {localizacaoModal.boxAssociado?.nome || 'N/A'}</p>
                                    <p className="text-xs text-slate-400 mt-2">Data da Consulta: {new Date(localizacaoModal.dataConsulta).toLocaleString('pt-BR')}</p>
                                </>
                            )}
                            <div className="flex justify-end mt-6">
                                <button onClick={() => setLocalizacaoModal(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md">Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}