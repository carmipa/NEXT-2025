"use client";

import { Bike, MapPin, Users, Wrench } from 'lucide-react';
import { EstatisticasVagas } from '../../app/mapa-box/types/VagaCompleta';

interface EstatisticasVagasProps {
    estatisticas: EstatisticasVagas;
    loading: boolean;
}

export default function EstatisticasVagasComponent({ estatisticas, loading }: EstatisticasVagasProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="neumorphic-container animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Total de Vagas',
            value: estatisticas.total,
            icon: Bike,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        {
            label: 'Livres',
            value: estatisticas.livres,
            icon: Bike,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        {
            label: 'Ocupadas',
            value: estatisticas.ocupadas,
            icon: Users,
            color: 'text-red-400',
            bgColor: 'bg-red-500/20'
        },
        {
            label: 'Manutenção',
            value: estatisticas.manutencao,
            icon: Wrench,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20'
        },
        {
            label: 'Pátios',
            value: estatisticas.patios,
            icon: MapPin,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                    <div
                        key={index}
                        className="neumorphic-container hover:scale-105 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <IconComponent size={24} className={card.color} />
                            <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                        </div>
                        <div className={`text-3xl font-bold ${card.color} mb-1`}>
                            {(card.value || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                            {card.label === 'Total de Vagas' && 'vagas cadastradas'}
                            {card.label === 'Livres' && 'disponíveis'}
                            {card.label === 'Ocupadas' && 'em uso'}
                            {card.label === 'Manutenção' && 'em reparo'}
                            {card.label === 'Pátios' && 'unidades'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
