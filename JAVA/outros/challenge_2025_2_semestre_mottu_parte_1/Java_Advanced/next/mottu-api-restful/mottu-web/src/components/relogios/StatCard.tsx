// components/StatCard.tsx

import { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string | number;
    icon: ReactNode;
};

export const StatCard = ({ title, value, icon }: StatCardProps) => {
    return (
        // Card com gradiente verde padronizado
        <div
            className="neumorphic-card-gradient p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer"
        >
            {/* Container para o anel animado e o valor */}
            <div className="relative w-20 h-20 flex-shrink-0">
                {/* O anel cinza de fundo (a trilha) */}
                <div className="absolute inset-0 rounded-full bg-white/10"></div>

                {/* O anel azul que gira - Usamos a animação 'spin' nativa do Tailwind */}
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        border: '4px solid transparent',
                        borderTopColor: '#3b82f6', // Cor azul para o rastro do spin
                        borderLeftColor: '#3b82f6', // Cor azul para o rastro do spin
                    }}
                ></div>

                {/* O conteúdo centralizado (o número) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--color-mottu-dark)]">{value}</span>
                </div>
            </div>

            {/* Título e ícone */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[var(--color-mottu-dark)]">
                    {icon}
                    <h2 className="font-semibold text-lg">{title}</h2>
                </div>
            </div>
        </div>
    );
};