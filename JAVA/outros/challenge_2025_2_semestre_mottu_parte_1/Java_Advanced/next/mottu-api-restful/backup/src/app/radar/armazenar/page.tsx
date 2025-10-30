"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import OcrScanner from '@/components/OcrScanner';
// NOVO: VeiculoService é necessário para a verificação
import { EstacionamentoService, BoxService, VeiculoService, PatioService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { PatioResponseDto } from '@/types/patio';
import '@/styles/neumorphic.css';

const isValidPlate = (plate: string): boolean => {
    if (!plate) return false;
    const cleanPlate = plate.trim().toUpperCase();
    const plateRegex = /^([A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$/;
    return plateRegex.test(cleanPlate);
};

type WorkflowStep = 'scan' | 'confirm' | 'parking';

export default function ArmazenarPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                
                // Verificar todos os status possíveis para vagas livres
                const freeBoxes = response.content.filter(box => {
                    const isFree = box.status === 'L' || box.status === 'S' || box.status === 'LIVRE';
                    console.log(`🔍 Box ${box.nome}: status="${box.status}", isFree=${isFree}`);
                    return isFree;
                });
                console.log('🔍 Vagas livres encontradas:', freeBoxes.length);
                console.log('🔍 Status das vagas:', response.content.map(box => ({ nome: box.nome, status: box.status })));
                
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
        try {
            // 1. Verifica se o veículo existe no banco de dados
            const veiculoPage = await VeiculoService.listarPaginadoFiltrado({ placa }, 0, 1);

            if (veiculoPage.content.length === 0) {
                // 2A. Se NÃO existe, mostra modal de confirmação
                setPlateToRegister(placa);
                setShowNotFoundModal(true);
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
                setError(`Veículo ${placa} está com status "${veiculo.status}" e não pode estacionar.`);
                setStep('scan');
                return;
            }

            // 2C. Se EXISTE e pode estacionar, continua para a tela de confirmação
            console.log(`✅ Veículo ${placa} com status "${veiculo.status}" pode estacionar`);
            setRecognizedPlate(placa);
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
            // Se boxId for null, busca uma vaga automática no pátio selecionado
            let vagaEncontrada;
            if (boxId === null && selectedPatioId) {
                // Busca primeira vaga livre no pátio selecionado
                const patio = patios.find(p => p.idPatio.toString() === selectedPatioId);
                if (patio) {
                    const response = await BoxService.listarPorPatio(parseInt(selectedPatioId), patio.status, 0, 500);
                    const freeBoxes = response.content.filter(box => box.status === 'L' || box.status === 'S' || box.status === 'LIVRE');
                    if (freeBoxes.length === 0) {
                        throw new Error('Nenhuma vaga livre no pátio selecionado');
                    }
                    boxId = freeBoxes[0].idBox;
                }
            }
            
            vagaEncontrada = await EstacionamentoService.estacionar(recognizedPlate, boxId);
            
            // Determinar qual mapa redirecionar baseado no pátio selecionado
            const patio = patios.find(p => p.idPatio.toString() === selectedPatioId);
            let mapUrl = '/mapa-2d'; // fallback
            
            if (patio) {
                // Mapear pátios para seus respectivos mapas
                if (patio.nomePatio.toLowerCase().includes('guarulhos')) {
                    mapUrl = '/mapa-2d?mapa=guarulhos';
                } else if (patio.nomePatio.toLowerCase().includes('limao')) {
                    mapUrl = '/mapa-2d?mapa=limao';
                } else {
                    // Para outros pátios, usar fallback ou mapeamento adicional
                    mapUrl = '/mapa-2d?mapa=guarulhos'; // padrão Guarulhos
                }
            }
            
            router.push(`${mapUrl}&highlightBoxId=${vagaEncontrada.idBox}&parkedPlate=${recognizedPlate}`);
        } catch (err: any) {
            // Este erro agora será principalmente sobre "nenhuma vaga livre"
            const errorMessage = err.response?.data?.message || err.message || 'Ocorreu uma falha desconhecida.';
            setError(errorMessage);
            setStep('confirm');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const plateToTest = manualPlate.trim();

        if (isValidPlate(plateToTest)) {
            // A função chamada aqui já contém a nova lógica de verificação
            handlePlateRecognized(plateToTest);
        } else {
            setError("Formato de placa inválido. Use o formato ABC1234 ou ABC1D23.");
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
        <>
            <NavBar active="radar" />
            <main className="min-h-screen text-white p-6 md:p-12 flex flex-col items-center justify-center">

                {step === 'scan' && (
                    <div className="w-full max-w-lg">
                        <h1 className="text-4xl font-bold mb-10 text-center">Armazenar Moto</h1>
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3 text-green-400 my-5">
                                <i className="ion-ios-sync text-5xl animate-spin"></i>
                                <p className="text-lg">Verificando placa...</p>
                            </div>
                        ) : error && (
                            <div className="mb-5 w-full max-w-lg p-5 bg-red-900/50 border border-red-500 rounded-lg text-center">
                                <i className="ion-ios-warning text-5xl mx-auto text-red-400 mb-3"></i>
                                <p className="font-semibold text-lg">Atenção</p>
                                <p className="text-red-300 text-base">{error}</p>
                            </div>
                        )}
                        <OcrScanner key={scannerKey} onPlateRecognized={handlePlateRecognized} />
                        <div className="my-10 flex items-center justify-center gap-5">
                            <hr className="w-full border-slate-700"/><span className="text-slate-400 text-base">OU</span><hr className="w-full border-slate-700"/>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-500 rounded-lg">
                            <form onSubmit={handleManualSubmit}>
                                <label htmlFor="manualPlate" className="flex items-center justify-center gap-3 text-xl font-semibold text-white mb-5">
                                    <i className="ion-ios-keypad text-3xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Digite a Placa Manualmente</span>
                                </label>
                                <input id="manualPlate" type="text" value={manualPlate} onChange={(e) => setManualPlate(e.target.value.trim().toUpperCase())}
                                       placeholder="EX: ABC1D23" maxLength={7}
                                       className="w-full p-4 h-14 rounded bg-slate-800 border border-slate-600 text-white text-xl font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-green-500 mb-5"
                                />
                                <button type="submit" disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-4 px-8 py-4 font-semibold text-white bg-green-600 rounded-lg text-lg hover:bg-green-700 disabled:opacity-50">
                                    {isLoading ? <i className="ion-ios-sync animate-spin"></i> : <i className="ion-ios-checkmark-circle"></i>} <span style={{fontFamily: 'Montserrat, sans-serif'}}>{isLoading ? "Verificando..." : "Verificar Placa"}</span>
                                </button>
                            </form>
                        </div>

                        {/* Seção de Navegação */}
                        <div className="w-full max-w-lg mt-8 p-4 border border-gray-600 rounded-lg bg-black/20">
                            <Link 
                                href="/radar" 
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors w-full"
                            >
                                <i className="ion-ios-search text-xl"></i>
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar ao Radar</span>
                            </Link>
                        </div>
                    </div>
                )}

                {step === 'confirm' && recognizedPlate && (
                    <div className="w-full max-w-lg p-8 bg-green-800 rounded-lg shadow-xl text-center animate-fade-in">
                        <h2 className="text-3xl font-bold text-white">Placa Reconhecida</h2>
                        <p className="font-mono text-4xl my-5 p-3 bg-black/50 rounded-md text-green-400">{recognizedPlate}</p>
                        {error && (
                            <div className="mb-5 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-base">{error}</div>
                        )}
                        
                        {/* Seleção de Pátio */}
                        <div className="space-y-5 mt-8">
                            <div className="flex items-center gap-2">
                                <i className="ion-ios-home text-slate-300"></i>
                                <select 
                                    value={selectedPatioId} 
                                    onChange={(e) => {
                                        setSelectedPatioId(e.target.value);
                                        loadBoxesForPatio(e.target.value);
                                    }}
                                    disabled={isLoading || loadingPatios}
                                    title="Selecione um pátio"
                                    className="w-full p-4 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-50"
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
                                <i className="ion-ios-pin text-slate-300"></i>
                                <select 
                                    value={selectedBoxId} 
                                    onChange={(e) => setSelectedBoxId(e.target.value)}
                                    disabled={isLoading || loadingBoxes || !selectedPatioId}
                                    title="Selecione uma vaga"
                                    className="w-full p-4 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-50"
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
                            <div className="space-y-4">
                                <button 
                                    onClick={() => handlePark(null)} 
                                    disabled={isLoading || !selectedPatioId}
                                    className="w-full flex items-center justify-center gap-4 px-8 py-4 font-semibold text-white bg-[var(--color-mottu-default)] rounded-lg text-lg disabled:opacity-50"
                                >
                                    <i className="ion-ios-car"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Atribuir Vaga Automática</span>
                                </button>
                                
                                <div className="text-center text-slate-400 text-lg">ou</div>
                                
                                <button 
                                    onClick={() => handlePark(parseInt(selectedBoxId))} 
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-4 px-8 py-4 font-semibold text-white bg-sky-600 rounded-lg text-lg disabled:opacity-50"
                                >
                                    <i className="ion-ios-bicycle"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Estacionar na Vaga Selecionada</span>
                                </button>
                            </div>
                        </div>
                        
                        <button onClick={handleBackToScan} className="mt-8 flex items-center justify-center gap-3 text-base text-slate-300 hover:underline">
                            <i className="ion-ios-arrow-back text-xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Escanear outra placa</span>
                        </button>
                    </div>
                )}

                {step === 'parking' && (
                    <div className="flex flex-col items-center gap-3 text-green-400">
                        <Loader2 size={42} className="animate-spin" />
                        <p className="text-lg">Estacionando moto {recognizedPlate}...</p>
                    </div>
                )}

                {/* Modal de confirmação para placa não encontrada */}
                {showNotFoundModal && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleCancelRegister}>
                        <div className="bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md text-white border border-slate-600 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-400">
                                    <i className="ion-ios-warning text-2xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Placa Não Encontrada</span>
                                </h2>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-slate-300">
                                    A placa <span className="font-mono text-emerald-300 font-bold">{plateToRegister}</span> não foi encontrada no sistema.
                                </p>
                                <p className="text-slate-300">
                                    Deseja cadastrar uma nova moto com esta placa?
                                </p>
                            </div>
                            
                            <div className="mt-6 flex gap-3 justify-end">
                                <button 
                                    onClick={handleCancelRegister}
                                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleConfirmRegister}
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                                >
                                    Cadastrar Nova Moto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}