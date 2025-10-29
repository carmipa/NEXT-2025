// Configurações de Layouts de Pátios
// Este arquivo centraliza todas as configurações de layouts para facilitar manutenção

export interface PatioLayout {
    id: string;
    name: string;
    description: string;
    outline: [number, number][];
    roofs: { id: string; poly: [number, number][] }[];
    streets: { name: string; from: [number, number]; to: [number, number] }[];
    boxAreas: BoxArea[];
}

export interface BoxArea {
    prefix: string;
    name: string;
    bounds: { x: number; y: number; width: number; height: number };
    grid: { cols: number; rows: number };
    boxSize: { w: number; h: number };
    gap: number;
}

// Layout do Pátio Guarulhos
export const GUARULHOS_LAYOUT: PatioLayout = {
    id: "guarulhos",
    name: "Pátio Guarulhos",
    description: "Layout principal da oficina em Guarulhos com formato em L",
    outline: [[0, 0], [60, 0], [60, 16], [50, 16], [50, 22], [64, 22], [64, 68], [6, 68], [6, 60], [0, 60], [0, 0]],
    roofs: [{ 
        id: "telhado-principal", 
        poly: [[0, 0], [60, 0], [60, 16], [50, 16], [50, 22], [64, 22], [64, 68], [6, 68], [6, 60], [0, 60], [0, 0]] 
    }],
    streets: [
        { name: "R. Antônio Pegoraro", from: [-10, -6], to: [72, -6] },
        { name: "Viela Espingarda", from: [70, 20], to: [70, 74] },
        { name: "R. Maria Antonieta", from: [-8, 74], to: [66, 74] }
    ],
    boxAreas: [
        {
            prefix: "B",
            name: "Área Principal",
            bounds: { x: 2, y: 2, width: 56, height: 12 },
            grid: { cols: 12, rows: 3 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        },
        {
            prefix: "Li",
            name: "Área Lateral",
            bounds: { x: 8, y: 24, width: 54, height: 42 },
            grid: { cols: 10, rows: 8 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        }
    ]
};

// Layout do Pátio São Paulo (exemplo)
export const SAO_PAULO_LAYOUT: PatioLayout = {
    id: "sao-paulo",
    name: "Pátio São Paulo",
    description: "Layout retangular para pátio em São Paulo",
    outline: [[0, 0], [80, 0], [80, 20], [70, 20], [70, 40], [80, 40], [80, 80], [0, 80], [0, 0]],
    roofs: [{ 
        id: "telhado-sp", 
        poly: [[0, 0], [80, 0], [80, 20], [70, 20], [70, 40], [80, 40], [80, 80], [0, 80], [0, 0]] 
    }],
    streets: [
        { name: "Av. Paulista", from: [-10, -6], to: [90, -6] },
        { name: "R. Augusta", from: [85, 20], to: [85, 90] }
    ],
    boxAreas: [
        {
            prefix: "A",
            name: "Área A",
            bounds: { x: 3, y: 3, width: 74, height: 15 },
            grid: { cols: 15, rows: 3 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        },
        {
            prefix: "C",
            name: "Área C",
            bounds: { x: 3, y: 25, width: 64, height: 52 },
            grid: { cols: 12, rows: 10 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        }
    ]
};

// Layout do Pátio Rio de Janeiro (exemplo)
export const RIO_LAYOUT: PatioLayout = {
    id: "rio-de-janeiro",
    name: "Pátio Rio de Janeiro",
    description: "Layout triangular para pátio no Rio de Janeiro",
    outline: [[0, 0], [60, 0], [60, 30], [30, 60], [0, 60], [0, 0]],
    roofs: [{ 
        id: "telhado-rio", 
        poly: [[0, 0], [60, 0], [60, 30], [30, 60], [0, 60], [0, 0]] 
    }],
    streets: [
        { name: "Av. Copacabana", from: [-10, -6], to: [70, -6] },
        { name: "R. Ipanema", from: [65, 20], to: [65, 70] }
    ],
    boxAreas: [
        {
            prefix: "R",
            name: "Área Retangular",
            bounds: { x: 2, y: 2, width: 56, height: 28 },
            grid: { cols: 14, rows: 6 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        },
        {
            prefix: "T",
            name: "Área Triangular",
            bounds: { x: 32, y: 32, width: 28, height: 28 },
            grid: { cols: 7, rows: 6 },
            boxSize: { w: 3, h: 4 },
            gap: 0.5
        }
    ]
};

// Registro de todos os layouts disponíveis
export const AVAILABLE_LAYOUTS: Record<string, PatioLayout> = {
    "guarulhos": GUARULHOS_LAYOUT,
    "sao-paulo": SAO_PAULO_LAYOUT,
    "rio-de-janeiro": RIO_LAYOUT
};

// Layout padrão
export const DEFAULT_LAYOUT = GUARULHOS_LAYOUT;

// Função para obter layout por ID
export const getLayoutById = (layoutId: string): PatioLayout => {
    return AVAILABLE_LAYOUTS[layoutId] || DEFAULT_LAYOUT;
};

// Função para listar todos os layouts disponíveis
export const getAllLayouts = (): PatioLayout[] => {
    return Object.values(AVAILABLE_LAYOUTS);
};
