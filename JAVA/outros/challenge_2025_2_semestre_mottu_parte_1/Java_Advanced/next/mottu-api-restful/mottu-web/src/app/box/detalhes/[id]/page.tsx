// src/app/box/detalhes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BoxService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { Loader2, AlertCircle, Box as BoxIcon, Edit, ArrowLeft } from 'lucide-react';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

export default function DetalhesBoxPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [box, setBox] = useState<BoxResponseDto | null>(null);
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
            setError("ID do box inválido.");
            setIsLoading(false);
            return;
        }
        const fetchBox = async () => {
            setIsLoading(true);
            try {
                const data = await BoxService.getById(id);
                setBox(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Box não encontrado ou erro ao carregar dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBox();
    }, [id]);

    if (isLoading) return (
        <>
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/box/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!box) return null;

    return (
        <>
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{box.nome}</h1>
                            <p className="text-slate-300">Detalhes do Box (ID: {box.idBox})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/box/listar" className="btn btn-ghost">
                                <ArrowLeft size={18} className="text-blue-600"/> Voltar
                            </Link>
                            <Link href={`/box/alterar/${box.idBox}`} className="btn btn-primary-green">
                                <Edit size={18} className="text-yellow-400"/> Editar
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg neumorphic-container">
                        <h2 className="text-xl font-semibold mb-3 flex items-center"><BoxIcon className="mr-2 text-orange-500"/>Dados do Box</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-800">
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-cube text-orange-500"></i>
                                <span><strong>Nome:</strong> {box.nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className={`ion-ios-pulse ${box.status === 'L' ? 'text-green-600' : 'text-red-600'}`}></i>
                                <span><strong>Status:</strong> {box.status === 'L' ? 'Livre' : 'Ocupado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-log-in text-sky-600"></i>
                                <span><strong>Entrada:</strong> {formatDate(box.dataEntrada)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-log-out text-sky-600"></i>
                                <span><strong>Saída:</strong> {formatDate(box.dataSaida)}</span>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <i className="ion-ios-information-circle text-slate-500"></i>
                                <span><strong>Observação:</strong> {box.observacao || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}