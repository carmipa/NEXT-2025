"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { VeiculoService } from '@/utils/api';
import { VeiculoResponseDto, VeiculoLocalizacaoResponseDto } from '@/types/veiculo';
import { Loader2, AlertCircle } from 'lucide-react';
// Ícones substituídos por Ionicons coloridos
import '@/types/styles/neumorphic.css';

export default function DetalhesVeiculoPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [veiculo, setVeiculo] = useState<VeiculoResponseDto | null>(null);
    const [localizacao, setLocalizacao] = useState<VeiculoLocalizacaoResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do veículo inválido.");
            setIsLoading(false);
            return;
        }
        const fetchVeiculo = async () => {
            setIsLoading(true);
            try {
                const data = await VeiculoService.getById(id);
                setVeiculo(data);
                // Iniciar busca da localização assim que os dados do veículo chegarem
                handleFetchLocalizacao(id);
            } catch (err: any) {
                setError(err.response?.data?.message || "Veículo não encontrado ou erro ao carregar dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVeiculo();
    }, [id]);

    const handleFetchLocalizacao = async (veiculoId: number) => {
        setIsLocating(true);
        try {
            const locData = await VeiculoService.getLocalizacao(veiculoId);
            setLocalizacao(locData);
        } catch (err: any) {
            // Não sobrescrever o erro principal se for apenas um erro de localização
            console.error("Erro ao buscar localização:", err);
            setError(prev => prev || err.response?.data?.message || "Erro ao buscar localização.");
        } finally {
            setIsLocating(false);
        }
    };

    if (isLoading) return (
        <>
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !veiculo) return (
        <>
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/veiculo/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!veiculo) return null;

    return (
        <>
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8">
                <div className="container max-w-4xl mx-auto neumorphic-container p-3 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
                        <div>
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                                <i className="ion-ios-bicycle mr-2 sm:mr-3 text-2xl sm:text-3xl text-cyan-400"></i>
                                Veículo: {veiculo.placa}
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base">{veiculo.modelo} - {veiculo.fabricante} (ID: {veiculo.idVeiculo})</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                            <Link href="/veiculo/listar" className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-arrow-back text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">VOLTAR</span>
                                </div>
                            </Link>
                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-create text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">EDITAR</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="neumorphic-fieldset p-3 sm:p-6">
                            <legend className="neumorphic-legend flex items-center text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-bicycle mr-1 sm:mr-2 text-cyan-400 text-lg sm:text-xl"></i> Dados da Moto
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-pricetag text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Placa:</strong> {veiculo.placa}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-document text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>RENAVAM:</strong> {veiculo.renavam}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-barcode text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Chassi:</strong> {veiculo.chassi}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-bicycle text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Modelo:</strong> {veiculo.modelo}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-build text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Fabricante:</strong> {veiculo.fabricante}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-calendar text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Ano:</strong> {veiculo.ano}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-settings text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Motor:</strong> {veiculo.motor || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-water text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Combustível:</strong> {veiculo.combustivel}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className={`ion-ios-checkmark-circle text-sm sm:text-base ${veiculo.status === 'OPERACIONAL' ? 'text-green-500' : 'text-yellow-500'}`}></i>
                                    <span className="text-slate-800" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Status:</strong> <span className={veiculo.status === 'OPERACIONAL' ? 'text-green-600' : 'text-yellow-600'}>{veiculo.status || 'N/A'}</span></span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <i className="ion-ios-bluetooth text-yellow-500 text-sm sm:text-base"></i>
                                    <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Tag BLE:</strong> {veiculo.tagBleId || 'Não associada'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="neumorphic-fieldset p-3 sm:p-6">
                            <legend className="neumorphic-legend flex items-center text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-location mr-1 sm:mr-2 text-rose-400 text-lg sm:text-xl"></i> Localização Atual
                            </legend>
                            {isLocating ? (
                                <div className="flex items-center gap-2 text-sky-300 mt-3 sm:mt-4 text-xs sm:text-sm"><Loader2 className="animate-spin text-sm sm:text-base"/>Buscando...</div>
                            ) : localizacao && localizacao.boxAssociado ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm mt-3 sm:mt-4">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-home text-red-500 text-sm sm:text-base"></i>
                                        <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Pátio:</strong> {localizacao.patioAssociado?.nomePatio || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-navigate text-red-500 text-sm sm:text-base"></i>
                                        <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Zona:</strong> {localizacao.zonaAssociada?.nome || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <i className="ion-ios-square text-red-500 text-sm sm:text-base"></i>
                                        <span className="text-slate-800 truncate" style={{fontFamily: 'Montserrat, sans-serif'}}><strong>Box:</strong> {localizacao.boxAssociado?.nome || 'N/A'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 mt-3 sm:mt-4 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Veículo não está estacionado em um box.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
