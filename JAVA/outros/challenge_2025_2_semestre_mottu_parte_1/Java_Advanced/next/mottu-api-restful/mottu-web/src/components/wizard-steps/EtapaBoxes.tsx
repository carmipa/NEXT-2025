// src/components/wizard-steps/EtapaBoxes.tsx
"use client";

import React, { useState } from 'react';
import { WizardData } from '@/app/patio/novo-assistente/page';
import { Tab } from '@headlessui/react'; // Usaremos o Headless UI diretamente para maior controle
import { Bot, Edit, Grid3X3, PlusCircle, Trash2 } from 'lucide-react';

interface EtapaBoxesProps {
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
}

// Função auxiliar para classes de abas
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const EtapaBoxes: React.FC<EtapaBoxesProps> = ({ wizardData, setWizardData }) => {
    const [prefixoLote, setPrefixoLote] = useState<string>('B');
    const [quantidadeLote, setQuantidadeLote] = useState<number>(50);
    const [nomeManual, setNomeManual] = useState<string>('');
    const [statusManual, setStatusManual] = useState<'L' | 'O'>('L');

    const handleGerarEmLote = () => {
        if (!prefixoLote.trim()) {
            alert('Por favor, informe um prefixo para gerar os boxes.');
            return;
        }
        if (quantidadeLote <= 0 || quantidadeLote > 1000) {
            alert('A quantidade deve ser entre 1 e 1000.');
            return;
        }
        const novosBoxes = [];
        const nomesExistentes = new Set(wizardData.boxes.map(box => box.nome.toLowerCase()));
        for (let i = 1; i <= quantidadeLote; i++) {
            const nomeBox = `${prefixoLote.trim()}${i.toString().padStart(3, '0')}`;
            if (nomesExistentes.has(nomeBox.toLowerCase())) continue;
            novosBoxes.push({ nome: nomeBox, status: 'L' as 'L' | 'O', zonaNome: 'Padrão', observacao: '' });
            nomesExistentes.add(nomeBox.toLowerCase());
        }
        if (novosBoxes.length === 0 && quantidadeLote > 0) {
            alert('Nenhum box novo foi gerado. Verifique se os nomes com o prefixo informado já existem.');
            return;
        }
        setWizardData(prev => ({ ...prev, boxes: [...prev.boxes, ...novosBoxes] }));
        alert(`${novosBoxes.length} boxes foram gerados com prefixo "${prefixoLote}"!`);
    };

    const handleAddManual = () => {
        if (!nomeManual.trim()) {
            alert('Por favor, informe o nome do box.');
            return;
        }
        if (wizardData.boxes.some(box => box.nome.toLowerCase() === nomeManual.trim().toLowerCase())) {
            alert('Um box com este nome já existe.');
            return;
        }
        setWizardData(prev => ({
            ...prev,
            boxes: [...prev.boxes, { nome: nomeManual.trim(), status: statusManual, zonaNome: 'Padrão', observacao: '' }]
        }));
        setNomeManual('');
    };

    const handleRemoveBox = (nomeBoxParaRemover: string) => {
        setWizardData(prev => ({
            ...prev,
            boxes: prev.boxes.filter(box => box.nome !== nomeBoxParaRemover)
        }));
    };

    const handleRemoveAllBoxes = () => {
        if (wizardData.boxes.length === 0) {
            alert('Não há boxes para remover.');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover TODOS os ${wizardData.boxes.length} boxes? Esta ação não pode ser desfeita.`)) {
            setWizardData(prev => ({
                ...prev,
                boxes: []
            }));
        }
    };

    // Agrupar boxes por prefixo para organização visual (opcional)
    const boxesAgrupados = wizardData.boxes.reduce((acc, box) => {
        const prefixo = box.nome.replace(/\d+$/, ''); // Remove números do final para obter prefixo
        const grupoNome = prefixo || 'Outros';
        (acc[grupoNome] = acc[grupoNome] || []).push(box);
        return acc;
    }, {} as Record<string, typeof wizardData.boxes>);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                <i className="ion-ios-grid text-pink-400"></i> 5. Gerenciar Boxes do Pátio
            </h2>

            {/* INFO: Boxes são diretos ao pátio, não dependem de zonas */}
            <div className="text-center text-blue-300 neumorphic-container p-4 rounded-lg">
                <p className="font-semibold">📦 Boxes são vinculados diretamente ao pátio</p>
                <p className="text-sm text-blue-200">Os boxes não dependem de zonas. Você pode adicionar, editar e gerenciar boxes livremente.</p>
            </div>
            
            {/* SEMPRE mostrar a interface de boxes, independente das zonas */}
            <div>
                {/* ESTRUTURA PRINCIPAL UNIFICADA: Um único painel com o grid de 2 colunas dentro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-lg">

                    {/* COLUNA ESQUERDA: ABAS E CONTEÚDO */}
                    <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-xl bg-white/80 p-1 shadow-inner">
                            <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2', 'focus:outline-none', selected ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-600 hover:bg-blue-100 hover:text-blue-700')}>
                                {({ selected }) => (
                                    <>
                                        <Bot size={16} className={selected ? 'text-white' : 'text-blue-500'} />
                                        Gerar em Lote
                                    </>
                                )}
                            </Tab>
                            <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2', 'focus:outline-none', selected ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-600 hover:bg-purple-100 hover:text-purple-700')}>
                                {({ selected }) => (
                                    <>
                                        <Edit size={16} className={selected ? 'text-white' : 'text-purple-500'} />
                                        Adicionar Manualmente
                                    </>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-2">
                            <Tab.Panel className="rounded-xl bg-white/60 p-4 shadow-inner">
                                <div className="space-y-4">
                                    {/* Conteúdo do Gerador em Lote */}
                                    <div>
                                        <label htmlFor="prefixoLote" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                            <i className="ion-ios-create text-blue-500"></i> Prefixo dos Boxes
                                        </label>
                                        <input 
                                            type="text" 
                                            id="prefixoLote" 
                                            value={prefixoLote} 
                                            onChange={e => setPrefixoLote(e.target.value)} 
                                            maxLength={10}
                                            placeholder="Ex: B" 
                                            className="neumorphic-input h-10" 
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            {prefixoLote.length}/10 caracteres
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="quantidadeLote" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                            <i className="ion-ios-calculator text-green-500"></i> Quantidade
                                        </label>
                                        <input type="number" id="quantidadeLote" value={quantidadeLote} onChange={e => setQuantidadeLote(parseInt(e.target.value, 10))} min="1" max="1000" className="neumorphic-input h-10" />
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {[10, 50, 100, 500, 1000].map(q => (<button key={q} type="button" onClick={() => setQuantidadeLote(q)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 hover:scale-110 ${quantidadeLote === q ? 'bg-green-500 text-white shadow-lg' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{q}</button>))}
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleGerarEmLote} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0">
                                        <Bot size={18} className="text-white" /> Gerar Boxes
                                    </button>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel className="rounded-xl bg-white/60 p-4 shadow-inner">
                                <div className="space-y-4">
                                    {/* Conteúdo da Adição Manual */}
                                    <div>
                                        <label htmlFor="nomeManual" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                            <i className="ion-ios-create text-purple-500"></i> Nome do Box
                                        </label>
                                        <input 
                                            type="text" 
                                            id="nomeManual" 
                                            value={nomeManual} 
                                            onChange={e => setNomeManual(e.target.value)} 
                                            maxLength={50}
                                            placeholder="Ex: G-01 (Garagem)" 
                                            className="neumorphic-input h-10" 
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            {nomeManual.length}/50 caracteres
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="statusManual" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                            <i className="ion-ios-flag text-orange-500"></i> Status Inicial
                                        </label>
                                        <select id="statusManual" value={statusManual} onChange={e => setStatusManual(e.target.value as 'L' | 'O')} className="neumorphic-select h-10">
                                            <option value="L">Livre</option>
                                            <option value="O">Ocupado</option>
                                        </select>
                                    </div>
                                    <button type="button" onClick={handleAddManual} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0">
                                        <PlusCircle size={18} className="text-white" /> Adicionar Box
                                    </button>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>

                    {/* COLUNA DIREITA: LISTA DE BOXES */}
                    <div className="p-4 rounded-lg bg-white/60 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <i className="ion-ios-grid text-pink-500"></i> Boxes Adicionados ({wizardData.boxes.length})
                            </h3>
                            {wizardData.boxes.length > 0 && (
                                <button
                                    onClick={handleRemoveAllBoxes}
                                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 shadow-md"
                                    title="Remover todos os boxes"
                                >
                                    <Trash2 size={14} />
                                    Remover Todos
                                </button>
                            )}
                        </div>
                        <div className="max-h-[26rem] overflow-y-auto space-y-3 pr-2 scrollbar-custom">
                            {Object.keys(boxesAgrupados).length > 0 ? (
                                Object.entries(boxesAgrupados).map(([zonaNome, boxesDaZona]) => (
                                    <div key={zonaNome}>
                                        <h4 className="font-bold text-green-600 text-sm mb-2 sticky top-0 bg-green-100 backdrop-blur-sm py-2 px-3 rounded-lg shadow-sm flex items-center gap-2">
                                            <i className="ion-ios-tag text-green-500"></i> Prefixo: {zonaNome}
                                        </h4>
                                        <div className="space-y-2 pl-2">
                                            {boxesDaZona.map((box, index) => (
                                                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center text-sm animate-fade-in transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                                    <p className="text-slate-700 flex items-center gap-2 font-medium">
                                                        <i className="ion-ios-cube text-blue-500"></i>{box.nome}
                                                    </p>
                                                    <button onClick={() => handleRemoveBox(box.nome)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-all duration-300 hover:scale-110" title={`Remover ${box.nome}`}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 pt-16">
                                    <i className="ion-ios-cube text-4xl mb-2 block text-slate-400"></i>
                                    <p>Nenhum box adicionado ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-custom::-webkit-scrollbar { width: 8px; }
                .scrollbar-custom::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
                .scrollbar-custom::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
};

export default EtapaBoxes;