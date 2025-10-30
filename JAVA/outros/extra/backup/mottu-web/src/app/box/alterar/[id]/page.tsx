// src/app/box/alterar/[id]/page.tsx
"use client";
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Tag, Calendar, Text, Info, Loader2, AlertCircle } from 'lucide-react';
import { BoxRequestDto, BoxResponseDto } from '@/types/box';
import { BoxService } from '@/utils/api';

export default function AlterarBoxPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [formData, setFormData] = useState<BoxRequestDto>({
        nome: '', status: '', dataEntrada: '', dataSaida: '', observacao: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do box não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchBoxData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: BoxResponseDto = await BoxService.getById(id);
                setFormData({
                    nome: data.nome,
                    status: data.status,
                    dataEntrada: data.dataEntrada,
                    dataSaida: data.dataSaida,
                    observacao: data.observacao || '',
                });
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados do box.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchBoxData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (id === null) { setError("ID do box inválido para atualização."); return; }
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedBox: BoxResponseDto = await BoxService.update(id, formData);
            setSuccess(`Box "${updatedBox.nome}" (ID: ${updatedBox.idBox}) atualizado com sucesso!`);
            setTimeout(() => {
                setSuccess(null);
                router.push('/box/listar');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao atualizar box.');
        } finally {
            setIsLoading(false);
        }
    };

    // ... (código de loading e erro inicial permanece o mesmo)

    return (
        <>
            <NavBar active="box" />
            <main className="container mx-auto px-4 py-12 bg-black min-h-screen text-white">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdEdit className="text-3xl text-white" /> Alterar Box (ID: {id})
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="group">
                            <label htmlFor="nome" className="flex items-center gap-1 block mb-1 text-sm font-medium text-white">
                                <Tag size={16} /> Nome: <span className="text-red-400">*</span>
                            </label>
                            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required maxLength={50} placeholder="Ex: Box A-01" className="w-full p-2 h-10 rounded bg-white text-slate-900 peer required:invalid:border-red-500" />
                            <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                        </div>
                        <div>
                            <label htmlFor="status" className="flex items-center gap-1 block mb-1 text-sm font-medium text-white">
                                <Info size={16} /> Status: <span className="text-red-400">*</span>
                            </label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-white text-slate-900">
                                <option value="L">Livre</option>
                                <option value="O">Ocupado</option>
                            </select>
                        </div>
                        <div className="group">
                            <label htmlFor="dataEntrada" className="flex items-center gap-1 block mb-1 text-sm font-medium text-white">
                                <Calendar size={16} /> Data Entrada: <span className="text-red-400">*</span>
                            </label>
                            <input type="date" id="dataEntrada" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-white text-slate-900 date-input-fix peer" />
                            <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                        </div>
                        <div className="group">
                            <label htmlFor="dataSaida" className="flex items-center gap-1 block mb-1 text-sm font-medium text-white">
                                <Calendar size={16} /> Data Saída: <span className="text-red-400">*</span>
                            </label>
                            <input type="date" id="dataSaida" name="dataSaida" value={formData.dataSaida} onChange={handleChange} required className="w-full p-2 h-10 rounded bg-white text-slate-900 date-input-fix peer" />
                            <p className="mt-1 text-xs text-slate-300 invisible peer-invalid:visible">Campo obrigatório.</p>
                        </div>
                        <div>
                            <label htmlFor="observacao" className="flex items-center gap-1 block mb-1 text-sm font-medium text-white">
                                <Text size={16} /> Observação:
                            </label>
                            <textarea id="observacao" name="observacao" rows={3} value={formData.observacao} onChange={handleChange} maxLength={100} placeholder="Alguma observação sobre o box..." className="w-full p-2 rounded bg-white text-slate-900" />
                        </div>

                        {/* Bloco de Mensagens Movido para cá */}
                        <div className="mt-6 space-y-3">
                            {error && (
                                <div className="relative text-red-200 bg-red-800/80 p-4 pr-10 rounded border border-red-600" role="alert">
                                    <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                                    <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-100" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center justify-center gap-2 text-green-900 p-3 rounded bg-green-200 border border-green-400">
                                    <MdCheckCircle className="text-xl" /> <span>{success}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-opacity duration-300 disabled:opacity-50" disabled={isLoading || isFetching}>
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link href="/box/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; }
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; }
            `}</style>
        </>
    );
}