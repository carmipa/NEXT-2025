// src/app/veiculo/cadastrar/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdAddCircleOutline, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle
} from 'react-icons/md';
import { Car, Hash, Palette, Calendar, User, Building, Settings, Info, ScanLine as ScanLicense } from 'lucide-react';

// Interfaces dos DTOs
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { VeiculoService } from '@/utils/api';

const combustiveis = ["Gasolina", "Etanol", "Diesel", "Flex", "Gás Natural", "Elétrico", "Híbrido", "Outro"];

export default function CadastrarVeiculoPage() {
    const router = useRouter();

    const initialState: VeiculoRequestDto = {
        placa: '',
        renavam: '',
        chassi: '',
        fabricante: '',
        modelo: '',
        motor: '',
        ano: new Date().getFullYear(), // Ano atual como default
        combustivel: '',
    };

    const [formData, setFormData] = useState<VeiculoRequestDto>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const createdVeiculo: VeiculoResponseDto = await VeiculoService.create(formData);
            setSuccess(`✅ Veículo "${createdVeiculo.placa}" cadastrado com sucesso!`);
            setFormData(initialState);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(`❌ ${err.response?.data?.message || err.message || 'Falha ao cadastrar veículo.'}`);
            console.error("Erro detalhado:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="veiculo-cadastrar" />
            <main className="container mx-auto px-4 py-12 bg-[#012A46] min-h-screen text-white">
                <div className="bg-slate-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-8 text-center">
                        <MdAddCircleOutline className="text-3xl text-sky-400" /> Novo Veículo
                    </h1>

                    {error && (
                        <div className="relative text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500 mb-4" role="alert">
                            <div className="flex items-center gap-2"> <MdErrorOutline className="text-xl" /> <span>{error}</span> </div>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl">&times;</span></button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-400 p-3 rounded bg-green-900/30 border border-green-700 mb-4">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <fieldset className="mb-6 border border-slate-700 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2">Detalhes do Veículo</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Placa */}
                                <div>
                                    <label htmlFor="placa" className="block mb-1 flex items-center gap-1">
                                        <Hash size={16} /> Placa:
                                    </label>
                                    <input
                                        type="text"
                                        id="placa"
                                        name="placa"
                                        value={formData.placa}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* RENAVAM */}
                                <div>
                                    <label htmlFor="renavam" className="block mb-1 flex items-center gap-1">
                                        <ScanLicense size={16} /> RENAVAM:
                                    </label>
                                    <input
                                        type="text"
                                        id="renavam"
                                        name="renavam"
                                        value={formData.renavam}
                                        onChange={handleChange}
                                        required
                                        maxLength={11}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Chassi */}
                                <div>
                                    <label htmlFor="chassi" className="block mb-1 flex items-center gap-1">
                                        <Hash size={16} /> Chassi:
                                    </label>
                                    <input
                                        type="text"
                                        id="chassi"
                                        name="chassi"
                                        value={formData.chassi}
                                        onChange={handleChange}
                                        required
                                        maxLength={17}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Fabricante */}
                                <div>
                                    <label htmlFor="fabricante" className="block mb-1 flex items-center gap-1">
                                        <Building size={16} /> Fabricante:
                                    </label>
                                    <input
                                        type="text"
                                        id="fabricante"
                                        name="fabricante"
                                        value={formData.fabricante}
                                        onChange={handleChange}
                                        required
                                        maxLength={50}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Modelo */}
                                <div>
                                    <label htmlFor="modelo" className="block mb-1 flex items-center gap-1">
                                        <Car size={16} /> Modelo:
                                    </label>
                                    <input
                                        type="text"
                                        id="modelo"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        required
                                        maxLength={60}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Motor */}
                                <div>
                                    <label htmlFor="motor" className="block mb-1 flex items-center gap-1">
                                        <Settings size={16} /> Motor:
                                    </label>
                                    <input
                                        type="text"
                                        id="motor"
                                        name="motor"
                                        value={formData.motor || ''} // Pode ser opcional, então trate null/undefined
                                        onChange={handleChange}
                                        maxLength={30}
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Ano */}
                                <div>
                                    <label htmlFor="ano" className="block mb-1 flex items-center gap-1">
                                        <Calendar size={16} /> Ano:
                                    </label>
                                    <input
                                        type="number"
                                        id="ano"
                                        name="ano"
                                        value={formData.ano}
                                        onChange={handleChange}
                                        required
                                        min={1900}
                                        max={new Date().getFullYear() + 2} // Ano atual + 2 para permitir carros novos
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    />
                                </div>
                                {/* Combustível */}
                                <div>
                                    <label htmlFor="combustivel" className="block mb-1 flex items-center gap-1">
                                        <Info size={16} /> Combustível:
                                    </label>
                                    <select
                                        id="combustivel"
                                        name="combustivel"
                                        value={formData.combustivel}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:ring-sky-500 h-10"
                                    >
                                        <option value="">Selecione...</option>
                                        {combustiveis.map(cb => (<option key={cb} value={cb}>{cb}</option>))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-opacity duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Veículo'}
                            </button>
                            <Link href="/veiculo/listar" className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
            <style jsx global>{`
                /* Esconder setas de input number */
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield; /* Firefox */
                }
            `}</style>
        </>
    );
}