"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OcrScanner from '@/components/OcrScanner';
import '@/styles/neumorphic.css';

export default function BuscarMotoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualPlate, setManualPlate] = useState('');

    const handlePlateScan = async (placa: string) => {
        if (!placa) {
            setError("Nenhuma placa foi reconhecida.");
            setIsLoading(false);
            return;
        }

        // Limpar e normalizar a placa (remover espaços, caracteres especiais, converter para maiúsculas)
        const placaLimpa = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
        
        // Validar formato básico (deve ter 7 caracteres)
        if (placaLimpa.length < 7) {
            setError("A placa deve ter 7 caracteres no formato Mercosul (ABC1D23).");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        // Redirecionar para página de localização (o backend normalizará a placa)
        router.push(`/radar/localizar/${placaLimpa}`);
    };

    const handleManualSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const plateToSearch = manualPlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (!plateToSearch) {
            setError("Por favor, digite uma placa para buscar.");
            setIsLoading(false);
            return;
        }

        // Validar tamanho mínimo
        if (plateToSearch.length < 7) {
            setError("A placa deve ter 7 caracteres no formato Mercosul (ABC1D23).");
            setIsLoading(false);
            return;
        }

        handlePlateScan(plateToSearch);
    };

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
        setManualPlate(value);
        // Limpar erro quando usuário começar a digitar
        if (error) {
            setError(null);
        }
    };

    return (
        <main className="min-h-screen text-white p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 sm:gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-search text-3xl sm:text-4xl md:text-5xl"></i>
                        Buscar Moto
                    </h1>
                    <p className="text-slate-300 text-base sm:text-lg mt-2 sm:mt-3" style={{fontFamily: 'Montserrat, sans-serif'}}>Escaneie ou digite a placa para encontrar a localização do veículo.</p>
                </div>

                <OcrScanner onPlateRecognized={handlePlateScan} />

                <div className="my-6 sm:my-8 md:my-10 flex items-center justify-center gap-3 sm:gap-5 w-full max-w-lg">
                    <hr className="w-full border-slate-700"/><span className="text-slate-400 text-sm sm:text-base">OU</span><hr className="w-full border-slate-700"/>
                </div>

                <div className="w-full max-w-lg p-4 sm:p-6 border-2 border-dashed border-gray-500 rounded-lg">
                    <form onSubmit={handleManualSearch}>
                        <label htmlFor="manualPlate" className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5">
                            <i className="ion-ios-keypad text-2xl sm:text-3xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Digite a Placa para Buscar</span>
                        </label>
                        <input id="manualPlate" type="text" value={manualPlate} onChange={handlePlateChange}
                               placeholder="EX: ABC1D23" maxLength={7}
                               className="w-full p-3 sm:p-4 h-12 sm:h-14 rounded bg-slate-800 border border-slate-600 text-white text-lg sm:text-xl font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 sm:mb-5"
                        />
                        <button type="submit" disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white bg-green-600 rounded-lg text-base sm:text-lg hover:bg-green-700 disabled:opacity-50">
                            {isLoading ? <i className="ion-ios-sync animate-spin"></i> : <i className="ion-ios-search"></i>} <span style={{fontFamily: 'Montserrat, sans-serif'}}>{isLoading ? "Buscando..." : "Buscar Placa"}</span>
                        </button>
                    </form>
                </div>

                {/* Seção de Navegação */}
                <div className="w-full max-w-lg mt-6 sm:mt-8 p-3 sm:p-4 border border-gray-600 rounded-lg /20">
                    <Link 
                        href="/radar" 
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors w-full text-sm sm:text-base"
                    >
                        <i className="ion-ios-arrow-back text-lg sm:text-xl"></i>
                        <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar ao Radar</span>
                    </Link>
                </div>

                {isLoading && (
                    <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 text-sky-300">
                        <i className="ion-ios-sync text-4xl sm:text-5xl animate-spin"></i>
                        <p className="text-base sm:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Buscando localização...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-red-900/50 border border-red-500 rounded-lg text-center w-full max-w-lg">
                        <i className="ion-ios-warning text-4xl sm:text-5xl mx-auto text-red-400 mb-2 sm:mb-3 block"></i>
                        <p className="font-semibold text-base sm:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>Atenção</p>
                        <p className="text-red-300 text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>{error}</p>
                    </div>
                )}
            </main>
    );
}