import { Building2, MapPin } from 'lucide-react';
import PatioMottuGuarulhos from '@/components/mapas-mottu/PatioMottuGuarulhos';
import PatioMottuLimao from '@/components/mapas-mottu/PatioMottuLimao';

export interface MapaDisponivel {
    id: string;
    nome: string;
    descricao: string;
    icone: any;
    cor: string;
    corHover: string;
    componente: React.ComponentType<any>;
    status: 'ativo' | 'em-desenvolvimento' | 'planejado';
    capacidade?: string;
    localizacao?: string;
}

export const MAPAS_DISPONIVEIS: MapaDisponivel[] = [
    {
        id: 'guarulhos',
        nome: 'Guarulhos',
        descricao: 'Pátio principal da Mottu em Guarulhos',
        icone: Building2,
        cor: 'bg-blue-600',
        corHover: 'hover:bg-blue-700',
        componente: PatioMottuGuarulhos,
        status: 'ativo',
        capacidade: '150+ vagas',
        localizacao: 'SP - Guarulhos'
    },
    {
        id: 'limao',
        nome: 'Limão',
        descricao: 'Unidade Limão da Mottu',
        icone: MapPin,
        cor: 'bg-green-600',
        corHover: 'hover:bg-green-700',
        componente: PatioMottuLimao,
        status: 'em-desenvolvimento',
        capacidade: '80+ vagas',
        localizacao: 'SP - Limão'
    },
    // Exemplo de mapas futuros (comentados para não aparecer ainda)
    // {
    //     id: 'sao-paulo',
    //     nome: 'São Paulo',
    //     descricao: 'Unidade central de São Paulo',
    //     icone: Factory,
    //     cor: 'bg-purple-600',
    //     corHover: 'hover:bg-purple-700',
    //     componente: PatioMottuSaoPaulo, // Seria criado no futuro
    //     status: 'planejado',
    //     capacidade: '200+ vagas',
    //     localizacao: 'SP - Centro'
    // },
    // {
    //     id: 'rio-de-janeiro',
    //     nome: 'Rio de Janeiro',
    //     descricao: 'Unidade do Rio de Janeiro',
    //     icone: Warehouse,
    //     cor: 'bg-orange-600',
    //     corHover: 'hover:bg-orange-700',
    //     componente: PatioMottuRio, // Seria criado no futuro
    //     status: 'planejado',
    //     capacidade: '120+ vagas',
    //     localizacao: 'RJ - Centro'
    // }
];

// Função para filtrar mapas por status
export const getMapasAtivos = () => MAPAS_DISPONIVEIS.filter(mapa => mapa.status === 'ativo');
export const getMapasEmDesenvolvimento = () => MAPAS_DISPONIVEIS.filter(mapa => mapa.status === 'em-desenvolvimento');
export const getMapasPlanejados = () => MAPAS_DISPONIVEIS.filter(mapa => mapa.status === 'planejado');

// Função para buscar um mapa por ID
export const getMapaById = (id: string) => MAPAS_DISPONIVEIS.find(mapa => mapa.id === id);
