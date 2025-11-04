"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
// NOVO: Ícone de Upload adicionado
import { Camera, Loader2, ScanLine, Smartphone, ArrowLeft, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RadarService, OcrSession } from '@/utils/api';

interface OcrScannerProps {
    onPlateRecognized: (plate: string) => void;
}

// Tipo para controlar o modo de operação do scanner
type ScannerMode = 'choice' | 'webcam' | 'mobile';

const OcrScanner: React.FC<OcrScannerProps> = ({ onPlateRecognized }) => {
    const webcamRef = useRef<Webcam>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState('Escolha um método para escanear a matrícula.');
    // Estado para controlar qual interface é exibida
    const [mode, setMode] = useState<ScannerMode>('choice');
    // Estados para o fluxo de QR Code
    const [sessionId, setSessionId] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // NOVO: Referência para o input de arquivo do computador
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cleanPlate = (text: string) => {
        // Remove caracteres especiais mas mantém hífens que podem ser válidos
        let cleaned = text.replace(/[^A-Z0-9\-]/gi, '').toUpperCase().trim();
        
        // Remove hífens se existirem
        cleaned = cleaned.replace(/-/g, '');
        
        // Garante que tenha pelo menos 7 caracteres para ser uma placa válida
        return cleaned.length >= 7 ? cleaned.substring(0, 7) : cleaned;
    };

    const handleScan = useCallback(async () => {
        if (isScanning || !webcamRef.current) return;

        setIsScanning(true);
        setStatus('A ler a imagem...');
        const imageSrc = webcamRef.current.getScreenshot();

        if (!imageSrc) {
            setStatus('Não foi possível capturar a imagem.');
            setIsScanning(false);
            return;
        }

        const worker = await createWorker('por');
        try {
            setStatus('A processar a matrícula...');
            const { data: { text } } = await worker.recognize(imageSrc);
            const plate = cleanPlate(text);

            if (plate.length >= 7) {
                setStatus(`Matrícula encontrada: ${plate}`);
                onPlateRecognized(plate);
            } else {
                setStatus('Matrícula não reconhecida. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            setStatus('Erro no reconhecimento. Tente novamente.');
        } finally {
            await worker.terminate();
            setIsScanning(false);
        }
    }, [isScanning, onPlateRecognized]);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const startPolling = (currentSessionId: string) => {
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const session: OcrSession = await RadarService.getStatusSessao(currentSessionId);
                if (session.status === 'COMPLETED' && session.recognizedPlate) {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setStatus(`Matrícula ${session.recognizedPlate} recebida!`);
                    onPlateRecognized(session.recognizedPlate);
                } else if (session.status === 'ERROR') {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setStatus(`Erro no processamento: ${session.errorMessage || 'Tente novamente.'}`);
                }
            } catch (error) {
                console.error("Erro ao verificar status da sessão:", error);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setStatus('Erro de comunicação. Tente novamente.');
            }
        }, 3000);
    };

    const handleUsePhone = async () => {
        setMode('mobile');
        if (sessionId) return;
        try {
            setStatus('A gerar QR Code...');
            const { sessionId: newSessionId } = await RadarService.iniciarSessao();
            setSessionId(newSessionId);
            setStatus('Escaneie o QR Code com o seu telemóvel.');
            startPolling(newSessionId);
        } catch (error) {
            setStatus('Erro ao iniciar sessão com o telemóvel.');
            console.error(error);
        }
    };

    // NOVO: Função para lidar com o upload de arquivo do computador
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setStatus('Iniciando sessão de upload...');
        setIsScanning(true); // Reutiliza o estado de loading

        try {
            // 1. Inicia a sessão no backend
            const { sessionId: newSessionId } = await RadarService.iniciarSessao();
            setSessionId(newSessionId);
            setStatus('Enviando imagem para análise...');

            // 2. Faz o upload do arquivo
            await RadarService.uploadImagem(newSessionId, file);

            // 3. Começa a verificar o resultado
            setStatus('Imagem enviada. Aguardando reconhecimento...');
            setMode('mobile'); // Reutiliza a UI de "aguardando" do modo mobile
            startPolling(newSessionId);

        } catch (error) {
            console.error(error);
            setStatus('Erro ao enviar o arquivo. Tente novamente.');
            setIsScanning(false);
        } finally {
            // Limpa o valor do input para permitir o upload do mesmo arquivo novamente
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const getMobileUploadUrl = () => {
        if (!sessionId) return '';
        const url = new URL(`/radar/mobile-upload/${sessionId}`, window.location.origin);
        return url.toString();
    };

    const handleBackToChoice = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setSessionId(null);
        setMode('choice');
        setStatus('Escolha um método para escanear a matrícula.');
        setIsScanning(false); // Garante que o loading para
    };

    const renderContent = () => {
        switch (mode) {
            case 'webcam':
                return (
                    <>
                        <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: 'environment' }}
                                className="w-full h-full object-cover"
                                onUserMediaError={(error) => {
                                    console.error('Erro ao acessar câmera:', error);
                                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                                        setStatus('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
                                    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                                        setStatus('Nenhuma câmera encontrada. Verifique se há uma câmera conectada.');
                                    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                                        setStatus('Erro ao acessar a câmera. Ela pode estar sendo usada por outro aplicativo.');
                                    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                                        setStatus('A câmera não suporta as configurações solicitadas.');
                                    } else {
                                        // Verificar se é problema de HTTPS
                                        const isSecureContext = window.isSecureContext;
                                        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                                        
                                        if (!isSecureContext && !isLocalhost) {
                                            setStatus('⚠️ Acesso à câmera requer HTTPS. Use HTTPS ou acesse via localhost.');
                                        } else {
                                            setStatus(`Erro ao acessar câmera: ${error.message || error.name}`);
                                        }
                                    }
                                }}
                                onUserMedia={() => {
                                    setStatus('Câmera conectada. Aponte para a placa.');
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-4/5 h-2/5 border-4 border-green-400 rounded-lg animate-pulse" />
                            </div>
                        </div>
                        <p className="text-center text-sm text-slate-300 min-h-[20px]">{status}</p>
                        {!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                            <div className="w-full p-3 bg-yellow-900/30 border border-yellow-600 rounded-md text-yellow-300 text-xs text-center">
                                ⚠️ Acesso à câmera requer HTTPS. Use HTTPS ou acesse via localhost para desenvolvimento.
                            </div>
                        )}
                        <div className="w-full flex flex-col gap-2">
                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-default)] rounded-md shadow hover:bg-opacity-80 transition-colors disabled:opacity-50"
                            >
                                {isScanning ? <Loader2 className="animate-spin" /> : <ScanLine />}
                                {isScanning ? 'A analisar...' : 'Escanear Matrícula'}
                            </button>
                            <button
                                onClick={handleBackToChoice}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md"
                            >
                                <ArrowLeft size={16} /> Voltar
                            </button>
                        </div>
                    </>
                );
            case 'mobile':
                return (
                    <>
                        <div className="w-full h-64 bg-white rounded-md flex items-center justify-center p-4">
                            {sessionId ? (
                                <QRCodeSVG value={getMobileUploadUrl()} size={220} />
                            ) : (
                                <Loader2 className="animate-spin text-slate-500 h-12 w-12" />
                            )}
                        </div>
                        <p className="text-center text-sm text-slate-300 min-h-[20px]">{status}</p>
                        <div className="w-full flex flex-col gap-2">
                            <div className="text-center text-sky-300 flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" />
                                A aguardar imagem...
                            </div>
                            <button
                                onClick={handleBackToChoice}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md"
                            >
                                <ArrowLeft size={16} /> Voltar
                            </button>
                        </div>
                    </>
                );
            case 'choice':
            default:
                return (
                    <>
                        {/* NOVO: Input de arquivo oculto */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            aria-label="Selecionar arquivo de imagem"
                        />
                        <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-black/20 rounded-lg">
                            <button
                                onClick={() => { setMode('webcam'); setStatus('Aponte a câmara para a matrícula.'); }}
                                className="w-4/5 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-slate-700 rounded-lg shadow-lg text-lg transition-transform hover:scale-105"
                            >
                                <Camera size={28} />
                                Escanear com a Câmara
                            </button>

                            {/* NOVO: Botão para acionar o upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isScanning}
                                className="w-4/5 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-slate-700 rounded-lg shadow-lg text-lg transition-transform hover:scale-105 disabled:opacity-50"
                            >
                                <Upload size={28} />
                                Carregar do Computador
                            </button>

                            <button
                                onClick={handleUsePhone}
                                className="w-4/5 flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white bg-slate-700 rounded-lg shadow-lg text-lg transition-transform hover:scale-105"
                            >
                                <Smartphone size={28} />
                                Enviar pelo Dispositivo Móvel
                            </button>
                        </div>
                        <p className="text-center text-sm text-slate-300 min-h-[20px]">{status}</p>
                    </>
                );
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-500 rounded-lg">
            {renderContent()}
        </div>
    );
};

export default OcrScanner;