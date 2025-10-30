// src/app/zona/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdInfoOutline } from 'react-icons/md';
import { Trash2, AlertCircle, Loader2, Stethoscope } from 'lucide-react';

// Interfaces dos DTOs
import { ZonaResponseDto } from '@/types/zona';
import { ZonaService } from '@/utils/api';

export default function DeletarZonaPage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [zonaInfo, setZonaInfo] = useState<ZonaResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
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

    // Efeito para buscar os dados da zona para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID da zona não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchZonaData = async () => {
            setIsLoadingInfo(true);
            setError(null);
            try {
                const data: ZonaResponseDto = await ZonaService.getById(id);
                setZonaInfo(data);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setError(`Zona com ID ${id} não encontrada(a) ou já foi excluída(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados da zona para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção:", err);
                setZonaInfo(null);
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchZonaData();
    }, [id]);

    // Handler para confirmar a deleção
    const handleConfirmDelete = async () => {
        if (id === null || !zonaInfo) {
            setError("Não é possível excluir: ID inválido ou dados da zona não carregados.");
            return;
        }
        setIsDeleting(true);
        setError(null);

        try {
            await ZonaService.delete(id);
            console.log(`Zona ID ${id} excluída com sucesso.`);
            router.push('/zona/listar?deleted=true');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Falha ao excluir zona.");
            console.error("Erro detalhado na deleção:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler para cancelar a deleção (volta para a lista)
    const handleCancel = () => {
        router.push('/zona/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="zona-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Carregando dados para confirmação...
                    </p>
                </main>
            </>
        );
    }

    if (error && !zonaInfo) {
        return (
            <>
                <NavBar active="zona-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" /> Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdInfoOutline size={20} /> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="zona-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir a zona abaixo? Esta ação não pode ser desfeita.</p>

                    {zonaInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID da Zona:</strong> {zonaInfo.idZona}</p>
                            <p><strong>Nome:</strong> {zonaInfo.nome}</p>
                            
                            <p><strong>Observação:</strong> {zonaInfo.observacao || '-'}</p>
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