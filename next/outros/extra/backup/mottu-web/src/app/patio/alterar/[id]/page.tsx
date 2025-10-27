// src/app/patio/alterar/[id]/page.tsx
"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { PatioService } from '@/utils/api';
import { PatioRequestDto } from '@/types/patio';
import { MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Building, Calendar, Text, Loader2, AlertCircle } from 'lucide-react';

export default function AlterarPatioPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [formData, setFormData] = useState<PatioRequestDto>({
        nomePatio: '', dataEntrada: '', dataSaida: '', observacao: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do pátio inválido.");
            setIsFetching(false);
            return;
        }
        const fetchPatio = async () => {
            setIsFetching(true);
            try {
                const data = await PatioService.getById(id);
                setFormData({
                    nomePatio: data.nomePatio,
                    dataEntrada: data.dataEntrada,
                    dataSaida: data.dataSaida,
                    observacao: data.observacao || '',
                });
            } catch (err: any) {
                setError(err.response?.data?.message || "Falha ao carregar dados do pátio.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchPatio();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await PatioService.update(id, formData);
            setSuccess(`Pátio "${formData.nomePatio}" atualizado com sucesso!`);
            setTimeout(() => router.push('/patio/listar'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao atualizar pátio.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <>
            <NavBar active="patio" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !formData.nomePatio) return (
        <>
            <NavBar active="patio" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/patio/listar" className="mt-6 inline-block px-6 py-2 bg-slate-600 text-white rounded-md">Voltar</Link>
                </div>
            </main>
        </>
    );

    return (
        <>
            <NavBar active="patio" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-lg mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6">
                        <MdEdit size={32} className="mr-3" />
                        Alterar Pátio (ID: {id})
                    </h1>
                    {success && <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100"><MdCheckCircle className="text-xl" /> <span>{success}</span></div>}
                    {error && <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100"><MdErrorOutline className="text-xl" /> <span>{error}</span></div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="nomePatio" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Building size={16}/> Nome do Pátio</label>
                            <input type="text" id="nomePatio" name="nomePatio" value={formData.nomePatio} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dataEntrada" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Data de Entrada</label>
                                <input type="date" id="dataEntrada" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10 date-input-fix" />
                            </div>
                            <div>
                                <label htmlFor="dataSaida" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Data de Saída</label>
                                <input type="date" id="dataSaida" name="dataSaida" value={formData.dataSaida} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10 date-input-fix" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="observacao" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Text size={16}/> Observação</label>
                            <textarea id="observacao" name="observacao" value={formData.observacao || ''} onChange={handleChange} rows={3} className="w-full p-2 rounded bg-white text-slate-900" />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 disabled:opacity-50">
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/patio/listar" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
