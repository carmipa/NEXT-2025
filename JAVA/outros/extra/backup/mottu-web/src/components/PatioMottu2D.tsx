import React, { useEffect, useMemo, useRef, useState } from "react";
import { BoxService } from "@/utils/api";
import { BoxResponseDto } from "@/types/box";
import { Loader2 } from "lucide-react";
import UsuarioMarkers from "@/components/map/UsuarioMarkers";

/**
 * PatioMottu2D.tsx
 *
 * Modelo esquemático 2D interativo do pátio da Mottu em Guarulhos.
 * Aprimorado com ícones de moto, alinhamento corrigido, e controlos de visualização.
 * Escala: 1 unidade do plano ≈ 1 metro.
 */

// ———————————————— Dados Geométricos e de Layout (Ajustáveis) ————————————————
const LOT_OUTLINE: [number, number][] = [
    [0, 0], [60, 0], [60, 16], [50, 16], [50, 22], [64, 22], [64, 68], [6, 68], [6, 60], [0, 60], [0, 0],
];
const ROOFS: { id: string; poly: [number, number][] }[] = [
    { id: "galpao-norte", poly: [ [2,2], [58,2], [58,30], [2,30] ] },
    { id: "galpao-sul-oeste", poly: [ [2,32], [36,32], [36,66], [2,66] ] },
    { id: "galpao-miolo", poly: [ [38,32], [58,32], [58,54], [38,54] ] },
];
const ZONAS = [
    { id: 'Z-A', label: 'Zona A (Norte)', poly: [[3, 3], [57, 3], [57, 29], [3, 29]], color: 'rgba(255, 165, 0, 0.2)'},
    { id: 'Z-B', label: 'Zona B (Sudoeste)', poly: [[3, 33], [35, 33], [35, 65], [3, 65]], color: 'rgba(0, 128, 128, 0.2)'},
    { id: 'Z-C', label: 'Zona C (Miolo)', poly: [[39, 33], [57, 33], [57, 53], [39, 53]], color: 'rgba(128, 0, 128, 0.2)'},
];
const STREETS = [
    { name: "R. Antônio Pegoraro", from: [-10, -6], to: [72, -6] },
    { name: "Viela Espingarda", from: [70, 20], to: [70, 74] },
    { name: "R. Maria Antonieta", from: [-8, 74], to: [66, 74] },
];

type MappedBox = {
    id: string;
    zonaId: string;
    x: number; y: number; w: number; h: number;
    status: 'Livre' | 'Ocupado' | 'Indefinido';
};

// ———————————————— Componentes e Hooks ————————————————
function toPath(poly: [number, number][]) {
    return poly.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
}

function usePanZoom() {
    const [k, setK] = useState(8);
    const [tx, setTx] = useState(40); // Alinhamento inicial melhorado
    const [ty, setTy] = useState(40); // Alinhamento inicial melhorado
    const dragging = useRef(false);
    const last = useRef({ x: 0, y: 0 });

    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        const next = Math.min(40, Math.max(2, k + delta * 0.5));
        setK(next);
    };
    const onDown = (e: React.MouseEvent) => {
        dragging.current = true; last.current = { x: e.clientX, y: e.clientY };
        (e.target as SVGSVGElement).style.cursor = 'grabbing';
    };
    const onUp = (e: React.MouseEvent) => {
        dragging.current = false;
        (e.target as SVGSVGElement).style.cursor = 'grab';
    };
    const onMove = (e: React.MouseEvent) => {
        if (!dragging.current) return;
        const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y;
        setTx(tx + dx); setTy(ty + dy); last.current = { x: e.clientX, y: e.clientY };
    };
    return { k, tx, ty, onWheel, onDown, onUp, onMove };
}

function DynamicScaleBar({ k }: { k: number }) {
    const targetWidthPx = 100;
    const metersPerPixel = 1 / k;
    const targetMeters = targetWidthPx * metersPerPixel;

    const niceNumbers = [1, 2, 5, 10, 20, 50, 100];
    let niceMeters = 10;

    const powerOf10 = Math.pow(10, Math.floor(Math.log10(targetMeters)));
    const rel = targetMeters / powerOf10;
    if (rel < 1.5) niceMeters = 1 * powerOf10;
    else if (rel < 3.5) niceMeters = 2 * powerOf10;
    else if (rel < 7.5) niceMeters = 5 * powerOf10;
    else niceMeters = 10 * powerOf10;

    const px = niceMeters * k;

    return (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/80 shadow rounded text-xs text-gray-800 pointer-events-none">
            <div className="h-[6px] w-full mb-1 border-x border-b border-black" style={{ width: px, borderTop: '1px solid black' }} />
            <span>{niceMeters} m</span>
        </div>
    );
}

