"use client";
import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdAdd, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Car, Hash, Building, Settings, Calendar, Info, ShieldCheck } from 'lucide-react';

const combustiveis = ["Gasolina", "Etanol", "Diesel", "Flex", "Gás Natural", "Elétrico", "Híbrido", "Outro"];

export default function CadastrarVeiculoPage() {
    const initialState: VeiculoRequestDto = {
        placa: '',
        renavam: '',
        chassi: '',
        fabricante: '',
        modelo: '',
        motor: '',
        ano: new Date().getFullYear(),
        combustivel: '',
        status: 'OPERACIONAL',
        tagBleId: ''
    };
    const [formData, setFormData] = useState<VeiculoRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'ano' ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const createdVeiculo: VeiculoResponseDto = await VeiculoService.create(formData);
            setSuccess(`Veículo "${createdVeiculo.placa}" cadastrado com sucesso!`);
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao cadastrar veículo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="veiculo" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6">
                        <Car size={32} className="mr-3" />
                        Cadastrar Novo Veículo
                    </h1>

                    {success && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300" role="alert">
                            <MdErrorOutline className="text-xl" /> <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label htmlFor="placa" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> Placa <span className="text-red-300">*</span></label>
                                <input type="text" id="placa" name="placa" value={formData.placa} onChange={handleChange} required maxLength={10} placeholder="ABC-1234" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div className="group">
                                <label htmlFor="renavam" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> RENAVAM <span className="text-red-300">*</span></label>
                                <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} placeholder="11 dígitos" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div className="group">
                                <label htmlFor="chassi" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> Chassi <span className="text-red-300">*</span></label>
                                <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} placeholder="17 caracteres" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div className="group">
                                <label htmlFor="fabricante" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Building size={16}/> Fabricante <span className="text-red-300">*</span></label>
                                <input type="text" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required maxLength={50} placeholder="Ex: Honda" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div className="group">
                                <label htmlFor="modelo" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Car size={16}/> Modelo <span className="text-red-300">*</span></label>
                                <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required maxLength={60} placeholder="Ex: CG 160" className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div>
                                <label htmlFor="motor" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Settings size={16}/> Motor</label>
                                <input type="text" id="motor" name="motor" value={formData.motor || ''} onChange={handleChange} maxLength={30} placeholder="162.7cc" className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div className="group">
                                <label htmlFor="ano" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Ano <span className="text-red-300">*</span></label>
                                <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500" />
                            </div>
                            <div className="group">
                                <label htmlFor="combustivel" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Info size={16}/> Combustível <span className="text-red-300">*</span></label>
                                <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10 peer required:invalid:border-red-500">
                                    <option value="">Selecione...</option>
                                    {combustiveis.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><ShieldCheck size={16}/> Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 rounded bg-white text-slate-900 h-10">
                                    <option value="OPERACIONAL">Operacional</option>
                                    <option value="EM_MANUTENCAO">Em Manutenção</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tagBleId" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> ID da Tag BLE</label>
                                <input type="text" id="tagBleId" name="tagBleId" value={formData.tagBleId} onChange={handleChange} placeholder="Ex: TAG001" maxLength={50} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors disabled:opacity-50">
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Veículo'}
                            </button>
                            <Link href="/veiculo/listar" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
