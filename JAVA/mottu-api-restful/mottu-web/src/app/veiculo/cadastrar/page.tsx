"use client";

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MARCAS, MODELOS_POR_MARCA, CILINDRADAS, TIPOS_COMBUSTIVEL } from '@/lib/motoData';

import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { validatePlate } from '@/utils/plateValidation';
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
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [salvamentoConcluido, setSalvamentoConcluido] = useState(false);
    const [veiculoSalvo, setVeiculoSalvo] = useState<VeiculoResponseDto | null>(null);

    useEffect(() => {
        const placaFromQuery = searchParams.get('placa');
        if (placaFromQuery) {
            setFormData(prev => ({ ...prev, placa: placaFromQuery }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Limpar erro de validação quando usuário corrige
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });

        if (name === 'fabricante') {
            setFormData(prev => ({
                ...prev,
                fabricante: value,
                modelo: '',
            }));
            setModelosDisponiveis(MODELOS_POR_MARCA[value] || []);
        } else if (name === 'placa') {
            // Validação em tempo real da placa
            const placaErrorMsg = validatePlate(value);
            setPlacaError(placaErrorMsg);
            
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase() // Converte para maiúscula automaticamente
            }));
        } else if (name === 'chassi') {
            // Permite apenas letras e números e força maiúsculas
            const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                chassi: sanitized
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

    const validateForm = (): boolean => {
        const errors: {[key: string]: string} = {};
        let isValid = true;

        // Validar placa
        if (!formData.placa?.trim()) {
            errors.placa = 'Placa é obrigatória';
            isValid = false;
        } else {
            const placaValidationError = validatePlate(formData.placa);
            if (placaValidationError) {
                errors.placa = placaValidationError;
                isValid = false;
            }
        }

        // Validar RENAVAM (11 dígitos)
        if (!formData.renavam?.trim()) {
            errors.renavam = 'RENAVAM é obrigatório';
            isValid = false;
        } else if (formData.renavam.replace(/\D/g, '').length !== 11) {
            errors.renavam = 'RENAVAM deve ter exatamente 11 dígitos';
            isValid = false;
        }

        // Validar chassi (17 caracteres)
        if (!formData.chassi?.trim()) {
            errors.chassi = 'Chassi é obrigatório';
            isValid = false;
        } else if (formData.chassi.length !== 17) {
            errors.chassi = 'Chassi deve ter exatamente 17 caracteres';
            isValid = false;
        }

        // Validar fabricante
        if (!formData.fabricante?.trim()) {
            errors.fabricante = 'Fabricante é obrigatório';
            isValid = false;
        }

        // Validar modelo
        if (!formData.modelo?.trim()) {
            errors.modelo = 'Modelo é obrigatório';
            isValid = false;
        }

        // Validar motor (cilindrada)
        if (!formData.motor?.trim()) {
            errors.motor = 'Motor (Cilindrada) é obrigatório';
            isValid = false;
        }

        // Validar ano
        if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 2) {
            errors.ano = `Ano deve estar entre 1900 e ${new Date().getFullYear() + 2}`;
            isValid = false;
        }

        // Validar combustível
        if (!formData.combustivel?.trim()) {
            errors.combustivel = 'Combustível é obrigatório';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Proteção contra múltiplas submissões simultâneas
        if (isLoading) {
            console.log('Submissão já em andamento, ignorando novo clique.');
            return;
        }

        // Validar formulário antes de enviar
        if (!validateForm()) {
            setError('❌ Por favor, preencha todos os campos obrigatórios corretamente antes de salvar.');
            setIsLoading(false);
            return;
        }

        // Validação adicional: garantir que não há erros antes de prosseguir
        if (Object.keys(validationErrors).length > 0) {
            setError('❌ Existem erros de validação. Por favor, corrija antes de salvar.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const createdVeiculo: VeiculoResponseDto = await VeiculoService.create(formData);
            setVeiculoSalvo(createdVeiculo);
            setSalvamentoConcluido(true);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao cadastrar veículo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Se o salvamento foi concluído, mostrar tela de relatório/resumo
    if (salvamentoConcluido && veiculoSalvo) {
        return (
            <main className="min-h-screen text-white p-3 sm:p-4 md:p-6 lg:p-8 pb-24 sm:pb-32">
                <div className="container mx-auto max-w-4xl">
                    <div className="neumorphic-container p-4 sm:p-6 md:p-8">
                        {/* Cabeçalho de Sucesso */}
                        <div className="text-center p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg mb-6">
                            <div className="flex items-center justify-center mb-3">
                                <MdCheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                                Veículo Cadastrado com Sucesso!
                            </h2>
                            <p className="text-slate-600 text-lg">
                                ID: <strong className="text-emerald-600">{veiculoSalvo.idVeiculo}</strong>
                            </p>
                        </div>

                        {/* Relatório/Resumo dos Dados */}
                        <div className="space-y-6">
                            {/* Dados do Veículo */}
                            <div className="neumorphic-fieldset p-4 sm:p-6">
                                <legend className="neumorphic-legend flex items-center font-montserrat text-sm sm:text-base">
                                    <i className="ion-ios-bicycle text-2xl text-purple-500 mr-2"></i> Dados do Veículo
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-pricetag text-blue-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Placa:</strong> {veiculoSalvo.placa}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-document text-green-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>RENAVAM:</strong> {veiculoSalvo.renavam}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-barcode text-purple-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Chassi:</strong> {veiculoSalvo.chassi}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-build text-orange-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Fabricante:</strong> {veiculoSalvo.fabricante}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-bicycle text-red-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Modelo:</strong> {veiculoSalvo.modelo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-settings text-yellow-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Motor (Cilindrada):</strong> {veiculoSalvo.motor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-calendar text-indigo-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Ano:</strong> {veiculoSalvo.ano}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-water text-cyan-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Combustível:</strong> {veiculoSalvo.combustivel}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="ion-ios-checkmark-circle text-emerald-500 text-base"></i>
                                        <span className="text-slate-700 font-medium"><strong>Status:</strong> {
                                            veiculoSalvo.status === 'OPERACIONAL' ? 'Operacional' :
                                            veiculoSalvo.status === 'EM_MANUTENCAO' ? 'Em Manutenção' :
                                            veiculoSalvo.status === 'INATIVO' ? 'Inativo' : veiculoSalvo.status
                                        }</span>
                                    </div>
                                    {veiculoSalvo.tagBleId && (
                                        <div className="flex items-center gap-2">
                                            <i className="ion-ios-bluetooth text-blue-500 text-base"></i>
                                            <span className="text-slate-700 font-medium"><strong>Tag BLE:</strong> <span className="font-mono">{veiculoSalvo.tagBleId}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botão de Voltar */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 mt-6 border-t border-slate-300">
                            <Link
                                href="/veiculo/listar"
                                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300 flex items-center justify-center gap-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <i className="ion-ios-arrow-back text-lg"></i>
                                    <span className="text-sm lg:text-base font-black">VOLTAR À LISTA</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

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
                                        className={`neumorphic-input text-sm sm:text-base ${placaError || validationErrors.placa ? 'border-red-500' : ''}`}
                                        style={{fontFamily: 'Montserrat, sans-serif'}} 
                                    />
                                    {(placaError || validationErrors.placa) && (
                                        <p className="text-red-400 text-xs mt-1">{placaError || validationErrors.placa}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="renavam" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-document text-green-500 text-sm sm:text-base"></i> RENAVAM <span className="text-red-300">*</span></label>
                                    <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} placeholder="11 dígitos" className={`neumorphic-input text-sm sm:text-base ${validationErrors.renavam ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    {validationErrors.renavam && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.renavam}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="chassi" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-barcode text-purple-500 text-sm sm:text-base"></i> Chassi <span className="text-red-300">*</span></label>
                                    <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} placeholder="17 caracteres" className={`neumorphic-input text-sm sm:text-base ${validationErrors.chassi ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}} inputMode="text" pattern="[A-Za-z0-9]{1,17}" />
                                    {validationErrors.chassi && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.chassi}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="fabricante" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-build text-orange-500 text-sm sm:text-base"></i> Fabricante <span className="text-red-300">*</span></label>
                                    <select id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required className={`neumorphic-select text-sm sm:text-base ${validationErrors.fabricante ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a marca...</option>
                                        {MARCAS.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                                    </select>
                                    {validationErrors.fabricante && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.fabricante}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="modelo" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-bicycle text-red-500 text-sm sm:text-base"></i> Modelo <span className="text-red-300">*</span></label>
                                    <select id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} disabled={!formData.fabricante} required className={`neumorphic-select text-sm sm:text-base ${validationErrors.modelo ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Primeiro, selecione a marca...</option>
                                        {modelosDisponiveis.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
                                    </select>
                                    {validationErrors.modelo && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.modelo}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="motor" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-settings text-yellow-500 text-sm sm:text-base"></i> Motor (Cilindrada) <span className="text-red-300">*</span></label>
                                    <select id="motor" name="motor" value={formData.motor} onChange={handleChange} required className={`neumorphic-select text-sm sm:text-base ${validationErrors.motor ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a cilindrada...</option>
                                        {CILINDRADAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {validationErrors.motor && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.motor}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="ano" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-calendar text-indigo-500 text-sm sm:text-base"></i> Ano <span className="text-red-300">*</span></label>
                                    <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className={`neumorphic-input text-sm sm:text-base ${validationErrors.ano ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}} />
                                    {validationErrors.ano && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.ano}</p>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="combustivel" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-water text-cyan-500 text-sm sm:text-base"></i> Combustível <span className="text-red-300">*</span></label>
                                    <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className={`neumorphic-select text-sm sm:text-base ${validationErrors.combustivel ? 'border-red-500' : ''}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione o combustível...</option>
                                        {TIPOS_COMBUSTIVEL.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {validationErrors.combustivel && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.combustivel}</p>
                                    )}
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
                            <button type="submit" disabled={isLoading || salvamentoConcluido || Object.keys(validationErrors).length > 0} className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
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