"use client";

import NavBar from '@/components/nav-bar';
import PatioMottu2D from '@/components/PatioMottu2D';
import { Map } from 'lucide-react';

export default function Mapa2DPage() {
    return (
        <>
            <NavBar active="mapa-2d" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <header className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
                            <Map size={36} />
                            Visualização 2D do Pátio
                        </h1>
                        <p className="mt-2 text-md text-slate-200 max-w-3xl mx-auto">
                            Este é um modelo esquemático interativo do pátio da Mottu em Guarulhos. Use o mouse para navegar (arrastar) e dar zoom (roda do mouse).
                        </p>
                    </header>

                    <PatioMottu2D />

                </div>
            </main>
        </>
    );
}
