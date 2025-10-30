// src/app/patio/detalhes/[id]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { Loader2, AlertCircle, Building, Edit, ArrowLeft } from 'lucide-react';

export default function DetalhesPatioPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;
    const [patio, setPatio] = useState<PatioResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do pátio inválido.");
            setIsLoading(false);
            return;
        }
        const fetchPatio = async () => {
            setIsLoading(true);
            try {
                const data = await PatioService.getById(id);
                setPatio(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Pátio não encontrado.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPatio();
    }, [id]);

    if (isLoading) return (
        <>
            <NavBar active="patio" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <NavBar active="patio" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/patio/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!patio) return null;

    return (
        <>
            <NavBar active="patio" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{patio.nomePatio}</h1>
                            <p className="text-slate-300">Detalhes do Pátio (ID: {patio.idPatio})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/patio/listar" className="flex items-center gap-2 px-4 py-2 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <ArrowLeft size={18} /> Voltar
                            </Link>
                            <Link href={`/patio/alterar/${patio.idPatio}`} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                <Edit size={18} /> Editar
                            </Link>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <p><strong>Nome:</strong> {patio.nomePatio}</p>
                            <p><strong>Data de Entrada:</strong> {new Date(patio.dataEntrada).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Data de Saída:</strong> {new Date(patio.dataSaida).toLocaleDateString('pt-BR')}</p>
                            <p className="md:col-span-2"><strong>Observação:</strong> {patio.observacao || '-'}</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
