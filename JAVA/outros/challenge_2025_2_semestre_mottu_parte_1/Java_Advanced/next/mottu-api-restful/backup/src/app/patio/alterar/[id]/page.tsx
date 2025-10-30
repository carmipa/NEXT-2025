// Caminho: src/app/patio/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { PatioService, ContatoService, EnderecoService, BoxService, ZonaService } from '@/utils/api';
import { PatioRequestDto, PatioResponseDto } from '@/types/patio';
import { ContatoResponseDto, ContatoRequestDto } from '@/types/contato';
import { EnderecoResponseDto, EnderecoRequestDto } from '@/types/endereco';
import { BoxResponseDto } from '@/types/box';
import { ZonaResponseDto } from '@/types/zona';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Building, MapPin, Grid3X3, ListChecks, Phone, Home } from 'lucide-react';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import EtapaPatio from '@/components/wizard-steps/EtapaPatio';
import EtapaContatos from '@/components/wizard-steps/EtapaContatos';
import EtapaLocalizacao from '@/components/wizard-steps/EtapaLocalizacao';
import EtapaZonas from '@/components/wizard-steps/EtapaZonas';
import EtapaBoxes from '@/components/wizard-steps/EtapaBoxes';

interface WizardData {
    // Etapa 1: Pátio
    patio: {
        nomePatio: string;
        status: string;
        observacao: string;
    };
    
    // Etapa 2: Contatos (objeto único para compatibilidade com componentes)
    contato: ContatoRequestDto;
    
    // Etapa 3: Localização (objeto único para compatibilidade com componentes)
    endereco: EnderecoRequestDto;
    dadosViaCep: {
        logradouro: string;
        bairro: string;
        cidade: string;
        estado: string;
        pais: string;
    };
    
    // Etapa 4: Zonas
    zonas: ZonaResponseDto[];
    
    // Etapa 5: Boxes
    boxes: BoxResponseDto[];
}

