// Este arquivo centraliza os dados das motos para serem usados no formulário.

export const MARCAS = [
    "Honda",
    "Yamaha",
    "Shineray",
    "Haojue",
    "Bajaj",
    "Mottu",
] as const; // 'as const' garante que esses valores são literais e não strings genéricas

export const MODELOS_POR_MARCA: { [key: string]: string[] } = {
    Honda: [
        "CG 160 Start",
        "Pop 110i",
        "Biz 125",
        "NXR 160 Bros",
        "CB 300F Twister",
    ],
    Yamaha: [
        "Factor 150 UBS",
        "Fazer FZ15 ABS",
        "NMax 160 ABS",
        "Crosser 150 S",
        "Lander 250 ABS",
    ],
    Shineray: ["Worker 125", "Worker 150 Cross"],
    Haojue: ["DK 150 CBS", "DR 160"],
    Bajaj: ["Dominar 160", "Dominar 200"],
    Mottu: ["Mottu Sport 110i"],
};

// Extraímos valores únicos da sua planilha para os outros campos
export const CILINDRADAS = [
    "110cc",
    "125cc",
    "150cc",
    "160cc",
    "200cc",
    "250cc",
    "300cc",
];

export const TIPOS_COMBUSTIVEL = ["Gasolina", "Flex"];