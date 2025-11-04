"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import OcrScanner from '@/components/OcrScanner';
// NOVO: VeiculoService é necessário para a verificação
import { EstacionamentoService, BoxService, VeiculoService, PatioService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { PatioResponseDto } from '@/types/patio';
import '@/styles/neumorphic.css';

// Função para limpar e normalizar placa
const cleanPlate = (plate: string): string => {
    if (!plate) return '';
    return plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
};

// Função para validar formato de placa
const isValidPlate = (plate: string): boolean => {
    if (!plate) return false;
    const clean = cleanPlate(plate);
    
    // Deve ter exatamente 7 caracteres
    if (clean.length !== 7) return false;
    
    // Formato antigo: ABC1234 (7 caracteres) - 3 letras + 4 números
    const oldFormatRegex = /^[A-Z]{3}[0-9]{4}$/;
    
    // Formato Mercosul: ABC1D23 (7 caracteres) - 3 letras + 1 número + 1 letra + 2 números
    const mercosulFormatRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    return oldFormatRegex.test(clean) || mercosulFormatRegex.test(clean);
};

type WorkflowStep = 'scan' | 'confirm' | 'parking';

export default function ArmazenarPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyParkedInfo, setAlreadyParkedInfo] = useState<null | { boxId: number; boxNome?: string; patioId?: number }>(null);

    const [step, setStep] = useState<WorkflowStep>('scan');
    const [recognizedPlate, setRecognizedPlate] = useState<string | null>(null);
    const [availableBoxes, setAvailableBoxes] = useState<BoxResponseDto[]>([]);
    const [selectedBoxId, setSelectedBoxId] = useState<string>('');
    const [scannerKey, setScannerKey] = useState(Date.now());
    const [manualPlate, setManualPlate] = useState('');
    
    // Novos estados para seleção de pátio e vagas
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [selectedPatioId, setSelectedPatioId] = useState<string>('');
    const [loadingPatios, setLoadingPatios] = useState(false);
    const [loadingBoxes, setLoadingBoxes] = useState(false);
    
    // Estados para o modal de confirmação
    const [showNotFoundModal, setShowNotFoundModal] = useState(false);
    const [plateToRegister, setPlateToRegister] = useState<string>('');

    // Carregar pátios na inicialização
    useEffect(() => {
        const loadPatios = async () => {
            setLoadingPatios(true);
            try {
                const response = await PatioService.listarPaginadoFiltrado({}, 0, 100);
                setPatios(response.content || []);
                if (response.content && response.content.length > 0) {
                    setSelectedPatioId(response.content[0].idPatio.toString());
                }
            } catch (err) {
                setError('Erro ao carregar pátios');
            } finally {
                setLoadingPatios(false);
            }
        };
        loadPatios();
    }, []);

    // Carregar vagas quando um pátio for selecionado automaticamente
    useEffect(() => {
        if (selectedPatioId && patios.length > 0) {
            loadBoxesForPatio(selectedPatioId);
        }
    }, [selectedPatioId, patios]);

    // Carregar vagas quando pátio for selecionado
    const loadBoxesForPatio = async (patioId: string) => {
        if (!patioId) return;
        
        setLoadingBoxes(true);
        try {
            const patio = patios.find(p => p.idPatio.toString() === patioId);
            console.log('🔍 Patio encontrado:', patio);
            
            if (patio) {
                console.log('🔍 Buscando boxes para pátio:', patioId, 'status:', patio.status);
                const response = await BoxService.listarPorPatio(parseInt(patioId), patio.status, 0, 500);
                console.log('🔍 Response completa:', response);
                console.log('🔍 Boxes encontrados:', response.content?.length);
                
                // Buscar estacionamentos ativos no pátio para verificar quais boxes estão realmente ocupados
                const estacionamentosAtivos = await EstacionamentoService.listarAtivosPorPatio(parseInt(patioId));
                const boxesOcupadosIds = new Set(estacionamentosAtivos.map(e => e.box.idBox));
                console.log('🔍 Boxes ocupados (via TB_ESTACIONAMENTO):', Array.from(boxesOcupadosIds));
                
                // Filtrar boxes livres: status livre E não está ocupado em TB_ESTACIONAMENTO
                const freeBoxes = response.content.filter(box => {
                    const statusLivre = box.status === 'L' || box.status === 'S' || box.status === 'LIVRE';
                    const naoOcupado = !boxesOcupadosIds.has(box.idBox);
                    const isFree = statusLivre && naoOcupado;
                    console.log(`🔍 Box ${box.nome}: status="${box.status}", ocupadoEmEstacionamento=${boxesOcupadosIds.has(box.idBox)}, isFree=${isFree}`);
                    return isFree;
                });
                console.log('🔍 Vagas livres encontradas:', freeBoxes.length);
                console.log('🔍 Status das vagas:', response.content.map(box => ({ 
                    nome: box.nome, 
                    status: box.status, 
                    ocupadoEmEstacionamento: boxesOcupadosIds.has(box.idBox) 
                })));
                
                setAvailableBoxes(freeBoxes);
                if (freeBoxes.length > 0) {
                    setSelectedBoxId(freeBoxes[0].idBox.toString());
                } else {
                    setSelectedBoxId('');
                }
            }
        } catch (err) {
            console.error('🔍 Erro ao carregar vagas:', err);
            setError('Erro ao carregar vagas do pátio');
        } finally {
            setLoadingBoxes(false);
        }
    };

    // ALTERADO: Esta função agora também verifica se o veículo existe
    const handlePlateRecognized = async (placa: string) => {
        setIsLoading(true);
        setError(null);
        
        // Limpar e normalizar a placa antes de processar
        const placaLimpa = cleanPlate(placa);
        
        // Validar formato básico
        if (placaLimpa.length < 7) {
            setError("A placa deve ter 7 caracteres no formato antigo (ABC1234) ou Mercosul (ABC1D23).");
            setIsLoading(false);
            return;
        }
        
        if (!isValidPlate(placaLimpa)) {
            setError("Formato de placa inválido. Use o formato antigo (ABC1234) ou Mercosul (ABC1D23).");
            setIsLoading(false);
            return;
        }
        
        try {
            // 1. Verifica se o veículo existe no banco de dados (usando placa normalizada)
            const veiculoPage = await VeiculoService.listarPaginadoFiltrado({ placa: placaLimpa }, 0, 1);

            if (veiculoPage.content.length === 0) {
                // 2A. Se NÃO existe, mostra modal de confirmação (usando placa normalizada)
                setPlateToRegister(placaLimpa);
                setShowNotFoundModal(true);
                setIsLoading(false);
                return; // Encerra a função aqui
            }

            // 2B. Verifica se o veículo pode estacionar (status válido)
            const veiculo = veiculoPage.content[0];
            console.log('🔍 Veículo encontrado:', veiculo);
            
            // Status válidos para estacionamento (incluindo EM_MANUTENCAO pois significa que está estacionado em área de manutenção)
            const statusValidosParaEstacionar = ['ATIVO', 'DISPONIVEL', 'OPERACIONAL', 'EM_MANUTENCAO'];
            
            // Só bloqueia se for um status realmente inválido (como BLOQUEADO, INATIVO, etc.)
            const statusBloqueados = ['BLOQUEADO', 'INATIVO', 'DESABILITADO'];
            if (statusBloqueados.includes(veiculo.status)) {
                setError(`Veículo ${placaLimpa} está com status "${veiculo.status}" e não pode estacionar.`);
                setStep('scan');
                setIsLoading(false);
                return;
            }

            // 2C. Consultar se já está estacionado (usando nova API com placa normalizada)
            try {
                const estacionamentoAtivo = await EstacionamentoService.buscarAtivoPorPlaca(placaLimpa);
                setAlreadyParkedInfo({ 
                    boxId: estacionamentoAtivo.box.idBox, 
                    boxNome: estacionamentoAtivo.box.nome, 
                    patioId: estacionamentoAtivo.patio.idPatio 
                });
                // Selecionar o pátio onde está estacionado
                setSelectedPatioId(String(estacionamentoAtivo.patio.idPatio));
            } catch (error: any) {
                // Se não encontrar (404), significa que não está estacionado - isso é normal
                if (error.response?.status === 404 || error.status === 404) {
                    setAlreadyParkedInfo(null);
                } else {
                    // Outros erros são apenas avisos, não bloqueiam o fluxo
                    console.warn('⚠️ Aviso ao verificar estacionamento:', error);
                    setAlreadyParkedInfo(null);
                }
            }

            // 2D. Se EXISTE e pode estacionar, continua para a tela de confirmação (usando placa normalizada)
            console.log(`✅ Veículo ${placaLimpa} com status "${veiculo.status}" pode estacionar`);
            setRecognizedPlate(placaLimpa);
            setStep('confirm');

        } catch (err: any) {
            setError("Falha ao verificar a placa ou buscar vagas disponíveis.");
            setStep('scan');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePark = async (boxId: number | null) => {
        if (!recognizedPlate) return;

        setIsLoading(true);
        setError(null);
        setStep('parking');

        try {
            // VERIFICAÇÃO ANTECIPADA: Verificar se a moto já está estacionada ANTES de tentar estacionar
            try {
                const estacionamentoAtivo = await EstacionamentoService.buscarAtivoPorPlaca(recognizedPlate);
                if (estacionamentoAtivo) {
                    const boxNome = estacionamentoAtivo.box.nome;
                    const patioNome = estacionamentoAtivo.patio.nomePatio;
                    setError(`🚨 A moto ${recognizedPlate} já está estacionada no box ${boxNome} (${patioNome}). Libere a vaga antes de estacionar novamente.`);
                    setStep('confirm');
                    setIsLoading(false);
                    return;
                }
            } catch (checkError: any) {
                // Se não encontrar (404), significa que não está estacionado - pode continuar
                if (checkError.response?.status !== 404 && checkError.status !== 404) {
                    console.warn('⚠️ Erro ao verificar se já está estacionado:', checkError);
                    // Continuar mesmo se houver erro na verificação
                }
            }

            // Se boxId for null, busca uma vaga automática no pátio selecionado
            if (boxId === null && selectedPatioId) {
                // Busca primeira vaga livre no pátio selecionado (verificando TB_ESTACIONAMENTO também)
                const patio = patios.find(p => p.idPatio.toString() === selectedPatioId);
                if (patio) {
                    const response = await BoxService.listarPorPatio(parseInt(selectedPatioId), patio.status, 0, 500);
                    
                    // Buscar estacionamentos ativos para verificar quais boxes estão realmente ocupados
                    const estacionamentosAtivos = await EstacionamentoService.listarAtivosPorPatio(parseInt(selectedPatioId));
                    const boxesOcupadosIds = new Set(estacionamentosAtivos.map(e => e.box.idBox));
                    
                    // Filtrar boxes livres: status livre E não está ocupado em TB_ESTACIONAMENTO
                    const freeBoxes = response.content.filter(box => {
                        const statusLivre = box.status === 'L' || box.status === 'S' || box.status === 'LIVRE';
                        const naoOcupado = !boxesOcupadosIds.has(box.idBox);
                        return statusLivre && naoOcupado;
                    });
                    
                    if (freeBoxes.length === 0) {
                        setError('❌ Nenhuma vaga livre no pátio selecionado. Tente outro pátio.');
                        setStep('confirm');
                        setIsLoading(false);
                        return;
                    }
                    boxId = freeBoxes[0].idBox;
                }
            }
            
            // Estacionar usando nova API (retorna EstacionamentoResponseDto)
            const estacionamento = await EstacionamentoService.estacionar(
                recognizedPlate, 
                boxId || undefined,
                selectedPatioId ? parseInt(selectedPatioId) : undefined
            );
            
            // Redirecionar para o mapa de vagas 2D com identificação do box e pátio
            // A nova API retorna EstacionamentoResponseDto com estrutura diferente
            const boxIdHighlight = estacionamento.box.idBox;
            const boxName = estacionamento.box.nome;
            const patioId = estacionamento.patio.idPatio;
            
            const query = new URLSearchParams({
                highlight: String(boxIdHighlight),
                placa: recognizedPlate,
                box: boxName,
                patioId: String(patioId),
            });
            router.push(`/vagas/mapa?${query.toString()}`);
        } catch (err: any) {
            // Tratamento de erros específicos com mensagens mais claras
            console.error('❌ Erro ao estacionar:', err);
            
            if (err.response?.status === 404) {
                setError('❌ Veículo não encontrado. Verifique se a placa está cadastrada no sistema.');
            } else if (err.response?.status === 409) {
                // Verificar se já está estacionado (pode ter sido estacionado entre a verificação e o estacionamento)
                try {
                    const estacionamentoAtivo = await EstacionamentoService.buscarAtivoPorPlaca(recognizedPlate);
                    if (estacionamentoAtivo) {
                        const boxNome = estacionamentoAtivo.box.nome;
                        const patioNome = estacionamentoAtivo.patio.nomePatio;
                        setError(`🚨 A moto ${recognizedPlate} já está estacionada no box ${boxNome} (${patioNome}). Libere a vaga antes de estacionar novamente.`);
                    } else {
                        setError('❌ Veículo já está estacionado em outra vaga. Verifique o mapa de vagas.');
                    }
                } catch {
                    setError('❌ Veículo já está estacionado em outra vaga. Verifique o mapa de vagas.');
                }
            } else if (err.response?.status === 400) {
                const backendMessage = err.response?.data?.message || '';
                if (backendMessage.includes('já está estacionado') || backendMessage.includes('ocupado')) {
                    setError(`❌ ${backendMessage}`);
                } else {
                    setError(`❌ ${backendMessage || 'Placa inválida ou dados incorretos.'}`);
                }
            } else if (err.response?.status === 500) {
                // Erro interno do servidor - verificar tipo específico de erro
                const backendMessage = err.response?.data?.message || '';
                const errorType = err.response?.data?.errorType || '';
                const suggestion = err.response?.data?.suggestion || '';
                
                console.error('❌ Erro 500 detalhado:', {
                    message: backendMessage,
                    errorType: errorType,
                    suggestion: suggestion,
                    fullError: err.response?.data
                });
                
                if (errorType === 'COLLECTION_ORPHAN_REMOVAL_ERROR' || 
                    backendMessage.includes('delete-orphan') || 
                    backendMessage.includes('relacionamentos')) {
                    // Erro específico de relacionamentos - verificar se já está estacionado
                    try {
                        const estacionamentoAtivo = await EstacionamentoService.buscarAtivoPorPlaca(recognizedPlate);
                        if (estacionamentoAtivo) {
                            const boxNome = estacionamentoAtivo.box.nome;
                            const patioNome = estacionamentoAtivo.patio.nomePatio;
                            setError(`🚨 A moto ${recognizedPlate} já está estacionada no box ${boxNome} (${patioNome}). Libere a vaga antes de estacionar novamente.`);
                        } else {
                            setError('❌ Erro ao processar relacionamentos de dados. O box pode estar ocupado ou a moto já está estacionada. Verifique o mapa de vagas ou tente escolher outro box.');
                        }
                    } catch (checkError) {
                        setError('❌ Erro ao processar relacionamentos de dados. Verifique se o veículo já está estacionado ou se o box selecionado está disponível.');
                    }
                } else if (errorType === 'LAZY_INITIALIZATION_ERROR' || backendMessage.includes('LazyInitialization')) {
                    setError('❌ Erro ao carregar dados relacionados. Tente novamente.');
                } else if (backendMessage) {
                    setError(`❌ ${backendMessage}`);
                } else {
                    setError('❌ Erro interno do servidor. Por favor, tente novamente mais tarde.');
                }
            } else {
                const errorMessage = err.response?.data?.message || err.message || 'Ocorreu uma falha desconhecida ao estacionar.';
                setError(`❌ ${errorMessage}`);
            }
            setStep('confirm');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Limpar e normalizar a placa
        const plateToTest = cleanPlate(manualPlate);
        
        if (!plateToTest) {
            setError("Por favor, digite uma placa para buscar.");
            return;
        }
        
        if (plateToTest.length < 7) {
            setError("A placa deve ter 7 caracteres no formato antigo (ABC1234) ou Mercosul (ABC1D23).");
            return;
        }

        if (isValidPlate(plateToTest)) {
            // A função chamada aqui já contém a nova lógica de verificação
            handlePlateRecognized(plateToTest);
        } else {
            setError("Formato de placa inválido. Use o formato antigo (ABC1234) ou Mercosul (ABC1D23).");
        }
    };
    
    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Limpar e normalizar em tempo real
        const value = cleanPlate(e.target.value);
        setManualPlate(value);
        // Limpar erro quando usuário começar a digitar
        if (error) {
            setError(null);
        }
    };

    const handleBackToScan = () => {
        setError(null);
        setRecognizedPlate(null);
        setAvailableBoxes([]);
        setSelectedBoxId('');
        setStep('scan');
        setScannerKey(Date.now());
    };

    const handleConfirmRegister = () => {
        setShowNotFoundModal(false);
        router.push(`/veiculo/cadastrar?placa=${plateToRegister}`);
    };

    const handleCancelRegister = () => {
        setShowNotFoundModal(false);
        setPlateToRegister('');
        setStep('scan');
    };

    return (
        <main className="min-h-screen text-white p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center justify-center">

                {step === 'scan' && (
                    <div className="w-full max-w-lg">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-center">Armazenar Moto</h1>
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3 text-green-400 my-4 sm:my-5">
                                <i className="ion-ios-sync text-4xl sm:text-5xl animate-spin"></i>
                                <p className="text-base sm:text-lg">Verificando placa...</p>
                            </div>
                        ) : error && (
                            <div className="mb-4 sm:mb-5 w-full max-w-lg p-4 sm:p-5 bg-red-900/50 border border-red-500 rounded-lg text-center">
                                <i className="ion-ios-warning text-4xl sm:text-5xl mx-auto text-red-400 mb-2 sm:mb-3"></i>
                                <p className="font-semibold text-base sm:text-lg">Atenção</p>
                                <p className="text-red-300 text-sm sm:text-base">{error}</p>
                            </div>
                        )}
                        <OcrScanner key={scannerKey} onPlateRecognized={handlePlateRecognized} />
                        <div className="my-6 sm:my-8 md:my-10 flex items-center justify-center gap-3 sm:gap-5">
                            <hr className="w-full border-slate-700"/><span className="text-slate-400 text-sm sm:text-base">OU</span><hr className="w-full border-slate-700"/>
                        </div>
                        <div className="p-4 sm:p-6 border-2 border-dashed border-gray-500 rounded-lg">
                            <form onSubmit={handleManualSubmit}>
                                <label htmlFor="manualPlate" className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5">
                                    <i className="ion-ios-keypad text-2xl sm:text-3xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Digite a Placa Manualmente</span>
                                </label>
                                <input id="manualPlate" type="text" value={manualPlate} onChange={handlePlateChange}
                                       placeholder="EX: ABC1D23" maxLength={7}
                                       className="w-full p-3 sm:p-4 h-12 sm:h-14 rounded bg-slate-800 border border-slate-600 text-white text-lg sm:text-xl font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 sm:mb-5"
                                />
                                <button type="submit" disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white bg-green-600 rounded-lg text-base sm:text-lg hover:bg-green-700 disabled:opacity-50">
                                    {isLoading ? <i className="ion-ios-sync animate-spin"></i> : <i className="ion-ios-checkmark-circle"></i>} <span style={{fontFamily: 'Montserrat, sans-serif'}}>{isLoading ? "Verificando..." : "Verificar Placa"}</span>
                                </button>
                            </form>
                        </div>

                        {/* Seção de Navegação */}
                        <div className="w-full max-w-lg mt-6 sm:mt-8 p-3 sm:p-4 border border-gray-600 rounded-lg /20">
                            <Link 
                                href="/radar" 
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors w-full text-sm sm:text-base"
                            >
                                <i className="ion-ios-search text-lg sm:text-xl"></i>
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar ao Radar</span>
                            </Link>
                        </div>
                    </div>
                )}

                {step === 'confirm' && recognizedPlate && (
                    <div className="w-full max-w-lg p-4 sm:p-6 md:p-8 bg-green-800 rounded-lg shadow-xl text-center animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Placa Reconhecida</h2>
                        <p className="font-mono text-2xl sm:text-3xl md:text-4xl my-4 sm:my-5 p-2 sm:p-3 /50 rounded-md text-green-400">{recognizedPlate}</p>
                        {(error || alreadyParkedInfo) && (
                            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm sm:text-base">{error}</div>
                        )}
                        {alreadyParkedInfo && (
                            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-amber-900/40 border border-amber-500 rounded-lg text-amber-200 text-sm sm:text-base">
                                Veículo já está estacionado{alreadyParkedInfo.boxNome ? ` no box ${alreadyParkedInfo.boxNome}` : ''}.
                                <div className="mt-2">
                                    <button
                                        onClick={() => {
                                            const q = new URLSearchParams({
                                                highlight: String(alreadyParkedInfo.boxId),
                                                placa: recognizedPlate!,
                                                box: alreadyParkedInfo.boxNome || '',
                                            });
                                            if (alreadyParkedInfo.patioId) q.set('patioId', String(alreadyParkedInfo.patioId));
                                            router.push(`/vagas/mapa?${q.toString()}`);
                                        }}
                                        className="mt-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        Ver no mapa
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Seleção de Pátio */}
                        <div className="space-y-4 sm:space-y-5 mt-6 sm:mt-8">
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-home text-slate-300 text-lg sm:text-xl"></i>
                                <select 
                                    value={selectedPatioId} 
                                    onChange={(e) => {
                                        setSelectedPatioId(e.target.value);
                                        loadBoxesForPatio(e.target.value);
                                    }}
                                    disabled={isLoading || loadingPatios}
                                    title="Selecione um pátio"
                                    className="w-full p-3 sm:p-4 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {loadingPatios ? (
                                        <option>Carregando pátios...</option>
                                    ) : patios.length === 0 ? (
                                        <option>Nenhum pátio encontrado</option>
                                    ) : (
                                        patios.map(patio => (
                                            <option key={patio.idPatio} value={patio.idPatio.toString()}>
                                                {patio.nomePatio}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Seleção de Vaga */}
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-pin text-slate-300 text-lg sm:text-xl"></i>
                                <select 
                                    value={selectedBoxId} 
                                    onChange={(e) => setSelectedBoxId(e.target.value)}
                                    disabled={isLoading || loadingBoxes || !selectedPatioId}
                                    title="Selecione uma vaga"
                                    className="w-full p-3 sm:p-4 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {loadingBoxes ? (
                                        <option>Carregando vagas...</option>
                                    ) : availableBoxes.length === 0 ? (
                                        <option>Nenhuma vaga livre</option>
                                    ) : (
                                        availableBoxes.map(box => (
                                            <option key={box.idBox} value={box.idBox.toString()}>
                                                {box.nome}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Botões de Ação */}
                            <div className="space-y-3 sm:space-y-4">
                                <button 
                                    onClick={() => handlePark(null)} 
                                    disabled={isLoading || !selectedPatioId}
                                    className="w-full flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white bg-[var(--color-mottu-default)] rounded-lg text-base sm:text-lg disabled:opacity-50"
                                >
                                    <i className="ion-ios-bicycle"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Atribuir Vaga Automática</span>
                                </button>
                                
                                <div className="text-center text-slate-400 text-base sm:text-lg">ou</div>
                                
                                <button 
                                    onClick={() => handlePark(parseInt(selectedBoxId))} 
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white bg-sky-600 rounded-lg text-base sm:text-lg disabled:opacity-50"
                                >
                                    <i className="ion-ios-bicycle"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Estacionar na Vaga Selecionada</span>
                                </button>
                            </div>
                        </div>
                        
                        <button onClick={handleBackToScan} className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-slate-300 hover:underline">
                            <i className="ion-ios-arrow-back text-lg sm:text-xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Escanear outra placa</span>
                        </button>
                    </div>
                )}

                {step === 'parking' && (
                    <div className="flex flex-col items-center gap-3 text-green-400">
                        <Loader2 size={32} className="animate-spin sm:hidden" />
                        <Loader2 size={42} className="animate-spin hidden sm:block" />
                        <p className="text-base sm:text-lg">Estacionando moto {recognizedPlate}...</p>
                    </div>
                )}

                {/* Modal de confirmação para placa não encontrada */}
                {showNotFoundModal && (
                    <div className="fixed inset-0 /70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleCancelRegister}>
                        <div className="bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md text-white border border-slate-600 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-amber-400">
                                    <i className="ion-ios-warning text-xl sm:text-2xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Placa Não Encontrada</span>
                                </h2>
                            </div>
                            
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-slate-300 text-sm sm:text-base">
                                    A placa <span className="font-mono text-emerald-300 font-bold">{plateToRegister}</span> não foi encontrada no sistema.
                                </p>
                                <p className="text-slate-300 text-sm sm:text-base">
                                    Deseja cadastrar uma nova moto com esta placa?
                                </p>
                            </div>
                            
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                                <button 
                                    onClick={handleCancelRegister}
                                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors text-sm sm:text-base"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleConfirmRegister}
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors text-sm sm:text-base"
                                >
                                    Cadastrar Nova Moto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
    );
}