export default function PatioMottu2D() {
    const { k, tx, ty, onWheel, onDown, onUp, onMove } = usePanZoom();
    const [viewOptions, setViewOptions] = useState({
        showRoofs: true,
        showZones: true,
        showBoxes: true,
        showStreetNames: true,
        showMotos: true,
    });
    const [hoveredItem, setHoveredItem] = useState<{ type: string; id: string; x: number; y: number } | null>(null);
    const [boxes, setBoxes] = useState<MappedBox[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateBoxesLayout = (zonaId: string, x: number, y: number, cols: number, rows: number, w: number, h: number, gap: number) => {
        const boxesLayout = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const id = `${zonaId}-B${(r * cols + c + 1).toString().padStart(2, '0')}`;
                boxesLayout.push({ id, zonaId, x: x + c * (w + gap), y: y + r * (h + gap), w, h });
            }
        }
        return boxesLayout;
    };

    useEffect(() => {
        const loadBoxData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiBoxesResponse = await BoxService.listarPaginadoFiltrado({}, 0, 500);
                const apiBoxesMap = new Map(apiBoxesResponse.content.map(box => [box.nome, box]));
                const layoutBoxes = [
                    ...generateBoxesLayout('Z-A', 5, 5, 12, 5, 3, 4, 1),
                    ...generateBoxesLayout('Z-B', 5, 35, 7, 6, 3, 4, 1),
                    ...generateBoxesLayout('Z-C', 40, 35, 4, 4, 3, 4, 1),
                ];
                const mergedBoxes = layoutBoxes.map(layoutBox => {
                    const apiBox = apiBoxesMap.get(layoutBox.id);
                    return {
                        ...layoutBox,
                        status: apiBox ? (apiBox.status === 'L' ? 'Livre' : 'Ocupado') : 'Indefinido',
                    };
                });
                setBoxes(mergedBoxes as MappedBox[]);
            } catch (err) {
                console.error("Falha ao buscar dados dos boxes:", err);
                setError("Não foi possível carregar o status das vagas.");
            } finally {
                setIsLoading(false);
            }
        };
        loadBoxData();
    }, []);

    const handleViewChange = (option: keyof typeof viewOptions) => {
        setViewOptions(prev => ({ ...prev, [option]: !prev[option] }));
    };

    const getBoxFillColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return 'rgba(74, 222, 128, 0.7)';
            case 'Ocupado': return 'rgba(239, 68, 68, 0.7)';
            default: return 'rgba(156, 163, 175, 0.7)';
        }
    };
    const getBoxStrokeColor = (status: MappedBox['status']) => {
        switch (status) {
            case 'Livre': return '#22c55e';
            case 'Ocupado': return '#dc2626';
            default: return '#6b7280';
        }
    };

    return (
        <div className="w-full h-[80vh] bg-neutral-100 rounded-2xl shadow-inner relative select-none">
            <div className="absolute top-3 left-3 z-10 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700">
                <div className="font-semibold mb-2">Controles de Visualização</div>
                <div className="space-y-1 text-xs">
                    {Object.keys(viewOptions).map(key => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={viewOptions[key as keyof typeof viewOptions]}
                                onChange={() => handleViewChange(key as keyof typeof viewOptions)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>
                        {key === 'showRoofs' && 'Mostrar Telhados'}
                                {key === 'showZones' && 'Mostrar Zonas'}
                                {key === 'showBoxes' && 'Mostrar Vagas (Boxes)'}
                                {key === 'showStreetNames' && 'Mostrar Ruas'}
                                {key === 'showMotos' && 'Mostrar Motos'}
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
            {error && !isLoading && (
                <div className="absolute bottom-4 right-4 z-20 p-3 bg-red-100 text-red-800 text-xs rounded-lg shadow-lg">
                    <strong>Erro:</strong> {error}
                </div>
            )}

            <svg
                className="w-full h-full cursor-grab"
                onWheel={onWheel}
                onMouseDown={onDown}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onMouseMove={onMove}
            >
                <defs>
                    <pattern id="grid" width={10} height={10} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth={0.3} />
                    </pattern>
                    {/* NOVO: Símbolo SVG para a moto */}
                    <symbol id="moto-icon" viewBox="0 0 24 24">
                        <path d="M19.26 10.71a2.01 2.01 0 00-2.09-1.52H9.83l2.21-4.66.5-1.04a1 1 0 00-.88-1.5H9.41a1 1 0 00-.97.76L5.3 10H3a1 1 0 00-1 1v2a1 1 0 001 1h1v3a2 2 0 002 2h1a2 2 0 002-2v-3h3.58a2 2 0 001.9-1.32l1.78-4.68zM7.5 17.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9-5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </symbol>
                </defs>

                <g transform={`translate(${tx},${ty}) scale(${k})`}>
                    <rect x={-500} y={-500} width={1000} height={1000} fill="url(#grid)" />
                    <path d={toPath(LOT_OUTLINE)} fill="#f0f0f0" stroke="#111" strokeWidth={0.4 / k} />

                    {viewOptions.showRoofs && ROOFS.map(r => (
                        <path key={r.id} d={toPath(r.poly)} fill="#c9cdd3" stroke="#6b7280" strokeWidth={0.35 / k} />
                    ))}

                    {viewOptions.showZones && ZONAS.map(z => (
                        <path
                            key={z.id}
                            d={toPath(z.poly)}
                            fill={z.color}
                            stroke={hoveredItem?.id === z.id ? 'black' : '#888'}
                            strokeWidth={hoveredItem?.id === z.id ? 0.6 / k : 0.2 / k}
                            onMouseEnter={() => setHoveredItem({ type: 'Zona', id: z.id, x: z.poly[0][0], y: z.poly[0][1] - 2 })}
                            onMouseLeave={() => setHoveredItem(null)}
                        />
                    ))}

                    {viewOptions.showBoxes && boxes.map(b => (
                        <g key={b.id}>
                            <rect
                                x={b.x}
                                y={b.y}
                                width={b.w}
                                height={b.h}
                                fill={getBoxFillColor(b.status)}
                                stroke={hoveredItem?.id === b.id ? 'blue' : getBoxStrokeColor(b.status)}
                                strokeWidth={hoveredItem?.id === b.id ? 0.5 / k : 0.2 / k}
                                onMouseEnter={() => setHoveredItem({ type: 'Box', id: b.id, x: b.x, y: b.y - 1 })}
                                onMouseLeave={() => setHoveredItem(null)}
                            />
                            {/* NOVO: Renderiza o ícone da moto se o box estiver ocupado */}
                            {b.status === 'Ocupado' && (
                                <use
                                    href="#moto-icon"
                                    x={b.x + b.w * 0.1}
                                    y={b.y + b.h * 0.1}
                                    width={b.w * 0.8}
                                    height={b.h * 0.8}
                                    fill="white"
                                    style={{pointerEvents: 'none'}} // Para não interferir no hover do retângulo
                                />
                            )}
                        </g>
                    ))}

                    {viewOptions.showStreetNames && STREETS.map((s, i) => (
                        <g key={i}>
                            <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#9ca3af" strokeWidth={4 / k} />
                            <text x={(s.from[0] + s.to[0]) / 2} y={(s.from[1] + s.to[1]) / 2 - 1} fontSize={2.5} textAnchor="middle" fill="#6b7280" style={{ textShadow: '0 0 3px white' }}>{s.name}</text>
                        </g>
                    ))}

                    {hoveredItem && (
                        <text x={hoveredItem.x} y={hoveredItem.y} fontSize={3 / k} fill="black" style={{pointerEvents: 'none', fontWeight: 'bold', textShadow: '0 0 4px white'}}>
                            {hoveredItem.type}: {hoveredItem.id}
                        </text>
                    )}
                </g>
            </svg>

            <DynamicScaleBar k={k} />

            <div className="absolute right-3 top-3 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700 pointer-events-none">
                <div className="font-semibold mb-1">Legenda</div>
                <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "#c9cdd3" }} /> Áreas Cobertas</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "rgba(255, 165, 0, 0.2)" }} /> Zona de Estacionamento</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-green-400" /> Vaga (Box) Livre</li>
                    <li className="flex items-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" className="mr-2">
                            <rect width="12" height="12" fill="rgb(239, 68, 68)" rx="2"/>
                            <use href="#moto-icon" width="10" height="10" x="1" y="1" fill="white"/>
                        </svg>
                        Vaga (Box) Ocupada
                    </li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-gray-400" /> Vaga (Status Desconhecido)</li>
                </ul>
            </div>
        </div>
    );
}

