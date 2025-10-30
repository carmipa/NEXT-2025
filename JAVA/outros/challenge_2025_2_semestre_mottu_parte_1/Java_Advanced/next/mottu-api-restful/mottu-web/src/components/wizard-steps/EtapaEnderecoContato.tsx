// src/components/wizard-steps/EtapaEnderecoContato.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { EnderecoService } from '@/utils/api';
import { IMaskInput } from 'react-imask';
import { Home, Phone, MapPin, Mail, AlertCircle } from 'lucide-react';
import { MdErrorOutline } from 'react-icons/md';

interface EtapaEnderecoContatoProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaEnderecoContato: React.FC<EtapaEnderecoContatoProps> = ({ wizardData, setWizardData }) => {
    const [cepError, setCepError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Funções de validação
    const validateEmail = (email: string): string | null => {
        if (!email.trim()) return "E-mail é obrigatório";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "E-mail inválido";
        return null;
    };

    const validateTelefone = (telefone: string, nome: string): string | null => {
        if (!telefone.trim()) return `${nome} é obrigatório`;
        const cleanTel = telefone.replace(/\D/g, '');
        if (cleanTel.length < 10) return `${nome} deve ter pelo menos 10 dígitos`;
        return null;
    };

    const validateDDD = (ddd: number): string | null => {
        if (!ddd || ddd < 11 || ddd > 99) return "DDD deve estar entre 11 e 99";
        return null;
    };

    const validateDDI = (ddi: number): string | null => {
        if (!ddi || ddi < 1 || ddi > 999) return "DDI deve estar entre 1 e 999";
        return null;
    };

    const validateCEP = (cep: string): string | null => {
        if (!cep.trim()) return "CEP é obrigatório";
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return "CEP deve ter 8 dígitos";
        return null;
    };

    const validateNumero = (numero: number): string | null => {
        if (!numero || numero <= 0) return "Número é obrigatório e deve ser maior que zero";
        return null;
    };

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'numero' ? parseInt(value, 10) || 0 : value;
        
        // Validação em tempo real
        if (name === 'numero') {
            const error = validateNumero(parsedValue);
            setErrors(prev => ({ ...prev, numero: error || '' }));
        }
        
        setWizardData(prev => ({
            ...prev,
            endereco: {
                ...prev.endereco,
                [name]: parsedValue
            }
        }));
    };

    const handleContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = ['ddd', 'ddi'].includes(name) ? parseInt(value, 10) || 0 : value;
        
        // Validação em tempo real
        let error: string | null = null;
        if (name === 'email') {
            error = validateEmail(value);
        } else if (name === 'telefone1') {
            error = validateTelefone(value, 'Telefone fixo');
        } else if (name === 'celular') {
            error = validateTelefone(value, 'Celular');
        } else if (name === 'ddd') {
            error = validateDDD(parsedValue as number);
        } else if (name === 'ddi') {
            error = validateDDI(parsedValue as number);
        }
        
        if (error !== null) {
            setErrors(prev => ({ ...prev, [name]: error || '' }));
        }
        
