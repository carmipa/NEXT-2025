"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto, VeiculoResponseDto } from '@/types/veiculo';
import { MdEdit, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Loader2, AlertCircle } from 'lucide-react';
import '@/styles/neumorphic.css';

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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !isFetching) return (
        <>
            <NavBar active="veiculo" />
            <main className="flex justify-center items-center min-h-screen p-4">
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
            <main className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <MdEdit size={32} className="mr-3" /> Alterar Veículo (ID: {id})
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
                        <fieldset className="neumorphic-fieldset mb-4">
                            <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Dados do Veículo</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="placa" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-pricetag"/> Placa</label>
                                    <input type="text" id="placa" name="placa" value={formData.placa} onChange={(e) => {
                                    const value = e.target.value.trim().toUpperCase();
                                    handleChange({...e, target: {...e.target, value}});
                                }} required maxLength={10} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="renavam" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-document"/> RENAVAM</label>
                                    <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="chassi" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-barcode"/> Chassi</label>
                                    <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="fabricante" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-build"/> Fabricante</label>
                                    <input type="text" id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required maxLength={50} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="modelo" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-bicycle"/> Modelo</label>
                                    <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required maxLength={60} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="motor" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-settings"/> Motor</label>
                                    <input type="text" id="motor" name="motor" value={formData.motor || ''} onChange={handleChange} maxLength={30} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="ano" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-calendar"/> Ano</label>
                                    <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="neumorphic-input" />
                                </div>
                                <div>
                                    <label htmlFor="combustivel" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-water"/> Combustível</label>
                                    <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione...</option>
                                        {combustiveis.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-checkmark-circle"/> Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="neumorphic-select" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="OPERACIONAL">Operacional</option>
                                        <option value="EM_MANUTENCAO">Em Manutenção</option>
                                        <option value="INATIVO">Inativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="tagBleId" className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}><i className="ion-ios-bluetooth"/> ID da Tag BLE</label>
                                    <input type="text" id="tagBleId" name="tagBleId" value={formData.tagBleId} onChange={handleChange} placeholder="Ex: TAG001" maxLength={50} className="neumorphic-input" />
                                </div>
                            </div>
                        </fieldset>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button type="submit" disabled={isLoading} className="neumorphic-button-green">
                                {isLoading ? <><i className="ion-ios-sync animate-spin mr-2"></i> Salvando...</> : <><i className="ion-ios-save mr-2"></i> Salvar Alterações</>}
                            </button>
                            <Link href="/veiculo/listar" className="neumorphic-button">
                                <i className="ion-ios-arrow-back mr-2"></i> Voltar para Lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
