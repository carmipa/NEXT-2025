// src/components/wizard-steps/EtapaPatio.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { Building, Text, AlertCircle } from 'lucide-react';

interface EtapaPatioProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaPatio: React.FC<EtapaPatioProps> = ({ wizardData, setWizardData }) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        
        setWizardData(prev => ({
            ...prev,
            patio: {
                ...prev.patio,
                [name]: value
            }
        }));
    };

    const isFormValid = () => {
        const nomeError = validateNomePatio(wizardData.patio.nomePatio);
        return !nomeError;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white">1. Informações Básicas do Pátio</h2>

            <div className="space-y-4">
                <div className="group">
                    <label
                        htmlFor="nomePatio"
                        className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2"
                    >
                        <Building size={16}/> Nome do Pátio <span className="text-red-400">*</span>
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
                        className={`w-full p-2 rounded bg-white text-slate-900 h-10 border-2 transition-colors ${
                            errors.nomePatio ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                    />
                    {errors.nomePatio && (
                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors.nomePatio}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                        {wizardData.patio.nomePatio.length}/50 caracteres
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="observacao"
                        className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-2"
                    >
                        <Text size={16}/> Observação (Opcional)
                    </label>
                    <textarea
                        id="observacao"
                        name="observacao"
                        value={wizardData.patio.observacao || ''}
                        onChange={handleChange}
                        rows={4}
                        maxLength={500}
                        placeholder="Alguma observação sobre o pátio, como localização ou características especiais..."
                        className="w-full p-2 rounded bg-white text-slate-900 border-2 border-gray-300 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        {(wizardData.patio.observacao || '').length}/500 caracteres
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EtapaPatio;