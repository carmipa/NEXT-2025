// src/app/patio/novo-assistente/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// ParticleBackground removido - está no layout global
import { PatioRequestDto } from '@/types/patio';
import { ContatoRequestDto } from '@/types/contato';
import { EnderecoRequestDto } from '@/types/endereco';
import { ZonaRequestDto } from '@/types/zona';
import { BoxRequestDto } from '@/types/box';
import { ArrowLeft, Building, MapPin, Grid3X3, ListChecks, Loader2, Phone, Home, CheckCircle } from 'lucide-react';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

import EtapaPatio from '@/components/wizard-steps/EtapaPatio';
import EtapaContatos from '@/components/wizard-steps/EtapaContatos';
import EtapaLocalizacao from '@/components/wizard-steps/EtapaLocalizacao';
import EtapaZonas from '@/components/wizard-steps/EtapaZonas';
import EtapaBoxes from '@/components/wizard-steps/EtapaBoxes';
import EtapaResumo from '@/components/wizard-steps/EtapaResumo';
import { PatioService } from '@/utils/api';


// Tipos para o estado do wizard
export interface ZonaWizardDto extends Omit<ZonaRequestDto, 'dataEntrada' | 'dataSaida'> {
    // Campos de Zona que precisamos no wizard
}

export interface BoxWizardDto extends Omit<BoxRequestDto, 'dataEntrada' | 'dataSaida'> {
    // Campos de Box que precisamos no wizard
    zonaNome: string; // Para associar o box à zona recém-criada
}

export interface WizardData {
    patio: Omit<PatioRequestDto, 'contato' | 'endereco' | 'contatoIds' | 'enderecoIds'>;
    contato: ContatoRequestDto;
    endereco: EnderecoRequestDto;
    dadosViaCep: {
        logradouro: string;
        bairro: string;
        cidade: string;
        estado: string;
        pais: string;
    };
    zonas: ZonaWizardDto[];
    boxes: BoxWizardDto[];
}

const etapas = [
    { id: 1, nome: 'Pátio', icone: '🏠', cor: '#667eea', componente: EtapaPatio },
    { id: 2, nome: 'Contatos', icone: '📞', cor: '#f093fb', componente: EtapaContatos },
    { id: 3, nome: 'Localização', icone: '📍', cor: '#4facfe', componente: EtapaLocalizacao },
    { id: 4, nome: 'Zonas', icone: '🗺️', cor: '#43e97b', componente: EtapaZonas },
    { id: 5, nome: 'Boxes', icone: '📦', cor: '#fa709a', componente: EtapaBoxes },
    { id: 6, nome: 'Resumo', icone: '✅', cor: '#ffecd2', componente: EtapaResumo },
];

