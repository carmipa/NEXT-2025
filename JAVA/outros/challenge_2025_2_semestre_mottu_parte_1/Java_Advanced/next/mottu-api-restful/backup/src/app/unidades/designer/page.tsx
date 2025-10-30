// src/app/unidades/designer/page.tsx
"use client";

/**
 * Designer do Pátio (Front-only)
 * - Grade zoomável/pan (SVG) para esboçar zonas (retângulos) e boxes (células da grade).
 * - Persistência em memória (estado local). Exporta/Importa JSON.
 * - Sem mudanças no Oracle. O JSON gerado pode ser usado para alimentar seus
 *   endpoints já existentes (Patio/Zona/Box) em passos futuros.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/nav-bar";
import {
    MdZoomIn,
    MdZoomOut,
    MdCenterFocusStrong,
    MdContentCopy,
    MdFileDownload,
    MdFileUpload,
    MdDelete,
    MdMap,
    MdViewModule,
    MdUndo,
    MdRedo,
} from "react-icons/md";

// ==== Tipos do “modelo” de desenho ====

type DesignerState = {
    meta: {
        patioNome: string;
        cols: number;
        rows: number;
        cell: number; // tamanho do pixel/célula
    };
    zonas: ZonaShape[];
    boxesMarcados: BoxShape[]; // boxes “pintados” (opcional)
};

type ZonaShape = {
    id: string;
    nome: string;
    x: number; // coluna inicial
    y: number; // linha inicial
    w: number; // largura (em células)
    h: number; // altura (em células)
    fill: string; // cor de exibição
    observacao?: string;
};

type BoxShape = {
    id: string;
    x: number;
    y: number;
    nome?: string; // ex.: A-01
    status?: "L" | "O";
};

type Tool = "pan" | "zona" | "box"; // mover tela | criar zona | pintar box

// ==== Utilidades ====

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 10);

// Paleta básica para zonas
const ZONA_COLORS = [
    "#d2b48c", // bege
    "#9ec5fe", // azul claro
    "#d1c4e9", // lilás
    "#a7f3d0", // verde claro
    "#fcd34d", // amarelo
    "#fca5a5", // salmão
];

// ==== Componente principal ====

export default function PatioDesignerPage() {
    // Meta inicial
    const [meta, setMeta] = useState<DesignerState["meta"]>({
        patioNome: "Pátio Guarulhos (modelo)",
        cols: 28,
        rows: 20,
        cell: 28,
    });

    const [zonas, setZonas] = useState<ZonaShape[]>([]);
    const [boxes, setBoxes] = useState<BoxShape[]>([]);

    // Ferramenta atual
    const [tool, setTool] = useState<Tool>("zona");

    // Zoom/Pan
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Undo/Redo
    const history = useRef<DesignerState[]>([]);
    const future = useRef<DesignerState[]>([]);

    // Seleção temporária ao desenhar zona
    const drawing = useRef<null | { startX: number; startY: number }>(null);

    const gridPx = useMemo(
        () => ({ w: meta.cols * meta.cell, h: meta.rows * meta.cell }),
        [meta]
    );

    // Salva um snapshot para undo
    const pushHistory = () => {
        history.current.push({
            meta: { ...meta },
            zonas: zonas.map((z) => ({ ...z })),
            boxesMarcados: boxes.map((b) => ({ ...b })),
        });
        if (history.current.length > 200) history.current.shift();
        future.current = []; // limpa redo após nova ação
    };

    const undo = () => {
        if (history.current.length === 0) return;
        const prev = history.current.pop()!;
        future.current.push({
            meta: { ...meta },
            zonas: zonas.map((z) => ({ ...z })),
            boxesMarcados: boxes.map((b) => ({ ...b })),
        });
        setMeta(prev.meta);
        setZonas(prev.zonas);
        setBoxes(prev.boxesMarcados);
    };

    const redo = () => {
        if (future.current.length === 0) return;
        const next = future.current.pop()!;
        history.current.push({
            meta: { ...meta },
            zonas: zonas.map((z) => ({ ...z })),
            boxesMarcados: boxes.map((b) => ({ ...b })),
        });
        setMeta(next.meta);
        setZonas(next.zonas);
        setBoxes(next.boxesMarcados);
    };

    // ==== Interações de grade ====

    const clientToGrid = (clientX: number, clientY: number, svgRect: DOMRect) => {
        const x = (clientX - svgRect.left - offset.x) / scale;
        const y = (clientY - svgRect.top - offset.y) / scale;
        const col = clamp(Math.floor(x / meta.cell), 0, meta.cols - 1);
        const row = clamp(Math.floor(y / meta.cell), 0, meta.rows - 1);
        return { col, row };
    };

    const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        if (tool === "pan" || e.button === 1) {
            isPanning.current = true;
            panStart.current = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
            };
            return;
        }

        if (tool === "zona") {
            const { col, row } = clientToGrid(e.clientX, e.clientY, rect);
            drawing.current = { startX: col, startY: row };
            pushHistory();
            return;
        }

        if (tool === "box") {
            pushHistory();
            const { col, row } = clientToGrid(e.clientX, e.clientY, rect);
            const id = `b-${col}-${row}`;
            setBoxes((prev) => {
                const exists = prev.find((b) => b.id === id);
                if (exists) return prev.filter((b) => b.id !== id); // “apaga” se já existir
                return [...prev, { id, x: col, y: row }];
            });
            return;
        }
    };

    const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        if (isPanning.current) {
            setOffset({
                x: e.clientX - panStart.current.x,
                y: e.clientY - panStart.current.y,
            });
            return;
        }

        if (tool === "zona" && drawing.current) {
            // Apenas para o “ghost” visual; o shape é criado no mouse up
            // (render do preview fica no JSX, calculado a partir de drawing.current)
            return;
        }
    };

    const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        if (isPanning.current) {
            isPanning.current = false;
            return;
        }

        if (tool === "zona" && drawing.current) {
            const { startX, startY } = drawing.current;
            const { col, row } = clientToGrid(e.clientX, e.clientY, rect);
            const minX = Math.min(startX, col);
            const minY = Math.min(startY, row);
            const w = Math.abs(col - startX) + 1;
            const h = Math.abs(row - startY) + 1;

            const color = ZONA_COLORS[(zonas.length + 1) % ZONA_COLORS.length];
            const novo: ZonaShape = {
                id: "z-" + uid(),
                nome: `Zona ${zonas.length + 1}`,
                x: minX,
                y: minY,
                w,
                h,
                fill: color,
            };
            setZonas((prev) => [...prev, novo]);
            drawing.current = null;
        }
    };

    const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const next = clamp(scale + delta, 0.4, 2.5);
        setScale(next);
    };

    // ==== Export/Import ====

    const exportJson = () => {
        const payload: DesignerState = {
            meta,
            zonas,
            boxesMarcados: boxes,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `patio-designer-${meta.patioNome.replace(/\s+/g, "_")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJson = async (file: File) => {
        const text = await file.text();
        const json = JSON.parse(text) as DesignerState;
        pushHistory();
        setMeta(json.meta);
        setZonas(json.zonas || []);
        setBoxes(json.boxesMarcados || []);
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const centerView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const clearAll = () => {
        pushHistory();
        setZonas([]);
        setBoxes([]);
    };

    // ==== Render ====

    const previewZona = (() => {
        if (!drawing.current) return null;
        // Monta um retângulo “fantasma” enquanto arrasta o mouse
        return (mouse: { clientX: number; clientY: number; rect: DOMRect }) => {
            const { startX, startY } = drawing.current!;
            const { col, row } = clientToGrid(mouse.clientX, mouse.clientY, mouse.rect);
            const minX = Math.min(startX, col);
            const minY = Math.min(startY, row);
            const w = Math.abs(col - startX) + 1;
            const h = Math.abs(row - startY) + 1;
            return (
                <rect
                    x={minX * meta.cell}
                    y={minY * meta.cell}
                    width={w * meta.cell}
                    height={h * meta.cell}
                    fill="#ffffff20"
                    stroke="#ffffffaa"
                    strokeDasharray="6 6"
                    pointerEvents="none"
                />
            );
        };
    })();

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) importJson(f);
        e.currentTarget.value = "";
    };

    return (
        <>
            <NavBar active="patio" />

            <main className="min-h-screen bg-black text-white">
                <header className="bg-[var(--color-mottu-default)] py-6 shadow">
                    <div className="container mx-auto px-4">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            <MdMap /> Designer do Pátio
                        </h1>
                        <p className="text-white/90 mt-1 text-sm">
                            Desenhe zonas e boxes num grid, faça zoom/pan, e exporte/importe
                            o layout em JSON (sem alterar seu banco agora).
                        </p>
                    </div>
                </header>

                <section className="container mx-auto px-4 py-6">
                    {/* Painel de controles */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="flex flex-wrap gap-3 items-center">
                            <label className="text-sm">
                                Nome do Pátio:&nbsp;
                                <input
                                    className="px-2 py-1 rounded bg-white text-slate-800"
                                    value={meta.patioNome}
                                    onChange={(e) =>
                                        setMeta((m) => ({ ...m, patioNome: e.target.value }))
                                    }
                                    maxLength={80}
                                />
                            </label>

                            <label className="text-sm">
                                Colunas:&nbsp;
                                <input
                                    type="number"
                                    min={6}
                                    max={100}
                                    className="w-20 px-2 py-1 rounded bg-white text-slate-800"
                                    value={meta.cols}
                                    onChange={(e) =>
                                        setMeta((m) => ({
                                            ...m,
                                            cols: clamp(parseInt(e.target.value || "0"), 6, 100),
                                        }))
                                    }
                                />
                            </label>

                            <label className="text-sm">
                                Linhas:&nbsp;
                                <input
                                    type="number"
                                    min={6}
                                    max={100}
                                    className="w-20 px-2 py-1 rounded bg-white text-slate-800"
                                    value={meta.rows}
                                    onChange={(e) =>
                                        setMeta((m) => ({
                                            ...m,
                                            rows: clamp(parseInt(e.target.value || "0"), 6, 100),
                                        }))
                                    }
                                />
                            </label>

                            <label className="text-sm">
                                Tamanho célula:&nbsp;
                                <input
                                    type="number"
                                    min={12}
                                    max={56}
                                    className="w-24 px-2 py-1 rounded bg-white text-slate-800"
                                    value={meta.cell}
                                    onChange={(e) =>
                                        setMeta((m) => ({
                                            ...m,
                                            cell: clamp(parseInt(e.target.value || "0"), 12, 56),
                                        }))
                                    }
                                />
                            </label>

                            <div className="flex gap-2 items-center">
                                <button
                                    className={`px-3 py-1 rounded ${
                                        tool === "pan"
                                            ? "bg-white text-[var(--color-mottu-dark)]"
                                            : "bg-black/40"
                                    }`}
                                    onClick={() => setTool("pan")}
                                    title="Mover tela"
                                >
                                    Pan
                                </button>
                                <button
                                    className={`px-3 py-1 rounded ${
                                        tool === "zona"
                                            ? "bg-white text-[var(--color-mottu-dark)]"
                                            : "bg-black/40"
                                    }`}
                                    onClick={() => setTool("zona")}
                                    title="Criar Zona (retângulo)"
                                >
                                    Zona
                                </button>
                                <button
                                    className={`px-3 py-1 rounded ${
                                        tool === "box"
                                            ? "bg-white text-[var(--color-mottu-dark)]"
                                            : "bg-black/40"
                                    }`}
                                    onClick={() => setTool("box")}
                                    title="Pintar Box (liga/desliga)"
                                >
                                    Box
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                className="px-3 py-1 rounded bg-black/40"
                                onClick={() => setScale((s) => clamp(s + 0.1, 0.4, 2.5))}
                                title="Zoom in"
                            >
                                <MdZoomIn />
                            </button>
                            <button
                                className="px-3 py-1 rounded bg-black/40"
                                onClick={() => setScale((s) => clamp(s - 0.1, 0.4, 2.5))}
                                title="Zoom out"
                            >
                                <MdZoomOut />
                            </button>
                            <button
                                className="px-3 py-1 rounded bg-black/40"
                                onClick={centerView}
                                title="Centralizar"
                            >
                                <MdCenterFocusStrong />
                            </button>

                            <button className="px-3 py-1 rounded bg-black/40" onClick={undo} title="Desfazer">
                                <MdUndo />
                            </button>
                            <button className="px-3 py-1 rounded bg-black/40" onClick={redo} title="Refazer">
                                <MdRedo />
                            </button>

                            <button
                                className="px-3 py-1 rounded bg-black/40"
                                onClick={exportJson}
                                title="Exportar JSON"
                            >
                                <MdFileDownload />
                            </button>
                            <button
                                className="px-3 py-1 rounded bg-black/40"
                                onClick={handleUploadClick}
                                title="Importar JSON"
                            >
                                <MdFileUpload />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/json,.json"
                                className="hidden"
                                onChange={handleFile}
                            />

                            <button
                                className="px-3 py-1 rounded bg-red-700/80 hover:bg-red-700"
                                onClick={clearAll}
                                title="Limpar zonas/boxes"
                            >
                                <MdDelete />
                            </button>
                        </div>
                    </div>

                    {/* Área de desenho */}
                    <div className="relative overflow-hidden border border-white/10 rounded-lg bg-[url('data:image/svg+xml;utf8,<?xml version=\\'1.0\\' encoding=\\'UTF-8\\'?><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><rect width=\\'40\\' height=\\'40\\' fill=\\'%23000000\\'/><path d=\\'M0 20 H40 M20 0 V40\\' stroke=\\'%23ffffff10\\' stroke-width=\\'1\\'/></svg>')]">
                        <svg
                            width="100%"
                            height={Math.min(700, gridPx.h + 40)}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onWheel={onWheel}
                            style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
                        >
                            <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
                                {/* fundo */}
                                <rect
                                    x={0}
                                    y={0}
                                    width={gridPx.w}
                                    height={gridPx.h}
                                    fill="#0b0b0b"
                                    stroke="#ffffff22"
                                />

                                {/* grade */}
                                <g>
                                    {Array.from({ length: meta.cols + 1 }).map((_, c) => (
                                        <line
                                            key={"vc" + c}
                                            x1={c * meta.cell}
                                            y1={0}
                                            x2={c * meta.cell}
                                            y2={gridPx.h}
                                            stroke="#ffffff10"
                                        />
                                    ))}
                                    {Array.from({ length: meta.rows + 1 }).map((_, r) => (
                                        <line
                                            key={"hr" + r}
                                            x1={0}
                                            y1={r * meta.cell}
                                            x2={gridPx.w}
                                            y2={r * meta.cell}
                                            stroke="#ffffff10"
                                        />
                                    ))}
                                </g>

                                {/* zonas */}
                                {zonas.map((z) => (
                                    <g key={z.id}>
                                        <rect
                                            x={z.x * meta.cell}
                                            y={z.y * meta.cell}
                                            width={z.w * meta.cell}
                                            height={z.h * meta.cell}
                                            fill={z.fill + "cc"}
                                            stroke="#1f2937"
                                            strokeWidth={2}
                                        />
                                        <text
                                            x={(z.x + z.w / 2) * meta.cell}
                                            y={(z.y + z.h / 2) * meta.cell}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontSize={Math.max(10, meta.cell * 0.5)}
                                            fill="#0b0b0b"
                                            style={{ pointerEvents: "none" }}
                                        >
                                            {z.nome}
                                        </text>
                                    </g>
                                ))}

                                {/* boxes “pintados” */}
                                {boxes.map((b) => (
                                    <rect
                                        key={b.id}
                                        x={b.x * meta.cell + 2}
                                        y={b.y * meta.cell + 2}
                                        width={meta.cell - 4}
                                        height={meta.cell - 4}
                                        fill={b.status === "O" ? "#ef4444cc" : "#22c55ecc"}
                                        stroke="#111827"
                                    />
                                ))}

                                {/* preview da zona em desenho */}
                                {(() => {
                                    if (!drawing.current) return null;
                                    const svg = document.querySelector("svg");
                                    const rect = svg?.getBoundingClientRect();
                                    if (!rect) return null;
                                    return previewZona!({
                                        clientX: (window as any).__lastMouseX || 0,
                                        clientY: (window as any).__lastMouseY || 0,
                                        rect,
                                    });
                                })()}
                            </g>
                        </svg>
                    </div>

                    <div className="mt-3 text-xs text-white/60">
                        Dica: com a ferramenta <b>Box</b>, clique para marcar/desmarcar
                        células individuais (livre/ocupada). Com <b>Zona</b>, arraste para
                        criar retângulos. Use <b>Pan</b> ou o botão do meio do mouse para
                        mover a tela; rolagem faz zoom.
                    </div>

                    {/* Preview do JSON */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <MdViewModule /> Resumo
                            </h3>
                            <ul className="text-sm text-white/80 space-y-1">
                                <li>
                                    Grade: <b>{meta.cols}</b> col × <b>{meta.rows}</b> lin — célula{" "}
                                    <b>{meta.cell}px</b>
                                </li>
                                <li>
                                    Zonas: <b>{zonas.length}</b> | Boxes marcados: <b>{boxes.length}</b>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <MdContentCopy /> JSON (somente leitura)
                            </h3>
                            <textarea
                                className="w-full h-64 text-xs bg-black/60 text-white p-3 rounded"
                                readOnly
                                value={JSON.stringify(
                                    { meta, zonas, boxesMarcados: boxes },
                                    null,
                                    2
                                )}
                            />
                        </div>
                    </div>
                </section>
            </main>

            <style jsx global>{`
        :root {
          --color-mottu-dark: #102d1a;
          --color-mottu-default: #1e8c4f;
        }
      `}</style>

            <script
                dangerouslySetInnerHTML={{
                    __html: `
          // Guardamos as últimas coords do mouse para o preview do retângulo
          window.addEventListener('mousemove', function(ev){
            window.__lastMouseX = ev.clientX;
            window.__lastMouseY = ev.clientY;
          });
        `,
                }}
            />
        </>
    );
}
