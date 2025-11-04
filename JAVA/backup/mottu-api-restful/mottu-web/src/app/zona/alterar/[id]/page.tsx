// src/app/zona/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Tag, Calendar, Text, Loader2, AlertCircle } from 'lucide-react';
import '@/types/styles/neumorphic.css';
import '@/styles/neumorphic.css';

// Interfaces dos DTOs
import { ZonaRequestDto, ZonaResponseDto } from '@/types/zona';
import { ZonaService } from '@/utils/api';

export default function AlterarZonaPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;
    
    // Parâmetros da URL para contexto do pátio
    const patioId = searchParams.get('patioId');
    const patioStatus = searchParams.get('patioStatus');

    const [formData, setFormData] = useState<ZonaRequestDto>({
        nome: '', dataEntrada: '', dataSaida: '', observacao: ''
    });

    const [isLoading, setIsLoading] = useState(false); // Para submissão
    const [isFetching, setIsFetching] = useState(true); // Para carregar dados iniciais
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Função para buscar os dados da zona ao carregar a página
    useEffect(() => {
        if (!id) {
            setError("ID da zona não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchZonaData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: ZonaResponseDto = await ZonaService.getById(id);
                setFormData({
                    nome: data.nome,
                    dataEntrada: data.dataEntrada,
                    dataSaida: data.dataSaida,
                    observacao: data.observacao || '',
                });
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados da zona.");
                console.error("Erro detalhado no fetch inicial:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchZonaData();
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
            setError("ID da zona inválido para atualização.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            let updatedZona: ZonaResponseDto;
            
            // Se temos parâmetros do pátio, usar o método hierárquico
            if (patioId && patioStatus) {
                updatedZona = await ZonaService.updatePorPatio(
                    parseInt(patioId), 
                    patioStatus, 
                    id, 
                    formData
                );
            } else {
                // Fallback para método tradicional
                updatedZona = await ZonaService.update(id, formData);
            }
            
            setSuccess(`Zona "${updatedZona.nome}" (ID: ${updatedZona.idZona}) atualizada com sucesso!`);
            setTimeout(() => {
                setSuccess(null);
                // Voltar para o gerenciamento com contexto do pátio se disponível
                if (patioId && patioStatus) {
                    router.push(`/gerenciamento-patio?patioId=${patioId}&patioStatus=${patioStatus}&zonaId=${id}`);
                } else {
                    router.push('/gerenciamento-patio');
                }
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao atualizar zona.');
            console.error("Erro detalhado na atualização:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <>
                <main className="flex justify-center items-center min-h-screen">
                    <div className="flex flex-col items-center gap-2 text-white">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" />
                        <span>Carregando dados da zona...</span>
                    </div>
                </main>
            </>
        );
    }

    if (error && !isFetching && (!formData.nome || formData.nome === '')) {
        return (
            <>
                <main className="flex justify-center items-center min-h-screen p-4">
                    <div className="text-center bg-red-900/50 p-8 rounded-lg">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                        <p className="mt-4 text-red-400">{error}</p>
                        <Link 
                            href={patioId && patioStatus 
                                ? `/gerenciamento-patio?patioId=${patioId}&patioStatus=${patioStatus}` 
                                : '/gerenciamento-patio'
                            } 
                            className="mt-4 inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Voltar ao Gerenciamento
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container mx-auto neumorphic-container p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                                <Tag size={32} className="text-emerald-400" />
                                Alterar Zona (ID: {id})
                            </h1>
                            <p className="text-slate-200 mt-1">Edite as informações da zona</p>
                        </div>
                        {/* Botão de voltar removido do topo para evitar duplicidade; mantido apenas no rodapé do formulário */}
                    </div>

                    <div className="neumorphic-container">

                    

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="nome" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                    <Tag size={16} className="text-emerald-500" /> Nome:
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    maxLength={50}
                                    className="neumorphic-input h-10"
                                />
                            </div>

                            <div>
                                <label htmlFor="dataEntrada" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                    <Calendar size={16} className="text-blue-500" /> Data Entrada:
                                </label>
                                <input
                                    type="date"
                                    id="dataEntrada"
                                    name="dataEntrada"
                                    value={formData.dataEntrada}
                                    onChange={handleChange}
                                    required
                                    className="neumorphic-input h-10 date-input-fix"
                                />
                            </div>

                            <div>
                                <label htmlFor="dataSaida" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                    <Calendar size={16} className="text-blue-500" /> Data Saída:
                                </label>
                                <input
                                    type="date"
                                    id="dataSaida"
                                    name="dataSaida"
                                    value={formData.dataSaida}
                                    onChange={handleChange}
                                    required
                                    className="neumorphic-input h-10 date-input-fix"
                                />
                            </div>

                            <div>
                                <label htmlFor="observacao" className="flex items-center gap-1 block mb-1 text-sm font-medium text-slate-300">
                                    <Text size={16} className="text-purple-500" /> Observação:
                                </label>
                                <textarea
                                    id="observacao"
                                    name="observacao"
                                    rows={3}
                                    value={formData.observacao}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="neumorphic-textarea"
                                />
                            </div>

                            {/* Mensagens acima dos botões */}
                            <div className="mt-6 space-y-3">
                                {error && (
                                    <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                                        <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                                    </div>
                                )}
                                {success && (
                                    <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700">
                                        <MdCheckCircle className="text-xl" /> <span>{success}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    className={`btn btn-primary-green ${isLoading || isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading || isFetching}
                                >
                                    <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                                <Link 
                                    href={patioId && patioStatus 
                                        ? `/gerenciamento-patio?patioId=${patioId}&patioStatus=${patioStatus}` 
                                        : '/gerenciamento-patio'
                                    } 
                                    className="btn btn-ghost"
                                >
                                    <MdArrowBack size={20} className="text-blue-600"/> Voltar ao Gerenciamento
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.2); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: #6b7280; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #111827 !important; }
                input[type="date"]::-webkit-datetime-edit { color: #111827; }
            `}</style>
        </>
    );
}