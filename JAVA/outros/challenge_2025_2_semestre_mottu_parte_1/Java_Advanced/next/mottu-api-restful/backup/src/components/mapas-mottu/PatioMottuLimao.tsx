import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// --- NOVAS DEFINIÇÕES GEOMÉTRICAS PARA A UNIDADE LIMÃO ---
// TODO: Substitua os valores abaixo pelas coordenadas reais medidas no Google Maps.
// Usei valores de exemplo baseados na aparência da imagem de satélite.

// Terreno retangular expandido para acomodar todas as vagas
const LIMAO_LOT_OUTLINE: [number, number][] = [
    [0, 0], [50, 0], [50, 100], [0, 100], [0, 0]
];

// Telhado principal expandido para acomodar 8 colunas × 19 linhas de vagas
const LIMAO_ROOFS: { id: string; poly: [number, number][] }[] = [
    // Telhado principal expandido (retangular simples para acomodar todas as vagas)
    { id: "galpao-principal-limao", poly: [
        [2, 2], [42, 2], [42, 75], [2, 75], [2, 2]
    ]},
    // Telhados das estruturas menores (reposicionados)
    { id: "estrutura-1", poly: [ [44, 70], [48, 70], [48, 80], [44, 80] ]},
    { id: "estrutura-2", poly: [ [44, 58], [48, 58], [48, 68], [44, 68] ]}
];

// As ruas que contornam o pátio expandido, com maior distanciamento.
const LIMAO_STREETS = [
    { name: "Av. Pr. Celestino Bourroul", from: [55, 0], to: [55, 80] },
    { name: "R. Miguel Magalhães", from: [-6, 0], to: [-6, 80] }
];


// --- O RESTANTE DO COMPONENTE É IDÊNTICO AO ANTERIOR ---

interface VeiculoInfo { placa: string; modelo: string; fabricante: string; tagBleId: string | null; }
interface BoxComVeiculo { idBox: number; nome: string; status: 'L' | 'O'; veiculo: VeiculoInfo | null; }
interface MapaData { rows: number; cols: number; boxes: BoxComVeiculo[]; }
interface TooltipState { content: React.ReactNode; x: number; y: number; }
type MappedBox = { layoutId: string; dbId: number | null; x: number; y: number; w: number; h: number; status: 'Livre' | 'Ocupado' | 'Indefinido' | 'Armazenamento'; veiculo: VeiculoInfo | null; };

