"use client";

import NavBar from '@/components/nav-bar';
import { Map, CheckCircle, ArrowLeft, Clock, MapPin as MapPinIcon, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MAPAS_DISPONIVEIS, getMapaById } from '@/config/mapasDisponiveis';

export default function Mapa2DPage() {
    const searchParams = useSearchParams();
    const highlightBoxId = searchParams.get('highlightBoxId');
    const parkedPlate = searchParams.get('parkedPlate');
    const mapaParam = searchParams.get('mapa'); // Novo parâmetro para seleção automática
    const [successMessage, setSuccessMessage] = useState('');
    const [mapaSelecionado, setMapaSelecionado] = useState<string | null>(null);
    const [viewType, setViewType] = useState<'cards' | 'list'>('cards');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useEffect(() => {
        if (highlightBoxId && parkedPlate) {
            setSuccessMessage(`Moto com placa ${parkedPlate} foi estacionada com sucesso!`);
            const timer = setTimeout(() => setSuccessMessage(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [highlightBoxId, parkedPlate]);

    // Detectar parâmetro 'mapa' na URL e selecionar automaticamente
    useEffect(() => {
        if (mapaParam) {
            // Mapear nomes de pátios para IDs de mapas
            const mapaMapping: Record<string, string> = {
                'guarulhos': 'guarulhos',
                'limao': 'limao'
            };
            
            const mapaId = mapaMapping[mapaParam.toLowerCase()];
            if (mapaId) {
                setMapaSelecionado(mapaId);
            }
        }
    }, [mapaParam]);

    const handleSelecionarMapa = (mapaId: string) => {
        setMapaSelecionado(mapaId);
    };

    const handleVoltarSelecao = () => {
        setMapaSelecionado(null);
    };

    // Lógica de paginação
    const totalPages = Math.ceil(MAPAS_DISPONIVEIS.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMapas = MAPAS_DISPONIVEIS.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(0); // Reset para primeira página
    };

    // Se um mapa foi selecionado, renderiza o mapa
    if (mapaSelecionado) {
        const mapa = getMapaById(mapaSelecionado);
        if (!mapa) return null;

        const ComponenteMapa = mapa.componente;

        return (
            <>
                <NavBar active="mapa-2d" />
                <main className="min-h-screen text-white p-4 md:p-8">
                    <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                        <header className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <button
                                    onClick={handleVoltarSelecao}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                    Voltar
                                </button>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
                                <Map size={36} />
                                Mapa 2D - {mapa.nome}
                            </h1>
                            <p className="mt-2 text-md text-slate-200 max-w-3xl mx-auto">
                                Visualização interativa do pátio da Mottu em {mapa.nome}. Use o mouse para navegar (arrastar) e dar zoom (roda do mouse).
                            </p>
                        </header>

                        {successMessage && (
                            <div className="mb-6 flex items-center justify-center gap-2 text-lg text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                                <CheckCircle />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <ComponenteMapa highlightBoxId={highlightBoxId} />
                    </div>
                </main>
            </>
        );
    }

    // Se nenhum mapa foi selecionado, renderiza o seletor
    return (
        <>
            <NavBar active="mapa-2d" />
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3 mb-4">
                            <Map size={48} />
                            Mapas 2D Mottu
                        </h1>
                        <p className="text-lg text-slate-200 max-w-3xl mx-auto">
                            Escolha um pátio para visualizar o mapa interativo em 2D
                        </p>
                    </header>

                    {/* Toggle de Visualização - Centralizado */}
                    <div className="flex justify-center mb-8">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewType('cards')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'cards' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid size={16} />
                                Cards
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewType === 'list' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <List size={16} />
                                Lista
                            </button>
                        </div>
                    </div>

                    {viewType === 'cards' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {currentMapas.map((mapa) => {
                            const IconeComponente = mapa.icone;
                            const isEmDesenvolvimento = mapa.status === 'em-desenvolvimento';
                            const isPlanejado = mapa.status === 'planejado';
                            
                            return (
                                <div
                                    key={mapa.id}
                                    onClick={() => !isPlanejado && handleSelecionarMapa(mapa.id)}
                                    className={`
                                        ${mapa.cor} ${!isPlanejado ? mapa.corHover : ''}
                                        p-8 rounded-2xl shadow-xl
                                        ${!isPlanejado ? 'cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl' : 'cursor-not-allowed opacity-60'}
                                        flex flex-col items-center text-center
                                        group relative
                                    `}
                                >
                                    {/* Badge de Status */}
                                    {isEmDesenvolvimento && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white text-xs rounded-full">
                                            <Clock size={12} />
                                            Em Desenvolvimento
                                        </div>
                                    )}
                                    {isPlanejado && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-gray-500/90 text-white text-xs rounded-full">
                                            <MapPinIcon size={12} />
                                            Planejado
                                        </div>
                                    )}

                                    <div className="mb-6 p-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                                        <IconeComponente size={48} className="text-white" />
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {mapa.nome}
                                    </h3>
                                    
                                    <p className="text-white/90 text-sm leading-relaxed mb-4">
                                        {mapa.descricao}
                                    </p>

                                    {/* Informações adicionais */}
                                    {mapa.capacidade && (
                                        <p className="text-white/80 text-xs mb-2">
                                            📍 {mapa.localizacao}
                                        </p>
                                    )}
                                    {mapa.capacidade && (
                                        <p className="text-white/80 text-xs mb-4">
                                            🏍️ {mapa.capacidade}
                                        </p>
                                    )}
                                    
                                    <div className={`
                                        mt-6 px-6 py-2 rounded-full text-white text-sm font-medium transition-colors
                                        ${isPlanejado 
                                            ? 'bg-white/10 cursor-not-allowed' 
                                            : 'bg-white/20 group-hover:bg-white/30'
                                        }
                                    `}>
                                        {isPlanejado ? 'Em Breve' : 'Visualizar Mapa'}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-3">
                            {currentMapas.map((mapa) => {
                                const IconeComponente = mapa.icone;
                                const isEmDesenvolvimento = mapa.status === 'em-desenvolvimento';
                                const isPlanejado = mapa.status === 'planejado';
                                
                                return (
                                    <div
                                        key={mapa.id}
                                        onClick={() => !isPlanejado && handleSelecionarMapa(mapa.id)}
                                        className={`
                                            bg-white text-slate-900 rounded-lg p-5 
                                            flex items-center justify-between
                                            transition-all duration-200
                                            ${!isPlanejado 
                                                ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' 
                                                : 'cursor-not-allowed opacity-60'
                                            }
                                        `}
                                    >
                                        {/* Lado Esquerdo - Ícone e Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`${mapa.cor} p-3 rounded-lg`}>
                                                <IconeComponente size={32} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900">
                                                        {mapa.nome}
                                                    </h3>
                                                    {/* Badge de Status */}
                                                    {isEmDesenvolvimento && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                                            <Clock size={12} />
                                                            Em Desenvolvimento
                                                        </span>
                                                    )}
                                                    {isPlanejado && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                                                            <MapPinIcon size={12} />
                                                            Planejado
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {mapa.descricao}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lado Direito - Info e Ação */}
                                        <div className="flex items-center gap-6">
                                            {mapa.localizacao && (
                                                <div className="hidden sm:flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPinIcon size={14} />
                                                    {mapa.localizacao}
                                                </div>
                                            )}
                                            {mapa.capacidade && (
                                                <div className="hidden md:flex items-center gap-1 text-sm text-slate-600">
                                                    🏍️ {mapa.capacidade}
                                                </div>
                                            )}
                                            <button
                                                className={`
                                                    px-5 py-2 rounded-lg font-medium transition-colors
                                                    ${isPlanejado 
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    }
                                                `}
                                                disabled={isPlanejado}
                                            >
                                                {isPlanejado ? 'Em Breve' : 'Ver Mapa'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Controles de Paginação - Centralizados */}
                    {MAPAS_DISPONIVEIS.length > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-slate-200">
                            {/* Contador de Mapas */}
                            <div className="text-center">
                                <span>
                                    Mostrando {startIndex + 1} a {Math.min(endIndex, MAPAS_DISPONIVEIS.length)} de {MAPAS_DISPONIVEIS.length} mapas
                                </span>
                            </div>
                            
                            {/* Controle de Itens por Página */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-200">Mapas por página:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                    className="px-2 py-1 rounded bg-zinc-700 text-white text-sm border border-zinc-600"
                                    title="Selecionar quantidade de mapas por página"
                                >
                                    <option value={3}>3</option>
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                </select>
                            </div>
                            
                            {/* Navegação de Páginas */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={16} /> Anterior
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                                    currentPage === i + 1
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-zinc-700 hover:bg-zinc-600 text-slate-200'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Próxima <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-slate-300 text-sm">
                            💡 <strong>Dica:</strong> Use o mouse para navegar pelos mapas (arrastar) e dar zoom (roda do mouse)
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}