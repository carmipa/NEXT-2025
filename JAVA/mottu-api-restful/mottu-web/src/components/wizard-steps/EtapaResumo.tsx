// src/components/wizard-steps/EtapaResumo.tsx
"use client";

import React from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';

interface EtapaResumoProps {
    wizardData: WizardData;
    // setWizardData não é necessário aqui, pois esta etapa é somente leitura
}

const EtapaResumo: React.FC<EtapaResumoProps> = ({ wizardData }) => {

    const boxesAgrupados = wizardData.boxes.reduce((acc, box) => {
        if (!acc[box.zonaNome]) {
            acc[box.zonaNome] = [];
        }
        acc[box.zonaNome].push(box);
        return acc;
    }, {} as Record<string, typeof wizardData.boxes>);

    return (
        <div className="space-y-6 animate-fade-in neumorphic-container">
            <div className="text-center p-6 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-lg">
                <h2 className="text-2xl font-semibold flex items-center justify-center gap-3 text-slate-700">
                    <i className="ion-ios-checkmark-circle text-green-500 text-3xl"></i>
                    <i className="ion-ios-list text-blue-500 text-2xl"></i>
                    5. Resumo e Confirmação
                </h2>
                <p className="text-slate-600 mt-3 text-lg">
                    Por favor, revise todas as informações abaixo. Se tudo estiver correto, clique em "Salvar Tudo".
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
                {/* Coluna da Esquerda */}
                <div className="space-y-6">
                    {/* Dados do Pátio */}
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend flex items-center gap-2">
                            <i className="ion-ios-business text-blue-500 text-xl"></i> Pátio
                        </legend>
                        <div className="space-y-3 text-sm pt-4">
                            <p className="flex items-center gap-2">
                                <i className="ion-ios-create text-blue-400"></i>
                                <strong className="w-24 text-slate-700">Nome:</strong> 
                                <span className="text-slate-600 font-medium">{wizardData.patio.nomePatio}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <i className="ion-ios-document text-purple-400"></i>
                                <strong className="w-24 text-slate-700">Observação:</strong> 
                                <span className="text-slate-600 font-medium">{wizardData.patio.observacao || 'N/A'}</span>
                            </p>
                        </div>
                    </fieldset>

                    {/* Dados de Endereço e Contato */}
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend flex items-center gap-2">
                            <i className="ion-ios-location text-green-500 text-xl"></i> Endereço e Contato
                        </legend>
                        <div className="space-y-3 text-sm pt-4">
                            <div className="flex items-start gap-2">
                                <i className="ion-ios-home text-green-400 mt-1"></i>
                                <div>
                                    <strong className="text-slate-700">Endereço:</strong> 
                                    <span className="text-slate-600 font-medium block mt-1">{`${wizardData.dadosViaCep.logradouro}, ${wizardData.endereco.numero} - ${wizardData.dadosViaCep.bairro}, ${wizardData.dadosViaCep.cidade}/${wizardData.dadosViaCep.estado}`}</span>
                                </div>
                            </div>
                            <p className="flex items-center gap-2">
                                <i className="ion-ios-mail text-blue-400"></i>
                                <strong className="w-24 text-slate-700">CEP:</strong> 
                                <span className="text-slate-600 font-medium">{wizardData.endereco.cep}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <i className="ion-ios-mail text-purple-400"></i>
                                <strong className="w-24 text-slate-700">E-mail:</strong> 
                                <span className="text-slate-600 font-medium">{wizardData.contato.email}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <i className="ion-ios-call text-orange-400"></i>
                                <strong className="w-24 text-slate-700">Celular:</strong> 
                                <span className="text-slate-600 font-medium">{wizardData.contato.celular}</span>
                            </p>
                        </div>
                    </fieldset>
                </div>

                {/* Coluna da Direita */}
                <div className="space-y-6">
                    {/* Zonas Adicionadas */}
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend flex items-center gap-2">
                            <i className="ion-ios-map text-purple-500 text-xl"></i> Zonas Adicionadas ({wizardData.zonas.length})
                        </legend>
                        <div className="space-y-3 text-sm pt-4 max-h-40 overflow-y-auto">
                            {wizardData.zonas.length > 0 ? wizardData.zonas.map(z => (
                                <div key={z.nome} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <i className="ion-ios-location text-purple-500"></i>
                                        <strong className="text-slate-700">{z.nome}</strong>
                                    </div>
                                    {z.observacao && <p className="text-xs text-slate-600 mt-2">{z.observacao}</p>}
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">
                                    <i className="ion-ios-map text-4xl mb-2 block text-slate-400"></i>
                                    <p>Nenhuma zona adicionada.</p>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Boxes Adicionados */}
                    <fieldset className="neumorphic-fieldset">
                        <legend className="neumorphic-legend flex items-center gap-2">
                            <i className="ion-ios-grid text-pink-500 text-xl"></i> Boxes Adicionados ({wizardData.boxes.length})
                        </legend>
                        <div className="space-y-3 text-sm pt-4 max-h-40 overflow-y-auto">
                            {Object.keys(boxesAgrupados).length > 0 ? (
                                Object.entries(boxesAgrupados).map(([zonaNome, boxesDaZona]) => (
                                    <div key={zonaNome} className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 p-4 rounded-lg">
                                        <h4 className="font-bold text-pink-600 text-sm mb-3 flex items-center gap-2">
                                            <i className="ion-ios-tag text-pink-500"></i>
                                            {zonaNome} ({boxesDaZona.length} boxes)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {boxesDaZona.map(b => (
                                                <span key={b.nome} className="bg-gradient-to-r from-pink-100 to-orange-100 text-slate-700 text-xs p-2 rounded-lg text-center border border-pink-200 font-medium shadow-sm">
                                                    {b.nome}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 py-8">
                                    <i className="ion-ios-cube text-4xl mb-2 block text-slate-400"></i>
                                    <p>Nenhum box adicionado.</p>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default EtapaResumo;