// src/app/veiculo/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdDirectionsCar } from 'react-icons/md';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

// Interfaces dos DTOs
import { VeiculoResponseDto } from '@/types/veiculo';
import { VeiculoService } from '@/utils/api';

export default function DeletarVeiculoPage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [veiculoInfo, setVeiculoInfo] = useState<VeiculoResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efeito para buscar os dados do veículo para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID do veículo não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchVeiculoData = async () => {
            setIsLoadingInfo(true);
            setError(null);
            try {
                const data: VeiculoResponseDto = await VeiculoService.getById(id);
                setVeiculoInfo(data);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setError(`Veículo com ID ${id} não encontrado(a) ou já foi excluído(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados do veículo para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção:", err);
                setVeiculoInfo(null);
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchVeiculoData();
    }, [id]);

    // Handler para confirmar a deleção
    const handleConfirmDelete = async () => {
        if (id === null || !veiculoInfo) {
            setError("Não é possível excluir: ID inválido ou dados do veículo não carregados.");
            return;
        }
        setIsDeleting(true);
        setError(null);

        try {
            await VeiculoService.delete(id);
            console.log(`Veículo ID ${id} excluído com sucesso.`);
            router.push('/veiculo/listar?deleted=true');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Falha ao excluir veículo.");
            console.error("Erro detalhado na deleção:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler para cancelar a deleção (volta para a lista)
    const handleCancel = () => {
        router.push('/veiculo/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="veiculo-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Carregando dados para confirmação...
                    </p>
                </main>
            </>
        );
    }

    if (error && !veiculoInfo) {
        return (
            <>
                <NavBar active="veiculo-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" /> Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdDirectionsCar className="text-2xl" /> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="veiculo-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o veículo abaixo? Esta ação não pode ser desfeita.</p>

                    {veiculoInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Veículo:</strong> {veiculoInfo.idVeiculo}</p>
                            <p><strong>Placa:</strong> {veiculoInfo.placa}</p>
                            <p><strong>Modelo:</strong> {veiculoInfo.modelo}</p>
                            <p><strong>Fabricante:</strong> {veiculoInfo.fabricante}</p>
                            <p><strong>Ano:</strong> {veiculoInfo.ano}</p>
                            <p><strong>Combustível:</strong> {veiculoInfo.combustivel}</p>
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