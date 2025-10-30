// src/app/clientes/deletar/[id]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto } from '@/types/cliente';
import { Loader2, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';

export default function DeletarClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [cliente, setCliente] = useState<ClienteResponseDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do cliente inválido.");
            setIsLoading(false);
            return;
        }
        const fetchCliente = async () => {
            setIsLoading(true);
            try {
                const data = await ClienteService.getById(id);
                setCliente(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Cliente não encontrado ou erro ao carregar dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCliente();
    }, [id]);

    const handleConfirmDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        setError(null);
        try {
            await ClienteService.delete(id);
            // Idealmente, usar um state management ou query param para mostrar a msg de sucesso na página de listagem
            router.push('/clientes/listar');
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao excluir cliente.");
            setIsDeleting(false);
        }
    };

    if (isLoading) return (
        <>
            <NavBar active="clientes" />
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !cliente) return (
        <>
            <NavBar active="clientes" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/clientes/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!cliente) return null;

    return (
        <>
            <NavBar active="clientes" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-lg mx-auto bg-slate-900 border border-red-500/50 p-6 md:p-8 rounded-lg shadow-xl text-center">
                    <Trash2 className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Confirmar Exclusão</h1>
                    <p className="text-slate-300 mb-6">
                        Tem certeza que deseja excluir permanentemente o cliente <strong className="text-white">{cliente.nome} {cliente.sobrenome}</strong> (CPF: {cliente.cpf})?
                    </p>

                    {error && <div className="mb-4 text-red-400 p-3 rounded-md bg-red-900/50">{error}</div>}

                    <div className="flex justify-center gap-4">
                        <Link href="/clientes/listar" className="px-6 py-2 font-semibold text-slate-800 bg-gray-300 rounded-md hover:bg-gray-400">
                            Cancelar
                        </Link>
                        <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                            {isDeleting ? <><Loader2 className="animate-spin h-5 w-5"/> Excluindo...</> : <>Excluir</>}
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}