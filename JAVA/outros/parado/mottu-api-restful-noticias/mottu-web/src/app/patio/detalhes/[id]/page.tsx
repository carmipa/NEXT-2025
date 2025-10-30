// Caminho: src/app/patio/detalhes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PatioService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { Loader2, AlertCircle, Building, Edit, ArrowLeft, Phone, Home } from 'lucide-react';
import '@/types/styles/neumorphic.css';

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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/gerenciamento-patio/patio" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar</Link>
                </div>
            </main>
        </>
    );

    if (!patio) return null;

    return (
        <>
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-3 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">{patio.nomePatio}</h1>
                            <p className="text-slate-300 text-xs sm:text-sm">Detalhes do Pátio (ID: {patio.idPatio})</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Link href="/gerenciamento-patio/patio" className="btn btn-ghost text-xs sm:text-sm px-3 sm:px-4 py-2">
                                <ArrowLeft size={16} className="text-blue-500"/> 
                                <span className="hidden sm:inline">Voltar</span>
                                <span className="sm:hidden">←</span>
                            </Link>
                            <Link href={`/patio/alterar/${patio.idPatio}`} className="btn btn-primary-green text-xs sm:text-sm px-3 sm:px-4 py-2">
                                <Edit size={16} className="text-yellow-400"/> 
                                <span className="hidden sm:inline">Editar</span>
                                <span className="sm:hidden">✏️</span>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* Dados do Pátio */}
                        <div className="p-3 sm:p-4 rounded-lg neumorphic-container">
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center">
                                <Building className="mr-2 text-emerald-600 w-5 h-5 sm:w-6 sm:h-6"/>Dados do Pátio
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-gray-800">
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-business text-emerald-600 text-sm"></i>
                                    <span><strong>Nome:</strong> {patio.nomePatio}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className={`ion-ios-pulse ${patio.status === 'A' ? 'text-green-600' : 'text-red-600'} text-sm`}></i>
                                    <span><strong>Status:</strong> {patio.status === 'A' ? 'Ativo' : 'Inativo'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-calendar text-blue-500 text-sm"></i>
                                    <span><strong>Data Cadastro:</strong> {new Date(patio.dataCadastro).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 md:col-span-2">
                                    <i className="ion-ios-information-circle text-slate-500 text-sm"></i>
                                    <span><strong>Observação:</strong> {patio.observacao || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* CORREÇÃO: Exibição detalhada do Contato Associado */}
                        <div className="p-3 sm:p-4 rounded-lg neumorphic-container">
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center">
                                <Phone className="mr-2 text-sky-600 w-5 h-5 sm:w-6 sm:h-6"/>Contato Principal
                            </h2>
                            {patio.contato ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-mail text-green-600 text-sm"></i>
                                        <span><strong>Email:</strong> <span className="text-sky-700">{patio.contato.email}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-phone-portrait text-green-600 text-sm"></i>
                                        <span><strong>Celular:</strong> {patio.contato.celular}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-call text-green-600 text-sm"></i>
                                        <span><strong>Telefone:</strong> ({patio.contato.ddd}) {patio.contato.telefone1}</span>
                                    </div>
                                    {patio.contato.ddi && (
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-globe text-green-600 text-sm"></i>
                                            <span><strong>DDI:</strong> +{patio.contato.ddi}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-xs sm:text-sm">Nenhum contato principal associado a este pátio.</p>
                            )}
                        </div>

                        {/* CORREÇÃO: Exibição detalhada do Endereço Associado */}
                        <div className="p-3 sm:p-4 rounded-lg neumorphic-container">
                            <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center">
                                <Home className="mr-2 text-purple-600 w-5 h-5 sm:w-6 sm:h-6"/>Endereço Principal
                            </h2>
                            {patio.endereco ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm text-gray-800">
                                    <div className="flex items-center gap-2 md:col-span-2">
                                        <i className="ion-ios-home text-red-500 text-sm"></i>
                                        <span><strong>Logradouro:</strong> {patio.endereco.logradouro}, {patio.endereco.numero}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-navigate text-red-500 text-sm"></i>
                                        <span><strong>Bairro:</strong> {patio.endereco.bairro}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-map text-red-500 text-sm"></i>
                                        <span><strong>Cidade/UF:</strong> {patio.endereco.cidade} / {patio.endereco.estado}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-pricetag text-red-500 text-sm"></i>
                                        <span><strong>CEP:</strong> {patio.endereco.cep}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-xs sm:text-sm">Nenhum endereço principal associado a este pátio.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}