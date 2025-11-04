// src/components/wizard-steps/EtapaZonas.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';

interface EtapaZonasProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

const EtapaZonas: React.FC<EtapaZonasProps> = ({ wizardData, setWizardData }) => {

    const [nomeNovaZona, setNomeNovaZona] = useState('');
    const [observacaoNovaZona, setObservacaoNovaZona] = useState('');

    const handleAddZona = () => {
        if (nomeNovaZona.trim() === '') {
            alert('O nome da zona não pode ser vazio.');
            return;
        }

        // Verifica se o nome da zona já existe
        if (wizardData.zonas.some(zona => zona.nome.toLowerCase() === nomeNovaZona.trim().toLowerCase())) {
            alert('Uma zona com este nome já foi adicionada.');
            return;
        }

        setWizardData(prev => ({
            ...prev,
            zonas: [
                ...prev.zonas,
                {
                    nome: nomeNovaZona.trim(),
                    observacao: observacaoNovaZona.trim(),
                    status: 'A' // Status padrão para novas zonas
                }
            ]
        }));

        // Limpa os campos após adicionar
        setNomeNovaZona('');
        setObservacaoNovaZona('');
    };

    const handleRemoveZona = (nomeZonaParaRemover: string) => {
        if (confirm(`Tem certeza que deseja remover a zona "${nomeZonaParaRemover}"?`)) {
            setWizardData(prev => ({
                ...prev,
                // Remove a zona e também todos os boxes associados a ela
                zonas: prev.zonas.filter(zona => zona.nome !== nomeZonaParaRemover),
                boxes: prev.boxes.filter(box => box.zonaNome !== nomeZonaParaRemover)
            }));
        }
    };

    const handleRemoveAllZonas = () => {
        if (wizardData.zonas.length === 0) {
            alert('Não há zonas para remover.');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover TODAS as ${wizardData.zonas.length} zonas? Esta ação também removerá todos os boxes associados e não pode ser desfeita.`)) {
            setWizardData(prev => ({
                ...prev,
                zonas: [],
                boxes: [] // Remove todos os boxes também, já que eles dependem das zonas
            }));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <i className="ion-ios-map text-green-400"></i> 4. Adicionar Zonas ao Pátio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lado Esquerdo: Formulário para adicionar nova zona */}
                <div className="p-4 rounded-lg space-y-4 neumorphic-container">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <i className="ion-ios-add-circle text-green-400"></i>
                        Criar Nova Zona
                    </h3>

                    <div className="group">
                        <label htmlFor="nomeNovaZona" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                            <i className="ion-ios-create text-blue-500 text-lg"></i> Nome da Zona <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="nomeNovaZona"
                            value={nomeNovaZona}
                            onChange={(e) => setNomeNovaZona(e.target.value)}
                            maxLength={50}
                            placeholder="Ex: Setor A - Coberto"
                            className="neumorphic-input h-10"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {nomeNovaZona.length}/50 caracteres
                        </p>
                    </div>

                    <div>
                        <label htmlFor="observacaoNovaZona" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                            <i className="ion-ios-document text-purple-500 text-lg"></i> Observação (Opcional)
                        </label>
                        <textarea
                            id="observacaoNovaZona"
                            value={observacaoNovaZona}
                            onChange={(e) => setObservacaoNovaZona(e.target.value)}
                            rows={3}
                            maxLength={300}
                            placeholder="Ex: Próximo à entrada principal"
                            className="neumorphic-textarea"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {observacaoNovaZona.length}/300 caracteres
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddZona}
                        className="neumorphic-button-green w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <i className="ion-ios-add-circle"></i>
                        Adicionar Zona à Lista
                    </button>
                </div>

                {/* Lado Direito: Lista de zonas já adicionadas */}
                <div className="p-4 rounded-lg neumorphic-container">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white">
                            Zonas Adicionadas ({wizardData.zonas.length})
                        </h3>
                        {wizardData.zonas.length > 0 && (
                            <button
                                onClick={handleRemoveAllZonas}
                                className="neumorphic-button px-3 py-1 text-red-600 text-sm transition-colors flex items-center gap-2"
                                title="Remover todas as zonas"
                            >
                                <i className="ion-ios-trash"></i>
                                Remover Todas
                            </button>
                        )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                        {wizardData.zonas.length > 0 ? (
                            wizardData.zonas.map((zona, index) => (
                                <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-3 rounded-lg flex justify-between items-start animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div>
                                        <p className="font-bold text-slate-700 flex items-center gap-2">
                                            <i className="ion-ios-location text-blue-500 text-lg"></i>
                                            {zona.nome}
                                        </p>
                                        {zona.observacao && (
                                            <p className="text-xs text-slate-600 mt-1 pl-6">
                                                {zona.observacao}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveZona(zona.nome)}
                                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md"
                                        title={`Remover zona ${zona.nome}`}
                                    >
                                        <i className="ion-ios-trash text-sm"></i>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-10">
                                <i className="ion-ios-map text-4xl mb-2 block"></i>
                                <p>Nenhuma zona adicionada ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EtapaZonas;