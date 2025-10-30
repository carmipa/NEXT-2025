"use client";

import { useRouter } from 'next/navigation';

export default function MapasPage() {
    const router = useRouter();

    const patios = [
        {
            id: 'guarulhos',
            nome: 'Guarulhos',
            descricao: 'Pátio principal da Mottu em Guarulhos',
            icone: 'ion-ios-home',
            cor: 'bg-blue-600',
            corHover: 'hover:bg-blue-700',
            capacidade: '150+ vagas',
            localizacao: 'SP - Guarulhos'
        },
        {
            id: 'limao',
            nome: 'Limão',
            descricao: 'Unidade Limão da Mottu',
            icone: 'ion-ios-pin',
            cor: 'bg-green-600',
            corHover: 'hover:bg-green-700',
            capacidade: '80+ vagas',
            localizacao: 'SP - Limão'
        }
    ];

    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        🗺️ Mapas de Pátio
                    </h1>
                    <p className="text-slate-300 text-base md:text-lg px-4">
                        Selecione um pátio para visualizar o mapa detalhado
                    </p>
                </div>

                {/* Cards dos Pátios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                    {patios.map((patio) => (
                        <div
                            key={patio.id}
                            onClick={() => router.push(`/mapas/patio?p=${patio.id}`)}
                            className={`${patio.cor} ${patio.corHover} rounded-2xl shadow-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-3xl`}
                        >
                            <div className="flex flex-col items-center text-center text-white">
                                {/* Ícone */}
                                <div className="bg-white/20 rounded-full p-4 md:p-6 mb-4 md:mb-6">
                                    <i className={`${patio.icone} text-4xl md:text-5xl lg:text-6xl`}></i>
                                </div>

                                {/* Título */}
                                <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    {patio.nome}
                                </h2>

                                {/* Descrição */}
                                <p className="text-white/90 mb-3 md:mb-4 text-sm md:text-base lg:text-lg px-2">
                                    {patio.descricao}
                                </p>

                                {/* Info */}
                                <div className="bg-white/20 rounded-lg p-3 md:p-4 w-full space-y-2">
                                    <div className="flex items-center justify-between text-sm md:text-base">
                                        <span className="font-semibold">Capacidade:</span>
                                        <span className="font-bold">{patio.capacidade}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm md:text-base">
                                        <span className="font-semibold">Localização:</span>
                                        <span className="font-bold">{patio.localizacao}</span>
                                    </div>
                                </div>

                                {/* Botão */}
                                <button className={`mt-4 md:mt-6 bg-white text-${patio.cor.split('-')[1]}-600 px-6 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg transition-all hover:bg-white/90 w-full md:w-auto`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Ver Mapa →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="text-center mt-8 md:mt-12 px-4">
                    <p className="text-slate-400 text-sm md:text-base">
                        💡 Selecione um dos pátios acima para visualizar o mapa interativo em tempo real
                    </p>
                </div>
            </div>
        </div>
    );
}
