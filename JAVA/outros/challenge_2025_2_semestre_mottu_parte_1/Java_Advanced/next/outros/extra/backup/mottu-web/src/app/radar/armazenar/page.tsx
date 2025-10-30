"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav-bar';
import OcrScanner from '@/components/OcrScanner';
import { EstacionamentoService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { Loader2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

export default function ArmazenarPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vaga, setVaga] = useState<BoxResponseDto | null>(null);

    const handlePlateScan = async (placa: string) => {
        setIsLoading(true);
        setError(null);
        setVaga(null);
        try {
            const vagaEncontrada = await EstacionamentoService.estacionar(placa);
            setVaga(vagaEncontrada);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao tentar estacionar. Verifique se a moto está registada e não está estacionada.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="radar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-8">Armazenar Moto</h1>

                {!vaga && <OcrScanner onPlateRecognized={handlePlateScan} />}

                {isLoading && (
                    <div className="mt-8 flex flex-col items-center gap-2 text-sky-300">
                        <Loader2 size={32} className="animate-spin" />
                        <p>A procurar vaga para a moto...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
                        <AlertTriangle size={32} className="mx-auto text-red-400 mb-2"/>
                        <p className="font-semibold">Erro ao Estacionar</p>
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {vaga && (
                    <div className="mt-8 p-6 bg-green-900/50 border border-green-500 rounded-lg text-center animate-fade-in">
                        <CheckCircle size={48} className="mx-auto text-green-400 mb-4"/>
                        <h2 className="text-2xl font-bold text-white">Vaga Encontrada!</h2>
                        <p className="text-slate-200 mb-4">A moto foi alocada com sucesso.</p>
                        <div className="text-left bg-black/30 p-4 rounded-md">
                            <p className="flex items-center gap-2 text-lg"><MapPin /> <strong>Vaga:</strong> {vaga.nome}</p>
                            <p className="text-sm text-slate-300">Status: {vaga.status === 'O' ? 'Ocupada' : 'Livre'}</p>
                        </div>
                        <button onClick={() => router.push('/radar')} className="mt-6 w-full px-6 py-3 font-semibold text-white bg-[var(--color-mottu-default)] rounded-md">
                            Voltar ao Início
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}

