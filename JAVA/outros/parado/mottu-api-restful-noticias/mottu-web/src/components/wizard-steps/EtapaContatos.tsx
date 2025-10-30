// src/components/wizard-steps/EtapaContatos.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { IMaskInput } from 'react-imask';
import { Phone, Mail, AlertCircle } from 'lucide-react';

interface EtapaContatosProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaContatos: React.FC<EtapaContatosProps> = ({ wizardData, setWizardData }) => {
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

    const handleContatoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = ['ddd', 'ddi'].includes(name) ? parseInt(value, 10) || 0 : value;
        
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
            contato: { ...prev.contato, [name]: parsedValue }
        }));
    };

    const handleTelefoneMaskChange = (value: string, fieldName: string) => {
        const cleanValue = value.replace(/\D/g, '');
        let error: string | null = null;
        
        if (fieldName === 'telefone1') {
            error = validateTelefone(value, 'Telefone fixo');
        } else if (fieldName === 'celular') {
            error = validateTelefone(value, 'Celular');
        }
        
        if (error !== null) {
            setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
        }
        
        setWizardData(prev => ({
            ...prev,
            contato: { ...prev.contato, [fieldName]: cleanValue }
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <i className="ion-ios-call text-pink-400"></i> 2. Dados de Contato
            </h2>
            <p className="text-white opacity-70 text-sm">
                Informe os dados de contato do pátio para comunicação
            </p>

            <div className="space-y-4">
                {/* E-mail */}
                <div className="group">
                    <label htmlFor="email" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                        <i className="ion-ios-mail text-blue-400"></i> E-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={wizardData.contato.email}
                        onChange={handleContatoChange}
                        required
                        placeholder="contato@exemplo.com"
                        className={`neumorphic-input h-10 ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                            <i className="ion-ios-close-circle text-sm"></i>
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* DDD e DDI em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="ddd" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-call text-green-400"></i> DDD <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="ddd"
                            name="ddd"
                            value={wizardData.contato.ddd || ''}
                            onChange={handleContatoChange}
                            required
                            min="11"
                            max="99"
                            placeholder="11"
                            className={`neumorphic-input h-10 ${errors.ddd ? 'ring-2 ring-red-400' : ''}`}
                        />
                        {errors.ddd && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <i className="ion-ios-close-circle text-sm"></i>
                                {errors.ddd}
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label htmlFor="ddi" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-globe text-purple-400"></i> DDI <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="ddi"
                            name="ddi"
                            value={wizardData.contato.ddi || ''}
                            onChange={handleContatoChange}
                            required
                            min="1"
                            max="999"
                            placeholder="55"
                            className={`neumorphic-input h-10 ${errors.ddi ? 'ring-2 ring-red-400' : ''}`}
                        />
                        {errors.ddi && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <i className="ion-ios-close-circle text-sm"></i>
                                {errors.ddi}
                            </p>
                        )}
                    </div>
                </div>

                {/* Telefone Fixo e Celular em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="telefone1" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-call text-orange-400"></i> Telefone Fixo <span className="text-red-400">*</span>
                        </label>
                        <IMaskInput
                            id="telefone1"
                            name="telefone1"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone1}
                            onAccept={(value) => handleTelefoneMaskChange(value, 'telefone1')}
                            required
                            placeholder="(11) 1234-5678"
                            className={`neumorphic-input h-10 ${errors.telefone1 ? 'ring-2 ring-red-400' : ''}`}
                        />
                        {errors.telefone1 && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <i className="ion-ios-close-circle text-sm"></i>
                                {errors.telefone1}
                            </p>
                        )}
                    </div>

                    <div className="group">
                        <label htmlFor="celular" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-phone-portrait text-cyan-400"></i> Celular <span className="text-red-400">*</span>
                        </label>
                        <IMaskInput
                            id="celular"
                            name="celular"
                            mask="(00) 00000-0000"
                            unmask={false}
                            value={wizardData.contato.celular}
                            onAccept={(value) => handleTelefoneMaskChange(value, 'celular')}
                            required
                            placeholder="(11) 91234-5678"
                            className={`neumorphic-input h-10 ${errors.celular ? 'ring-2 ring-red-400' : ''}`}
                        />
                        {errors.celular && (
                            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <i className="ion-ios-close-circle text-sm"></i>
                                {errors.celular}
                            </p>
                        )}
                    </div>
                </div>

                {/* Telefones opcionais em linha */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label htmlFor="telefone2" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-call text-yellow-400"></i> Telefone 2
                        </label>
                        <IMaskInput
                            id="telefone2"
                            name="telefone2"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone2 || ''}
                            onAccept={(value) => {
                                const cleanValue = value.replace(/\D/g, '');
                                setWizardData(prev => ({
                                    ...prev,
                                    contato: { ...prev.contato, telefone2: cleanValue }
                                }));
                            }}
                            placeholder="(11) 2345-6789"
                            className="neumorphic-input h-10"
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="telefone3" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                            <i className="ion-ios-call text-red-400"></i> Telefone 3
                        </label>
                        <IMaskInput
                            id="telefone3"
                            name="telefone3"
                            mask="(00) 0000-0000"
                            unmask={false}
                            value={wizardData.contato.telefone3 || ''}
                            onAccept={(value) => {
                                const cleanValue = value.replace(/\D/g, '');
                                setWizardData(prev => ({
                                    ...prev,
                                    contato: { ...prev.contato, telefone3: cleanValue }
                                }));
                            }}
                            placeholder="(11) 3456-7890"
                            className="neumorphic-input h-10"
                        />
                    </div>
                </div>

                {/* Outro contato */}
                <div className="group">
                    <label htmlFor="outro" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                        <i className="ion-ios-chatboxes text-indigo-400"></i> Outro Contato
                    </label>
                    <input
                        type="text"
                        id="outro"
                        name="outro"
                        value={wizardData.contato.outro || ''}
                        onChange={handleContatoChange}
                        maxLength={100}
                        placeholder="WhatsApp, Telegram, etc."
                        className="neumorphic-input h-10"
                    />
                    <p className="mt-1 text-xs text-white opacity-70">
                        {(wizardData.contato.outro || '').length}/100 caracteres
                    </p>
                </div>

                {/* Observação do contato */}
                <div className="group">
                    <label htmlFor="observacao" className="neumorphic-label text-white mb-1 flex items-center gap-2">
                        <i className="ion-ios-document text-gray-400"></i> Observações do Contato
                    </label>
                    <textarea
                        id="observacao"
                        name="observacao"
                        value={wizardData.contato.observacao || ''}
                        onChange={handleContatoChange}
                        rows={3}
                        maxLength={300}
                        placeholder="Informações adicionais sobre o contato..."
                        className="neumorphic-textarea"
                    />
                    <p className="mt-1 text-xs text-white opacity-70">
                        {(wizardData.contato.observacao || '').length}/300 caracteres
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EtapaContatos;
