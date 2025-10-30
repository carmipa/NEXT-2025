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
            <h2 className="text-xl font-semibold text-white">4. Gerenciar Boxes do Pátio</h2>

            {/* INFO: Boxes são diretos ao pátio, não dependem de zonas */}
            <div className="text-center text-blue-300 bg-blue-900/50 p-4 rounded-lg">
                <p className="font-semibold">📦 Boxes são vinculados diretamente ao pátio</p>
                <p className="text-sm text-blue-200">Os boxes não dependem de zonas. Você pode adicionar, editar e gerenciar boxes livremente.</p>
            </div>
            
            {/* SEMPRE mostrar a interface de boxes, independente das zonas */}
            <div>
                {/* ESTRUTURA PRINCIPAL UNIFICADA: Um único painel com o grid de 2 colunas dentro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-lg">

                    {/* COLUNA ESQUERDA: ABAS E CONTEÚDO */}
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-black/20 p-1">
                            <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-black shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                                <Bot size={16} /> Gerar em Lote
                            </Tab>
                            <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2', 'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-black shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                                <Edit size={16} /> Adicionar Manualmente
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-2">
                            <Tab.Panel className="rounded-xl bg-black/20 p-3 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                                <div className="space-y-4">
                                    {/* Conteúdo do Gerador em Lote */}
                                    <div>
                                        <label htmlFor="prefixoLote" className="block text-sm font-medium text-slate-100 mb-1">Prefixo dos Boxes</label>
                                        <input 
                                            type="text" 
                                            id="prefixoLote" 
                                            value={prefixoLote} 
                                            onChange={e => setPrefixoLote(e.target.value)} 
                                            maxLength={10}
                                            placeholder="Ex: B" 
                                            className="w-full p-2 rounded bg-white text-slate-900 h-10 border-2 border-gray-300 focus:border-blue-500 transition-colors" 
                                        />
                                        <p className="mt-1 text-xs text-slate-400">
                                            {prefixoLote.length}/10 caracteres
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="quantidadeLote" className="block text-sm font-medium text-slate-100 mb-1">Quantidade</label>
                                        <input type="number" id="quantidadeLote" value={quantidadeLote} onChange={e => setQuantidadeLote(parseInt(e.target.value, 10))} min="1" max="1000" className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                                        <div className="flex gap-2 flex-wrap mt-2">
                                            {[10, 50, 100, 500, 1000].map(q => (<button key={q} type="button" onClick={() => setQuantidadeLote(q)} className="px-3 py-1 text-xs font-semibold bg-slate-700 text-white rounded-full hover:bg-slate-600 transition-colors">{q}</button>))}
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleGerarEmLote} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                        <Bot size={18} /> Gerar Boxes
                                    </button>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel className="rounded-xl bg-black/20 p-3 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                                <div className="space-y-4">
                                    {/* Conteúdo da Adição Manual */}
                                    <div>
                                        <label htmlFor="nomeManual" className="block text-sm font-medium text-slate-100 mb-1">Nome do Box</label>
                                        <input 
                                            type="text" 
                                            id="nomeManual" 
                                            value={nomeManual} 
                                            onChange={e => setNomeManual(e.target.value)} 
                                            maxLength={50}
                                            placeholder="Ex: G-01 (Garagem)" 
                                            className="w-full p-2 rounded bg-white text-slate-900 h-10 border-2 border-gray-300 focus:border-blue-500 transition-colors" 
                                        />
                                        <p className="mt-1 text-xs text-slate-400">
                                            {nomeManual.length}/50 caracteres
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="statusManual" className="block text-sm font-medium text-slate-100 mb-1">Status Inicial</label>
                                        <select id="statusManual" value={statusManual} onChange={e => setStatusManual(e.target.value as 'L' | 'O')} className="w-full p-2 rounded bg-white text-slate-900 h-10">
                                            <option value="L">Livre</option>
                                            <option value="O">Ocupado</option>
                                        </select>
                                    </div>
                                    <button type="button" onClick={handleAddManual} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                        <PlusCircle size={18} /> Adicionar Box
                                    </button>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>

                    {/* COLUNA DIREITA: LISTA DE BOXES */}
                    <div className="bg-black/20 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">Boxes Adicionados ({wizardData.boxes.length})</h3>
                            {wizardData.boxes.length > 0 && (
                                <button
                                    onClick={handleRemoveAllBoxes}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2"
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
                                        <h4 className="font-bold text-green-400 text-sm mb-1 sticky top-0 bg-black/50 backdrop-blur-sm py-1">Prefixo: {zonaNome}</h4>
                                        <div className="space-y-1 pl-2">
                                            {boxesDaZona.map((box, index) => (
                                                <div key={index} className="bg-slate-800 p-2 rounded-md flex justify-between items-center text-sm animate-fade-in">
                                                    <p className="text-white flex items-center gap-2"><Grid3X3 size={14} />{box.nome}</p>
                                                    <button onClick={() => handleRemoveBox(box.nome)} className="p-1 text-red-400 hover:text-red-300" title={`Remover ${box.nome}`}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 pt-16">
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