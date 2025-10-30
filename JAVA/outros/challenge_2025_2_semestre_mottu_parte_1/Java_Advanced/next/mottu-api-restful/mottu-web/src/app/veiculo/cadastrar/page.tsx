"use client";

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MARCAS, MODELOS_POR_MARCA, CILINDRADAS, TIPOS_COMBUSTIVEL } from '@/lib/motoData';

import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
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
        <main className="min-h-screen text-white p-4 md:p-8 pb-32">
                <div className="container max-w-2xl mx-auto">
                    <div className="neumorphic-container p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <i className="ion-ios-bicycle mr-3 text-3xl text-[var(--color-mottu-dark)]"></i>
                            Cadastrar Nova Moto
                        </h1>


                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset className="neumorphic-fieldset">
                            <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Dados da Moto</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                                <div className="group">
                                    <label htmlFor="placa" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-pricetag text-blue-500"></i> Placa <span className="text-red-300">*</span></label>
                                    <input 
                                        type="text" 
                                        id="placa" 
                                        name="placa" 
                                        value={formData.placa} 
                                        onChange={handleChange}
                                        required 
                                        maxLength={10} 
                                        placeholder="ABC-1234" 
                                        className="neumorphic-input" 
                                        style={{fontFamily: 'Montserrat, sans-serif'}} 
                                    />
                                </div>

                                <div className="group">
                                    <label htmlFor="renavam" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-document text-green-500"></i> RENAVAM <span className="text-red-300">*</span></label>
                                    <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} placeholder="11 dígitos" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="chassi" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-barcode text-purple-500"></i> Chassi <span className="text-red-300">*</span></label>
                                    <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} placeholder="17 caracteres" className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="fabricante" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-build text-orange-500"></i> Fabricante <span className="text-red-300">*</span></label>
                                    <select id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a marca...</option>
                                        {MARCAS.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                                    </select>
                                </div>

                                <div className="group">
                                    <label htmlFor="modelo" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-bicycle text-red-500"></i> Modelo <span className="text-red-300">*</span></label>
                                    <select id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} disabled={!formData.fabricante} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Primeiro, selecione a marca...</option>
                                        {modelosDisponiveis.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="motor" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-settings text-yellow-500"></i> Motor (Cilindrada) <span className="text-red-300">*</span></label>
                                    <select id="motor" name="motor" value={formData.motor} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a cilindrada...</option>
                                        {CILINDRADAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="group">
                                    <label htmlFor="ano" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-calendar text-indigo-500"></i> Ano <span className="text-red-300">*</span></label>
                                    <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="neumorphic-input" style={{fontFamily: 'Montserrat, sans-serif'}} />
                                </div>

                                <div className="group">
                                    <label htmlFor="combustivel" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-water text-cyan-500"></i> Combustível <span className="text-red-300">*</span></label>
                                    <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione o combustível...</option>
                                        {TIPOS_COMBUSTIVEL.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="status" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-checkmark-circle text-emerald-500"></i> Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="OPERACIONAL">Operacional</option>
                                        <option value="EM_MANUTENCAO">Em Manutenção</option>
                                        <option value="INATIVO">Inativo</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="tagBleId" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <i className="ion-ios-bluetooth text-blue-500"></i> ID da Tag BLE
                                        <span className="text-xs text-red-300 ml-1">(opcional - será gerada automaticamente se vazio)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="tagBleId"
                                            name="tagBleId"
                                            value={formData.tagBleId}
                                            onChange={handleChange}
                                            placeholder="Ex: TAG001"
                                            maxLength={50}
                                            className="flex-1 neumorphic-input"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGerarTagAutomatica}
                                            disabled={isGeneratingTag}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-1 text-sm"
                                            title="Gerar próxima Tag BLE automaticamente"
                                        >
                                            {isGeneratingTag ? (
                                                <i className="ion-ios-sync animate-spin"></i>
                                            ) : (
                                                <i className="ion-ios-star"></i>
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

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button type="submit" disabled={isLoading} className="neumorphic-button-green">
                                {isLoading ? <><i className="ion-ios-sync animate-spin mr-2"></i> Salvando...</> : <><i className="ion-ios-save mr-2"></i> Salvar Veículo</>}
                            </button>
                            <Link href="/radar/armazenar" className="neumorphic-button">
                                <i className="ion-ios-arrow-back mr-2"></i> Voltar para o Radar
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