        setWizardData(prev => ({
            ...prev,
            contato: {
                ...prev.contato,
                [name]: parsedValue
            }
        }));
    };

    const handleCepMaskChange = (value: string) => {
        const cleanCep = value.replace(/\D/g, '');
        
        // Validação do CEP
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

    const buscarCep = async (cep: string) => {
        setCepError(null);
        try {
            const dados = await EnderecoService.buscarCep(cep);
            setWizardData(prev => ({
                ...prev,
                dadosViaCep: dados
            }));
        } catch (err: any) {
            setCepError(`Erro ao buscar CEP: ${err.message}`);
            setWizardData(prev => ({
                ...prev,
                dadosViaCep: { logradouro: '', bairro: '', cidade: '', estado: '', pais: 'Brasil' }
            }));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white">2. Endereço e Contato Principal do Pátio</h2>

            {/* --- Seção de Endereço --- */}
            <fieldset className="border border-slate-700/50 p-4 rounded-md">
                <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2"><Home size={18}/> Endereço</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="group">
                        <label htmlFor="cep" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><MapPin size={16} /> CEP <span className="text-red-400">*</span></label>
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
                                errors.cep ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.cep && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.cep}
                            </p>
                        )}
                        {cepError && <p className="mt-1 text-xs text-red-400">{cepError}</p>}
                    </div>
                    <div className="group">
                        <label htmlFor="numero" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Home size={16} /> Número <span className="text-red-400">*</span></label>
                        <input 
                            type="number" 
                            id="numero" 
                            name="numero" 
                            value={wizardData.endereco.numero || ''} 
                            onChange={handleEnderecoChange} 
                            required 
                            min={1} 
                            placeholder="123" 
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.numero ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.numero && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.numero}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-100 mb-1">Logradouro</label>
                        <input type="text" value={wizardData.dadosViaCep.logradouro} readOnly className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-100 mb-1">Bairro</label>
                        <input type="text" value={wizardData.dadosViaCep.bairro} readOnly className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-100 mb-1">Cidade</label>
                        <input type="text" value={wizardData.dadosViaCep.cidade} readOnly className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-100 mb-1">Estado (UF)</label>
                        <input type="text" value={wizardData.dadosViaCep.estado} readOnly className="w-full p-2 rounded bg-gray-100 text-slate-600 h-10 cursor-not-allowed" />
                    </div>
                </div>
            </fieldset>

            {/* --- Seção de Contato --- */}
            <fieldset className="border border-slate-700/50 p-4 rounded-md">
                <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2"><Phone size={18}/> Contato</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="group">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Mail size={16} /> E-mail <span className="text-red-400">*</span></label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={wizardData.contato.email} 
                            onChange={handleContatoChange} 
                            required 
                            placeholder="contato@patio.com" 
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="celular" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Phone size={16} /> Celular <span className="text-red-400">*</span></label>
                        <IMaskInput
                            id="celular"
                            name="celular"
                            mask="(00) 00000-0000"
                            unmask={false}
                            value={wizardData.contato.celular}
                            onAccept={(value) => {
                                const e = { target: { name: 'celular', value } } as any;
                                handleContatoChange(e);
                            }}
                            required
                            placeholder="(11) 98765-4321"
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.celular ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.celular && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.celular}
                            </p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="telefone1" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Phone size={16} /> Telefone Fixo <span className="text-red-400">*</span></label>
                        <IMaskInput
                            id="telefone1"
                            name="telefone1"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone1}
                            onAccept={(value) => {
                                const e = { target: { name: 'telefone1', value } } as any;
                                handleContatoChange(e);
                            }}
                            required
                            placeholder="(11) 3456-7890"
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.telefone1 ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.telefone1 && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.telefone1}
                            </p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="ddd" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1">DDD <span className="text-red-400">*</span></label>
                        <input 
                            type="number" 
                            id="ddd" 
                            name="ddd" 
                            value={wizardData.contato.ddd} 
                            onChange={handleContatoChange} 
                            required 
                            min={11} 
                            max={99} 
                            placeholder="11" 
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.ddd ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.ddd && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.ddd}
                            </p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="ddi" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1">DDI <span className="text-red-400">*</span></label>
                        <input 
                            type="number" 
                            id="ddi" 
                            name="ddi" 
                            value={wizardData.contato.ddi} 
                            onChange={handleContatoChange} 
                            required 
                            min={1} 
                            max={999} 
                            placeholder="55" 
                            className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                                errors.ddi ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        />
                        {errors.ddi && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.ddi}
                            </p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="telefone2" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Phone size={16} /> Telefone 2 (Opcional)</label>
                        <IMaskInput
                            id="telefone2"
                            name="telefone2"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone2 || ''}
                            onAccept={(value) => {
                                const e = { target: { name: 'telefone2', value } } as any;
                                handleContatoChange(e);
                            }}
                            placeholder="(11) 2345-6789"
                            className="w-full p-2 rounded bg-white text-slate-900 h-10 border-2 border-gray-300 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="telefone3" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Phone size={16} /> Telefone 3 (Opcional)</label>
                        <IMaskInput
                            id="telefone3"
                            name="telefone3"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone3 || ''}
                            onAccept={(value) => {
                                const e = { target: { name: 'telefone3', value } } as any;
                                handleContatoChange(e);
                            }}
                            placeholder="(11) 1234-5678"
                            className="w-full p-2 rounded bg-white text-slate-900 h-10 border-2 border-gray-300 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="outro" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Phone size={16} /> Outro Contato (Opcional)</label>
                        <input 
                            type="text" 
                            id="outro" 
                            name="outro" 
                            value={wizardData.contato.outro || ''} 
                            onChange={handleContatoChange} 
                            maxLength={100}
                            placeholder="WhatsApp, Telegram, etc." 
                            className="w-full p-2 rounded bg-white text-slate-900 h-10 border-2 border-gray-300 focus:border-blue-500 transition-colors" 
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            {(wizardData.contato.outro || '').length}/100 caracteres
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="observacao" className="block text-sm font-medium text-slate-100 mb-1">Observações do Contato</label>
                    <textarea 
                        id="observacao" 
                        name="observacao" 
                        value={wizardData.contato.observacao || ''} 
                        onChange={handleContatoChange} 
                        rows={3} 
                        maxLength={300}
                        placeholder="Informações adicionais sobre o contato..." 
                        className="w-full p-2 rounded bg-white text-slate-900 border-2 border-gray-300 focus:border-blue-500 transition-colors" 
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        {(wizardData.contato.observacao || '').length}/300 caracteres
                    </p>
                </div>
            </fieldset>
        </div>
    );
};

export default EtapaEnderecoContato;