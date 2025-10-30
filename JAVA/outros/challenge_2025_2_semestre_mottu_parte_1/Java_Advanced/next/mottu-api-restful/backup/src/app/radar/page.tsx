// src/app/radar/page.tsx
"use client";
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import '@/styles/neumorphic.css';

export default function RadarPage() {
    return (
        <>
            <NavBar active="radar" />
            <main className="min-h-screen text-white p-6 md:p-12 flex items-center justify-center">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>Radar Mottu</h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-16" style={{fontFamily: 'Montserrat, sans-serif'}}>Selecione uma opção para começar.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Link href="/radar/armazenar" className="block p-12 bg-[var(--color-mottu-default)] rounded-xl shadow-xl hover:scale-105 transition-transform">
                            <i className="ion-ios-car text-6xl mx-auto mb-6 text-white block"></i>
                            <h2 className="text-3xl font-semibold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>Armazenar Moto</h2>
                            <p className="text-slate-200 mt-3 text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Estacione sua moto rapidamente encontrando uma vaga livre.</p>
                        </Link>

                        <Link href="/radar/buscar" className="block p-12 bg-slate-800 rounded-xl shadow-xl hover:scale-105 transition-transform">
                            <i className="ion-ios-search text-6xl mx-auto mb-6 text-white block"></i>
                            <h2 className="text-3xl font-semibold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>Buscar Moto</h2>
                            <p className="text-slate-200 mt-3 text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Localize sua moto no pátio com o mapa de localização.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}