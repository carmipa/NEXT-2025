// Tipos para o sistema de vagas completo
export interface VagaCompleta {
    idBox: number;
    nomeBox: string;
    status: 'L' | 'O' | 'M'; // L=Livre, O=Ocupado, M=Manutenção
    patio: {
        idPatio: number;
        nomePatio: string;
        endereco: {
            cidade: string;
            estado: string;
        };
    };
    veiculo?: {
        placa: string;
        modelo: string;
        fabricante: string;
    };
}

// Cores para os status das vagas
export const STATUS_COLORS = {
    'L': {
        bg: 'bg-green-500',
        border: 'border-green-600',
        text: 'text-green-800'
    },
    'O': {
        bg: 'bg-red-500',
        border: 'border-red-600',
        text: 'text-red-800'
    },
    'M': {
        bg: 'bg-yellow-500',
        border: 'border-yellow-600',
        text: 'text-yellow-800'
    }
};

// Labels para os status das vagas
export const STATUS_LABELS = {
    'L': 'Livre',
    'O': 'Ocupado',
    'M': 'Manutenção'
};