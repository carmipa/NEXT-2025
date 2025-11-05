import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Definições geométricas específicas do Pátio Limão
const LIMAO_LOT_OUTLINE: [number, number][] = [
    [0, 0], [100, 0], [100, 50], [0, 50], [0, 0] // 100m de largura, 50m de altura
];

const LIMAO_ROOFS: { id: string; poly: [number, number][] }[] = [
    { id: "galpao-principal-limao", poly: [
            [2, 2], [98, 2], [98, 48], [2, 48], [2, 2] // 96m de largura, 46m de altura
        ]},
    { id: "estrutura-1", poly: [ [70, 44], [80, 44], [80, 48], [70, 48] ]},
    { id: "estrutura-2", poly: [ [58, 44], [68, 44], [68, 48], [58, 48] ]}
];

const LIMAO_STREETS = [
    { name: "Av. Pr. Celestino Bourroul", from: [105, 0], to: [105, 50] },
    { name: "R. Miguel Magalhães", from: [-6, 0], to: [-6, 50] }
];

// Definição dos tipos de dados
interface VeiculoInfo {
    placa: string;
    modelo: string;
    fabricante: string;
    tagBleId: string | null;
}
interface BoxComVeiculo {
    idBox: number;
    nome: string;
    status: 'L' | 'O';
    veiculo: VeiculoInfo | null;
}
interface MapaData {
    rows: number;
    cols: number;
    boxes: BoxComVeiculo[];
}
interface TooltipState {
    content: React.ReactNode;
    x: number;
    y: number;
}
type MappedBox = {
    layoutId: string;
    dbId: number | null;
    nome: string;
    x: number;
    y: number;
    w: number;
    h: number;
    status: 'Livre' | 'Ocupado' | 'Indefinido' | 'Armazenamento';
    veiculo: VeiculoInfo | null;
};

