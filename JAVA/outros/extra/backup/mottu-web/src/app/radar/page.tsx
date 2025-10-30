// src/app/radar/page.tsx
"use client";
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ArrowRight, Search, ParkingSquare } from 'lucide-react';

export default function RadarPage() {
    return (
        <>
            <NavBar active="radar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Radar Motu</h1>
                    <p className="text-lg text-slate-300 mb-12">Selecione uma opção para começar.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/radar/armazenar" className="block p-8 bg-[var(--color-mottu-default)] rounded-lg shadow-lg hover:scale-105 transition-transform">
                            <ParkingSquare size={48} className="mx-auto mb-4 text-white"/>
                            <h2 className="text-2xl font-semibold text-white">Armazenar Moto</h2>
                            <p className="text-slate-200 mt-2">Estacione sua moto rapidamente encontrando uma vaga livre.</p>
                        </Link>

                        <Link href="/radar/buscar" className="block p-8 bg-slate-800 rounded-lg shadow-lg hover:scale-105 transition-transform">
                            <Search size={48} className="mx-auto mb-4 text-white"/>
                            <h2 className="text-2xl font-semibold text-white">Buscar Moto</h2>
                            <p className="text-slate-200 mt-2">Localize sua moto no pátio com o mapa de localização.</p>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}