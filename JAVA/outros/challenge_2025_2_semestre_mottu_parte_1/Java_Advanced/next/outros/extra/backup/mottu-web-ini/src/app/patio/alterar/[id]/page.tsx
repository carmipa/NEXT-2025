// src/app/patio/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle, MdLocationOn } from 'react-icons/md';
import { Tag, Calendar, Text, Info, Loader2, AlertCircle } from 'lucide-react';

// Interfaces dos DTOs
import { PatioRequestDto, PatioResponseDto } from '@/types/patio';
import { PatioService } from '@/utils/api';

export default function AlterarPatioPage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [formData, setFormData] = useState<PatioRequestDto>({
        nomePatio: '', dataEntrada: '', dataSaida: '', observacao: ''
    });

    const [isLoading, setIsLoading] = useState(false); // Para submissão
    const [isFetching, setIsFetching] = useState(true); // Para carregar dados iniciais
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Função para buscar os dados do pátio ao carregar a página
    useEffect(() => {
        if (!id) {
            setError("ID do pátio não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchPatioData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: PatioResponseDto = await PatioService.getById(id);
                setFormData({
                    nomePatio: data.nomePatio,
                    dataEntrada: data.dataEntrada,
                    dataSaida: data.dataSaida,
                    observacao: data.observacao || '',
                });
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados do pátio.");
                console.error("Erro detalhado no fetch inicial:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchPatioData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (id === null) {
            setError("ID do pátio inválido para atualização.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedPatio: PatioResponseDto = await PatioService.update(id, formData);
            setSuccess(`Pátio "${updatedPatio.nomePatio}" (ID: ${updatedPatio.idPatio}) atualizado com sucesso!`);
            setTimeout(() => {
                setSuccess(null);
                router.push('/patio/listar');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao atualizar pátio.');
            console.error("Erro detalhado na atualização:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <>
                <NavBar active="patio-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados do pátio...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !isFetching && (!formData.nomePatio || formData.nomePatio === '')) {
        return (
            <>
                <NavBar active="patio-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-900 p-8 rounded-lg shadow-xl text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg mb-6">{error}</p>
                        <Link href="/patio/listar" className="px-6 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700">Voltar para Lista</Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="patio-alterar" />
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdEdit className="text-3xl text-sky-400" /> Alterar Pátio (ID: {id})
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
                            <label htmlFor="nomePatio" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Tag size={16} /> Nome do Pátio:
                            </label>
                            <input
                                type="text"
                                id="nomePatio"
                                name="nomePatio"
                                value={formData.nomePatio}
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
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading || isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isFetching}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/patio/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
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