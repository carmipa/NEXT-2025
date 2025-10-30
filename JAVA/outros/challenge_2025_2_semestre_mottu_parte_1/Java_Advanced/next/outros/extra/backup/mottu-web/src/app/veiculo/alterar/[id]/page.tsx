"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Car, Hash, Building, Settings, Calendar, Info, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const combustiveis = ["Gasolina", "Etanol", "Diesel", "Flex", "Gás Natural", "Elétrico", "Híbrido", "Outro"];

export default function AlterarVeiculoPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [formData, setFormData] = useState<VeiculoRequestDto>({
        placa: '', renavam: '', chassi: '', fabricante: '', modelo: '', motor: '', ano: 0, combustivel: '',
        status: 'OPERACIONAL', tagBleId: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do veículo inválido.");
            setIsFetching(false);
            return;
        }
        const fetchVeiculo = async () => {
            setIsFetching(true);
            try {
                const data = await VeiculoService.getById(id);
                setFormData({
                    placa: data.placa,
                    renavam: data.renavam,
                    chassi: data.chassi,
                    fabricante: data.fabricante,
                    modelo: data.modelo,
                    motor: data.motor || '',
                    ano: data.ano,
                    combustivel: data.combustivel,
                    status: data.status || 'OPERACIONAL',
                    tagBleId: data.tagBleId || ''
                });
            } catch (err: any) {
                setError(err.response?.data?.message || "Falha ao carregar dados do veículo.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchVeiculo();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'ano' ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await VeiculoService.update(id, formData);
            setSuccess(`Veículo de placa "${formData.placa}" atualizado com sucesso!`);
            setTimeout(() => router.push('/veiculo/listar'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao atualizar veículo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <>
            <NavBar active="veiculo" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !isFetching) return (
        <>
            <NavBar active="veiculo" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/veiculo/listar" className="mt-6 inline-block px-6 py-2 bg-slate-600 text-white rounded-md">Voltar</Link>
                </div>
            </main>
        </>
    );

    return (
        <>
            <NavBar active="veiculo" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6">
                        <MdEdit size={32} className="mr-3" />
                        Alterar Veículo (ID: {id})
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
                            <div>
                                <label htmlFor="placa" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> Placa</label>
                                <input type="text" id="placa" name="placa" value={formData.placa} onChange={handleChange} required maxLength={10} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="renavam" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> RENAVAM</label>
                                <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="chassi" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Hash size={16}/> Chassi</label>
                                <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="fabricante" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Building size={16}/> Fabricante</label>
                                <input type="text" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required maxLength={50} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="modelo" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Car size={16}/> Modelo</label>
                                <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required maxLength={60} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="motor" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Settings size={16}/> Motor</label>
                                <input type="text" id="motor" name="motor" value={formData.motor || ''} onChange={handleChange} maxLength={30} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="ano" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Calendar size={16}/> Ano</label>
                                <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="w-full p-2 rounded bg-white text-slate-900 h-10" />
                            </div>
                            <div>
                                <label htmlFor="combustivel" className="block text-sm font-medium text-slate-100 mb-1 flex items-center gap-1"><Info size={16}/> Combustível</label>
                                <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 h-10">
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
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
