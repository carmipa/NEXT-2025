"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { VeiculoService } from "@/utils/api";
import { VeiculoResponseDto } from "@/types/veiculo";
import { getPatioByBoxName, getPatioById, getMapaUrl as getMapaUrlFromConfig, PATIOS_CONFIG } from "@/lib/patioConfig";
import '@/styles/neumorphic.css';

// Tipagem (sem alterações)
interface VeiculoInfoFromApi {
    placa: string | null;
    modelo: string;
    fabricante: string;
    tagBleId: string | null;
}
interface BoxFromApi {
    idBox: number;
    nome: string;
    status: string;
    veiculo: VeiculoInfoFromApi | null;
}
interface MapaResponse {
    rows: number;
    cols: number;
    boxes: BoxFromApi[];
}

function MapaVagasContent() {
    const params = useSearchParams();
    const router = useRouter();
    const highlight = params.get("highlight");
    const placaParam = params.get("placa");
    const boxNomeParam = params.get("box");

    const [mapa, setMapa] = useState<MapaResponse | null>(null);
    const [highlightedVehicle, setHighlightedVehicle] = useState<VeiculoResponseDto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVehicleData, setModalVehicleData] = useState<VeiculoResponseDto | null>(null);
    const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
    const [patioName, setPatioName] = useState<string>('');
    const [vehiclesData, setVehiclesData] = useState<Map<number, VeiculoResponseDto>>(new Map());
    
    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);

    // Funções de paginação
    const paginatedBoxes = useMemo(() => {
        if (!mapa?.boxes) return [];
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return mapa.boxes.slice(startIndex, endIndex);
    }, [mapa?.boxes, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        if (!mapa?.boxes) return 0;
        return Math.ceil(mapa.boxes.length / itemsPerPage);
    }, [mapa?.boxes, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll para o topo quando mudar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset da página quando o mapa mudar
    useEffect(() => {
        setCurrentPage(1);
    }, [mapa]);

    // Hooks e funções (sem alterações)
    useEffect(() => {
        let alive = true;
        const fetchMapa = async () => {
            // Se temos uma placa, tentar buscar o pátio correto
            let url = "/api/vagas/mapa";
            let patioId: number | null = null;
            
            if (placaParam) {
                console.log('🔍 Buscando pátio para placa:', placaParam);
                try {
                    // Buscar em qual pátio o veículo está estacionado
                    const buscaRes = await fetch(`/api/vagas/buscar-placa/${placaParam}`, { cache: 'no-store' });
                    if (buscaRes.ok) {
                        const buscaData = await buscaRes.json();
                        console.log('📋 Dados da busca:', buscaData);
                        console.log('🧭 Debug localizar → mapa:', {
                            placa: buscaData?.placa,
                            found: buscaData?.found,
                            boxId: buscaData?.boxId,
                            boxNome: buscaData?.boxNome,
                            patioId: buscaData?.patioId,
                        });
                        if (buscaData.found && buscaData.boxId) {
                            // Buscar informações do box para determinar o pátio
                            const boxNome = buscaData.boxNome || '';
                            console.log('📦 Nome do box encontrado:', boxNome);
                            
                            // Usar configuração centralizada
                            const patioConfig = getPatioByBoxName(boxNome);
                            if (patioConfig) {
                                url = `/api/vagas/mapa?patioId=${patioConfig.id}`;
                                patioId = patioConfig.id;
                                console.log(`✅ Determinado como ${patioConfig.nome} (ID ${patioConfig.id})`);
                            } else {
                                console.warn('❌ Pátio não encontrado para box:', boxNome);
                            }
                        }
                    }
                } catch (err) {
                    console.warn('❌ Erro ao buscar pátio do veículo:', err);
                }
            }
            
            console.log('🌐 Fazendo requisição para URL:', url);
            let res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                console.error('❌ Erro na requisição:', res.status, res.statusText);
                return;
            }
            let data = (await res.json()) as MapaResponse;
            console.log('📊 Dados recebidos da API:', {
                rows: data.rows,
                cols: data.cols,
                totalBoxes: data.boxes?.length,
                firstBox: data.boxes?.[0],
                lastBox: data.boxes?.[data.boxes?.length - 1]
            });
            // Fallback: se filtrou por pátio e veio vazio, tentar sem filtro
            if (patioId && Array.isArray(data.boxes) && data.boxes.length === 0) {
                console.warn('⚠️ Nenhum box retornado para patioId=', patioId, ' — tentando sem filtro...');
                res = await fetch('/api/vagas/mapa', { cache: 'no-store' });
                if (res.ok) {
                    data = (await res.json()) as MapaResponse;
                    console.log('🔁 Requisição sem filtro retornou:', {
                        totalBoxes: data.boxes?.length,
                        sample: data.boxes?.slice(0, 3)
                    });
                } else {
                    console.error('❌ Falha também sem filtro:', res.status, res.statusText);
                }
            }
            if (Array.isArray(data.boxes)) {
                const sample = data.boxes.slice(0, 10).map(b => ({ idBox: b.idBox, nome: b.nome, status: b.status, placa: b.veiculo?.placa }));
                console.log('🧪 Amostra de boxes (até 10):', sample);
            }
            
            // Log dos primeiros 5 boxes para debug
            console.log('📦 Primeiros 5 boxes:', data.boxes?.slice(0, 5));
            
            // Log do box destacado se houver
            if (highlight && data.boxes) {
                const highlightedBox = data.boxes.find(b => b.idBox.toString() === highlight);
                console.log('🎯 Box destacado encontrado:', highlightedBox);
            }
            if (alive) {
                setMapa(data);
                
                // Buscar dados de todos os veículos ocupados
                fetchAllVehiclesData(data.boxes);
                
                // Sempre tentar determinar o nome do pátio
                if (patioId) {
                    console.log('🔍 Buscando nome do pátio para ID:', patioId);
                    try {
                        const patioRes = await fetch(`/api/patios/${patioId}`);
                        if (patioRes.ok) {
                            const patioData = await patioRes.json();
                            console.log('📋 Dados do pátio recebidos:', patioData);
                            // Usar o nome que vem diretamente da API
                            setPatioName(patioData.nomePatio || 'Pátio Desconhecido');
                        } else {
                            console.warn('❌ Erro ao buscar pátio:', patioRes.status);
                            setPatioName('Pátio Desconhecido');
                        }
                    } catch (err) {
                        console.warn('❌ Erro ao buscar nome do pátio:', err);
                        setPatioName('Pátio Desconhecido');
                    }
                } else {
                    // Se não temos patioId específico, tentar determinar pelo primeiro box
                    console.log('🔍 Determinando pátio pelo primeiro box...');
                    if (data.boxes.length > 0) {
                        const primeiroBox = data.boxes[0];
                        console.log('📦 Primeiro box encontrado:', primeiroBox);
                        
                        if (primeiroBox.nome.startsWith('B') || primeiroBox.nome.startsWith('GRU') || primeiroBox.nome.startsWith('Gru')) {
                            console.log('✅ Pátio identificado como Guarulhos');
                            setPatioName('Pátio Mottu Guarulhos');
                        } else if (primeiroBox.nome.startsWith('L') || primeiroBox.nome.startsWith('LIM') || primeiroBox.nome.startsWith('LIMAO')) {
                            console.log('✅ Pátio identificado como Limão');
                            setPatioName('Pátio Mottu Limão');
                        } else {
                            console.log('❓ Pátio não identificado pelo prefixo');
                            setPatioName('Pátio Desconhecido');
                        }
                    } else {
                        console.log('❌ Nenhum box encontrado');
                        setPatioName('Pátio Desconhecido');
                    }
                }
                
                // Fallback: se ainda não temos nome do pátio, tentar determinar pela URL
                if (!patioName && url.includes('patioId=')) {
                    const urlPatioId = url.split('patioId=')[1];
                    console.log('🔄 Tentando determinar pátio pela URL:', urlPatioId);
                    if (urlPatioId === '2') {
                        setPatioName('Pátio Mottu Guarulhos');
                    } else if (urlPatioId === '13') {
                        setPatioName('Pátio Mottu Limão');
                    }
                }
                
                // Log final do estado
                console.log('🏁 Estado final do patioName será:', patioName || 'vazio');
            }
        };
        fetchMapa();
        const t = setInterval(fetchMapa, 2000);
        return () => { alive = false; clearInterval(t); };
    }, [placaParam]);

    // Debug: monitorar mudanças no patioName
    useEffect(() => {
        console.log('🔄 patioName mudou para:', patioName);
    }, [patioName]);

    useEffect(() => {
        if (placaParam) {
            console.log('🚗 Buscando detalhes do veículo para placa:', placaParam);
            const fetchVehicleDetails = async () => {
                try {
                    const result = await VeiculoService.listarPaginadoFiltrado({ placa: placaParam }, 0, 1);
                    console.log('🚗 Resultado da busca do veículo:', result);
                    if (result.content.length > 0) {
                        console.log('✅ Veículo encontrado:', result.content[0]);
                        setHighlightedVehicle(result.content[0]);
                    } else {
                        console.log('❌ Nenhum veículo encontrado para placa:', placaParam);
                    }
                } catch (error) {
                    console.error("❌ Falha ao buscar detalhes do veículo:", error);
                }
            };
            fetchVehicleDetails();
        } else {
            console.log('ℹ️ Nenhuma placa especificada, não buscando detalhes do veículo');
        }
    }, [placaParam]);

    const gridStyle = useMemo(() => {
        if (!mapa) return { gridTemplateColumns: "repeat(5, minmax(0,1fr))" };
        return { gridTemplateColumns: `repeat(${mapa.cols}, minmax(0,1fr))` };
    }, [mapa]);

    const isOcupado = (b: BoxFromApi) => (b.status ?? "").toUpperCase() === "O";

    const onLiberar = async (boxId: number) => {
        if (!confirm(`Tem certeza que deseja liberar o box ${boxId}?`)) return;
        const res = await fetch(`/api/vagas/liberar/${boxId}`, { method: "POST" });
        if (res.ok) {
            router.replace("/vagas/mapa");
        }
    };

    const handleOpenModal = (vehicleData: VeiculoResponseDto) => {
        setModalVehicleData(vehicleData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalVehicleData(null);
    };

    // Função para buscar dados de todos os veículos ocupados
    const fetchAllVehiclesData = async (boxes: BoxFromApi[]) => {
        const vehiclesMap = new Map<number, VeiculoResponseDto>();
        
        for (const box of boxes) {
            if (box.veiculo?.placa) {
                try {
                    const result = await VeiculoService.listarPaginadoFiltrado({ placa: box.veiculo.placa }, 0, 1);
                    if (result.content.length > 0) {
                        vehiclesMap.set(box.idBox, result.content[0]);
                    }
                } catch (error) {
                    console.error(`Erro ao buscar dados do veículo ${box.veiculo.placa}:`, error);
                }
            }
        }
        
        setVehiclesData(vehiclesMap);
    };

    // Função para determinar o mapa correto baseado no pátio
    const getMapaUrl = () => {
        if (!patioName) {
            console.log('ℹ️ Nenhum nome de pátio definido, retornando URL padrão');
            return "/mapa-2d";
        }
        
        console.log('🔍 Buscando configuração do pátio para:', patioName);
        
        // Tentar encontrar o pátio pelo nome
        const patioConfig = PATIOS_CONFIG.find(patio => 
            patio.nome.toLowerCase().includes(patioName.toLowerCase()) ||
            patioName.toLowerCase().includes(patio.nome.toLowerCase())
        );
        
        if (patioConfig) {
            const url = getMapaUrlFromConfig(patioConfig);
            console.log(`✅ Encontrado pátio: ${patioConfig.nome}, URL: ${url}`);
            return url;
        }
        
        console.log('❌ Pátio não encontrado na configuração, retornando URL padrão');
        return "/mapa-2d";
    };

    return (
        <>
            <main className="min-h-screen text-white p-4 sm:p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 sm:mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Mapa de Vagas (2D)</h1>
                            <p className="text-base sm:text-lg text-emerald-400 mt-1">
                                {patioName || 'Carregando pátio...'}
                            </p>
                            {/* Debug info - remover depois */}
                            {process.env.NODE_ENV === 'development' && (
                                <p className="text-xs text-zinc-500 mt-1">Debug: patioName = "{patioName}"</p>
                            )}
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-400">
                            {placaParam ? (
                                <>
                                    Placa: <span className="font-mono text-emerald-300">{placaParam}</span>
                                    {boxNomeParam ? <> • Box: <span className="font-mono">{boxNomeParam}</span></> : null}
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Bloco Centralizado de Controles */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="neumorphic-container p-3 sm:p-4 max-w-md w-full">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {/* Toggle de Visualização */}
                                <div className="flex bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewType('cards')}
                                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                            viewType === 'cards' 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <i className="ion-ios-grid text-sm sm:text-base"></i>
                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Cards</span>
                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Cards</span>
                                    </button>
                                    <button
                                        onClick={() => setViewType('table')}
                                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                            viewType === 'table' 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <i className="ion-ios-list text-sm sm:text-base"></i>
                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Tabela</span>
                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Lista</span>
                                    </button>
                                </div>

                                {/* Informações de Status */}
                                {mapa && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span>{mapa.boxes.filter(b => isOcupado(b)).length} ocupadas</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                                            <span>{mapa.boxes.filter(b => !isOcupado(b)).length} livres</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-3 sm:p-4">
                        {!mapa ? (
                            <div className="text-zinc-300 text-sm sm:text-base">Carregando mapa...</div>
                        ) : viewType === 'cards' ? (
                            <div className="grid gap-2 sm:gap-3" style={gridStyle}>
                                {paginatedBoxes.map((b) => {
                                    const isHighlighted = highlight && b.idBox?.toString() === highlight;
                                    const ocupado = isOcupado(b);
                                    
                                    // Log para debug dos primeiros 3 boxes
                                    if (paginatedBoxes.indexOf(b) < 3) {
                                        console.log(`🎨 Renderizando card ${paginatedBoxes.indexOf(b) + 1}:`, {
                                            idBox: b.idBox,
                                            nome: b.nome,
                                            status: b.status,
                                            veiculo: b.veiculo,
                                            isHighlighted,
                                            ocupado
                                        });
                                    }

                                    return (
                                        <div
                                            key={b.idBox}
                                            className={[
                                                "relative rounded-xl border p-3 sm:p-4 transition duration-300 ease-in-out flex flex-col justify-between",
                                                ocupado ? "border-emerald-600 bg-emerald-600/10" : "border-zinc-700 bg-zinc-800",
                                                isHighlighted ? "ring-4 ring-amber-400/80 scale-105" : "hover:bg-zinc-700"
                                            ].join(" ")}
                                            style={{ minHeight: '100px' }}
                                        >
                                            {isHighlighted && highlightedVehicle ? (
                                                <>
                                                    <div>
                                                        <div className="text-xs sm:text-sm text-amber-300 font-bold">{b.nome}</div>
                                                        <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-mono tracking-widest">
                                                            {b.veiculo?.placa || "OCUPADO"}
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-end gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(highlightedVehicle)}
                                                            className="px-2 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors">
                                                            <i className="ion-ios-eye text-xs"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Detalhes</span>
                                                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Ver</span>
                                                        </button>
                                                        <button
                                                            onClick={() => onLiberar(b.idBox)}
                                                            className="px-2 py-1 text-xs rounded-md bg-rose-600 hover:bg-rose-700"
                                                        >
                                                            Liberar
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <div className="text-xs sm:text-sm text-zinc-300">{b.nome || `BOX ${b.idBox}`}</div>
                                                        <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-mono tracking-widest">
                                                            {ocupado ? (b.veiculo?.placa || "OCUPADO") : "LIVRE"}
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-1 sm:pt-2">
                                                        {ocupado ? (
                                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                                {vehiclesData.has(b.idBox) && (
                                                                    <button
                                                                        onClick={() => handleOpenModal(vehiclesData.get(b.idBox)!)}
                                                                        className="px-2 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors">
                                                                        <i className="ion-ios-eye text-xs"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Detalhes</span>
                                                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Ver</span>
                                                                    </button>
                                                                )}
                                                                <button onClick={() => onLiberar(b.idBox)} className="px-2 sm:px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm"> Liberar </button>
                                                            </div>
                                                        ) : ( <span className="text-xs text-zinc-400">Disponível</span> )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Visualização em tabela
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-700 text-zinc-400">
                                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Box</th>
                                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">Status</th>
                                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Placa</th>
                                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">Modelo</th>
                                            <th className="text-center py-2 sm:py-3 px-2 sm:px-4">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedBoxes.map((b) => {
                                            const isHighlighted = highlight && b.idBox?.toString() === highlight;
                                            const ocupado = isOcupado(b);

                                            return (
                                                <tr 
                                                    key={b.idBox}
                                                    className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                                                        isHighlighted ? 'bg-amber-400/10 ring-2 ring-amber-400/50' : ''
                                                    }`}
                                                >
                                                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono">
                                                        {isHighlighted ? (
                                                            <span className="text-amber-300 font-bold text-xs sm:text-sm">{b.nome}</span>
                                                        ) : (
                                                            <span className="text-xs sm:text-sm">{b.nome || `BOX ${b.idBox}`}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            ocupado 
                                                                ? 'bg-emerald-600/20 text-emerald-400' 
                                                                : 'bg-zinc-600/20 text-zinc-400'
                                                        }`}>
                                                            {ocupado ? 'OCUPADO' : 'LIVRE'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-xs sm:text-sm">
                                                        {ocupado ? (b.veiculo?.placa || 'N/A') : '-'}
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell text-xs sm:text-sm">
                                                        {ocupado && b.veiculo?.modelo ? b.veiculo.modelo : '-'}
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                                                        {ocupado ? (
                                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                                {(isHighlighted && highlightedVehicle) || vehiclesData.has(b.idBox) ? (
                                                                    <button
                                                                        onClick={() => handleOpenModal(isHighlighted && highlightedVehicle ? highlightedVehicle : vehiclesData.get(b.idBox)!)}
                                                                        className="px-2 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors"
                                                                    >
                                                                        <i className="ion-ios-eye text-xs"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Detalhes</span>
                                                                        <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Ver</span>
                                                                    </button>
                                                                ) : null}
                                                                <button
                                                                    onClick={() => onLiberar(b.idBox)}
                                                                    className="px-2 py-1 text-xs rounded-md bg-rose-600 hover:bg-rose-700"
                                                                >
                                                                    Liberar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-500">Disponível</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Componente de Paginação */}
                    {mapa && mapa.boxes.length > itemsPerPage && (
                        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4">
                            {/* Informações da paginação */}
                            <div className="text-xs sm:text-sm text-zinc-400 text-center">
                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, mapa.boxes.length)} de {mapa.boxes.length} vagas
                            </div>
                            
                            {/* Controles de paginação */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                {/* Botão Anterior */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white'
                                    }`}
                                >
                                    <span className="hidden sm:inline">Anterior</span>
                                    <span className="sm:hidden">Ant</span>
                                </button>

                                {/* Números das páginas */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 2) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 1) {
                                            pageNum = totalPages - 2 + i;
                                        } else {
                                            pageNum = currentPage - 1 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Botão Próximo */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white'
                                    }`}
                                >
                                    <span className="hidden sm:inline">Próximo</span>
                                    <span className="sm:hidden">Próx</span>
                                </button>
                            </div>

                            {/* Pular para página específica */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                                <span className="hidden sm:inline">Ir para página:</span>
                                <span className="sm:hidden">Página:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const page = parseInt(e.target.value);
                                        if (page >= 1 && page <= totalPages) {
                                            handlePageChange(page);
                                        }
                                    }}
                                    className="w-12 sm:w-16 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-center text-white text-xs sm:text-sm"
                                    title="Digite o número da página"
                                    aria-label="Número da página"
                                />
                                <span>de {totalPages}</span>
                            </div>
                        </div>
                    )}

                    {/* --- BOTÕES DE NAVEGAÇÃO ALTERADOS --- */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
                        <button onClick={() => router.push("/radar/buscar")} className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <i className="ion-ios-search text-sm sm:text-base"></i> 
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Buscar outra placa</span>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Buscar</span>
                        </button>

                        {/* BOTÃO ALTERADO */}
                        <button onClick={() => router.push("/radar")} className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <i className="ion-ios-arrow-back text-sm sm:text-base"></i> 
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Voltar ao Radar</span>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Voltar</span>
                        </button>

                        <Link href={getMapaUrl()} className="px-3 sm:px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <i className="ion-ios-map text-sm sm:text-base"></i> 
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Ver Mapa Interativo</span>
                            <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Mapa</span>
                        </Link>
                    </div>

					{/* Acesso rápido aos novos relatórios */}
					<div className="mt-4 sm:mt-8 rounded-2xl border border-zinc-700 bg-zinc-900 p-3 sm:p-4">
						<div className="flex items-center justify-between flex-wrap gap-3 mb-3">
							<h2 className="text-sm sm:text-base font-semibold text-zinc-200 flex items-center gap-2">
								<i className="ion-ios-analytics text-emerald-400"></i>
								Relatórios
							</h2>
							<Link href="/relatorios" className="text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm flex items-center gap-1">
								Ver todos
								<i className="ion-ios-arrow-forward"></i>
							</Link>
						</div>
						<div className="flex flex-wrap gap-2 sm:gap-3">
							<Link href="/relatorios/ocupacao-diaria" className="px-3 py-1.5 rounded-lg bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-calendar"></i>
								Ocupação Diária
							</Link>
							<Link href="/relatorios/movimentacao" className="px-3 py-1.5 rounded-lg bg-orange-700/20 hover:bg-orange-700/30 text-orange-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-swap"></i>
								Movimentação
							</Link>
							<Link href="/relatorios/heatmap" className="px-3 py-1.5 rounded-lg bg-red-700/20 hover:bg-red-700/30 text-red-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-map"></i>
								Heatmap
							</Link>
							<Link href="/relatorios/manutencao" className="px-3 py-1.5 rounded-lg bg-sky-700/20 hover:bg-sky-700/30 text-sky-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-construct"></i>
								Manutenção
							</Link>
							<Link href="/relatorios/performance-sistema" className="px-3 py-1.5 rounded-lg bg-indigo-700/20 hover:bg-indigo-700/30 text-indigo-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-speedometer"></i>
								Performance
							</Link>
							<Link href="/relatorios/analytics" className="px-3 py-1.5 rounded-lg bg-purple-700/20 hover:bg-purple-700/30 text-purple-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-analytics"></i>
								Analytics
							</Link>
							<Link href="/relatorios/dashboard-ia" className="px-3 py-1.5 rounded-lg bg-fuchsia-700/20 hover:bg-fuchsia-700/30 text-fuchsia-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-bulb"></i>
								Dashboard IA
							</Link>
							<Link href="/relatorios/notificacoes" className="px-3 py-1.5 rounded-lg bg-amber-700/20 hover:bg-amber-700/30 text-amber-300 text-xs sm:text-sm flex items-center gap-1">
								<i className="ion-ios-notifications"></i>
								Notificações
							</Link>
						</div>
					</div>
                </div>

                {/* Modal com cores atualizadas */}
                {isModalOpen && modalVehicleData && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={handleCloseModal}>
                        <div className="bg-zinc-900 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md text-white border border-zinc-700 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-emerald-400">
                                    <i className="ion-ios-bicycle text-xl sm:text-2xl"></i> 
                                    <span style={{fontFamily: 'Montserrat, sans-serif'}} className="hidden sm:inline">Detalhes da Moto</span>
                                    <span style={{fontFamily: 'Montserrat, sans-serif'}} className="sm:hidden">Detalhes</span>
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-zinc-800 transition-colors" title="Fechar modal"> 
                                    <i className="ion-ios-close text-xl sm:text-2xl"></i> 
                                </button>
                            </div>
                            <dl className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Placa</dt> 
                                    <dd className="font-mono text-emerald-300 text-xs sm:text-sm">{modalVehicleData.placa}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Modelo</dt> 
                                    <dd className="text-white text-xs sm:text-sm">{modalVehicleData.modelo}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Fabricante</dt> 
                                    <dd className="text-white text-xs sm:text-sm">{modalVehicleData.fabricante}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">RENAVAM</dt> 
                                    <dd className="font-mono text-zinc-300 text-xs sm:text-sm">{modalVehicleData.renavam}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Chassi</dt> 
                                    <dd className="font-mono text-zinc-300 text-xs sm:text-sm">{modalVehicleData.chassi}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Ano</dt> 
                                    <dd className="text-white text-xs sm:text-sm">{modalVehicleData.ano}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Combustível</dt> 
                                    <dd className="text-white text-xs sm:text-sm">{modalVehicleData.combustivel}</dd> 
                                </div>
                                <div className="flex justify-between border-b border-zinc-700 pb-1 sm:pb-2"> 
                                    <dt className="text-zinc-400 font-medium">Status</dt> 
                                    <dd>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            modalVehicleData.status === 'LIVRE' 
                                                ? 'bg-emerald-600/20 text-emerald-400' 
                                                : modalVehicleData.status === 'OCUPADO'
                                                ? 'bg-amber-600/20 text-amber-400'
                                                : 'bg-zinc-600/20 text-zinc-400'
                                        }`}>
                                            {modalVehicleData.status}
                                        </span>
                                    </dd> 
                                </div>
                                <div className="flex justify-between"> 
                                    <dt className="text-zinc-400 font-medium">Tag BLE ID</dt> 
                                    <dd className="font-mono text-zinc-300 text-xs sm:text-sm">{modalVehicleData.tagBleId || 'N/A'}</dd> 
                                </div>
                            </dl>
                            <div className="mt-4 sm:mt-6 text-right">
                                <button onClick={handleCloseModal} className="px-4 sm:px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-sm sm:text-base">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

export default function MapaVagasPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen text-white p-4 sm:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-emerald-400 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-zinc-300 text-sm sm:text-base">Carregando mapa de vagas...</p>
                </div>
            </div>
        }>
            <MapaVagasContent />
        </Suspense>
    );
}