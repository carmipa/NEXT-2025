import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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
    x: number; y: number; w: number; h: number;
    status: 'Livre' | 'Ocupado' | 'Indefinido' | 'Armazenamento';
    veiculo: VeiculoInfo | null;
};

// Definições geométricas específicas do Pátio Guarulhos
const LOT_OUTLINE: [number, number][] = [ [0, 0], [80, 0], [80, 20], [70, 20], [70, 26], [84, 26], [84, 72], [6, 72], [6, 64], [0, 64], [0, 0],];
const ROOFS: { id: string; poly: [number, number][] }[] = [ { id: "telhado-principal", poly: LOT_OUTLINE } ];
const STREETS = [{ name: "R. Antônio Pegoraro", from: [-10, -6], to: [92, -6] },{ name: "Viela Espingarda", from: [90, 20], to: [90, 78] },{ name: "R. Maria Antonieta", from: [-8, 78], to: [86, 78] },];

// Funções auxiliares
function toPath(poly: [number, number][]) {
    return poly.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
}
function usePanZoom() {
    const [k, setK] = useState(10); const [tx, setTx] = useState(350); const [ty, setTy] = useState(150);
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

// Componente Principal - Pátio Guarulhos
export default function PatioMottuGuarulhos({ highlightBoxId }: { highlightBoxId?: string | null }) {
    const { k, tx, ty, onWheel, onDown, onUp, onMove } = usePanZoom();
    const [viewOptions, setViewOptions] = useState({ showRoofs: true, showBoxes: true, showStreetNames: true, showMotos: true });
    const [boxes, setBoxes] = useState<MappedBox[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const getBoxPositionFromName = (boxName: string) => {
        const match = boxName.match(/^(Gru|B|Li)(\d+)$/);
        if (!match) return { x: 2, y: 2 };
        
        const prefixo = match[1];
        const numero = parseInt(match[2], 10);
        
        // Dimensões dos boxes otimizadas
        const w = 3, h = 4, gap = 0.5;
        
        // Coordenadas baseadas na área real do pátio (LOT_OUTLINE: [0,0] até [64,68])
        let baseX, baseY, cols;
        
        if (prefixo === 'Gru' || prefixo === 'B' || prefixo === 'GRU') {
            // Boxes principais na área superior do pátio (dentro da área 0-80 x 0-20)
            baseX = 2; baseY = 2; cols = 20; // 20 colunas para acomodar 100 boxes
        } else if (prefixo === 'Li') {
            // Boxes de linha na área lateral (dentro da área 6-84 x 26-72)
            baseX = 8; baseY = 28; cols = 10;
        } else {
            // Posição padrão
            baseX = 2; baseY = 2; cols = 20;
        }
        
        const row = Math.floor((numero - 1) / cols);
        const col = (numero - 1) % cols;
        
        return { 
            x: baseX + col * (w + gap), 
            y: baseY + row * (h + gap) 
        };
    };

    useEffect(() => {
        const loadBoxData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Primeiro, busca o pátio Guarulhos pelo nome para obter o ID correto
                const patiosResponse = await fetch('/api/patios');
                if (!patiosResponse.ok) throw new Error("Falha ao buscar pátios.");
                const patiosData = await patiosResponse.json();
                
                // Encontra o pátio Guarulhos
                const patioGuarulhos = patiosData.content?.find((p: any) => 
                    p.nomePatio.toLowerCase().includes('guarulhos')
                );
                
                if (!patioGuarulhos) {
                    throw new Error("Pátio Guarulhos não encontrado.");
                }
                
                console.log('🏢 Pátio encontrado:', patioGuarulhos.nomePatio, 'ID:', patioGuarulhos.idPatio);
                
                // Busca dados específicos do pátio Guarulhos
                const response = await fetch(`/api/vagas/mapa?patioId=${patioGuarulhos.idPatio}`);
                if (!response.ok) throw new Error("Falha ao buscar dados do mapa.");
                const mapaData: MapaData = await response.json();

                console.log('📊 Dados do mapa recebidos:', {
                    totalBoxes: mapaData.boxes?.length,
                    boxesOcupados: mapaData.boxes?.filter((b: any) => b.status === 'O').length,
                    boxesLivres: mapaData.boxes?.filter((b: any) => b.status === 'L').length,
                    primeiraBox: mapaData.boxes?.[0]
                });

                if (!mapaData.boxes || mapaData.boxes.length === 0) {
                    console.warn('⚠️ Nenhum box encontrado no mapa!');
                    setBoxes([]);
                    return;
                }

                const mappedBoxes: MappedBox[] = mapaData.boxes.map((apiBox: any) => {
                    const position = getBoxPositionFromName(apiBox.nome);
                    
                    // Determinar status: 'L' = Livre, 'O' = Ocupado, outros = Indefinido
                    let status: 'Livre' | 'Ocupado' | 'Indefinido' | 'Armazenamento' = 'Indefinido';
                    if (apiBox.status === 'L') {
                        status = 'Livre';
                    } else if (apiBox.status === 'O') {
                        status = 'Ocupado';
                    }
                    
                    return {
                        layoutId: `box-${apiBox.idBox}`, 
                        dbId: apiBox.idBox,
                        nome: apiBox.nome,
                        x: position.x, 
                        y: position.y, 
                        w: 3, 
                        h: 4,
                        status: status,
                        veiculo: apiBox.veiculo || null
                    };
                });
                
                console.log('✅ Boxes mapeados:', {
                    total: mappedBoxes.length,
                    livres: mappedBoxes.filter(b => b.status === 'Livre').length,
                    ocupados: mappedBoxes.filter(b => b.status === 'Ocupado').length,
                    primeiroBox: mappedBoxes[0]
                });
                
                setBoxes(mappedBoxes);
            } catch (err: any) {
                console.error("Falha ao buscar dados do mapa:", err);
                setError("Não foi possível carregar o status das vagas.");
            } finally {
                setIsLoading(false);
            }
        };
        loadBoxData();
        
        // Atualiza os dados a cada 30 segundos para mostrar mudanças em tempo real
        const interval = setInterval(loadBoxData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleViewChange = (option: keyof typeof viewOptions) => {
        setViewOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const handleMouseEnterBox = (e: React.MouseEvent, box: MappedBox) => {
        console.log('Mouse enter box Guarulhos:', { status: box.status, nome: box.nome, veiculo: box.veiculo });
        if (box.status === 'Ocupado' && box.veiculo) {
            setTooltip({
                x: e.clientX, y: e.clientY,
                content: ( 
                    <div className="text-xs bg-gray-900 text-white p-3 rounded-lg shadow-lg"> 
                        <div className="font-bold text-yellow-400 mb-2">📦 {box.nome}</div>
                        <div className="font-bold text-green-400 mb-1">🏍️ Placa: {box.veiculo.placa}</div> 
                        <div className="text-gray-300"><strong>Modelo:</strong> {box.veiculo.modelo}</div> 
                        <div className="text-gray-300"><strong>Fabricante:</strong> {box.veiculo.fabricante}</div> 
                        <div className="text-gray-300"><strong>Tag BLE:</strong> {box.veiculo.tagBleId || 'N/A'}</div> 
                    </div> 
                )
            });
        }
    };
    const handleMouseLeaveBox = () => { setTooltip(null); };
    const handleMouseMove = (e: React.MouseEvent) => { onMove(e); if (tooltip) { setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null); } };

    const getBoxFillColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return 'rgba(74, 222, 128, 0.7)';
            case 'Ocupado': return 'rgba(239, 68, 68, 0.7)';
            case 'Armazenamento': return 'rgba(59, 130, 246, 0.7)';
            default: return 'rgba(156, 163, 175, 0.7)';
        }
    };
    const getBoxStrokeColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return '#22c55e';
            case 'Ocupado': return '#dc2626';
            case 'Armazenamento': return '#2563eb';
            default: return '#6b7280';
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
                                {key === 'showRoofs' && 'Mostrar Telhado (Completo)'}
                                {key === 'showBoxes' && 'Mostrar Vagas (Boxes)'}
                                {key === 'showStreetNames' && 'Mostrar Ruas'}
                                {key === 'showMotos' && 'Mostrar Motos'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {isLoading && ( <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 text-white rounded-2xl"> <div className="flex flex-col items-center gap-2 p-4 bg-black/50 rounded-lg"> <Loader2 className="animate-spin h-8 w-8" /> <span>Carregando status das vagas...</span> </div> </div> )}
            {tooltip && ( <div className="fixed z-30 p-2 bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(10px, -25px)' }}> {tooltip.content} </div> )}

            <svg className="w-full h-full cursor-grab" onWheel={onWheel} onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp} onMouseMove={handleMouseMove}>
                <defs>
                    <pattern id="grid" width={10} height={10} patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth={0.3} /></pattern>
                    <symbol id="helmet-icon" viewBox="0 0 24 24"><path d="M12 2C8.69 2 6 4.69 6 8v3c0 1.1.9 2 2 2h1v6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-6h1c1.1 0 2-.9 2-2V8c0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4v1H8V8c0-2.21 1.79-4 4-4zM8 9h8v2H8V9zm4 3c-1.1 0-2 .9-2 2v6h4v-6c0-1.1-.9-2-2-2z" /></symbol>
                </defs>
                <g transform={`translate(${tx},${ty}) scale(${k})`}>
                    <rect x={-500} y={-500} width={1000} height={1000} fill="url(#grid)" />
                    <path d={toPath(LOT_OUTLINE)} fill="#e5e7eb" stroke="#111" strokeWidth={0.4 / k} />
                    {viewOptions.showRoofs && ROOFS.map(r => ( <path key={r.id} d={toPath(r.poly)} fill="#c9cdd3" stroke="#6b7280" strokeWidth={0.35 / k} /> ))}
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
                                    onMouseEnter={(e) => handleMouseEnterBox(e, b)} 
                                    onMouseLeave={handleMouseLeaveBox}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Label do box com nome/número */}
                                <text 
                                    x={b.x + b.w / 2} 
                                    y={b.y + b.h / 2} 
                                    fontSize={Math.max(0.8, 1.5 / k)} 
                                    textAnchor="middle" 
                                    dominantBaseline="middle"
                                    fill={b.status === 'Ocupado' ? '#ffffff' : '#1f2937'}
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {b.nome || b.dbId}
                                </text>
                                {/* Ícone de moto para boxes ocupados */}
                                {b.status === 'Ocupado' && viewOptions.showMotos && (
                                    <use 
                                        href="#helmet-icon" 
                                        x={b.x + b.w * 0.15} 
                                        y={b.y + b.h * 0.15} 
                                        width={b.w * 0.7} 
                                        height={b.h * 0.7} 
                                        fill="rgba(255, 255, 255, 0.8)" 
                                        style={{pointerEvents: 'none'}} 
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* --- BLOCO DE CÓDIGO CORRIGIDO --- */}
                    {viewOptions.showStreetNames && STREETS.map((s, i) => {
                        const isVertical = s.from[0] === s.to[0];
                        const midX = (s.from[0] + s.to[0]) / 2;
                        const midY = (s.from[1] + s.to[1]) / 2;

                        // Para ruas horizontais, a lógica é simples
                        if (!isVertical) {
                            return (
                                <g key={i}>
                                    <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} />
                                    <text x={midX} y={midY - 1} fontSize={2.5} textAnchor="middle" fill="#6b7280" style={{ textShadow: '0 0 3px white' }}>
                                        {s.name}
                                    </text>
                                </g>
                            );
                        }

                        // Para ruas verticais, usamos um grupo de transformação para garantir o espaçamento
                        return (
                            <g key={i}>
                                <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} />
                                {/* O 'g' abaixo move o sistema de coordenadas para o centro da linha e o rotaciona */}
                                <g transform={`translate(${midX}, ${midY}) rotate(-90)`}>
                                    <text
                                        x={0} // Centralizado no novo eixo Y (que agora é vertical)
                                        y={-2.5} // Afastado da linha no novo eixo X (que agora é horizontal). Valor negativo para ir para "cima" na rotação
                                        fontSize={2.5}
                                        textAnchor="middle"
                                        dominantBaseline="middle" // Garante o alinhamento vertical perfeito
                                        fill="#6b7280"
                                        style={{ textShadow: '0 0 3px white' }}
                                    >
                                        {s.name}
                                    </text>
                                </g>
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
                </div>
                <div className="font-semibold mb-1">Legenda</div>
                <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "#c9cdd3" }} /> Telhado (Área Coberta)</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-green-400" /> Vaga Livre</li>
                    <li className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" className="mr-2"><rect width="12" height="12" fill="rgb(239, 68, 68)" rx="2"/><use href="#helmet-icon" width="10" height="10" x="1" y="1" fill="white"/></svg> Vaga Ocupada</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-blue-500" /> Box de Armazenamento</li>
                </ul>
            </div>
        </div>
    );
}
