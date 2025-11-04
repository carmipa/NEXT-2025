"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { VeiculoService, EstacionamentoService } from '@/utils/api';
import { VeiculoResponseDto, VeiculoLocalizacaoResponseDto } from '@/types/veiculo';
import { EstacionamentoResponseDto } from '@/types/estacionamento';
import { Search, MapPin, Bike } from 'lucide-react';
import '@/styles/neumorphic.css';

interface VeiculoComLocalizacao extends VeiculoResponseDto {
    localizacao?: VeiculoLocalizacaoResponseDto;
    estaEstacionado: boolean;
    patioNome?: string;
    boxNome?: string;
}

export default function StatusVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoComLocalizacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null); // null inicialmente para evitar erro de hidratação
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 9; // Exibir 9 veículos por página

    // Buscar todos os veículos e suas localizações
    const fetchVeiculosComLocalizacao = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Buscar todos os veículos (em lotes de 1000)
            const todosVeiculos: VeiculoResponseDto[] = [];
            let page = 0;
            let hasMore = true;

            while (hasMore) {
                const response = await VeiculoService.listarPaginadoFiltrado({}, page, 1000, 'idVeiculo,asc');
                todosVeiculos.push(...response.content);
                hasMore = !response.last;
                page++;
            }

            // Buscar estacionamentos ativos para saber quais veículos estão estacionados
            const estacionamentosAtivos = await EstacionamentoService.listarTodosAtivos();
            
            // Log para debug
            console.log('📊 Estacionamentos ativos recebidos:', estacionamentosAtivos.length);

            // Criar mapa de placas para estacionamentos
            const mapaPlacasEstacionamentos = new Map<string, { patioNome: string; boxNome: string }>();
            estacionamentosAtivos.forEach((estacionamento: EstacionamentoResponseDto) => {
                const placa = estacionamento.veiculo?.placa;
                const nomeBox = estacionamento.box?.nome;
                const nomePatio = estacionamento.patio?.nomePatio;
                
                if (placa) {
                    mapaPlacasEstacionamentos.set(placa.toUpperCase(), {
                        patioNome: nomePatio || 'N/A',
                        boxNome: nomeBox || 'N/A'
                    });
                }
            });
            
            console.log('📊 Mapa de placas criado:', mapaPlacasEstacionamentos.size, 'veículos estacionados');

            // Combinar dados
            const veiculosComLocalizacao: VeiculoComLocalizacao[] = todosVeiculos.map(veiculo => {
                const placaUpper = veiculo.placa?.toUpperCase() || '';
                const infoEstacionamento = mapaPlacasEstacionamentos.get(placaUpper);
                
                return {
                    ...veiculo,
                    estaEstacionado: !!infoEstacionamento,
                    patioNome: infoEstacionamento?.patioNome,
                    boxNome: infoEstacionamento?.boxNome
                };
            });

            setVeiculos(veiculosComLocalizacao);
            setUltimaAtualizacao(new Date());
        } catch (err: any) {
            console.error('Erro ao buscar veículos:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao buscar status dos veículos.');
            setVeiculos([]);
        } finally {
            setIsLoading(false);
        }
    };

    // SSE para atualização em tempo real
    useEffect(() => {
        fetchVeiculosComLocalizacao();

        // Polling para atualização em tempo real (SSE pode ser implementado no futuro)
        // TODO: Implementar SSE quando o backend suportar `/api/estacionamentos/stream`
        const pollInterval = setInterval(() => {
            fetchVeiculosComLocalizacao();
        }, 30000);

        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    // Filtrar veículos por termo de busca (apenas por placa)
    const veiculosFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return veiculos;

        const termo = searchTerm.toLowerCase();
        return veiculos.filter(v => 
            v.placa?.toLowerCase().includes(termo)
        );
    }, [veiculos, searchTerm]);

    // Paginação - calcular dados paginados
    const veiculosPaginados = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return veiculosFiltrados.slice(startIndex, endIndex);
    }, [veiculosFiltrados, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(veiculosFiltrados.length / ITEMS_PER_PAGE);
    }, [veiculosFiltrados]);

    // Reset da página quando mudar o filtro
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    // Função para obter badge de status (mesmo estilo da página de listar)
    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'OPERACIONAL':
                return (
                    <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        Operacional
                    </span>
                );
            case 'EM_MANUTENCAO':
                return (
                    <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                        Manutenção
                    </span>
                );
            case 'INATIVO':
                return (
                    <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                        Inativo
                    </span>
                );
            default:
                return (
                    <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
                        N/A
                    </span>
                );
        }
    };

    // Função para obter badge de estacionamento
    const getEstacionamentoBadge = (estaEstacionado: boolean, patioNome?: string) => {
        if (estaEstacionado && patioNome) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    <MapPin size={12} />
                    {patioNome}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                Não estacionado
            </span>
        );
    };

    return (
        <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-32">
            <div className="container mx-auto">
                <div className="neumorphic-container p-3 sm:p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-bicycle mr-2 sm:mr-3 text-2xl sm:text-4xl text-emerald-500"></i>
                            <span className="hidden sm:inline">Status das Motos</span>
                            <span className="sm:hidden">Status</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            {ultimaAtualizacao && (
                                <span className="text-gray-400 text-sm">Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}</span>
                            )}
                                                         <Link 
                                 href="/veiculo/listar" 
                                 className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center gap-2"
                             >
                                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                 <div className="relative flex items-center gap-2">
                                     <i className="ion-ios-arrow-back text-lg"></i>
                                     <span className="text-sm lg:text-base font-black">VOLTAR</span>
                                 </div>
                             </Link>
                        </div>
                    </div>

                    {/* Barra de pesquisa */}
                    <div className="mb-4 sm:mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                            <input
                                type="text"
                                placeholder=""
                                title="Buscar por placa"
                                aria-label="Buscar por placa"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neumorphic-input w-full pl-10 sm:pl-14 pr-3 sm:pr-4 py-2 text-sm sm:text-base"
                            />
                        </div>
                        <div className="text-sm text-zinc-400 mt-2">
                            {veiculosFiltrados.length} de {veiculos.length} veículos
                        </div>
                    </div>

                    {/* Toggle de Visualização */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-apps text-sm sm:text-base"></i>
                                <span className="hidden sm:inline">Cards</span>
                                <span className="sm:hidden">C</span>
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
                                    viewType === 'table' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-list text-sm sm:text-base"></i>
                                <span className="hidden sm:inline">Tabela</span>
                                <span className="sm:hidden">T</span>
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                            <p className="text-zinc-400">Carregando status dos veículos...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Conteúdo */}
                    {!isLoading && !error && (
                        <>
                            {viewType === 'cards' ? (
                                /* Visualização em Cards - usando neumorphic-card-gradient como na página de listar */
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                    {veiculosPaginados.map((veiculo) => (
                                        <div
                                            key={veiculo.idVeiculo}
                                            className="neumorphic-card-gradient p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <span className="text-xs font-semibold bg-[var(--neumorphic-bg)] text-[var(--color-mottu-dark)] px-2 sm:px-3 py-1 rounded-full shadow-inner" style={{fontFamily: 'Montserrat, sans-serif'}}>ID: {veiculo.idVeiculo}</span>
                                                        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-mottu-dark)] truncate flex items-center gap-1 sm:gap-2" title={veiculo.placa} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                            <i className="ion-ios-pricetag text-blue-500 text-base sm:text-lg"></i>
                                                            {veiculo.placa}
                                                        </h2>
                                                    </div>
                                                    {getStatusBadge(veiculo.status)}
                                                </div>
                                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-bicycle text-red-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Modelo:</span>
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.modelo}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-build text-orange-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Fabricante:</span>
                                                        <span className="text-slate-600 truncate ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.fabricante}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <i className="ion-ios-calendar text-indigo-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                        <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Ano:</span>
                                                        <span className="text-slate-600 ml-1 sm:ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.ano}</span>
                                                    </div>
                                                    {veiculo.tagBleId && (
                                                        <div className="flex items-center">
                                                            <i className="ion-ios-bluetooth text-blue-500 text-sm sm:text-base mr-1 sm:mr-2"></i>
                                                            <span className="font-semibold text-[var(--color-mottu-dark)] w-16 sm:w-20" style={{fontFamily: 'Montserrat, sans-serif'}}>Tag:</span>
                                                            <span className="text-slate-600 truncate ml-1 sm:ml-2 font-mono" style={{fontFamily: 'Montserrat, sans-serif'}}>{veiculo.tagBleId}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center mt-2">
                                                        {getEstacionamentoBadge(veiculo.estaEstacionado, veiculo.patioNome)}
                                                        {veiculo.estaEstacionado && veiculo.boxNome && (
                                                            <span className="text-xs text-slate-600 ml-2" style={{fontFamily: 'Montserrat, sans-serif'}}>• Box: {veiculo.boxNome}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center gap-1 sm:gap-2 pt-3 sm:pt-4 mt-auto">
                                                <Link
                                                    href={`/veiculo/detalhes/${veiculo.idVeiculo}`}
                                                    className="p-1.5 sm:p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Ver Detalhes"
                                                >
                                                    <i className="ion-ios-eye text-lg sm:text-xl"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Visualização em Tabela - fonte preta */
                                <div className="neumorphic-container overflow-x-auto">
                                    <table className="w-full">
                                                                                 <thead>
                                             <tr className="border-b border-zinc-700">
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-key text-gray-600"></i>
                                                         ID
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-pricetag text-blue-500"></i>
                                                         Placa
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-bicycle text-red-500"></i>
                                                         Modelo
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-build text-orange-500"></i>
                                                         Fabricante
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-calendar text-indigo-500"></i>
                                                         Ano
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-bluetooth text-blue-500"></i>
                                                         Tag
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-pulse text-yellow-500"></i>
                                                         Status
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-car text-green-600"></i>
                                                         Estacionado
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-location text-blue-500"></i>
                                                         Pátio
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-square-outline text-purple-500"></i>
                                                         Box
                                                     </div>
                                                 </th>
                                                 <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">
                                                     <div className="flex items-center gap-2">
                                                         <i className="ion-ios-settings text-gray-600"></i>
                                                         Ações
                                                     </div>
                                                 </th>
                                             </tr>
                                         </thead>
                                                                                 <tbody>
                                             {veiculosPaginados.map((veiculo) => (
                                                 <tr key={veiculo.idVeiculo} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                                                     <td className="py-3 px-4 text-black text-xs font-mono">{veiculo.idVeiculo}</td>
                                                     <td className="py-3 px-4 text-black font-medium">
                                                         <div className="flex items-center gap-2">
                                                             <i className="ion-ios-pricetag text-blue-500"></i>
                                                             {veiculo.placa}
                                                         </div>
                                                     </td>
                                                     <td className="py-3 px-4 text-black font-medium">
                                                         <div className="flex items-center gap-2">
                                                             <i className="ion-ios-bicycle text-red-500"></i>
                                                             {veiculo.modelo}
                                                         </div>
                                                     </td>
                                                     <td className="py-3 px-4 text-black">
                                                         <div className="flex items-center gap-2">
                                                             <i className="ion-ios-build text-orange-500"></i>
                                                             {veiculo.fabricante}
                                                         </div>
                                                     </td>
                                                     <td className="py-3 px-4 text-black">
                                                         <div className="flex items-center gap-2">
                                                             <i className="ion-ios-calendar text-indigo-500"></i>
                                                             {veiculo.ano}
                                                         </div>
                                                     </td>
                                                     <td className="py-3 px-4">
                                                         {veiculo.tagBleId ? (
                                                             <div className="flex items-center gap-2">
                                                                 <i className="ion-ios-bluetooth text-blue-500"></i>
                                                                 <span className="text-xs text-emerald-700 font-mono bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                                                                     {veiculo.tagBleId}
                                                                 </span>
                                                             </div>
                                                         ) : (
                                                             <span className="text-black">-</span>
                                                         )}
                                                     </td>
                                                     <td className="py-3 px-4">{getStatusBadge(veiculo.status)}</td>
                                                     <td className="py-3 px-4 text-black">
                                                         {veiculo.estaEstacionado ? (
                                                             <div className="flex items-center gap-2">
                                                                 <i className="ion-ios-checkmark-circle text-green-600"></i>
                                                                 <span className="font-medium">Sim</span>
                                                             </div>
                                                         ) : (
                                                             <div className="flex items-center gap-2">
                                                                 <i className="ion-ios-close-circle text-gray-400"></i>
                                                                 <span>Não</span>
                                                             </div>
                                                         )}
                                                     </td>
                                                     <td className="py-3 px-4 text-black">
                                                         {veiculo.patioNome ? (
                                                             <div className="flex items-center gap-2">
                                                                 <i className="ion-ios-location text-blue-500"></i>
                                                                 {veiculo.patioNome}
                                                             </div>
                                                         ) : (
                                                             <span>-</span>
                                                         )}
                                                     </td>
                                                     <td className="py-3 px-4 text-black">
                                                         {veiculo.boxNome ? (
                                                             <div className="flex items-center gap-2">
                                                                 <i className="ion-ios-square-outline text-purple-500"></i>
                                                                 {veiculo.boxNome}
                                                             </div>
                                                         ) : (
                                                             <span>-</span>
                                                         )}
                                                     </td>
                                                     <td className="py-3 px-4">
                                                         <Link
                                                             href={`/veiculo/detalhes/${veiculo.idVeiculo}`}
                                                             className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1"
                                                             title="Visualizar detalhes"
                                                         >
                                                             <i className="ion-ios-eye"></i>
                                                         </Link>
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Paginação */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-6">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            currentPage === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        ← Anterior
                                    </button>
                                    <span className="text-slate-700 text-sm font-medium">
                                        Página {currentPage + 1} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            currentPage >= totalPages - 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        Próxima →
                                    </button>
                                </div>
                            )}

                            {/* Mensagem se não houver resultados */}
                            {veiculosFiltrados.length === 0 && (
                                <div className="text-center py-12">
                                    <Bike size={48} className="mx-auto text-zinc-600 mb-4" />
                                    <p className="text-zinc-400">Nenhum veículo encontrado.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
