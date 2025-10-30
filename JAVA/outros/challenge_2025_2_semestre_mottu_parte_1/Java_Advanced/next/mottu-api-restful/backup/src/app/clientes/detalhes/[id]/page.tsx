// src/app/clientes/detalhes/[id]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto } from '@/types/cliente';
import { Loader2, AlertCircle } from 'lucide-react';
// Ícones substituídos por Ionicons coloridos
import '@/styles/neumorphic.css';

export default function DetalhesClientePage() {
    const params = useParams();
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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
            <NavBar active="clientes" />
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/clientes/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><i className="ion-ios-arrow-back mr-2"></i> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!cliente) return null;

    return (
        <>
            <NavBar active="clientes" />
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{cliente.nome} {cliente.sobrenome}</h1>
                            <p className="text-slate-300">Detalhes do Cliente (ID: {cliente.idCliente})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/clientes/listar" className="neumorphic-button">
                                <i className="ion-ios-arrow-back mr-2"></i> Voltar
                            </Link>
                            <Link href={`/clientes/alterar/${cliente.idCliente}`} className="neumorphic-button-green">
                                <i className="ion-ios-create mr-2"></i> Editar
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Dados Pessoais */}
                        <div className="neumorphic-fieldset p-6">
                            <legend className="neumorphic-legend flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-person mr-2 text-blue-500 text-xl"></i> Dados Pessoais
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-document text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>CPF:</strong> {cliente.cpf}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-calendar text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Data de Nasc.:</strong> {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-person-add text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Sexo:</strong> {cliente.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-people text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Estado Civil:</strong> {cliente.estadoCivil}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-briefcase text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Profissão:</strong> {cliente.profissao}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-time text-blue-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Data Cadastro:</strong> {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div className="neumorphic-fieldset p-6">
                            <legend className="neumorphic-legend flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-call mr-2 text-green-500 text-xl"></i> Contato
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-mail text-green-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Email:</strong> {cliente.contatoResponseDto.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-phone-portrait text-green-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Celular:</strong> {cliente.contatoResponseDto.celular}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-phone text-green-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Telefone:</strong> ({cliente.contatoResponseDto.ddd}) {cliente.contatoResponseDto.telefone1}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-globe text-green-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>DDI:</strong> +{cliente.contatoResponseDto.ddi}</span>
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="neumorphic-fieldset p-6">
                            <legend className="neumorphic-legend flex items-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-location mr-2 text-red-500 text-xl"></i> Endereço
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-pricetag text-red-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>CEP:</strong> {cliente.enderecoResponseDto.cep}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-home text-red-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Logradouro:</strong> {cliente.enderecoResponseDto.logradouro}, {cliente.enderecoResponseDto.numero}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-navigate text-red-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Bairro:</strong> {cliente.enderecoResponseDto.bairro}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-map text-red-500"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Cidade/UF:</strong> {cliente.enderecoResponseDto.cidade} / {cliente.enderecoResponseDto.estado}</span>
                                </div>
                                {cliente.enderecoResponseDto.complemento && (
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-information-circle text-red-500"></i>
                                        <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Complemento:</strong> {cliente.enderecoResponseDto.complemento}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}