export default function NovoPatioWizardPage() {
    const [etapaAtual, setEtapaAtual] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [salvamentoConcluido, setSalvamentoConcluido] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // Funções de validação para cada etapa
    const validateEtapa1 = (): boolean => {
        const errors: { [key: string]: string } = {};
        
        if (!wizardData.patio.nomePatio.trim()) {
            errors.nomePatio = "Nome do pátio é obrigatório";
        } else if (wizardData.patio.nomePatio.trim().length < 3) {
            errors.nomePatio = "Nome deve ter pelo menos 3 caracteres";
        } else if (wizardData.patio.nomePatio.trim().length > 50) {
            errors.nomePatio = "Nome deve ter no máximo 50 caracteres";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateEtapa2 = (): boolean => {
        const errors: { [key: string]: string } = {};
        
        // Validar email
        if (!wizardData.contato.email.trim()) {
            errors.email = "E-mail é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardData.contato.email)) {
            errors.email = "E-mail inválido";
        }
        
        // Validar telefone fixo
        if (!wizardData.contato.telefone1.trim()) {
            errors.telefone1 = "Telefone fixo é obrigatório";
        } else if (wizardData.contato.telefone1.replace(/\D/g, '').length < 10) {
            errors.telefone1 = "Telefone fixo deve ter pelo menos 10 dígitos";
        }
        
        // Validar celular
        if (!wizardData.contato.celular.trim()) {
            errors.celular = "Celular é obrigatório";
        } else if (wizardData.contato.celular.replace(/\D/g, '').length < 10) {
            errors.celular = "Celular deve ter pelo menos 10 dígitos";
        }
        
        // Validar DDD
        if (!wizardData.contato.ddd || wizardData.contato.ddd < 11 || wizardData.contato.ddd > 99) {
            errors.ddd = "DDD deve estar entre 11 e 99";
        }
        
        // Validar DDI
        if (!wizardData.contato.ddi || wizardData.contato.ddi < 1 || wizardData.contato.ddi > 999) {
            errors.ddi = "DDI deve estar entre 1 e 999";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateEtapa3 = (): boolean => {
        const errors: { [key: string]: string } = {};
        
        // Validar CEP
        if (!wizardData.endereco.cep || wizardData.endereco.cep.replace(/\D/g, '').length !== 8) {
            errors.cep = "CEP deve ter 8 dígitos";
        }
        
        // Validar número
        if (!wizardData.endereco.numero || wizardData.endereco.numero <= 0) {
            errors.numero = "Número é obrigatório";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateEtapa4 = (): boolean => {
        if (wizardData.zonas.length === 0) {
            setValidationErrors({ zonas: "Pelo menos uma zona deve ser criada" });
            return false;
        }
        
        // Validar se todas as zonas têm nome
        const zonasInvalidas = wizardData.zonas.some(zona => !zona.nome.trim());
        if (zonasInvalidas) {
            setValidationErrors({ zonas: "Todas as zonas devem ter um nome" });
            return false;
        }
        
        setValidationErrors({});
        return true;
    };

    const validateEtapa5 = (): boolean => {
        if (wizardData.boxes.length === 0) {
            setValidationErrors({ boxes: "Pelo menos um box deve ser criado" });
            return false;
        }
        
        // Validar se todos os boxes têm nome
        const boxesInvalidos = wizardData.boxes.some(box => !box.nome.trim());
        if (boxesInvalidos) {
            setValidationErrors({ boxes: "Todos os boxes devem ter um nome" });
            return false;
        }
        
        setValidationErrors({});
        return true;
    };

    const [wizardData, setWizardData] = useState<WizardData>({
        patio: {
            nomePatio: '',
            observacao: '',
            status: 'A',
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
            observacao: '',
        },
        endereco: {
            cep: '',
            numero: 0,
        },
        dadosViaCep: {
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: '',
            pais: 'Brasil',
        },
        zonas: [],
        boxes: [],
    });

    // Debug: Verificar se os dados estão sendo carregados corretamente
    React.useEffect(() => {
        console.log('🔍 Wizard Data inicial:', wizardData);
        console.log('🔍 Nome do pátio:', wizardData.patio.nomePatio);
        console.log('🔍 Email:', wizardData.contato.email);
        console.log('🔍 Zonas:', wizardData.zonas.length);
        console.log('🔍 Boxes:', wizardData.boxes.length);
    }, []);

    const proximaEtapa = () => {
        let isValid = true;
        
        // Validar etapa atual antes de avançar
        switch (etapaAtual) {
            case 1:
                isValid = validateEtapa1();
                break;
            case 2:
                isValid = validateEtapa2();
                break;
            case 3:
                isValid = validateEtapa3();
                break;
            case 4:
                isValid = validateEtapa4();
                break;
            case 5:
                isValid = validateEtapa5();
                break;
            default:
                isValid = true;
        }
        
        if (isValid && etapaAtual < etapas.length) {
            setValidationErrors({});
            setError(null);
            setEtapaAtual(prev => Math.min(prev + 1, etapas.length));
        } else if (!isValid) {
            setError("Por favor, corrija os erros antes de continuar.");
        }
    };

    // Nova função para navegar diretamente para uma etapa (via clique na aba)
    const navegarParaEtapa = (novaEtapa: number) => {
        // Se está voltando para uma etapa anterior, sempre permite
        if (novaEtapa < etapaAtual) {
            setEtapaAtual(novaEtapa);
            setValidationErrors({});
            setError(null);
            return;
        }
        
        // Se está avançando para a próxima etapa, precisa validar
        if (novaEtapa === etapaAtual + 1) {
            let isValid = true;
            
            // Validar etapa atual antes de avançar
            switch (etapaAtual) {
                case 1:
                    isValid = validateEtapa1();
                    break;
                case 2:
                    isValid = validateEtapa2();
                    break;
                case 3:
                    isValid = validateEtapa3();
                    break;
                case 4:
                    isValid = validateEtapa4();
                    break;
                case 5:
                    isValid = validateEtapa5();
                    break;
                default:
                    isValid = true;
            }
            
            if (isValid) {
                setEtapaAtual(novaEtapa);
                setValidationErrors({});
                setError(null);
            } else {
                setError("Por favor, preencha todos os campos obrigatórios antes de avançar.");
            }
        }
        
        // Se é a mesma etapa, não faz nada
        if (novaEtapa === etapaAtual) {
            return;
        }
    };
    
    const etapaAnterior = () => {
        setValidationErrors({});
        setError(null);
        setEtapaAtual(prev => Math.max(prev - 1, 1));
    };

    const handleSubmitCompleto = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // Montar o payload no formato esperado pelo backend
            const payload = {
                patio: {
                    nomePatio: wizardData.patio.nomePatio,
                    observacao: wizardData.patio.observacao,
                    status: wizardData.patio.status
                },
                contato: wizardData.contato,
                endereco: {
                    ...wizardData.endereco,
                    ...wizardData.dadosViaCep
                },
                zonas: wizardData.zonas.map(zona => ({
                    nome: zona.nome,
                    observacao: zona.observacao,
                    status: zona.status
                })),
                boxes: wizardData.boxes.map(box => ({
                    nome: box.nome,
                    status: box.status,
                    observacao: box.observacao,
                    zonaNome: box.zonaNome
                }))
            };

            console.log("Enviando para o backend:", payload);
            
            // Chamar o endpoint real do backend
            const resultado = await PatioService.createCompleto(payload);
            
            setSuccess(`Pátio "${resultado.nomePatio}" cadastrado com sucesso! ID: ${resultado.idPatio}`);
            setSalvamentoConcluido(true);
            
            // Contagem regressiva para redirecionamento
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        window.location.href = '/gerenciamento-patio';
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (err: any) {
            console.error("Erro ao criar pátio:", err);
            setError(`Erro ao cadastrar pátio: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const EtapaComponente = etapas.find(e => e.id === etapaAtual)?.componente || EtapaPatio;

    const etapaProps: any = {
        wizardData: wizardData,
        setWizardData: setWizardData
    };

    return (
        <>
            {/* ParticleBackground removido - está no layout global */}
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 flex items-center justify-center relative z-20" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <div className="container max-w-4xl mx-auto neumorphic-container p-3 sm:p-6 md:p-8 rounded-lg shadow-xl relative z-20">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-home mr-2"></i>Assistente de Criação de Pátio
                            </h1>
                            <p className="text-slate-200 opacity-70 text-sm sm:text-base">Passo {etapaAtual} de {etapas.length}: {etapas[etapaAtual - 1].nome}</p>
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
                                const Icone = etapa.icone;

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
                        {success && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-green-700 p-2 sm:p-3 rounded-md neumorphic-container gap-2">
                                <div className="flex items-center gap-2">
                                    <i className="ion-ios-checkmark-circle text-lg sm:text-xl"></i>
                                    <span>{success}</span>
                                </div>
                                {salvamentoConcluido && countdown > 0 && (
                                    <div className="text-xs text-green-600 font-medium">
                                        Redirecionando em {countdown}s...
                                    </div>
                                )}
                            </div>
                        )}
                        
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#a3b1c6] relative z-30 gap-4">
                        {salvamentoConcluido ? (
                            // Botão de retorno após salvamento bem-sucedido
                            <Link
                                href="/gerenciamento-patio"
                                className="neumorphic-button-green flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
                            >
                                <i className="ion-ios-checkmark-circle text-white"></i>
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
                                    <span className="sm:hidden">←</span>
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
                                            padding: '8px 16px',
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
                                            minHeight: '40px'
                                        }}
                                    >
                                        <i className="ion-ios-arrow-forward"></i>
                                        <span className="hidden sm:inline">Avançar</span>
                                        <span className="sm:hidden">→</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitCompleto}
                                        disabled={isLoading}
                                        className="neumorphic-button-green px-4 sm:px-6 py-2 font-semibold disabled:opacity-50 flex items-center gap-2 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                    >
                                        {isLoading ? <><i className="ion-ios-refresh animate-spin"></i> <span className="hidden sm:inline">Salvando...</span><span className="sm:hidden">...</span></> : <><i className="ion-ios-checkmark"></i> <span className="hidden sm:inline">Salvar Tudo</span><span className="sm:hidden">Salvar</span></>}
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