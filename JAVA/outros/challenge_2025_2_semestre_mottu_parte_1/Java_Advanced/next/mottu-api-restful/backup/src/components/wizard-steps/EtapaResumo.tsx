// src/components/wizard-steps/EtapaResumo.tsx
"use client";

import React from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { Building, Phone, MapPin, Grid3X3, ListChecks } from 'lucide-react';

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
        <div className="space-y-6 animate-fade-in">
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                    <ListChecks />
                    5. Resumo e Confirmação
                </h2>
                <p className="text-slate-300 mt-1">
                    Por favor, revise todas as informações abaixo. Se tudo estiver correto, clique em "Salvar Tudo".
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
                {/* Coluna da Esquerda */}
                <div className="space-y-6">
                    {/* Dados do Pátio */}
                    <fieldset className="border border-slate-700/50 p-4 rounded-md">
                        <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2">
                            <Building size={18} /> Pátio
                        </legend>
                        <div className="space-y-2 text-sm pt-2">
                            <p><strong className="text-slate-300 w-24 inline-block">Nome:</strong> {wizardData.patio.nomePatio}</p>
                            <p><strong className="text-slate-300 w-24 inline-block">Observação:</strong> {wizardData.patio.observacao || 'N/A'}</p>
                        </div>
                    </fieldset>

                    {/* Dados de Endereço e Contato */}
                    <fieldset className="border border-slate-700/50 p-4 rounded-md">
                        <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2">
                            <MapPin size={18} /> Endereço e Contato
                        </legend>
                        <div className="space-y-2 text-sm pt-2">
                            <p><strong className="text-slate-300 w-24 inline-block">Endereço:</strong> {`${wizardData.dadosViaCep.logradouro}, ${wizardData.endereco.numero} - ${wizardData.dadosViaCep.bairro}, ${wizardData.dadosViaCep.cidade}/${wizardData.dadosViaCep.estado}`}</p>
                            <p><strong className="text-slate-300 w-24 inline-block">CEP:</strong> {wizardData.endereco.cep}</p>
                            <p><strong className="text-slate-300 w-24 inline-block">E-mail:</strong> {wizardData.contato.email}</p>
                            <p><strong className="text-slate-300 w-24 inline-block">Celular:</strong> {wizardData.contato.celular}</p>
                        </div>
                    </fieldset>
                </div>

                {/* Coluna da Direita */}
                <div className="space-y-6">
                    {/* Zonas Adicionadas */}
                    <fieldset className="border border-slate-700/50 p-4 rounded-md">
                        <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2">
                            <MapPin size={18} /> Zonas Adicionadas ({wizardData.zonas.length})
                        </legend>
                        <div className="space-y-2 text-sm pt-2 max-h-40 overflow-y-auto">
                            {wizardData.zonas.length > 0 ? wizardData.zonas.map(z => (
                                <p key={z.nome} className="bg-slate-800/50 p-1 rounded text-center">{z.nome}</p>
                            )) : <p className="text-slate-400">Nenhuma zona adicionada.</p>}
                        </div>
                    </fieldset>

                    {/* Boxes Adicionados */}
                    <fieldset className="border border-slate-700/50 p-4 rounded-md">
                        <legend className="px-2 font-semibold text-lg text-white flex items-center gap-2">
                            <Grid3X3 size={18} /> Boxes Adicionados ({wizardData.boxes.length})
                        </legend>
                        <div className="space-y-2 text-sm pt-2 max-h-40 overflow-y-auto">
                            {Object.keys(boxesAgrupados).length > 0 ? (
                                Object.entries(boxesAgrupados).map(([zonaNome, boxesDaZona]) => (
                                    <div key={zonaNome}>
                                        <h4 className="font-bold text-green-400 text-xs mb-1">{zonaNome} ({boxesDaZona.length})</h4>
                                        <p className="text-xs text-slate-300 bg-slate-800/50 p-1 rounded leading-relaxed">
                                            {boxesDaZona.map(b => b.nome).join(', ')}
                                        </p>
                                    </div>
                                ))
                            ) : <p className="text-slate-400">Nenhum box adicionado.</p>}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default EtapaResumo;