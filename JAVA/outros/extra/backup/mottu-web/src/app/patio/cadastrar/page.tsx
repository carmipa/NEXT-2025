// src/app/patio/cadastrar/page.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { PatioService } from '@/utils/api';
import { PatioRequestDto } from '@/types/patio';
import { MdAdd, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Building, Calendar, Text } from 'lucide-react';

export default function CadastrarPatioPage() {
    const today = new Date().toISOString().split('T')[0];
    const initialState: PatioRequestDto = {
        nomePatio: '', dataEntrada: today, dataSaida: today, observacao: '',
    };
    const [formData, setFormData] = useState<PatioRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const createdPatio = await PatioService.create(formData);
            setSuccess(`Pátio "${createdPatio.nomePatio}" cadastrado com sucesso!`);
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao cadastrar pátio.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="patio" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-lg mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6">
                        <MdAdd size={32} className="mr-3" />
                        Cadastrar Novo Pátio
                    </h1>
                    {success && <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300"><MdCheckCircle className="text-xl" /> <span>{success}</span></div>}
                    {error && <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300"><MdErrorOutline className="text-xl" /> <span>{error}</span></div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group">
                            <label htmlFor="nomePatio" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Building size={16}/> Nome do Pátio <span className="text-red-300">*</span></label>
                            <input type="text" id="nomePatio" name="nomePatio" value={formData.nomePatio} onChange={handleChange} required placeholder="Ex: Pátio Principal" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label htmlFor="dataEntrada" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Data de Entrada <span className="text-red-300">*</span></label>
                                <input type="date" id="dataEntrada" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10 date-input-fix peer" />
                                <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                            </div>
                            <div className="group">
                                <label htmlFor="dataSaida" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Data de Saída <span className="text-red-300">*</span></label>
                                <input type="date" id="dataSaida" name="dataSaida" value={formData.dataSaida} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10 date-input-fix peer" />
                                <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="observacao" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Text size={16}/> Observação</label>
                            <textarea id="observacao" name="observacao" value={formData.observacao || ''} onChange={handleChange} rows={3} placeholder="Alguma observação sobre o pátio..." className="w-full p-2 rounded bg-white text-slate-900" />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 disabled:opacity-50">
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Pátio'}
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