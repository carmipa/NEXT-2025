"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VeiculoService } from '@/utils/api';
import { VeiculoRequestDto } from '@/types/veiculo';
import { MARCAS, MODELOS_POR_MARCA, CILINDRADAS, TIPOS_COMBUSTIVEL } from '@/lib/motoData';
import { MdEdit, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Loader2, AlertCircle, Tag, FileText, CreditCard, Wrench, Bike, Settings, Calendar, Droplets, CheckCircle, Bluetooth, Save, ArrowLeft } from 'lucide-react';
import '@/types/styles/neumorphic.css';


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
    const [isGeneratingTag, setIsGeneratingTag] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [modelosDisponiveis, setModelosDisponiveis] = useState<string[]>([]);

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

    // Carrega modelos quando fabricante é definido
    useEffect(() => {
        if (formData.fabricante) {
            setModelosDisponiveis(MODELOS_POR_MARCA[formData.fabricante] || []);
        }
    }, [formData.fabricante]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'fabricante') {
            setFormData(prev => ({
                ...prev,
                fabricante: value,
                modelo: '' // Reset modelo quando fabricante muda
            }));
            setModelosDisponiveis(MODELOS_POR_MARCA[value] || []);
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'ano' ? parseInt(value, 10) || 0 : value }));
        }
    };

    const handleGerarTagAutomatica = async () => {
        setIsGeneratingTag(true);
        setError(null);
        try {
            const proximaTag = await VeiculoService.gerarProximaTagBle();
            setFormData(prev => ({ ...prev, tagBleId: proximaTag }));
            setSuccess(`Tag BLE gerada automaticamente: ${proximaTag}`);
        } catch (err) {
            setError('Erro ao gerar tag automática. Tente novamente.');
            console.error('Erro ao gerar tag:', err);
        } finally {
            setIsGeneratingTag(false);
        }
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
            <main className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !isFetching) return (
        <>
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
            <main className="min-h-screen text-white p-2 sm:p-4 md:p-8 flex items-center justify-center">
                <div className="container max-w-2xl mx-auto neumorphic-container p-3 sm:p-6 md:p-8">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white flex items-center justify-center mb-4 sm:mb-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <MdEdit size={24} className="mr-2 sm:mr-3" /> 
                        <span className="hidden sm:inline">Alterar Veículo (ID: {id})</span>
                        <span className="sm:hidden">Alterar (ID: {id})</span>
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

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <fieldset className="neumorphic-fieldset mb-3 sm:mb-4">
                            <legend className="neumorphic-legend text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>Dados do Veículo</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                <div>
                                    <label htmlFor="placa" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Tag className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> Placa</label>
                                    <input type="text" id="placa" name="placa" value={formData.placa} onChange={(e) => {
                                    const value = e.target.value.trim().toUpperCase();
                                    handleChange({...e, target: {...e.target, value}});
                                }} required maxLength={10} className="neumorphic-input text-sm sm:text-base" />
                                </div>
                                <div>
                                    <label htmlFor="renavam" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"/> RENAVAM</label>
                                    <input type="text" id="renavam" name="renavam" value={formData.renavam} onChange={handleChange} required maxLength={11} className="neumorphic-input text-sm sm:text-base" />
                                </div>
                                <div>
                                    <label htmlFor="chassi" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400"/> Chassi</label>
                                    <input type="text" id="chassi" name="chassi" value={formData.chassi} onChange={handleChange} required maxLength={17} className="neumorphic-input text-sm sm:text-base" />
                                </div>
                                <div>
                                    <label htmlFor="fabricante" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400"/> Fabricante</label>
                                    <select id="fabricante" name="fabricante" value={formData.fabricante} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a marca...</option>
                                        {MARCAS.map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="modelo" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Bike className="w-4 h-4 sm:w-5 sm:h-5 text-green-400"/> Modelo</label>
                                    <select id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione o modelo...</option>
                                        {modelosDisponiveis.map(modelo => (
                                            <option key={modelo} value={modelo}>{modelo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="motor" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Settings className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"/> Motor (Cilindrada)</label>
                                    <select id="motor" name="motor" value={formData.motor || ''} onChange={handleChange} className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione a cilindrada...</option>
                                        {CILINDRADAS.map(cilindrada => (
                                            <option key={cilindrada} value={cilindrada}>{cilindrada}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="ano" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"/> Ano</label>
                                    <input type="number" id="ano" name="ano" value={formData.ano} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 2} className="neumorphic-input text-sm sm:text-base" />
                                </div>
                                <div>
                                    <label htmlFor="combustivel" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"/> Combustível</label>
                                    <select id="combustivel" name="combustivel" value={formData.combustivel} onChange={handleChange} required className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="">Selecione o combustível...</option>
                                        {TIPOS_COMBUSTIVEL.map(combustivel => (
                                            <option key={combustivel} value={combustivel}>{combustivel}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400"/> Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="neumorphic-select text-sm sm:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <option value="OPERACIONAL">Operacional</option>
                                        <option value="EM_MANUTENCAO">Em Manutenção</option>
                                        <option value="INATIVO">Inativo</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="tagBleId" className="neumorphic-label flex items-center gap-1 text-xs sm:text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                        <Bluetooth className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400"/> ID da Tag BLE
                                        <span className="text-xs text-red-400 ml-1">(opcional - será gerada automaticamente se vazio)</span>
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                                        <input
                                            type="text"
                                            id="tagBleId"
                                            name="tagBleId"
                                            value={formData.tagBleId}
                                            onChange={handleChange}
                                            placeholder="Ex: TAG001"
                                            maxLength={50}
                                            className="flex-1 neumorphic-input text-sm sm:text-base"
                                            style={{fontFamily: 'Montserrat, sans-serif'}}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGerarTagAutomatica}
                                            disabled={isGeneratingTag}
                                            className="px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm min-h-[40px] sm:min-h-[48px]"
                                            title="Gerar próxima Tag BLE automaticamente"
                                        >
                                            {isGeneratingTag ? (
                                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                            ) : (
                                                <Bluetooth className="w-3 h-3 sm:w-4 sm:h-4" />
                                            )}
                                            <span style={{fontFamily: 'Montserrat, sans-serif'}}>{isGeneratingTag ? 'Gerando...' : 'Auto'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <button type="submit" disabled={isLoading} className="neumorphic-button-green text-sm sm:text-base px-3 sm:px-4 py-2">
                                {isLoading ? <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-white animate-spin"></Loader2> <span className="hidden sm:inline">Salvando...</span><span className="sm:hidden">Salvando</span></> : <><Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-white"></Save> <span className="hidden sm:inline">Salvar Alterações</span><span className="sm:hidden">Salvar</span></>}
                            </button>
                            <Link href="/veiculo/listar" className="neumorphic-button text-sm sm:text-base px-3 sm:px-4 py-2">
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-white"></ArrowLeft> 
                                <span className="hidden sm:inline">Voltar para Lista</span>
                                <span className="sm:hidden">Voltar</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