function toPath(poly: [number, number][]) { return poly.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z"; }
function usePanZoom() {
    const [k, setK] = useState(8); const [tx, setTx] = useState(250); const [ty, setTy] = useState(150);
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

    const getBoxPositionFromName = (boxName: string) => {
        // Lógica adaptada para posicionar os boxes LIMAO001-LIMAO150 DENTRO do telhado
        const match = boxName.match(/^(B|Li|LIMAO)(\d+)$/);
        if (!match) return { x: 3, y: 3 };
        const prefixo = match[1]; const numero = parseInt(match[2], 10);
        let baseX = 3, baseY = 3, cols = 12, gap = 1, w = 3, h = 4;
        
        if (prefixo === 'B' || prefixo === 'LIMAO') { 
            // Posicionar dentro do telhado principal expandido: [2, 2] até [42, 75]
            // Telhado tem ~40m de largura (42-2) e ~73m de altura (75-2)
            // Layout: 8 colunas por linha para layout mais vertical e organizado
            baseX = 4; baseY = 4; cols = 8; // 8 colunas = ~19 linhas para 150 boxes
            w = 4; h = 3; // Boxes maiores para melhor visualização no telhado expandido
        }
        else if (prefixo === 'Li') { 
            baseX = 5; baseY = 35; cols = 7; 
        }
        else { 
            baseX = 40; baseY = 35; cols = 4; 
        }
        
        const row = Math.floor((numero - 1) / cols); 
        const col = (numero - 1) % cols;
        return { x: baseX + col * (w + gap), y: baseY + row * (h + gap) };
    };

    useEffect(() => {
        const loadBoxData = async () => {
            setIsLoading(true); setError(null);
            try {
                // Busca dados específicos do pátio Limão (ID: 13)
                const response = await fetch('/api/vagas/mapa?patioId=13');
                if (!response.ok) throw new Error("Falha ao buscar dados do mapa.");
                const mapaData: MapaData = await response.json();
                
                const mappedBoxes: MappedBox[] = mapaData.boxes.map(apiBox => {
                    const position = getBoxPositionFromName(apiBox.nome);
                    // Usar tamanhos otimizados para os boxes LIMAO no telhado expandido
                    const isLimaoBox = apiBox.nome.startsWith('LIMAO');
                    return {
                        layoutId: `box-${apiBox.idBox}`, dbId: apiBox.idBox, x: position.x, y: position.y, 
                        w: isLimaoBox ? 4 : 3, h: isLimaoBox ? 3 : 4,
                        status: apiBox.status === 'L' ? 'Livre' : 'Ocupado', veiculo: apiBox.veiculo
                    };
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
    }, []);

    const handleViewChange = (option: keyof typeof viewOptions) => { setViewOptions(prev => ({ ...prev, [option]: !prev[option] })); };
    const handleMouseEnterBox = (e: React.MouseEvent, box: MappedBox) => { if (box.status === 'Ocupado' && box.veiculo) { setTooltip({ x: e.clientX, y: e.clientY, content: ( <div className="text-xs"> <div className="font-bold mb-1">Placa: {box.veiculo.placa}</div> <div><strong>Modelo:</strong> {box.veiculo.modelo}</div> <div><strong>Fabricante:</strong> {box.veiculo.fabricante}</div> <div><strong>Tag BLE:</strong> {box.veiculo.tagBleId || 'N/A'}</div> </div> ) }); } };
    const handleMouseLeaveBox = () => { setTooltip(null); };
    const handleMouseMove = (e: React.MouseEvent) => { onMove(e); if (tooltip) { setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null); } };
    const getBoxFillColor = (status: MappedBox['status']) => { switch (status) { case 'Livre': return 'rgba(74, 222, 128, 0.7)'; case 'Ocupado': return 'rgba(239, 68, 68, 0.7)'; case 'Armazenamento': return 'rgba(59, 130, 246, 0.7)'; default: return 'rgba(156, 163, 175, 0.7)'; } };
    const getBoxStrokeColor = (status: MappedBox['status']) => { switch (status) { case 'Livre': return '#22c55e'; case 'Ocupado': return '#dc2626'; case 'Armazenamento': return '#2563eb'; default: return '#6b7280'; } };

    return (
        <div className="w-full h-[80vh] bg-neutral-100 rounded-2xl shadow-inner relative select-none overflow-hidden">
            
            {/* --- CÓDIGO DA INTERFACE RESTAURADO --- */}
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

            {isLoading && ( <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 text-white rounded-2xl"> <div className="flex flex-col items-center gap-2 p-4 bg-black/50 rounded-lg"> <Loader2 className="animate-spin h-8 w-8" /> <span>Carregando status das vagas...</span> </div> </div> )}
            {tooltip && ( <div className="fixed z-30 p-2 bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(10px, -25px)' }}> {tooltip.content} </div> )}
            
            <svg className="w-full h-full cursor-grab" onWheel={onWheel} onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp} onMouseMove={handleMouseMove}>
                <defs>
                    <pattern id="grid" width={10} height={10} patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth={0.3} /></pattern>
                    <symbol id="helmet-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.33 5.03A9.95 9.95 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.12-.66-4.08-1.77-5.7L19.33 5.03zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2z"/></symbol>
                </defs>
                <g transform={`translate(${tx},${ty}) scale(${k})`}>
                    <rect x={-500} y={-500} width={1000} height={1000} fill="url(#grid)" />
                    
                    <path d={toPath(LIMAO_LOT_OUTLINE)} fill="#e5e7eb" stroke="#111" strokeWidth={0.4 / k} />
                    {viewOptions.showRoofs && LIMAO_ROOFS.map(r => ( <path key={r.id} d={toPath(r.poly)} fill="#c9cdd3" stroke="#6b7280" strokeWidth={0.35 / k} /> ))}
                    {viewOptions.showBoxes && boxes.map(b => {
                        const isHighlighted = highlightBoxId && b.dbId?.toString() === highlightBoxId;
                        return (
                            <g key={b.layoutId}>
                                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={getBoxFillColor(b.status)} stroke={isHighlighted ? '#f59e0b' : getBoxStrokeColor(b.status)} strokeWidth={isHighlighted ? 0.8 / k : 0.2 / k} onMouseEnter={(e) => handleMouseEnterBox(e, b)} onMouseLeave={handleMouseLeaveBox}/>
                                {b.status === 'Ocupado' && viewOptions.showMotos && (
                                    <use href="#helmet-icon" x={b.x + b.w * 0.1} y={b.y + b.h * 0.1} width={b.w * 0.8} height={b.h * 0.8} fill="white" style={{pointerEvents: 'none'}} />
                                )}
                            </g>
                        );
                    })}
                    {viewOptions.showStreetNames && LIMAO_STREETS.map((s, i) => {
                         const isVertical = s.from[0] === s.to[0];
                         const midX = (s.from[0] + s.to[0]) / 2;
                         const midY = (s.from[1] + s.to[1]) / 2;
                         if (!isVertical) { return ( <g key={i}> <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} /> <text x={midX} y={midY - 1} fontSize={2.5} textAnchor="middle" fill="#6b7280" style={{ textShadow: '0 0 3px white' }}>{s.name}</text> </g> ); }
                         return ( <g key={i}> <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} /> <g transform={`translate(${midX}, ${midY}) rotate(-90)`}> <text x={0} y={-2.5} fontSize={2.5} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" style={{ textShadow: '0 0 3px white' }}>{s.name}</text> </g> </g> );
                    })}
                </g>
            </svg>

            <DynamicScaleBar k={k} />
            <div className="absolute right-3 top-3 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700 pointer-events-none">
                <div className="font-semibold mb-1">Legenda</div>
                <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "#c9cdd3" }} /> Telhado (Área Coberta)</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-green-400" /> Vaga Livre</li>
                    <li className="flex items-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" className="mr-2">
                            <rect width="24" height="24" fill="rgb(239, 68, 68)" rx="2"/>
                            <use href="#helmet-icon" width="20" height="20" x="2" y="2" fill="white"/>
                        </svg>
                        Vaga Ocupada
                    </li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-blue-500" /> Box de Armazenamento</li>
                </ul>
            </div>
        </div>
    );
}