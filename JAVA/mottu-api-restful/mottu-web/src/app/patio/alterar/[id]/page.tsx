// Caminho: src/app/patio/alterar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// ParticleBackground removido - está no layout global
import { PatioService, ContatoService, EnderecoService, BoxService, ZonaService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { ContatoResponseDto, ContatoRequestDto } from '@/types/contato';
import { EnderecoResponseDto, EnderecoRequestDto } from '@/types/endereco';
import { BoxResponseDto } from '@/types/box';
import { ZonaResponseDto } from '@/types/zona';
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
            setEtapaAtual(etapaAtual + 1);
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

            // 2. Gerenciar zonas: comparar existentes com as do wizard
            const zonasExistentesResponse = await ZonaService.listarPorPatio(id!, patioOriginal!.status);
            const zonasExistentes = zonasExistentesResponse.content || [];
            
            // Criar mapa de zonas existentes por nome (case-insensitive)
            const zonasExistentesMap = new Map<string, ZonaResponseDto>();
            zonasExistentes.forEach(z => zonasExistentesMap.set(z.nome.toLowerCase(), z));
            
            // Criar mapa de zonas do wizard por nome
            const zonasWizardMap = new Map<string, ZonaResponseDto>();
            wizardData.zonas.forEach(z => zonasWizardMap.set(z.nome.toLowerCase(), z));
            
            // Deletar zonas que foram removidas do wizard
            for (const zonaExistente of zonasExistentes) {
                if (!zonasWizardMap.has(zonaExistente.nome.toLowerCase())) {
                    try {
                        await ZonaService.deletePorPatio(id!, patioOriginal!.status, zonaExistente.idZona);
                        console.log(`Zona "${zonaExistente.nome}" removida`);
                    } catch (err) {
                        console.warn(`Erro ao remover zona ${zonaExistente.idZona}:`, err);
                    }
                }
            }
            
            // Criar ou atualizar zonas do wizard
            for (const zona of wizardData.zonas) {
                const zonaExistente = zonasExistentesMap.get(zona.nome.toLowerCase());
                
                if (zonaExistente) {
                    // Zona já existe, atualizar apenas se os dados mudaram
                    try {
                        const zonaPayload = {
                            nome: zona.nome,
                            status: zona.status || zonaExistente.status || 'A',
                            observacao: zona.observacao || '',
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        await ZonaService.updatePorPatio(id!, patioOriginal!.status, zonaExistente.idZona, zonaPayload);
                        console.log(`Zona "${zona.nome}" atualizada`);
                    } catch (err) {
                        console.error(`Erro ao atualizar zona ${zona.nome}:`, err);
                        throw err;
                    }
                } else {
                    // Zona não existe, criar nova
                    try {
                        const zonaPayload = {
                            nome: zona.nome,
                            status: zona.status || 'A',
                            observacao: zona.observacao || '',
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        await ZonaService.create(zonaPayload);
                        console.log(`Zona "${zona.nome}" criada`);
                    } catch (err) {
                        console.error(`Erro ao criar zona ${zona.nome}:`, err);
                        throw err;
                    }
                }
            }

            // 3. Gerenciar boxes: comparar existentes com os do wizard
            const boxesExistentesResponse = await BoxService.listarPorPatio(id!, patioOriginal!.status);
            const boxesExistentes = boxesExistentesResponse.content || [];
            
            // Criar mapa de boxes existentes por nome (case-insensitive)
            const boxesExistentesMap = new Map<string, BoxResponseDto>();
            boxesExistentes.forEach(b => boxesExistentesMap.set(b.nome.toLowerCase(), b));
            
            // Criar mapa de boxes do wizard por nome
            const boxesWizardMap = new Map<string, BoxResponseDto>();
            wizardData.boxes.forEach(b => boxesWizardMap.set(b.nome.toLowerCase(), b));
            
            // Deletar boxes que foram removidos do wizard
            for (const boxExistente of boxesExistentes) {
                if (!boxesWizardMap.has(boxExistente.nome.toLowerCase())) {
                    try {
                        await BoxService.delete(boxExistente.idBox);
                        console.log(`Box "${boxExistente.nome}" removido`);
                    } catch (err) {
                        console.warn(`Erro ao remover box ${boxExistente.idBox}:`, err);
                    }
                }
            }
            
            // Criar ou atualizar boxes do wizard
            for (const box of wizardData.boxes) {
                const boxExistente = boxesExistentesMap.get(box.nome.toLowerCase());
                
                if (boxExistente) {
                    // Box já existe, atualizar apenas se os dados mudaram
                    try {
                        const boxPayload = {
                            nome: box.nome,
                            status: box.status || boxExistente.status || 'L',
                            dataEntrada: box.dataEntrada || boxExistente.dataEntrada || new Date().toISOString(),
                            dataSaida: box.dataSaida || boxExistente.dataSaida || new Date().toISOString(),
                            observacao: box.observacao || boxExistente.observacao || '',
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        await BoxService.update(boxExistente.idBox, boxPayload);
                        console.log(`Box "${box.nome}" atualizado`);
                    } catch (err: any) {
                        console.error(`Erro ao atualizar box ${box.nome}:`, err);
                        throw err;
                    }
                } else {
                    // Box não existe, criar novo
                    try {
                        const boxPayload = {
                            nome: box.nome,
                            status: box.status || 'L',
                            dataEntrada: box.dataEntrada || new Date().toISOString(),
                            dataSaida: box.dataSaida || new Date().toISOString(),
                            observacao: box.observacao || '',
                            patioId: id!,
                            patioStatus: patioOriginal!.status
                        };
                        await BoxService.create(boxPayload);
                        console.log(`Box "${box.nome}" criado`);
                    } catch (err: any) {
                        console.error(`Erro ao criar box ${box.nome}:`, err);
                        
                        // Tratamento específico para box duplicado
                        if (err.response?.status === 409 || err.name === 'DuplicatedResourceException') {
                            const errorMessage = err.response?.data?.message || err.message || `Box com nome '${box.nome}' já existe`;
                            throw new Error(`Falha ao criar box "${box.nome}": ${errorMessage}. Este box já existe no sistema. Por favor, remova os boxes existentes ou escolha nomes diferentes.`);
                        }
                        
                        throw err;
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
            // Melhorar tratamento de erro com mensagens mais específicas
            let errorMessage = "Erro ao alterar pátio.";
            
            if (err.response?.status === 409) {
                // Conflito - recurso duplicado
                const apiMessage = err.response?.data?.message || err.message;
                const suggestion = err.response?.data?.suggestion;
                
                if (apiMessage.includes('Box') || apiMessage.includes('box') || err.response?.data?.errorType === 'DUPLICATED_BOX') {
                    if (suggestion) {
                        errorMessage = `${apiMessage}\n\n💡 ${suggestion}`;
                    } else {
                        errorMessage = `${apiMessage}\n\n💡 Verifique se há boxes antigos com os mesmos nomes. Você pode precisar removê-los antes de criar novos boxes com os mesmos nomes.`;
                    }
                } else {
                    errorMessage = apiMessage || "Já existe um recurso com essas informações. Verifique os dados e tente novamente.";
                }
            } else if (err.response?.status === 400) {
                // Dados inválidos
                errorMessage = err.response?.data?.message || "Dados inválidos fornecidos. Verifique as informações e tente novamente.";
            } else if (err.response?.status === 404) {
                // Recurso não encontrado
                errorMessage = err.response?.data?.message || "Recurso não encontrado. Verifique se o pátio ainda existe.";
            } else if (err.message) {
                // Mensagem de erro customizada
                errorMessage = err.message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            console.error("Erro detalhado ao alterar pátio:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Definir as etapas com ícones emoji (igual ao wizard de cadastro)
    const etapas = [
        { id: 1, nome: 'Pátio', icone: '🏠', cor: '#667eea', componente: EtapaPatio },
        { id: 2, nome: 'Contatos', icone: '📞', cor: '#f093fb', componente: EtapaContatos },
        { id: 3, nome: 'Localização', icone: '📍', cor: '#4facfe', componente: EtapaLocalizacao },
        { id: 4, nome: 'Zonas', icone: '🗺️', cor: '#43e97b', componente: EtapaZonas },
        { id: 5, nome: 'Boxes', icone: '📦', cor: '#fa709a', componente: EtapaBoxes },
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
            {/* ParticleBackground removido - está no layout global */}
            <main className="flex justify-center items-center min-h-screen relative z-20">
                <div className="neumorphic-container p-8 rounded-lg">
                    <i className="ion-ios-refresh text-4xl text-blue-500 animate-spin"></i>
                </div>
            </main>
        </>
    );

    if (salvamentoConcluido) {
        return (
            <>
                {/* ParticleBackground removido - está no layout global */}
                <main className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center relative z-20" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="container mx-auto neumorphic-container p-6 md:p-8 rounded-lg shadow-xl">
                        <div className="text-center">
                            <div className="mb-6">
                                <i className="ion-ios-checkmark-circle text-6xl text-green-500 mb-4"></i>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Pátio Alterado com Sucesso!
                                </h1>
                                <p className="text-white opacity-70">
                                    O pátio "{patioOriginal?.nomePatio}" foi atualizado com todas as informações.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    href="/gerenciamento-patio"
                                    className="neumorphic-button-green flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-white"
                                >
                                    <i className="ion-ios-arrow-back"></i>
                                    Voltar ao Gerenciamento
                                </Link>
                                <button
                                    onClick={() => {
                                        setSalvamentoConcluido(false);
                                        setEtapaAtual(1);
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    className="neumorphic-button flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <i className="ion-ios-settings"></i>
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
            {/* ParticleBackground removido - está no layout global */}
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 flex items-center justify-center relative z-20" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <div className="container max-w-4xl mx-auto neumorphic-container p-3 sm:p-6 md:p-8 rounded-lg shadow-xl relative z-20">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-settings mr-2"></i>Assistente de Alteração de Pátio
                            </h1>
                            <p className="text-slate-200 opacity-70 text-xs sm:text-sm">Passo {etapaAtual} de {etapas.length}: {etapas[etapaAtual - 1].nome}</p>
                        </div>
                        <Link href="/gerenciamento-patio" className="neumorphic-button flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm">
                            <i className="ion-ios-arrow-back"></i>
                            <span className="hidden sm:inline">Voltar ao Gerenciamento</span>
                            <span className="sm:hidden">Voltar</span>
                        </Link>
                    </div>

                    {/* Barra de Progresso do Wizard */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between overflow-x-auto">
                            {etapas.map((etapa, index) => {
                                const isCompleted = etapa.id < etapaAtual;
                                const isCurrent = etapa.id === etapaAtual;
                                const isNext = etapa.id === etapaAtual + 1;
                                const isPrevious = etapa.id < etapaAtual;
                                const isClickable = isPrevious || isCurrent || isNext; // Pode voltar, estar na atual, ou avançar para próxima

                                return (
                                    <React.Fragment key={etapa.id}>
                                        <div 
                                            className={`flex flex-col items-center text-center z-20 transition-all duration-300 min-w-0 flex-shrink-0 ${
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
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 neumorphic-container
                                                ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                                                ${isCurrent ? 'bg-[#e0e5ec] text-[#4a5568] ring-4 ring-green-500/50' : ''}
                                                ${!isCompleted && !isCurrent && isClickable ? 'bg-[#e0e5ec] text-[#4a5568] hover:bg-[#d1d9e6]' : ''}
                                                ${!isCompleted && !isCurrent && !isClickable ? 'bg-[#e0e5ec] text-[#4a5568] opacity-50' : ''}
                                            `}>
                                                <span style={{fontSize: '16px'}} className="sm:text-lg md:text-xl">{etapa.icone}</span>
                                            </div>
                                            <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                                isCurrent || isCompleted ? 'text-white' : 
                                                isClickable ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                <span className="hidden sm:inline">{etapa.nome}</span>
                                                <span className="sm:hidden">{etapa.id}</span>
                                            </p>
                                        </div>
                                        {index < etapas.length - 1 && (
                                            <div className={`flex-1 h-1 transition-colors duration-300 mx-1 sm:mx-2
                                                ${isCompleted ? 'bg-emerald-600' : 'bg-slate-700'}
                                            `}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Área de Conteúdo da Etapa */}
                    <div className="neumorphic-container p-3 sm:p-6 rounded-lg min-h-[300px]">
                        {/* Renderiza a etapa atual passando as props */}
                        <EtapaComponente {...etapaProps} />
                    </div>

                    {/* Mensagens de Erro/Sucesso */}
                    <div className="mt-4 min-h-[48px]">
                        {error && <div className="flex items-center gap-2 text-xs sm:text-sm text-red-700 p-2 sm:p-3 rounded-md neumorphic-container"><i className="ion-ios-close-circle text-lg sm:text-xl"></i> <span>{error}</span></div>}
                        {success && <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 p-2 sm:p-3 rounded-md neumorphic-container"><i className="ion-ios-checkmark-circle text-lg sm:text-xl"></i> <span>{success}</span></div>}
                        
                        {/* Erros de validação específicos */}
                        {Object.keys(validationErrors).length > 0 && (
                            <div className="mt-2 p-2 sm:p-3 rounded-md neumorphic-container">
                                <h4 className="text-xs sm:text-sm font-semibold text-red-800 mb-2">Corrija os seguintes erros:</h4>
                                <ul className="text-xs sm:text-sm text-red-700 space-y-1">
                                    {Object.entries(validationErrors).map(([field, message]) => (
                                        <li key={field} className="flex items-center gap-2">
                                            <i className="ion-ios-close-circle text-sm"></i>
                                            {message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Botões de Navegação */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-[#a3b1c6] relative z-30 gap-4">
                        {salvamentoConcluido ? (
                            // Botão de retorno após salvamento bem-sucedido
                            <Link
                                href="/gerenciamento-patio"
                                className="neumorphic-button-primary flex items-center gap-2 px-4 sm:px-6 py-2 font-semibold transition-all text-sm sm:text-base"
                            >
                                <i className="ion-ios-checkmark-circle"></i>
                                <span className="hidden sm:inline">Voltar ao Gerenciamento</span>
                                <span className="sm:hidden">Voltar</span>
                            </Link>
                        ) : (
                            // Botões normais de navegação
                            <>
                                <button
                                    onClick={etapaAnterior}
                                    disabled={etapaAtual === 1 || isLoading}
                                    className="neumorphic-button px-4 sm:px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                >
                                    <i className="ion-ios-arrow-back"></i>
                                    <span className="hidden sm:inline">Voltar</span>
                                    <span className="sm:hidden">Voltar</span>
                                </button>

                                {etapaAtual < etapas.length ? (
                                    <button
                                        onClick={proximaEtapa}
                                        className="neumorphic-button-advance px-4 sm:px-6 py-2 font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                        style={{
                                            background: 'linear-gradient(145deg, #0C8B4E, #0A6E40)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            position: 'relative',
                                            zIndex: 1002,
                                            visibility: 'visible',
                                            opacity: 1,
                                            minWidth: '100px',
                                            minHeight: '44px'
                                        }}
                                    >
                                        <i className="ion-ios-arrow-forward"></i>
                                        <span className="hidden sm:inline">Avançar</span>
                                        <span className="sm:hidden">Próximo</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitCompleto}
                                        disabled={isLoading}
                                        className="neumorphic-button-green px-4 sm:px-6 py-2 font-semibold disabled:opacity-50 flex items-center gap-2 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                    >
                                        {isLoading ? <><i className="ion-ios-refresh animate-spin"></i> <span className="hidden sm:inline">Salvando...</span><span className="sm:hidden">...</span></> : <><i className="ion-ios-checkmark"></i> <span className="hidden sm:inline">Salvar Alterações</span><span className="sm:hidden">Salvar</span></>}
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