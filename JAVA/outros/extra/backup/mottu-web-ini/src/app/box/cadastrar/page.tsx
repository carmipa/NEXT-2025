// src/app/box/cadastrar/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdAddCircleOutline, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Tag, Calendar, Text, Info } from 'lucide-react';

// Interfaces dos DTOs
import { BoxRequestDto, BoxResponseDto } from '@/types/box';
import { BoxService } from '@/utils/api';

export default function CadastrarBoxPage() {
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD

    // Estado inicial para o formulário
    const initialState: BoxRequestDto = {
        nome: '',
        status: 'L', // 'L' (Livre) ou 'O' (Ocupado)
        dataEntrada: today,
        dataSaida: today,
        observacao: '',
    };

    const [formData, setFormData] = useState<BoxRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false); // Para controlar o estado de submissão (salvando...)
    const [error, setError] = useState<string | null>(null); // Para exibir mensagens de erro
    const [success, setSuccess] = useState<string | null>(null); // Para exibir mensagens de sucesso

    // Handler para mudanças nos inputs do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handler para o envio do formulário
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Evita o recarregamento padrão da página
        setIsLoading(true); // Ativa o estado de loading
        setError(null); // Limpa mensagens de erro anteriores
        setSuccess(null); // Limpa mensagens de sucesso anteriores

        try {
            // Chama o serviço para criar um novo box
            const createdBox: BoxResponseDto = await BoxService.create(formData);
            setSuccess(`Box "${createdBox.nome}" (ID: ${createdBox.idBox}) cadastrado com sucesso!`);
            setFormData(initialState); // Limpa o formulário após o sucesso
            setTimeout(() => setSuccess(null), 5000); // Limpa a mensagem de sucesso após 5 segundos
        } catch (err: any) {
            // Captura a mensagem de erro do backend (se disponível) ou uma mensagem genérica
            setError(err.response?.data?.message || err.message || 'Falha ao cadastrar box.');
            console.error("Erro detalhado:", err);
        } finally {
            setIsLoading(false); // Desativa o estado de loading
        }
    };

    return (
        <>
            <NavBar active="boxes-cadastrar" /> {/* Marca 'boxes-cadastrar' como ativo na NavBar */}
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdAddCircleOutline className="text-3xl text-sky-400" /> Novo Box
                    </h1>

                    {/* Mensagens de Erro e Sucesso */}
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

                    {/* Formulário de Cadastro */}
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
                            <label htmlFor="status" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                <Info size={16} /> Status:
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full p-2 h-10 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="L">Livre</option>
                                <option value="O">Ocupado</option>
                            </select>
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

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Box'}
                            </button>
                            <Link href="/box/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            {/* Estilos globais para input de data */}
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}