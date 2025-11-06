"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PatioMottuGuarulhos from '@/components/mapas-mottu/PatioMottuGuarulhos';
import PatioMottuLimao from '@/components/mapas-mottu/PatioMottuLimao';

function MapaPatioContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paramMapa = searchParams.get('p');
    
    const [selectedMapa, setSelectedMapa] = useState<'guarulhos' | 'limao'>(
        paramMapa === 'limao' ? 'limao' : 'guarulhos'
    );

    useEffect(() => {
        if (paramMapa === 'limao' || paramMapa === 'guarulhos') {
            setSelectedMapa(paramMapa);
        }
    }, [paramMapa]);

    const handleMapaChange = (mapa: 'guarulhos' | 'limao') => {
        setSelectedMapa(mapa);
        router.push(`/mapas/patio?p=${mapa}`);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header com título e navegação */}
            <div className="bg-[var(--color-mottu-dark)] border-b border-emerald-700/30 sticky top-0 z-40 shadow-lg">
                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                🗺️ Mapa Interativo
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm">Visualize os pátios em tempo real</p>
                        </div>
                        <a
                            href="/mapas"
                            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-xl text-sm sm:text-base"
                            style={{fontFamily: 'Montserrat, sans-serif'}}
                        >
                            <i className="ion-ios-arrow-back text-lg sm:text-xl"></i>
                            <span className="font-semibold">Voltar</span>
                        </a>
                    </div>

                    {/* Seletor de Pátio - Estilo Moderno e Responsivo */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-black/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 shadow-inner">
                        <button
                            onClick={() => handleMapaChange('guarulhos')}
                            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 ${
                                selectedMapa === 'guarulhos'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 hover:-translate-y-1 hover:shadow-lg'
                            }`}
                            style={{fontFamily: 'Montserrat, sans-serif'}}
                        >
                            <i className="ion-ios-home text-xl sm:text-2xl"></i>
                            <span className="text-base sm:text-lg">Guarulhos</span>
                        </button>
                        <button
                            onClick={() => handleMapaChange('limao')}
                            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 ${
                                selectedMapa === 'limao'
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 hover:-translate-y-1 hover:shadow-lg'
                            }`}
                            style={{fontFamily: 'Montserrat, sans-serif'}}
                        >
                            <i className="ion-ios-pin text-xl sm:text-2xl"></i>
                            <span className="text-base sm:text-lg">Limão</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Mapa */}
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
                    {selectedMapa === 'guarulhos' ? (
                        <div className="p-3 sm:p-6">
                            <PatioMottuGuarulhos />
                        </div>
                    ) : (
                        <div className="p-3 sm:p-6">
                            <PatioMottuLimao />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MapaPatioPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Carregando mapa...</div>
            </div>
        }>
            <MapaPatioContent />
        </Suspense>
    );
}
