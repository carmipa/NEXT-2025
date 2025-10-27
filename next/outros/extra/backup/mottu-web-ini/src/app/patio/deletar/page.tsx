// src/app/patio/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdLocationOn } from 'react-icons/md';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

// Interfaces dos DTOs
import { PatioResponseDto } from '@/types/patio';
import { PatioService } from '@/utils/api';

export default function DeletarPatioPage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [patioInfo, setPatioInfo] = useState<PatioResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true); // Para carregar os dados do pátio a ser deletado
    const [isDeleting, setIsDeleting] = useState(false); // Para o estado de deleção (excluindo...)
    const [error, setError] = useState<string | null>(null);

    // Função para formatar a data para exibição
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return 'Inválida';
        }
    };

    // Efeito para buscar os dados do pátio para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID do pátio não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchPatioData = async () => {
            setIsLoadingInfo(true);
            setError(null);
            try {
                const data: PatioResponseDto = await PatioService.getById(id);
                setPatioInfo(data);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setError(`Pátio com ID ${id} não encontrado(a) ou já foi excluído(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados do pátio para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção:", err);
                setPatioInfo(null);
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchPatioData();
    }, [id]);

    // Handler para confirmar a deleção
    const handleConfirmDelete = async () => {
        if (id === null || !patioInfo) {
            setError("Não é possível excluir: ID inválido ou dados do pátio não carregados.");
            return;
        }
        setIsDeleting(true);
        setError(null);

        try {
            await PatioService.delete(id);
            console.log(`Pátio ID ${id} excluído com sucesso.`);
            router.push('/patio/listar?deleted=true');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Falha ao excluir pátio.");
            console.error("Erro detalhado na deleção:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler para cancelar a deleção (volta para a lista)
    const handleCancel = () => {
        router.push('/patio/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="patio-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Carregando dados para confirmação...
                    </p>
                </main>
            </>
        );
    }

    if (error && !patioInfo) {
        return (
            <>
                <NavBar active="patio-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" /> Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="patio-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o pátio abaixo? Esta ação não pode ser desfeita.</p>

                    {patioInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Pátio:</strong> {patioInfo.idPatio}</p>
                            <p><strong>Nome:</strong> {patioInfo.nomePatio}</p>
                            <p><strong>Data Entrada:</strong> {formatDate(patioInfo.dataEntrada)}</p>
                            <p><strong>Data Saída:</strong> {formatDate(patioInfo.dataSaida)}</p>
                            <p><strong>Observação:</strong> {patioInfo.observacao || '-'}</p>
                        </div>
                    )}

                    {error && (
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-4">{error}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Excluindo...' : (<><MdDeleteForever size={20} /> Sim, Excluir</>)}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            disabled={isDeleting}
                        >
                            <MdCancel size={20} /> Não, Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}