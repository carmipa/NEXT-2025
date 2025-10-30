// components/StatCard.tsx

import { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string | number;
    icon: ReactNode;
    colorScheme?: 'blue' | 'emerald' | 'indigo' | 'orange' | 'purple' | 'cyan';
};

const colorSchemes = {
    blue: {
        gradient: 'from-blue-50 via-blue-100 to-blue-200',
        ring: '#3b82f6',
        shadow: 'shadow-blue-500/30',
    },
    emerald: {
        gradient: 'from-emerald-50 via-emerald-100 to-emerald-200',
        ring: '#10b981',
        shadow: 'shadow-emerald-500/30',
    },
    indigo: {
        gradient: 'from-indigo-50 via-indigo-100 to-indigo-200',
        ring: '#6366f1',
        shadow: 'shadow-indigo-500/30',
    },
    orange: {
        gradient: 'from-orange-50 via-orange-100 to-orange-200',
        ring: '#f97316',
        shadow: 'shadow-orange-500/30',
    },
    purple: {
        gradient: 'from-purple-50 via-purple-100 to-purple-200',
        ring: '#a855f7',
        shadow: 'shadow-purple-500/30',
    },
    cyan: {
        gradient: 'from-cyan-50 via-cyan-100 to-cyan-200',
        ring: '#06b6d4',
        shadow: 'shadow-cyan-500/30',
    },
};

export const StatCard = ({ title, value, icon, colorScheme = 'emerald' }: StatCardProps) => {
    const colors = colorSchemes[colorScheme];

    return (
        // Card com gradiente variável baseado no colorScheme
        <div
            className={`bg-gradient-to-br ${colors.gradient} p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:${colors.shadow} cursor-pointer`}
        >
            {/* Container para o anel animado e o valor */}
            <div className="relative w-20 h-20 flex-shrink-0">
                {/* O anel cinza de fundo (a trilha) */}
                <div className="absolute inset-0 rounded-full bg-white/30"></div>

                {/* O anel colorido que gira - Usamos a cor do colorScheme */}
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        border: '4px solid transparent',
                        borderTopColor: colors.ring,
                        borderLeftColor: colors.ring,
                    }}
                ></div>

                {/* O conteúdo centralizado (o número) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{value}</span>
                </div>
            </div>

            {/* Título e ícone */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-slate-800">
                    {icon}
                    <h2 className="font-semibold text-lg">{title}</h2>
                </div>
            </div>
        </div>
    );
};