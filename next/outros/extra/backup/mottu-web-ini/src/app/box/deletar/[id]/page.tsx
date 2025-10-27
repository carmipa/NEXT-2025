// src/app/box/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdInfoOutline } from 'react-icons/md';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

// Interfaces dos DTOs
import { BoxResponseDto } from '@/types/box';
import { BoxService } from '@/utils/api';

export default function DeletarBoxPage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [boxInfo, setBoxInfo] = useState<BoxResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true); // Para carregar os dados do box a ser deletado
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

    // Efeito para buscar os dados do box para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID do box não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchBoxData = async () => {
            setIsLoadingInfo(true);
            setError(null); // Limpa erros anteriores
            try {
                const data: BoxResponseDto = await BoxService.getById(id);
                setBoxInfo(data);
            } catch (err: any) {
                // Se for 404, indica que o recurso não foi encontrado (talvez já deletado)
                if (err.response && err.response.status === 404) {
                    setError(`Box com ID ${id} não encontrado(a) ou já foi excluído(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados do box para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção:", err);
                setBoxInfo(null); // Garante que o info esteja vazio em caso de erro
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchBoxData();
    }, [id]);

    // Handler para confirmar a deleção
    const handleConfirmDelete = async () => {
        if (id === null || !boxInfo) { // Verifica se o ID é válido e se os dados do box foram carregados
            setError("Não é possível excluir: ID inválido ou dados do box não carregados.");
            return;
        }
        setIsDeleting(true); // Ativa o estado de deleção
        setError(null); // Limpa erros anteriores

        try {
            await BoxService.delete(id);
            console.log(`Box ID ${id} excluído com sucesso.`);
            // Redireciona para a página de listagem após o sucesso
            router.push('/box/listar?deleted=true'); // Adiciona query param para possível mensagem de sucesso na lista
        } catch (err: any) {
            // Captura e exibe erros durante a deleção
            setError(err.response?.data?.message || err.message || "Falha ao excluir box.");
            console.error("Erro detalhado na deleção:", err);
        } finally {
            setIsDeleting(false); // Desativa o estado de deleção
        }
    };

    // Handler para cancelar a deleção (volta para a lista)
    const handleCancel = () => {
        router.push('/box/listar');
    };

    // Renderização condicional para o estado de carregamento inicial dos dados do box
    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="boxes-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Carregando dados para confirmação...
                    </p>
                </main>
            </>
        );
    }

    // Renderização condicional para erro no carregamento inicial ou box não encontrado
    if (error && !boxInfo) {
        return (
            <>
                <NavBar active="boxes-deletar" />
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

    // Renderização da página de confirmação de deleção
    return (
        <>
            <NavBar active="boxes-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o seguinte box? Esta ação não pode ser desfeita.</p>

                    {boxInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Box:</strong> {boxInfo.idBox}</p>
                            <p><strong>Nome:</strong> {boxInfo.nome}</p>
                            <p><strong>Status:</strong> {boxInfo.status === 'L' ? 'Livre' : 'Ocupado'}</p>
                            <p><strong>Data Entrada:</strong> {formatDate(boxInfo.dataEntrada)}</p>
                            <p><strong>Data Saída:</strong> {formatDate(boxInfo.dataSaida)}</p>
                            <p><strong>Observação:</strong> {boxInfo.observacao || '-'}</p>
                        </div>
                    )}

                    {error && ( // Exibe erro se ocorrer durante a tentativa de exclusão
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