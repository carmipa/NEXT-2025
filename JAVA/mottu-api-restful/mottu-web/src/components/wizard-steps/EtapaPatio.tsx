// src/components/wizard-steps/EtapaPatio.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';

interface EtapaPatioProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaPatio: React.FC<EtapaPatioProps> = ({ wizardData, setWizardData }) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const MAX_OBS = 500;

    const validateNomePatio = (nome: string): string | null => {
        if (!nome.trim()) {
            return "O nome do pátio é obrigatório";
        }
        if (nome.trim().length < 3) {
            return "O nome deve ter pelo menos 3 caracteres";
        }
        if (nome.trim().length > 50) {
            return "O nome deve ter no máximo 50 caracteres";
        }
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Validação em tempo real
        if (name === 'nomePatio') {
            const error = validateNomePatio(value);
            setErrors(prev => ({
                ...prev,
                [name]: error || ''
            }));
        }
        
        // Enforce limite de observação também em colagens
        const nextValue = name === 'observacao' ? value.slice(0, MAX_OBS) : value;

        setWizardData(prev => ({
            ...prev,
            patio: {
                ...prev.patio,
                [name]: nextValue
            }
        }));
    };

    const isFormValid = () => {
        const nomeError = validateNomePatio(wizardData.patio.nomePatio);
        return !nomeError;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <i className="ion-ios-home text-blue-400"></i>
                1. Informações Básicas do Pátio
            </h2>

            <div className="space-y-4">
                <div className="group">
                    <label
                        htmlFor="nomePatio"
                        className="neumorphic-label text-white mb-1 flex items-center gap-2"
                    >
                        <i className="ion-ios-building text-blue-400"></i> Nome do Pátio <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="nomePatio"
                        name="nomePatio"
                        value={wizardData.patio.nomePatio}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Pátio Principal Guarulhos"
                        maxLength={50}
                        className={`neumorphic-input h-10 ${
                            errors.nomePatio ? 'ring-2 ring-red-400' : ''
                        }`}
                    />
                    {errors.nomePatio && (
                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                            <i className="ion-ios-close-circle text-sm"></i>
                            {errors.nomePatio}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-white opacity-70">
                        {wizardData.patio.nomePatio.length}/50 caracteres
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="observacao"
                        className="neumorphic-label text-white mb-1 flex items-center gap-2"
                    >
                        <i className="ion-ios-document text-green-400"></i> Observação (Opcional)
                    </label>
                    <textarea
                        id="observacao"
                        name="observacao"
                        value={wizardData.patio.observacao || ''}
                        onChange={handleChange}
                        rows={4}
                        maxLength={MAX_OBS}
                        placeholder="Alguma observação sobre o pátio, como localização ou características especiais..."
                        className="neumorphic-textarea"
                    />
                    {(() => {
                        const len = (wizardData.patio.observacao || '').length;
                        const restante = MAX_OBS - len;
                        const nearLimit = restante <= 20;
                        return (
                            <p className={`mt-1 text-xs ${nearLimit ? 'text-red-300' : 'text-white opacity-70'}`}>
                                {len}/{MAX_OBS} caracteres {nearLimit && `(restam ${restante})`}
                                {restante === 0 && ' — você atingiu o limite.'}
                            </p>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default EtapaPatio;