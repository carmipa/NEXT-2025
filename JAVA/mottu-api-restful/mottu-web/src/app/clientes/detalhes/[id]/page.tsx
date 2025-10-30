// src/app/clientes/detalhes/[id]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClienteService } from '@/utils/api';
import { ClienteResponseDto } from '@/types/cliente';
import { Loader2, AlertCircle, Printer } from 'lucide-react';
// Ícones substituídos por Ionicons coloridos
import '@/types/styles/neumorphic.css';

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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error) return (
        <>
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


    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style jsx>{`
                .print-only {
                    display: none;
                }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                        font-size: 12px !important;
                        line-height: 1.4 !important;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-only {
                        display: block !important;
                    }
                    
                    /* Esconder footer na impressão */
                    footer, .footer {
                        display: none !important;
                    }
                    
                    .neumorphic-container {
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        max-width: none !important;
                    }
                    
                    .neumorphic-fieldset {
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                        background: white !important;
                        margin-bottom: 15px !important;
                        padding: 15px !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .neumorphic-legend {
                        background: #f5f5f5 !important;
                        border: 1px solid #ddd !important;
                        padding: 5px 10px !important;
                        margin-bottom: 10px !important;
                        font-weight: bold !important;
                        color: black !important;
                    }
                    
                    .text-white, .text-slate-300 {
                        color: black !important;
                    }
                    
                    .text-gray-800 {
                        color: black !important;
                    }
                    
                    .grid {
                        display: block !important;
                    }
                    
                    .grid > div {
                        margin-bottom: 8px !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .flex {
                        display: block !important;
                    }
                    
                    .flex.items-center {
                        margin-bottom: 5px !important;
                    }
                    
                    h1, h2, h3 {
                        color: black !important;
                        page-break-after: avoid !important;
                    }
                    
                    .print-title {
                        display: block !important;
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 24px;
                        font-weight: bold;
                        color: black !important;
                        border-bottom: 2px solid #333 !important;
                        padding-bottom: 10px !important;
                    }
                    
                    .print-title h1 {
                        font-size: 20px !important;
                        margin-bottom: 5px !important;
                    }
                    
                    .print-title p {
                        font-size: 12px !important;
                        color: #666 !important;
                        margin: 0 !important;
                    }
                    
                    .print-date {
                        text-align: center;
                        margin-bottom: 30px;
                        font-size: 12px;
                        color: #666;
                    }
                    
                    /* Garantir que todo conteúdo seja visível */
                    .space-y-6 > * {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>
            <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-4 sm:p-6 md:p-8">
                    {/* Título para impressão - só aparece na impressão */}
                    <div className="print-only">
                        <h1>Relatório de Cliente - Mottu Oficina</h1>
                        <p>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                                <i className="ion-ios-person mr-2 sm:mr-3 text-2xl sm:text-3xl text-pink-400"></i>
                                {cliente.nome} {cliente.sobrenome}
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base">Detalhes do Cliente (ID: {cliente.idCliente})</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto no-print">
                            <Link href="/clientes/listar" className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-arrow-back text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">VOLTAR</span>
                                </div>
                            </Link>
                            <Link href={`/clientes/alterar/${cliente.idCliente}`} className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-create text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">EDITAR</span>
                                </div>
                            </Link>
                            <button 
                                onClick={handlePrint}
                                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-400 hover:border-purple-300 flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <Printer className="w-4 h-4" />
                                    <span className="text-sm lg:text-base font-black">IMPRIMIR</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* Dados Pessoais */}
                        <div className="neumorphic-fieldset p-4 sm:p-6">
                            <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                <i className="ion-ios-person mr-2 text-cyan-400 text-lg sm:text-xl"></i> Dados Pessoais
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-document text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>CPF:</strong> {cliente.cpf}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-calendar text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Data de Nasc.:</strong> {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-person-add text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Sexo:</strong> {cliente.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-people text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Estado Civil:</strong> {cliente.estadoCivil}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-briefcase text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Profissão:</strong> {cliente.profissao}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-time text-blue-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Data Cadastro:</strong> {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dados de Contato */}
                        <div className="neumorphic-fieldset p-4 sm:p-6">
                            <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                <i className="ion-ios-call mr-2 text-emerald-400 text-lg sm:text-xl"></i> Contato
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-mail text-green-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Email:</strong> {cliente.contatoResponseDto.email}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-phone-portrait text-green-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Celular:</strong> {cliente.contatoResponseDto.celular}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-phone text-green-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Telefone:</strong> ({cliente.contatoResponseDto.ddd}) {cliente.contatoResponseDto.telefone1}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-globe text-green-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>DDI:</strong> +{cliente.contatoResponseDto.ddi}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dados de CNH */}
                        {cliente.cnhResponseDto && (
                            <div className="neumorphic-fieldset p-4 sm:p-6">
                                <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                    <i className="ion-ios-card mr-2 text-purple-400 text-lg sm:text-xl"></i> Dados de CNH
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-document text-purple-500 text-sm sm:text-base"></i>
                                        <span className="text-gray-800 font-montserrat"><strong>Número de Registro:</strong> {cliente.cnhResponseDto.numeroRegistro}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-calendar text-purple-500 text-sm sm:text-base"></i>
                                        <span className="text-gray-800 font-montserrat"><strong>Data de Emissão:</strong> {new Date(cliente.cnhResponseDto.dataEmissao).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-calendar-outline text-purple-500 text-sm sm:text-base"></i>
                                        <span className="text-gray-800 font-montserrat"><strong>Data de Validade:</strong> {new Date(cliente.cnhResponseDto.dataValidade).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-car text-purple-500 text-sm sm:text-base"></i>
                                        <span className="text-gray-800 font-montserrat"><strong>Categoria:</strong> {cliente.cnhResponseDto.categoria}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Endereço */}
                        <div className="neumorphic-fieldset p-4 sm:p-6">
                            <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                <i className="ion-ios-location mr-2 text-rose-400 text-lg sm:text-xl"></i> Endereço
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-pricetag text-red-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>CEP:</strong> {cliente.enderecoResponseDto.cep}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-home text-red-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Logradouro:</strong> {cliente.enderecoResponseDto.logradouro}, {cliente.enderecoResponseDto.numero}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-navigate text-red-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Bairro:</strong> {cliente.enderecoResponseDto.bairro}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-map text-red-500 text-sm sm:text-base"></i>
                                    <span className="text-gray-800 font-montserrat"><strong>Cidade/UF:</strong> {cliente.enderecoResponseDto.cidade} / {cliente.enderecoResponseDto.estado}</span>
                                </div>
                                {cliente.enderecoResponseDto.complemento && (
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-information-circle text-red-500 text-sm sm:text-base"></i>
                                        <span className="text-gray-800 font-montserrat"><strong>Complemento:</strong> {cliente.enderecoResponseDto.complemento}</span>
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