// src/app/zona/detalhes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ZonaService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { Loader2, AlertCircle, MapPin as ZonaIcon, ArrowLeft } from 'lucide-react';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/gerenciamento-patio/zona" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!zona) return null;

    return (
        <>
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{zona.nome}</h1>
                            <p className="text-slate-300">Detalhes da Zona (ID: {zona.idZona})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/gerenciamento-patio/zona" className="btn btn-ghost">
                                <ArrowLeft size={18} className="text-blue-600"/> Voltar
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg neumorphic-container">
                        <h2 className="text-xl font-semibold mb-3 flex items-center"><ZonaIcon className="mr-2 text-purple-600"/>Dados da Zona</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-800">
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-pricetag text-purple-500"></i>
                                <span><strong>Nome:</strong> {zona.nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-pulse text-green-500"></i>
                                <span><strong>Status:</strong> 
                                    <span className={`ml-1 font-semibold ${zona.status === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                        {zona.status === 'A' ? 'Ativa' : 'Inativa'}
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-calendar text-blue-500"></i>
                                <span><strong>ID da Zona:</strong> {zona.idZona}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-business text-emerald-600"></i>
                                <span><strong>Pátio:</strong> {zona.patio?.nomePatio || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-key text-orange-500"></i>
                                <span><strong>ID do Pátio:</strong> {zona.patioId || zona.patio?.idPatio || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-pulse text-blue-600"></i>
                                <span><strong>Status do Pátio:</strong> 
                                    <span className={`ml-1 font-semibold ${zona.patioStatus === 'A' ? 'text-green-600' : 'text-red-600'}`}>
                                        {zona.patioStatus === 'A' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <i className="ion-ios-information-circle text-gray-500"></i>
                                <span><strong>Observação:</strong> {zona.observacao || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}