// src/app/zona/detalhes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ZonaService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { Loader2, AlertCircle, MapPin as ZonaIcon, Edit, ArrowLeft } from 'lucide-react';

export default function DetalhesZonaPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [zona, setZona] = useState<ZonaResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch {
            return 'Data inválida';
        }
    };

    useEffect(() => {
        if (!id) {
            setError("ID da zona inválido.");
            setIsLoading(false);
            return;
        }
        const fetchZona = async () => {
            setIsLoading(true);
            try {
                const data = await ZonaService.getById(id);
                setZona(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Zona não encontrada ou erro ao carregar dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchZona();
    }, [id]);

    if (isLoading) return (
        <>
            <NavBar active="zona" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <NavBar active="zona" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/zona/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!zona) return null;

    return (
        <>
            <NavBar active="zona" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{zona.nome}</h1>
                            <p className="text-slate-300">Detalhes da Zona (ID: {zona.idZona})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/zona/listar" className="flex items-center gap-2 px-4 py-2 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <ArrowLeft size={18} /> Voltar
                            </Link>
                            <Link href={`/zona/alterar/${zona.idZona}`} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                <Edit size={18} /> Editar
                            </Link>
                        </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-3 text-slate-100 flex items-center"><ZonaIcon className="mr-2"/>Dados da Zona</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <p><strong>Nome:</strong> {zona.nome}</p>
                            <p><strong>Data de Entrada:</strong> {formatDate(zona.dataEntrada)}</p>
                            <p><strong>Data de Saída:</strong> {formatDate(zona.dataSaida)}</p>
                            <p className="md:col-span-2"><strong>Observação:</strong> {zona.observacao || '-'}</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}