"use client";

import { useState, FormEvent,  } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSave, MdArrowBack, } from 'react-icons/md';
import { Loader2, Bot } from 'lucide-react';
// IMPORTANTE: Agora usamos o BoxService real que acabamos de modificar
import { BoxService } from '@/utils/api';

const zonas = [
    { label: "Zona A (Nomes: Z-A-B...)", prefix: "Z-A-B" },
    { label: "Zona B (Nomes: Z-B-B...)", prefix: "Z-B-B" },
    { label: "Zona C (Nomes: Z-C-B...)", prefix: "Z-C-B" },
];

export default function GerarBoxesPage() {
    const [prefixo, setPrefixo] = useState(zonas[0].prefix);
    const [quantidade, setQuantidade] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // ALTERADO: Agora chama a função real do BoxService
            const successMessage = await BoxService.gerarEmLote(prefixo, quantidade);
            setSuccess(successMessage);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao gerar boxes.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="box" />
            <main className="container mx-auto px-4 py-12 min-h-screen text-white">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center text-white">
                        <Bot className="text-3xl" /> Gerador de Boxes em Lote
                    </h1>

                    {success && <div className="mb-4 text-center p-3 bg-green-200 text-green-900 rounded-md">{success}</div>}
                    {error && <div className="mb-4 text-center p-3 bg-red-200 text-red-900 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="zona" className="block mb-1 text-sm font-medium text-white">
                                Selecione a Zona para Gerar os Boxes
                            </label>
                            <select
                                id="zona"
                                value={prefixo}
                                onChange={(e) => setPrefixo(e.target.value)}
                                className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            >
                                {zonas.map(z => <option key={z.prefix} value={z.prefix}>{z.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="quantidade" className="block mb-1 text-sm font-medium text-white">
                                Quantidade de Boxes a Gerar
                            </label>
                            <input
                                id="quantidade"
                                type="number"
                                value={quantidade}
                                onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 0)}
                                min="1"
                                max="500"
                                className="w-full p-2 h-10 rounded bg-white text-slate-900"
                                required
                            />
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin"/> : <MdSave size={20} />}
                                {isLoading ? 'Gerando...' : `Gerar ${quantidade} Boxes`}
                            </button>
                            <Link href="/box/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}