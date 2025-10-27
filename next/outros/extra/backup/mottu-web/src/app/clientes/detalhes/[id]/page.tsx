// src/app/clientes/detalhes/[id]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto } from '@/types/cliente';
import { Loader2, AlertCircle, User, Mail, MapPin, Briefcase, Phone, Home, Edit, ArrowLeft } from 'lucide-react';

export default function DetalhesClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [cliente, setCliente] = useState<ClienteResponseDto | null>(null);
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

    if (isLoading) return (
        <>
            <NavBar active="clientes" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
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
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{cliente.nome} {cliente.sobrenome}</h1>
                            <p className="text-slate-300">Detalhes do Cliente (ID: {cliente.idCliente})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/clientes/listar" className="flex items-center gap-2 px-4 py-2 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <ArrowLeft size={18} /> Voltar
                            </Link>
                            <Link href={`/clientes/alterar/${cliente.idCliente}`} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                <Edit size={18} /> Editar
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Dados Pessoais */}
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-3 text-slate-100 flex items-center"><User className="mr-2"/>Dados Pessoais</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <p><strong>CPF:</strong> {cliente.cpf}</p>
                                <p><strong>Data de Nasc.:</strong> {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Sexo:</strong> {cliente.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
                                <p><strong>Estado Civil:</strong> {cliente.estadoCivil}</p>
                                <p><strong>Profissão:</strong> {cliente.profissao}</p>
                                <p><strong>Data Cadastro:</strong> {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-3 text-slate-100 flex items-center"><Phone className="mr-2"/>Contato</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <p><strong>Email:</strong> {cliente.contatoResponseDto.email}</p>
                                <p><strong>Celular:</strong> {cliente.contatoResponseDto.celular}</p>
                                <p><strong>Telefone:</strong> ({cliente.contatoResponseDto.ddd}) {cliente.contatoResponseDto.telefone1}</p>
                                <p><strong>DDI:</strong> +{cliente.contatoResponseDto.ddi}</p>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-3 text-slate-100 flex items-center"><MapPin className="mr-2"/>Endereço</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <p><strong>CEP:</strong> {cliente.enderecoResponseDto.cep}</p>
                                <p><strong>Logradouro:</strong> {cliente.enderecoResponseDto.logradouro}, {cliente.enderecoResponseDto.numero}</p>
                                <p><strong>Bairro:</strong> {cliente.enderecoResponseDto.bairro}</p>
                                <p><strong>Cidade/UF:</strong> {cliente.enderecoResponseDto.cidade} / {cliente.enderecoResponseDto.estado}</p>
                                {cliente.enderecoResponseDto.complemento && <p><strong>Complemento:</strong> {cliente.enderecoResponseDto.complemento}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}