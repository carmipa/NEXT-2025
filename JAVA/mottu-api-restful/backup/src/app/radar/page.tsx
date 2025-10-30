// src/app/radar/page.tsx
"use client";
import Link from 'next/link';
import '@/styles/neumorphic.css';

export default function RadarPage() {
    return (
        <main className="min-h-screen text-white p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>Radar Mottu</h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 md:mb-16" style={{fontFamily: 'Montserrat, sans-serif'}}>Selecione uma opção para começar.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        <Link href="/radar/armazenar" className="block p-6 sm:p-8 md:p-10 lg:p-12 bg-[var(--color-mottu-default)] rounded-xl shadow-xl hover:scale-105 transition-transform">
                            <i className="ion-ios-car text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6 text-white block"></i>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>Armazenar Moto</h2>
                            <p className="text-slate-200 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Estacione sua moto rapidamente encontrando uma vaga livre.</p>
                        </Link>

                        <Link href="/radar/buscar" className="block p-6 sm:p-8 md:p-10 lg:p-12 bg-slate-800 rounded-xl shadow-xl hover:scale-105 transition-transform">
                            <i className="ion-ios-search text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6 text-white block"></i>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>Buscar Moto</h2>
                            <p className="text-slate-200 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Localize sua moto no pátio com o mapa de localização.</p>
                        </Link>

                        <Link href="/radar/app-download" className="block p-6 sm:p-8 md:p-10 lg:p-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-xl hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1">
                            <i className="ion-ios-download text-4xl sm:text-5xl md:text-6xl mx-auto mb-4 sm:mb-6 text-white block"></i>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>App Download</h2>
                            <p className="text-slate-200 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Baixe nosso aplicativo de rastreamento móvel.</p>
                        </Link>
                    </div>
                </div>
            </main>
    );
}