// src/utils/map/geometry.ts
export type Rect = { x: number; y: number; w: number; h: number };

// configuração do “mapa1”: origem, grade, tamanho da célula
const ZONAS = {
    A: { origin: { x: 520, y: 120 }, rows: 6, cols: 10, cell: { w: 26, h: 26 }, gap: 6 },
    B: { origin: { x: 480, y: 420 }, rows: 6, cols: 10, cell: { w: 26, h: 26 }, gap: 6 },
    C: { origin: { x: 720, y: 420 }, rows: 4, cols: 6,  cell: { w: 26, h: 26 }, gap: 6 },
} as const;

// Converte “A05”, “B12” etc -> {zona, linha, coluna}
function parseBoxNome(boxNome?: string) {
    if (!boxNome) return null;
    const m = boxNome.trim().match(/^([A-Z])\s*0*([1-9]\d*)$/i);
    if (!m) return null;
    const zonaKey = m[1].toUpperCase() as keyof typeof ZONAS; // A/B/C...
    const idx = parseInt(m[2], 10) - 1; // 0-based
    const zona = ZONAS[zonaKey];
    if (!zona) return null;
    const row = Math.floor(idx / zona.cols);
    const col = idx % zona.cols;
    if (row >= zona.rows) return null;
    return { zonaKey, row, col, zona };
}

export function rectByBoxNome(boxNome?: string): Rect | null {
    const parsed = parseBoxNome(boxNome);
    if (!parsed) return null;
    const { zona, row, col } = parsed;
    const { origin, cell, gap } = zona;
    const x = origin.x + col * (cell.w + gap);
    const y = origin.y + row * (cell.h + gap);
    return { x, y, w: cell.w, h: cell.h };
}
