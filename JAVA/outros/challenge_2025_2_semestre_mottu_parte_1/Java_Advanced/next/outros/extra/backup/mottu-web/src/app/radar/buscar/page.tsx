"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import OcrScanner from '@/components/OcrScanner';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function BuscarMotoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para lidar com a placa reconhecida pelo OCR
    const handlePlateScan = async (placa: string) => {
        if (!placa) {
            setError("Nenhuma placa foi reconhecida.");
            return;
        }
        setIsLoading(true);
        setError(null);

        // Redireciona para a página de localização com a placa na URL.
        // A página de localização será responsável por procurar os dados.
        router.push(`/radar/localizar/${placa}`);
    };

    return (
        <>
            <NavBar active="radar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Buscar Moto</h1>
                    <p className="text-slate-300">Escaneie a placa para encontrar a localização do veículo.</p>
                </div>

                <OcrScanner onPlateRecognized={handlePlateScan} />

                {isLoading && (
                    <div className="mt-8 flex flex-col items-center gap-2 text-sky-300">
                        <Loader2 size={32} className="animate-spin" />
                        <p>A redirecionar para o mapa...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
                        <AlertTriangle size={32} className="mx-auto text-red-400 mb-2"/>
                        <p className="font-semibold">Erro</p>
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}
            </main>
        </>
    );
}

