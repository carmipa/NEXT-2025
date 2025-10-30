// src/app/clientes/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdWarningAmber, MdPeopleAlt, MdInfoOutline } from 'react-icons/md';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';

// Interfaces dos DTOs
import { ClienteResponseDto } from '@/types/cliente';
import { ClienteService } from '@/utils/api';

export default function DeletarClientePage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [clienteInfo, setClienteInfo] = useState<ClienteResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true); // Para carregar os dados do cliente a ser deletado
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

    // Efeito para buscar os dados do cliente para confirmação
    useEffect(() => {
        if (!id) {
            setError("ID do cliente não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchClienteData = async () => {
            setIsLoadingInfo(true);
            setError(null); // Limpa erros anteriores
            try {
                const data: ClienteResponseDto = await ClienteService.getById(id);
                setClienteInfo(data);
            } catch (err: any) {
                // Se for 404, indica que o recurso não foi encontrado (talvez já deletado)
                if (err.response && err.response.status === 404) {
                    setError(`Cliente com ID ${id} não encontrado(a) ou já foi excluído(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados do cliente para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção:", err);
                setClienteInfo(null); // Garante que o info esteja vazio em caso de erro
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchClienteData();
    }, [id]);

    // Handler para confirmar a deleção
    const handleConfirmDelete = async () => {
        if (id === null || !clienteInfo) {
            setError("Não é possível excluir: ID inválido ou dados do cliente não carregados.");
            return;
        }
        setIsDeleting(true);
        setError(null);

        try {
            await ClienteService.delete(id);
            console.log(`Cliente ID ${id} excluído com sucesso.`);
            router.push('/clientes/listar?deleted=true');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Falha ao excluir cliente.");
            console.error("Erro detalhado na deleção:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler para cancelar a deleção (volta para a lista)
    const handleCancel = () => {
        router.push('/clientes/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="clientes-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <p className="text-center text-sky-300 py-10 text-xl flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" /> Carregando dados para confirmação...
                    </p>
                </main>
            </>
        );
    }

    if (error && !clienteInfo) {
        return (
            <>
                <NavBar active="clientes-deletar" />
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
            <NavBar active="clientes-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-[#012A46] text-white px-4 py-10">
                <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500">
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-red-400">
                        <Trash2 size={28} className="text-red-400" /> Confirmar Exclusão
                    </h2>
                    <p className="text-center mb-6 text-slate-300">Tem certeza que deseja excluir o cliente abaixo? Esta ação não pode ser desfeita.</p>

                    {clienteInfo && (
                        <div className="text-slate-300 text-sm mb-8 border-l-2 border-red-500 pl-4 bg-slate-800 p-4 rounded">
                            <p><strong>ID do Cliente:</strong> {clienteInfo.idCliente}</p>
                            <p><strong>Nome Completo:</strong> {`${clienteInfo.nome} ${clienteInfo.sobrenome}`}</p>
                            <p><strong>CPF:</strong> {clienteInfo.cpf}</p>
                            <p><strong>Email:</strong> {clienteInfo.contatoResponseDto?.email || '-'}</p>
                            <p><strong>Cidade/UF:</strong> {`${clienteInfo.enderecoResponseDto?.cidade || '-'} / ${clienteInfo.enderecoResponseDto?.estado || '-'}`}</p>
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