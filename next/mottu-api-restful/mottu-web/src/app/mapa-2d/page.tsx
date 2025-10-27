"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Mapa2DRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirecionar para o novo sistema de mapas
        router.replace('/mapas/patio');
    }, [router]);

    return (
        <main className="min-h-screen text-white p-4 md:p-8">
            <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white">Redirecionando para o novo sistema de mapas...</p>
                    </div>
                </div>
            </div>
        </main>
    );
}