// Funções auxiliares
function toPath(poly: [number, number][]) {
    return poly.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
}
function usePanZoom() {
    const [k, setK] = useState(7); const [tx, setTx] = useState(380); const [ty, setTy] = useState(150);
    const dragging = useRef(false); const last = useRef({ x: 0, y: 0 });
    const onWheel = (e: React.WheelEvent) => { e.preventDefault(); const delta = e.deltaY > 0 ? -1 : 1; const next = Math.min(40, Math.max(2, k + delta * 0.5)); setK(next); };
    const onDown = (e: React.MouseEvent) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; (e.target as SVGSVGElement).style.cursor = 'grabbing'; };
    const onUp = (e: React.MouseEvent) => { dragging.current = false; (e.target as SVGSVGElement).style.cursor = 'grab'; };
    const onMove = (e: React.MouseEvent) => { if (!dragging.current) return; const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y; setTx(tx + dx); setTy(ty + dy); last.current = { x: e.clientX, y: e.clientY }; };
    return { k, tx, ty, onWheel, onDown, onUp, onMove };
}
function DynamicScaleBar({ k }: { k: number }) {
    const targetWidthPx = 100; const metersPerPixel = 1 / k; const targetMeters = targetWidthPx * metersPerPixel;
    let niceMeters = 10; const powerOf10 = Math.pow(10, Math.floor(Math.log10(targetMeters))); const rel = targetMeters / powerOf10;
    if (rel < 1.5) niceMeters = 1 * powerOf10; else if (rel < 3.5) niceMeters = 2 * powerOf10; else if (rel < 7.5) niceMeters = 5 * powerOf10; else niceMeters = 10 * powerOf10;
    const px = niceMeters * k;
    return ( <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/80 shadow rounded text-xs text-gray-800 pointer-events-none"> <div className="h-[6px] w-full mb-1 border-x border-b border-black" style={{ width: px, borderTop: '1px solid black' }} /> <span>{`${niceMeters} m`}</span> </div> );
}

export default function PatioMottuLimao({ highlightBoxId }: { highlightBoxId?: string | null }) {
    const { k, tx, ty, onWheel, onDown, onUp, onMove } = usePanZoom();
    const [viewOptions, setViewOptions] = useState({ showRoofs: true, showBoxes: true, showStreetNames: true, showMotos: true });
    const [boxes, setBoxes] = useState<MappedBox[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    // Função para organizar boxes em grid dentro do mapa
    const organizeBoxesInGrid = (boxes: BoxComVeiculo[]): MappedBox[] => {
        if (boxes.length === 0) return [];
        
        // Área disponível dentro do mapa Limão (dentro do LIMAO_LOT_OUTLINE)
        // Aproximadamente: x de 2 a 98, y de 2 a 48
        const areaWidth = 96; // 98 - 2
        const areaHeight = 46; // 48 - 2
        const startX = 2;
        const startY = 2;
        
        // Tamanho dos boxes aumentado para melhor visualização sem zoom
        const boxWidth = 3.5;
        const boxHeight = 3.5;
        const gap = 0.3; // Gap proporcional ao tamanho maior
        
        // Calcular número de colunas que cabem na área (mais colunas = grid mais compacto)
        const colsPerRow = Math.floor(areaWidth / (boxWidth + gap));
        // Usar mais colunas para um grid mais compacto lado a lado
        const totalCols = Math.min(colsPerRow, Math.max(10, Math.ceil(Math.sqrt(boxes.length))));
        
        // Ordenar boxes por nome para garantir ordem consistente
        const sortedBoxes = [...boxes].sort((a, b) => {
            const aNum = parseInt(a.nome.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.nome.replace(/\D/g, '')) || 0;
            return aNum - bNum;
        });
        
        return sortedBoxes.map((apiBox, index) => {
            const row = Math.floor(index / totalCols);
            const col = index % totalCols;
            
            // Determinar status do backend: 'L' = Livre, 'O' = Ocupado, 'M' = Manutenção
            let status: 'Livre' | 'Ocupado' | 'Indefinido' | 'Armazenamento' | 'Manutencao' = 'Indefinido';
            if (apiBox.status === 'L') {
                status = 'Livre';
            } else if (apiBox.status === 'O') {
                status = 'Ocupado';
            } else if (apiBox.status === 'M') {
                status = 'Manutencao';
            }
            
            return {
                layoutId: `box-${apiBox.idBox}`,
                dbId: apiBox.idBox,
                nome: apiBox.nome,
                x: startX + col * (boxWidth + gap),
                y: startY + row * (boxHeight + gap),
                w: boxWidth,
                h: boxHeight,
                status: status,
                veiculo: apiBox.veiculo || null
            };
        });
    };

    useEffect(() => {
        const loadBoxData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Buscando o pátio Limão
                const patiosResponse = await fetch('/api/patios');
                if (!patiosResponse.ok) throw new Error("Falha ao buscar pátios.");
                const patiosData = await patiosResponse.json();

                const patioLimao = patiosData.content?.find((p: any) =>
                    p.nomePatio.toLowerCase().includes('limao') ||
                    p.nomePatio.toLowerCase().includes('limão')
                );

                if (!patioLimao) {
                    const patioGuarulhos = patiosData.content?.find((p: any) =>
                        p.nomePatio.toLowerCase().includes('guarulhos')
                    );
                    if (!patioGuarulhos) {
                        throw new Error("Nenhum pátio encontrado.");
                    }
                    return await loadBoxesForPatio(patioGuarulhos.idPatio);
                }

                return await loadBoxesForPatio(patioLimao.idPatio);

            } catch (err: any) {
                console.error("Falha ao buscar dados do mapa:", err);
                setError("Não foi possível carregar o status das vagas.");
            } finally {
                setIsLoading(false);
            }
        };

        const loadBoxesForPatio = async (patioId: number) => {
            try {
                console.log('🔍 Buscando boxes para pátio ID:', patioId);
                const response = await fetch(`/api/vagas/mapa?patioId=${patioId}`, {
                    cache: 'no-store'
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Erro na resposta:', response.status, errorText);
                    throw new Error(`Falha ao buscar dados do mapa: ${response.status}`);
                }
                const mapaData: MapaData = await response.json();

                console.log('📊 Dados do mapa recebidos (Limão):', {
                    totalBoxes: mapaData.boxes?.length,
                    boxesOcupados: mapaData.boxes?.filter((b: any) => b.status === 'O').length,
                    boxesLivres: mapaData.boxes?.filter((b: any) => b.status === 'L').length,
                    primeiraBox: mapaData.boxes?.[0]
                });

                if (!mapaData.boxes || mapaData.boxes.length === 0) {
                    console.warn('⚠️ Nenhum box encontrado no mapa (Limão)!');
                    setBoxes([]);
                    return;
                }

                // Organizar boxes em grid dentro do mapa
                const mappedBoxes = organizeBoxesInGrid(mapaData.boxes);
                
                console.log('✅ Boxes mapeados (Limão):', {
                    total: mappedBoxes.length,
                    livres: mappedBoxes.filter(b => b.status === 'Livre').length,
                    ocupados: mappedBoxes.filter(b => b.status === 'Ocupado').length,
                    primeiroBox: mappedBoxes[0]
                });
                
                setBoxes(mappedBoxes);
            } catch (err: any) {
                throw err;
            }
        };

        loadBoxData();

        const interval = setInterval(loadBoxData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleViewChange = (option: keyof typeof viewOptions) => {
        setViewOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const handleMouseEnterBox = (e: React.MouseEvent, box: MappedBox) => {
        // Tooltip sempre mostra nome e status
        const tooltipContent = (
            <div className="text-xs bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                <div className="font-bold text-yellow-400 mb-2">📦 {box.nome || `Box ${box.dbId}`}</div>
                <div className={`font-semibold mb-1 ${
                    box.status === 'Ocupado' ? 'text-red-400' : 
                    box.status === 'Manutencao' ? 'text-yellow-400' : 
                    'text-green-400'
                }`}>
                    Status: {box.status}
                </div>
                {box.status === 'Ocupado' && box.veiculo && (
                    <>
                        <div className="font-bold text-green-400 mb-1">🏍️ Placa: {box.veiculo.placa}</div>
                        <div className="text-gray-300"><strong>Modelo:</strong> {box.veiculo.modelo}</div>
                        <div className="text-gray-300"><strong>Fabricante:</strong> {box.veiculo.fabricante}</div>
                        <div className="text-gray-300"><strong>Tag BLE:</strong> {box.veiculo.tagBleId || 'N/A'}</div>
                    </>
                )}
                {box.status === 'Manutencao' && (
                    <div className="text-yellow-300 text-xs mt-1">⚠️ Box em manutenção</div>
                )}
            </div>
        );
        
        setTooltip({
            x: e.clientX,
            y: e.clientY,
            content: tooltipContent
        });
    };
    
    const handleMouseLeaveBox = () => { 
        setTooltip(null); 
    };
    
    const handleMouseMove = (e: React.MouseEvent) => { 
        onMove(e); 
        if (tooltip) { 
            setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null); 
        } 
    };

    const getBoxFillColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return 'rgba(74, 222, 128, 0.8)'; // Verde
            case 'Ocupado': return 'rgba(239, 68, 68, 0.8)'; // Vermelho
            case 'Manutencao': return 'rgba(234, 179, 8, 0.8)'; // Amarelo/Laranja
            case 'Armazenamento': return 'rgba(59, 130, 246, 0.8)'; // Azul
            default: return 'rgba(156, 163, 175, 0.8)'; // Cinza
        }
    };
    
    const getBoxStrokeColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return '#22c55e'; // Verde
            case 'Ocupado': return '#dc2626'; // Vermelho
            case 'Manutencao': return '#eab308'; // Amarelo
            case 'Armazenamento': return '#2563eb'; // Azul
            default: return '#6b7280'; // Cinza
        }
    };

    return (
        <div className="w-full h-[80vh] bg-neutral-100 rounded-2xl shadow-inner relative select-none overflow-hidden">
            <div className="absolute top-3 left-3 z-10 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700">
                <div className="font-semibold mb-2">Controles de Visualização</div>
                <div className="space-y-1 text-xs">
                    {Object.keys(viewOptions).map(key => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={viewOptions[key as keyof typeof viewOptions]} onChange={() => handleViewChange(key as keyof typeof viewOptions)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>
                                {key === 'showRoofs' && 'Mostrar Telhados'}
                                {key === 'showBoxes' && 'Mostrar Vagas (Boxes)'}
                                {key === 'showStreetNames' && 'Mostrar Ruas'}
                                {key === 'showMotos' && 'Mostrar Ícones'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 text-white rounded-2xl">
                    <div className="flex flex-col items-center gap-2 p-4 bg-black/50 rounded-lg">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <span>Carregando status das vagas...</span>
                    </div>
                </div>
            )}

            {tooltip && (
                <div className="fixed z-30 p-2 bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(10px, -25px)' }}>
                    {tooltip.content}
                </div>
            )}

            <svg className="w-full h-full cursor-grab" onWheel={onWheel} onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp} onMouseMove={handleMouseMove}>
                <defs>
                    <pattern id="grid-limao" width={10} height={10} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth={0.3} />
                    </pattern>
                    <symbol id="helmet-icon-limao" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.33 5.03A9.95 9.95 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.12-.66-4.08-1.77-5.7L19.33 5.03zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2z"/>
                    </symbol>
                </defs>
                <g transform={`translate(${tx},${ty}) scale(${k})`}>
                    <rect x={-500} y={-500} width={1000} height={1000} fill="url(#grid-limao)" />
                    <path d={toPath(LIMAO_LOT_OUTLINE)} fill="#e5e7eb" stroke="#111" strokeWidth={0.4 / k} />
                    {viewOptions.showRoofs && LIMAO_ROOFS.map(r => (
                        <path key={r.id} d={toPath(r.poly)} fill="#c9cdd3" stroke="#6b7280" strokeWidth={0.35 / k} />
                    ))}
                    
                    {/* Boxes em grid dentro do mapa */}
                    {viewOptions.showBoxes && boxes.map(b => {
                        const isHighlighted = highlightBoxId && b.dbId?.toString() === highlightBoxId;
                        return (
                            <g key={b.layoutId}>
                                <rect 
                                    x={b.x} 
                                    y={b.y} 
                                    width={b.w} 
                                    height={b.h} 
                                    fill={getBoxFillColor(b.status)} 
                                    stroke={isHighlighted ? '#f59e0b' : getBoxStrokeColor(b.status)} 
                                    strokeWidth={isHighlighted ? 0.8 / k : 0.2 / k} 
                                    rx="0.2"
                                    onMouseEnter={(e) => handleMouseEnterBox(e, b)} 
                                    onMouseLeave={handleMouseLeaveBox}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Label do box - apenas número extraído do nome (apenas se não estiver ocupado ou em manutenção) */}
                                {b.status !== 'Ocupado' && b.status !== 'Manutencao' && (
                                    <text 
                                        x={b.x + b.w / 2} 
                                        y={b.y + b.h / 2} 
                                        fontSize={Math.max(1.0, 1.8 / k)} 
                                        textAnchor="middle" 
                                        dominantBaseline="middle"
                                        fill="#1f2937"
                                        fontWeight="bold"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {(() => {
                                            // Extrair apenas o número do nome do box (ex: "BLimao001" -> "1", "Li015" -> "15")
                                            const match = b.nome?.match(/(\d+)/);
                                            return match ? match[1] : (b.dbId || '');
                                        })()}
                                    </text>
                                )}
                                {/* Ícone "V" para boxes ocupados */}
                                {b.status === 'Ocupado' && viewOptions.showMotos && (
                                    <text
                                        x={b.x + b.w / 2}
                                        y={b.y + b.h / 2}
                                        fontSize={Math.max(1.5, 2.5 / k)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#ffffff"
                                        fontWeight="bold"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        V
                                    </text>
                                )}
                                {/* Ícone "M" para boxes em manutenção */}
                                {b.status === 'Manutencao' && (
                                    <text
                                        x={b.x + b.w / 2}
                                        y={b.y + b.h / 2}
                                        fontSize={Math.max(1.5, 2.5 / k)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#1f2937"
                                        fontWeight="bold"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        M
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Ruas */}
                    {viewOptions.showStreetNames && LIMAO_STREETS.map((s, i) => {
                        const isVertical = s.from[0] === s.to[0];
                        const midX = (s.from[0] + s.to[0]) / 2;
                        const midY = (s.from[1] + s.to[1]) / 2;
                        
                        if (isVertical) {
                            return (
                                <g key={i}>
                                    <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} />
                                    <g transform={`translate(${midX}, ${midY}) rotate(-90)`}>
                                        <text
                                            x={0}
                                            y={-2.5}
                                            fontSize={2.5}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#6b7280"
                                            style={{ textShadow: '0 0 3px white' }}
                                        >
                                            {s.name}
                                        </text>
                                    </g>
                                </g>
                            );
                        }
                        
                        return (
                            <g key={i}>
                                <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} />
                                <text x={midX} y={midY - 1} fontSize={2.5} textAnchor="middle" fill="#6b7280" style={{ textShadow: '0 0 3px white' }}>
                                    {s.name}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            <DynamicScaleBar k={k} />
            <div className="absolute right-3 top-3 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700 pointer-events-none">
                <div className="font-semibold mb-2">Status do Pátio</div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{boxes.filter(b => b.status === 'Livre').length}</div>
                        <div className="text-gray-600">Livres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{boxes.filter(b => b.status === 'Ocupado').length}</div>
                        <div className="text-gray-600">Ocupados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{boxes.filter(b => b.status === 'Manutencao').length}</div>
                        <div className="text-gray-600">Manutenção</div>
                    </div>
                </div>
                <div className="font-semibold mb-1">Legenda</div>
                <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "#c9cdd3" }} /> Telhado (Área Coberta)</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-green-400" /> Vaga Livre</li>
                    <li className="flex items-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" className="mr-2">
                            <rect width="24" height="24" fill="rgb(239, 68, 68)" rx="2"/>
                            <use href="#helmet-icon-limao" width="20" height="20" x="2" y="2" fill="white"/>
                        </svg>
                        Vaga Ocupada</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-yellow-400" /> Vaga em Manutenção</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-blue-500" /> Box de Armazenamento</li>
                </ul>
            </div>
        </div>
    );
}