export default function AlterarPatioPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({
        patio: {
            nomePatio: '',
            status: 'A',
            observacao: ''
        },
        contato: {
            email: '',
            ddd: 11,
            ddi: 55,
            telefone1: '',
            telefone2: '',
            telefone3: '',
            celular: '',
            outro: '',
            observacao: ''
        },
        endereco: {
            cep: '',
            numero: 0,
            complemento: '',
            observacao: ''
        },
        dadosViaCep: {
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: '',
            pais: 'Brasil'
        },
        zonas: [],
        boxes: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [salvamentoConcluido, setSalvamentoConcluido] = useState(false);

    const [availableContatos, setAvailableContatos] = useState<ContatoResponseDto[]>([]);
    const [availableEnderecos, setAvailableEnderecos] = useState<EnderecoResponseDto[]>([]);
    const [patioOriginal, setPatioOriginal] = useState<PatioResponseDto | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do pátio inválido.");
            setIsFetching(false);
            return;
        }
        
        const fetchPatioData = async () => {
            setIsFetching(true);
            try {
                const [patioData, contatosData, enderecosData] = await Promise.all([
                    PatioService.getById(id),
                    ContatoService.listarTodos(),
                    EnderecoService.listarTodos()
                ]);

                // Carregar zonas e boxes usando o status correto do pátio
                console.log('🔍 Carregando zonas e boxes para pátio:', id, 'status:', patioData.status);
                const [zonasData, boxesData] = await Promise.all([
                    ZonaService.listarPorPatio(id, patioData.status),
                    BoxService.listarPorPatio(id, patioData.status)
                ]);
                console.log('🔍 Zonas carregadas:', zonasData);
                console.log('🔍 Boxes carregados:', boxesData);

                setPatioOriginal(patioData);
                setWizardData({
                    patio: {
                        nomePatio: patioData.nomePatio,
                        status: patioData.status,
                        observacao: patioData.observacao || ''
                    },
                    contato: patioData.contato ? {
                        email: patioData.contato.email,
                        ddd: patioData.contato.ddd,
                        ddi: patioData.contato.ddi,
                        telefone1: patioData.contato.telefone1,
                        telefone2: patioData.contato.telefone2 || '',
                        telefone3: patioData.contato.telefone3 || '',
                        celular: patioData.contato.celular,
                        outro: patioData.contato.outro || '',
                        observacao: patioData.contato.observacao || ''
                    } : {
                        email: '',
                        ddd: 11,
                        ddi: 55,
                        telefone1: '',
                        telefone2: '',
                        telefone3: '',
                        celular: '',
                        outro: '',
                        observacao: ''
                    },
                    endereco: patioData.endereco ? {
                        cep: patioData.endereco.cep,
                        numero: patioData.endereco.numero,
                        complemento: patioData.endereco.complemento || '',
                        observacao: patioData.endereco.observacao || ''
                    } : {
                        cep: '',
                        numero: 0,
                        complemento: '',
                        observacao: ''
                    },
                    dadosViaCep: patioData.endereco ? {
                        logradouro: patioData.endereco.logradouro || '',
                        bairro: patioData.endereco.bairro || '',
                        cidade: patioData.endereco.cidade || '',
                        estado: patioData.endereco.estado || '',
                        pais: patioData.endereco.pais || 'Brasil'
                    } : {
                        logradouro: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                        pais: 'Brasil'
                    },
                    zonas: zonasData.content || zonasData || [],
                    boxes: boxesData.content || boxesData || []
                });
                setAvailableContatos(contatosData);
                setAvailableEnderecos(enderecosData);
            } catch (err: any) {
                setError(err.response?.data?.message || "Falha ao carregar dados do pátio.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchPatioData();
    }, [id]);

    const handleWizardDataChange = (newData: Partial<WizardData>) => {
        setWizardData(prev => ({ ...prev, ...newData }));
    };

    const proximaEtapa = () => {
        if (etapaAtual < 5) {
            setEtapaAtual(etapaAtual + 1);
        }
    };

    const etapaAnterior = () => {
        if (etapaAtual > 1) {
            setEtapaAtual(etapaAtual - 1);
        }
    };

    const navegarParaEtapa = (etapa: number) => {
        if (etapa < etapaAtual || etapa === etapaAtual + 1) {
            setEtapaAtual(etapa);
        }
    };

    const handleSubmitCompleto = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Para edição, precisamos usar o endpoint de alteração
            // Buscar IDs corretos baseados nos dados do pátio original
            const contatoId = patioOriginal?.contato?.idContato;
            const enderecoId = patioOriginal?.endereco?.idEndereco;
            
            console.log('Dados sendo enviados:', {
                id: id!,
                nomePatio: wizardData.patio.nomePatio,
                status: wizardData.patio.status,
                observacao: wizardData.patio.observacao,
                contatoId,
                enderecoId
            });

            // 1. Atualizar dados básicos do pátio
            await PatioService.update(id!, {
                nomePatio: wizardData.patio.nomePatio,
                status: wizardData.patio.status,
                observacao: wizardData.patio.observacao,
                contatoId: contatoId,
                enderecoId: enderecoId
            });

            // 2. Remover todas as zonas existentes (isso também remove os boxes associados)
            // Buscar zonas existentes do pátio
            const zonasExistentes = await ZonaService.listarPorPatio(id!, patioOriginal!.status);
            if (zonasExistentes && zonasExistentes.content && zonasExistentes.content.length > 0) {
                for (const zona of zonasExistentes.content) {
                    try {
                        await ZonaService.deletePorPatio(id!, patioOriginal!.status, zona.idZona);
                    } catch (err) {
                        console.warn(`Erro ao remover zona ${zona.idZona}:`, err);
                    }
                }
            }

            // 3. Criar novas zonas se existirem
            if (wizardData.zonas.length > 0) {
                console.log('Criando zonas:', wizardData.zonas);
                for (const zona of wizardData.zonas) {
                    try {
                        const zonaPayload = {
                            nome: zona.nome,
                            status: zona.status || 'A', // Usar status existente ou padrão: Ativa
                            observacao: zona.observacao || '',
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        console.log('Payload da zona:', zonaPayload);
                        await ZonaService.create(zonaPayload);
                    } catch (err) {
                        console.error(`Erro ao criar zona ${zona.nome}:`, err);
                        throw err; // Re-throw para parar o processo se houver erro
                    }
                }
            }

            // 4. Criar novos boxes se existirem
            if (wizardData.boxes.length > 0) {
                console.log('Criando boxes:', wizardData.boxes);
                for (const box of wizardData.boxes) {
                    try {
                        const boxPayload = {
                            nome: box.nome,
                            status: box.status || 'L',
                            dataEntrada: box.dataEntrada || new Date().toISOString().split('T')[0], // Data atual se não especificada
                            dataSaida: box.dataSaida || new Date().toISOString().split('T')[0], // Data atual se não especificada
                            observacao: box.observacao || '',
                            zonaNome: box.zonaNome || 'Padrão', // Zona padrão se não especificada
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        console.log('Payload do box:', boxPayload);
                        await BoxService.create(boxPayload);
                    } catch (err) {
                        console.error(`Erro ao criar box ${box.nome}:`, err);
                        throw err; // Re-throw para parar o processo se houver erro
                    }
                }
            }
            
            setSalvamentoConcluido(true);
            setWizardData({
                patio: {
                    nomePatio: '',
                    status: 'A',
                    observacao: ''
                },
                contato: {
                    email: '',
                    ddd: 11,
                    ddi: 55,
                    telefone1: '',
                    telefone2: '',
                    telefone3: '',
                    celular: '',
                    outro: '',
                    observacao: ''
                },
                endereco: {
                    cep: '',
                    numero: 0,
                    complemento: '',
                    observacao: ''
                },
                dadosViaCep: {
                    logradouro: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    pais: 'Brasil'
                },
                zonas: [],
                boxes: []
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao alterar pátio.");
        } finally {
            setIsLoading(false);
        }
    };

    // Definir as etapas com ícones do Lucide React (igual ao wizard de cadastro)
    const etapas = [
        { id: 1, nome: 'Pátio', icone: Building, componente: EtapaPatio },
        { id: 2, nome: 'Contatos', icone: Phone, componente: EtapaContatos },
        { id: 3, nome: 'Localização', icone: Home, componente: EtapaLocalizacao },
        { id: 4, nome: 'Zonas', icone: MapPin, componente: EtapaZonas },
        { id: 5, nome: 'Boxes', icone: Grid3X3, componente: EtapaBoxes },
    ];

    // Função para determinar o componente da etapa atual (igual ao wizard de cadastro)
    const EtapaComponente = etapas.find(e => e.id === etapaAtual)?.componente || EtapaPatio;

    // Props para passar para o componente da etapa (todos usam a mesma estrutura agora)
    const etapaProps = {
        wizardData: wizardData,
        setWizardData: setWizardData
    };

    if (isFetching) return (
        <>
            <NavBar active="patio" />
            <main className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" />
            </main>
        </>
    );

    if (salvamentoConcluido) {
        return (
            <>
                <NavBar active="patio" />
                <main className="min-h-screen bg-[#363636] text-white p-4 md:p-8">
                    <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                        <div className="text-center">
                            <div className="mb-6">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Pátio Alterado com Sucesso!
                                </h1>
                                <p className="text-slate-300">
                                    O pátio "{patioOriginal?.nomePatio}" foi atualizado com todas as informações.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    href="/gerenciamento-patio"
                                    className="px-6 py-3 bg-[var(--color-mottu-dark)] text-white rounded-lg hover:bg-opacity-80 transition-colors font-medium"
                                >
                                    Voltar ao Gerenciamento
                                </Link>
                                <button
                                    onClick={() => {
                                        setSalvamentoConcluido(false);
                                        setEtapaAtual(1);
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Alterar Outro Pátio
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="patio" />
            <main className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                Assistente de Alteração de Pátio
                            </h1>
                            <p className="text-slate-200">Passo {etapaAtual} de {etapas.length}: {etapas[etapaAtual - 1].nome}</p>
                        </div>
                        <Link href="/gerenciamento-patio" className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors text-sm">
                            <ArrowLeft size={18} />
                            Voltar ao Gerenciamento
                        </Link>
                    </div>

                    {/* Barra de Progresso do Wizard */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {etapas.map((etapa, index) => {
                                const isCompleted = etapa.id < etapaAtual;
                                const isCurrent = etapa.id === etapaAtual;
                                const isNext = etapa.id === etapaAtual + 1;
                                const isPrevious = etapa.id < etapaAtual;
                                const isClickable = isPrevious || isCurrent || isNext; // Pode voltar, estar na atual, ou avançar para próxima
                                const Icone = etapa.icone;

                                return (
                                    <React.Fragment key={etapa.id}>
                                        <div 
                                            className={`flex flex-col items-center text-center z-10 transition-all duration-300 ${
                                                isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
                                            }`}
                                            onClick={() => isClickable && navegarParaEtapa(etapa.id)}
                                            title={
                                                isPrevious ? `Voltar para ${etapa.nome}` :
                                                isCurrent ? `Etapa atual: ${etapa.nome}` :
                                                isNext ? `Avançar para ${etapa.nome} (será validada)` :
                                                'Complete as etapas anteriores primeiro'
                                            }
                                        >
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                                                ${isCompleted ? 'bg-green-500 text-white' : ''}
                                                ${isCurrent ? 'bg-white text-[var(--color-mottu-dark)] ring-4 ring-green-500/50' : ''}
                                                ${!isCompleted && !isCurrent && isClickable ? 'bg-slate-600 text-white hover:bg-slate-500' : ''}
                                                ${!isCompleted && !isCurrent && !isClickable ? 'bg-slate-700 text-slate-400' : ''}
                                            `}>
                                                <Icone size={24} />
                                            </div>
                                            <p className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                                isCurrent || isCompleted ? 'text-white' : 
                                                isClickable ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {etapa.nome}
                                            </p>
                                        </div>
                                        {index < etapas.length - 1 && (
                                            <div className={`flex-1 h-1 transition-colors duration-300 mx-2
                                                ${isCompleted ? 'bg-green-500' : 'bg-slate-700'}
                                            `}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Área de Conteúdo da Etapa */}
                    <div className="bg-black/20 p-6 rounded-lg min-h-[300px]">
                        {/* Renderiza a etapa atual passando as props */}
                        <EtapaComponente {...etapaProps} />
                    </div>

                    {/* Mensagens de Erro/Sucesso */}
                    <div className="mt-4 min-h-[48px]">
                        {error && <div className="flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300"><MdErrorOutline className="text-xl" /> <span>{error}</span></div>}
                        {success && <div className="flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300"><MdCheckCircle className="text-xl" /> <span>{success}</span></div>}
                        
                        {/* Erros de validação específicos */}
                        {Object.keys(validationErrors).length > 0 && (
                            <div className="mt-2 p-3 rounded-md bg-red-50 border border-red-200">
                                <h4 className="text-sm font-semibold text-red-800 mb-2">Corrija os seguintes erros:</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    {Object.entries(validationErrors).map(([field, message]) => (
                                        <li key={field} className="flex items-center gap-2">
                                            <MdErrorOutline className="text-sm" />
                                            {message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Botões de Navegação */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700">
                        {salvamentoConcluido ? (
                            // Botão de retorno após salvamento bem-sucedido
                            <Link
                                href="/gerenciamento-patio"
                                className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-all"
                            >
                                <CheckCircle size={20} />
                                Voltar ao Gerenciamento
                            </Link>
                        ) : (
                            // Botões normais de navegação
                            <>
                                <button
                                    onClick={etapaAnterior}
                                    disabled={etapaAtual === 1 || isLoading}
                                    className="px-6 py-2 font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Voltar
                                </button>

                                {etapaAtual < etapas.length ? (
                                    <button
                                        onClick={proximaEtapa}
                                        className="px-6 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80"
                                    >
                                        Avançar
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitCompleto}
                                        disabled={isLoading}
                                        className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoading ? <><Loader2 className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}