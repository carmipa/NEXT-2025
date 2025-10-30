"use client";

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MARCAS, MODELOS_POR_MARCA, CILINDRADAS, TIPOS_COMBUSTIVEL } from '@/lib/motoData';

import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { isValidMercosulPlate, validatePlate } from '@/utils/plateValidation';
// Ícones removidos - usando Ionicons
import '@/styles/neumorphic.css';

function CadastrarVeiculoContent() {
    const searchParams = useSearchParams();

    const initialState: VeiculoRequestDto = {
        placa: '',
        renavam: '',
        chassi: '',
        fabricante: '',
        modelo: '',
        motor: '',
        ano: new Date().getFullYear(),
        combustivel: '',
        status: 'OPERACIONAL',
        tagBleId: ''
    };

    const [formData, setFormData] = useState<VeiculoRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingTag, setIsGeneratingTag] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [modelosDisponiveis, setModelosDisponiveis] = useState<string[]>([]);
    const [placaError, setPlacaError] = useState<string>('');

    useEffect(() => {
        const placaFromQuery = searchParams.get('placa');
        if (placaFromQuery) {
            setFormData(prev => ({ ...prev, placa: placaFromQuery }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'fabricante') {
            setFormData(prev => ({
                ...prev,
                fabricante: value,
                modelo: '',
            }));
            setModelosDisponiveis(MODELOS_POR_MARCA[value] || []);
        } else if (name === 'placa') {
            // Validação em tempo real da placa
            const placaError = validatePlate(value);
            setPlacaError(placaError);
            
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase() // Converte para maiúscula automaticamente
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'ano' ? parseInt(value, 10) || 0 : value
            }));
        }
    };

    const handleGerarTagAutomatica = async () => {
        setIsGeneratingTag(true);
        setError(null);
        try {
            const proximaTag = await VeiculoService.gerarProximaTagBle();
            setFormData(prev => ({ ...prev, tagBleId: proximaTag }));
            setSuccess(`Tag BLE gerada automaticamente: ${proximaTag}`);
        } catch (err) {
            setError('Erro ao gerar tag automática. Tente novamente.');
            console.error('Erro ao gerar tag:', err);
        } finally {
            setIsGeneratingTag(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const createdVeiculo: VeiculoResponseDto = await VeiculoService.create(formData);
            setSuccess(`Veículo "${createdVeiculo.placa}" cadastrado! Você já pode tentar estacioná-lo novamente.`);
            setFormData(initialState);
            setModelosDisponiveis([]);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao cadastrar veículo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 pb-32">
                <div className="container max-w-2xl mx-auto">
                    <div className="neumorphic-container p-3 sm:p-6 md:p-8">
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-bicycle mr-2 sm:mr-3 text-2xl sm:text-3xl text-purple-500"></i>
                            <span className="hidden sm:inline">Cadastrar Nova Moto</span>
                            <span className="sm:hidden">Nova Moto</span>
                        </h1>


                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <fieldset className="neumorphic-fieldset">
                            <legend className="neumorphic-legend text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>Dados da Moto</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">

                                <div className="group">
                                    <label htmlFor="placa" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-pricetag text-blue-500 text-sm sm:text-base"></i> Placa <span className="text-red-300">*</span></label>
                                    <input 
                                        type="text" 
                                        id="placa" 
                                        name="placa" 
                                        value={formData.placa} 
                                        onChange={handleChange}
                                        required 
                                        maxLength={7} 
                                        placeholder="ABC1D23" 
                                        className={`neumorphic-input text-sm sm:text-base ${placaError ? 'border-red-500' : ''}`}
                                        style={{fontFamily: 'Montserrat, sans-serif'}} 
                                    />
                                    {placaError && (
                                        <p className="text-red-400 text-xs mt-1">{placaError}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="renavam" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-document text-green-500 text-sm sm:text-base"></i> RENAVAM <span className="text-red-300">*</span></label>
                                    <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} placeholder="11 dígitos" className="neumorphic-input text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="chassi" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-barcode text-purple-500 text-sm sm:text-base"></i> Chassi <span className="text-red-300">*</span></label>
                                    <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} placeholder="17 caracteres" className="neumorphic-input text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="fabricante" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-build text-orange-500 text-sm sm:text-base"></i> Fabricante <span className="text-red-300">*</span></label>
                                    <select id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a marca...</option>
                                        {MARCAS.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                                    </select>
                                </div>

                                <div className="group">
                                    <label htmlFor="modelo" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-bicycle text-red-500 text-sm sm:text-base"></i> Modelo <span className="text-red-300">*</span></label>
                                    <select id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} disabled={!formData.fabricante} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Primeiro, selecione a marca...</option>
                                        {modelosDisponiveis.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="motor" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-settings text-yellow-500 text-sm sm:text-base"></i> Motor (Cilindrada) <span className="text-red-300">*</span></label>
                                    <select id="motor" name="motor" value={formData.motor} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a cilindrada...</option>
                                        {CILINDRADAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="group">
                                    <label htmlFor="ano" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-calendar text-indigo-500 text-sm sm:text-base"></i> Ano <span className="text-red-300">*</span></label>
                                    <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="neumorphic-input text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="combustivel" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-water text-cyan-500 text-sm sm:text-base"></i> Combustível <span className="text-red-300">*</span></label>
                                    <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione o combustível...</option>
                                        {TIPOS_COMBUSTIVEL.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="status" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-checkmark-circle text-emerald-500 text-sm sm:text-base"></i> Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="OPERACIONAL">Operacional</option>
                                        <option value="EM_MANUTENCAO">Em Manutenção</option>
                                        <option value="INATIVO">Inativo</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="tagBleId" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-bluetooth text-blue-500 text-sm sm:text-base"></i> ID da Tag BLE
                                        <span className="text-xs text-red-300 ml-1">(opcional - será gerada automaticamente se vazio)</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            id="tagBleId"
                                            name="tagBleId"
                                            value={formData.tagBleId}
                                            onChange={handleChange}
                                            placeholder="Ex: TAG001"
                                            maxLength={50}
                                            className="flex-1 neumorphic-input text-sm sm:text-base"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGerarTagAutomatica}
                                            disabled={isGeneratingTag}
                                            className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-1 text-xs sm:text-sm"
                                            title="Gerar próxima Tag BLE automaticamente"
                                        >
                                            {isGeneratingTag ? (
                                                <i className="ion-ios-sync animate-spin text-sm"></i>
                                            ) : (
                                                <i className="ion-ios-star text-sm"></i>
                                            )}
                                            <span style={{fontFamily: 'Montserrat, sans-serif'}}>{isGeneratingTag ? 'Gerando...' : 'Auto'}</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </fieldset>

                        {/* Mensagens de Sucesso e Erro */}
                        {success && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                                <MdCheckCircle className="text-xl" /> <span>{success}</span>
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300" role="alert">
                                <MdErrorOutline className="text-xl" /> <span>{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <button type="submit" disabled={isLoading} className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <i className="ion-ios-sync animate-spin text-lg"></i>
                                            <span className="text-sm lg:text-base font-black">SALVANDO...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ion-ios-save text-lg"></i>
                                            <span className="text-sm lg:text-base font-black">SALVAR VEÍCULO</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            <Link href="/radar/armazenar" className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-arrow-back text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">VOLTAR PARA O RADAR</span>
                                </div>
                            </Link>
                        </div>
                    </form>
                    </div>
                </div>
            </main>
    );
}

export default function CadastrarVeiculoPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen text-white p-4 md:p-8">
                <div className="container max-w-2xl mx-auto">
                    <div className="neumorphic-container p-6 md:p-8">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-white">Carregando formulário...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        }>
            <CadastrarVeiculoContent />
        </Suspense>
    );
}