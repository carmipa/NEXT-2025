// src/app/zona/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdAddCircleOutline, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle
} from 'react-icons/md';
import { Tag, Calendar, Text, Info, Stethoscope } from 'lucide-react'; // Ícone de zona

// Interfaces dos DTOs
import { ZonaRequestDto, ZonaResponseDto } from '@/types/zona';
import { ZonaService } from '@/utils/api';

export default function CadastrarZonaPage() {
    const today = new Date().toISOString().split('T')[0];

    const initialState: ZonaRequestDto = {
        nome: '',
        dataEntrada: today,
        dataSaida: today,
        observacao: '',
    };

    const [formData, setFormData] = useState<ZonaRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const createdZona: ZonaResponseDto = await ZonaService.create(formData);
            setSuccess(`Zona "${createdZona.nome}" (ID: ${createdZona.idZona}) cadastrada com sucesso!`);
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao cadastrar zona.');
            console.error("Erro detalhado:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="zona-cadastrar" />
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdAddCircleOutline className="text-3xl text-sky-400" /> Nova Zona
                    </h1>

                    {error && (
                        <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 mb-4" role="alert">
                            <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700 mb-4">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Tag size={16} /> Nome:
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                maxLength={50}
                                className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="dataEntrada" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Calendar size={16} /> Data Entrada:
                            </label>
                            <input
                                type="date"
                                id="dataEntrada"
                                name="dataEntrada"
                                value={formData.dataEntrada}
                                onChange={handleChange}
                                required
                                className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix"
                            />
                        </div>

                        <div>
                            <label htmlFor="dataSaida" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Calendar size={16} /> Data Saída:
                            </label>
                            <input
                                type="date"
                                id="dataSaida"
                                name="dataSaida"
                                value={formData.dataSaida}
                                onChange={handleChange}
                                required
                                className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 date-input-fix"
                            />
                        </div>

                        <div>
                            <label htmlFor="observacao" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Text size={16} /> Observação:
                            </label>
                            <textarea
                                id="observacao"
                                name="observacao"
                                rows={3}
                                value={formData.observacao}
                                onChange={handleChange}
                                maxLength={100}
                                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Zona'}
                            </button>
                            <Link href="/zona/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}