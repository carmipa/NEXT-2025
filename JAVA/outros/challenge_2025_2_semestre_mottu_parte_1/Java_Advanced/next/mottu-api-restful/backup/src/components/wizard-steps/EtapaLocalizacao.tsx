// src/components/wizard-steps/EtapaLocalizacao.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { EnderecoService } from '@/utils/api';
import { IMaskInput } from 'react-imask';
import { MapPin, AlertCircle } from 'lucide-react';

interface EtapaLocalizacaoProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaLocalizacao: React.FC<EtapaLocalizacaoProps> = ({ wizardData, setWizardData }) => {
    const [cepError, setCepError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    // Funções de validação
    const validateCEP = (cep: string): string | null => {
        if (!cep.trim()) return "CEP é obrigatório";
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return "CEP deve ter 8 dígitos";
        return null;
    };

    const validateNumero = (numero: number): string | null => {
        if (!numero || numero <= 0) return "Número é obrigatório";
        if (numero > 99999) return "Número muito grande";
        return null;
    };

    const buscarCep = async (cep: string) => {
        if (cep.length !== 8) return;
        
        setIsLoadingCep(true);
        setCepError(null);
        
        try {
            const response = await EnderecoService.buscarCep(cep);
            if (response.erro) {
                setCepError('CEP não encontrado');
                return;
            }
            
            setWizardData(prev => ({
                ...prev,
                dadosViaCep: {
                    logradouro: response.logradouro || '',
                    bairro: response.bairro || '',
                    cidade: response.cidade || '',
                    estado: response.estado || '',
                    pais: 'Brasil'
                }
            }));
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setCepError('Erro ao consultar CEP');
        } finally {
            setIsLoadingCep(false);
        }
    };

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'numero' ? parseInt(value, 10) || 0 : value;
        
        if (name === 'numero') {
            const error = validateNumero(parsedValue);
            setErrors(prev => ({ ...prev, numero: error || '' }));
        }
        
        setWizardData(prev => ({
            ...prev,
            endereco: { ...prev.endereco, [name]: parsedValue }
        }));
    };

    const handleCepMaskChange = (value: string) => {
        const cleanCep = value.replace(/\D/g, '');
        const error = validateCEP(cleanCep);
        setErrors(prev => ({ ...prev, cep: error || '' }));
        
        setWizardData(prev => ({
            ...prev,
            endereco: { ...prev.endereco, cep: cleanCep }
        }));
        
        if (cleanCep.length === 8) {
            buscarCep(cleanCep);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin size={20} /> 3. Localização do Pátio
            </h2>
            <p className="text-slate-300 text-sm">
                Informe o endereço completo do pátio
            </p>

            <div className="space-y-4">
                {/* CEP e Número em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="cep" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> CEP <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <IMaskInput
                                id="cep"
                                name="cep"
                                mask="00000-000"
                                unmask={false}
                                value={wizardData.endereco.cep}
                                onAccept={handleCepMaskChange}
                                required
                                placeholder="00000-000"
                                className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                    errors.cep || cepError
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-blue-500'
                                }`}
                            />
                            {isLoadingCep && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>
                        {errors.cep && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.cep}
                            </p>
                        )}
                        {cepError && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {cepError}
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label htmlFor="numero" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> Número <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="numero"
                            name="numero"
                            value={wizardData.endereco.numero || ''}
                            onChange={handleEnderecoChange}
                            required
                            min="1"
                            max="99999"
                            placeholder="123"
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.numero 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.numero && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.numero}
                            </p>
                        )}
                    </div>
                </div>

                {/* Logradouro (preenchido automaticamente) */}
                <div className="group">
                    <label htmlFor="logradouro" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                        <MapPin size={16} /> Logradouro
                    </label>
                    <input
                        type="text"
                        id="logradouro"
                        value={wizardData.dadosViaCep.logradouro}
                        readOnly
                        placeholder="Preenchido automaticamente pelo CEP"
                        className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 border-2 border-gray-300"
                    />
                </div>

                {/* Bairro e Cidade em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="bairro" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> Bairro
                        </label>
                        <input
                            type="text"
                            id="bairro"
                            value={wizardData.dadosViaCep.bairro}
                            readOnly
                            placeholder="Preenchido automaticamente pelo CEP"
                            className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 border-2 border-gray-300"
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="cidade" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> Cidade
                        </label>
                        <input
                            type="text"
                            id="cidade"
                            value={wizardData.dadosViaCep.cidade}
                            readOnly
                            placeholder={wizardData.dadosViaCep.cidade ? "" : "Preenchido automaticamente pelo CEP"}
                            className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 border-2 border-gray-300"
                        />
                    </div>
                </div>

                {/* Estado e País em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="estado" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> Estado
                        </label>
                        <input
                            type="text"
                            id="estado"
                            value={wizardData.dadosViaCep.estado}
                            readOnly
                            placeholder={wizardData.dadosViaCep.estado ? "" : "Preenchido automaticamente pelo CEP"}
                            className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 border-2 border-gray-300"
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="pais" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2">
                            <MapPin size={16} /> País
                        </label>
                        <input
                            type="text"
                            id="pais"
                            value={wizardData.dadosViaCep.pais}
                            readOnly
                            className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 border-2 border-gray-300"
                        />
                    </div>
                </div>

                {/* Campo de Complemento */}
                <div className="mt-6">
                    <label
                        htmlFor="complemento"
                        className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2"
                    >
                        <MapPin size={16} /> Complemento (Opcional)
                    </label>
                    <input
                        type="text"
                        id="complemento"
                        name="complemento"
                        value={wizardData.endereco.complemento || ''}
                        onChange={(e) => {
                            setWizardData(prev => ({
                                ...prev,
                                endereco: {
                                    ...prev.endereco,
                                    complemento: e.target.value
                                }
                            }));
                        }}
                        placeholder="Ex: Apto 101, Bloco A, Sala 205, etc..."
                        maxLength={60}
                        className="w-full p-3 rounded bg-white text-slate-900 border-2 border-gray-300 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        {(wizardData.endereco.complemento || '').length}/60 caracteres
                    </p>
                </div>

                {/* Campo de Observação */}
                <div className="mt-4">
                    <label
                        htmlFor="observacao"
                        className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2"
                    >
                        <MapPin size={16} /> Observação (Opcional)
                    </label>
                    <textarea
                        id="observacao"
                        name="observacao"
                        value={wizardData.endereco.observacao || ''}
                        onChange={(e) => {
                            setWizardData(prev => ({
                                ...prev,
                                endereco: {
                                    ...prev.endereco,
                                    observacao: e.target.value
                                }
                            }));
                        }}
                        rows={3}
                        maxLength={200}
                        placeholder="Informações adicionais sobre a localização, pontos de referência, instruções de acesso, etc..."
                        className="w-full p-3 rounded bg-white text-slate-900 border-2 border-gray-300 focus:border-blue-500 transition-colors resize-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        {(wizardData.endereco.observacao || '').length}/200 caracteres
                    </p>
                </div>

            </div>
        </div>
    );
};

export default EtapaLocalizacao;
