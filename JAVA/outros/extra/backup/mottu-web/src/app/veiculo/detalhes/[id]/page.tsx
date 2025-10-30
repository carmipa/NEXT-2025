"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { VeiculoService } from '@/utils/api';
import { VeiculoResponseDto, VeiculoLocalizacaoResponseDto } from '@/types/veiculo';
import { Loader2, AlertCircle, Car, Edit, ArrowLeft, MapPin, Hash, ShieldCheck } from 'lucide-react';

export default function DetalhesVeiculoPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [veiculo, setVeiculo] = useState<VeiculoResponseDto | null>(null);
    const [localizacao, setLocalizacao] = useState<VeiculoLocalizacaoResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do veículo inválido.");
            setIsLoading(false);
            return;
        }
        const fetchVeiculo = async () => {
            setIsLoading(true);
            try {
                const data = await VeiculoService.getById(id);
                setVeiculo(data);
                // Iniciar busca da localização assim que os dados do veículo chegarem
                handleFetchLocalizacao(id);
            } catch (err: any) {
                setError(err.response?.data?.message || "Veículo não encontrado ou erro ao carregar dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVeiculo();
    }, [id]);

    const handleFetchLocalizacao = async (veiculoId: number) => {
        setIsLocating(true);
        try {
            const locData = await VeiculoService.getLocalizacao(veiculoId);
            setLocalizacao(locData);
        } catch (err: any) {
            // Não sobrescrever o erro principal se for apenas um erro de localização
            console.error("Erro ao buscar localização:", err);
            setError(prev => prev || err.response?.data?.message || "Erro ao buscar localização.");
        } finally {
            setIsLocating(false);
        }
    };

    if (isLoading) return (
        <>
            <NavBar active="veiculo" />
            <main className="flex justify-center items-center min-h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-[var(--color-mottu-light)]" /></main>
        </>
    );

    if (error && !veiculo) return (
        <>
            <NavBar active="veiculo" />
            <main className="flex justify-center items-center min-h-screen bg-black p-4">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <Link href="/veiculo/listar" className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-md"><ArrowLeft size={18}/> Voltar para Lista</Link>
                </div>
            </main>
        </>
    );

    if (!veiculo) return null;

    return (
        <>
            <NavBar active="veiculo" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container max-w-4xl mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Veículo: {veiculo.placa}</h1>
                            <p className="text-slate-300">{veiculo.modelo} - {veiculo.fabricante} (ID: {veiculo.idVeiculo})</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/veiculo/listar" className="flex items-center gap-2 px-4 py-2 font-medium text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100">
                                <ArrowLeft size={18} /> Voltar
                            </Link>
                            <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80">
                                <Edit size={18} /> Editar
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold mb-3 text-slate-100 flex items-center"><Car className="mr-2"/>Dados do Veículo</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                <p><strong>Placa:</strong> {veiculo.placa}</p>
                                <p><strong>RENAVAM:</strong> {veiculo.renavam}</p>
                                <p><strong>Chassi:</strong> {veiculo.chassi}</p>
                                <p><strong>Modelo:</strong> {veiculo.modelo}</p>
                                <p><strong>Fabricante:</strong> {veiculo.fabricante}</p>
                                <p><strong>Ano:</strong> {veiculo.ano}</p>
                                <p><strong>Motor:</strong> {veiculo.motor || '-'}</p>
                                <p><strong>Combustível:</strong> {veiculo.combustivel}</p>
                                <p className="flex items-center gap-1"><strong>Status:</strong> <span className={veiculo.status === 'OPERACIONAL' ? 'text-green-300' : 'text-yellow-300'}>{veiculo.status || 'N/A'}</span></p>
                                <p><strong>Tag BLE:</strong> {veiculo.tagBleId || 'Não associada'}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-slate-100 flex items-center mb-3"><MapPin className="mr-2"/>Localização Atual</h2>
                            {isLocating ? (
                                <div className="flex items-center gap-2 text-sky-300"><Loader2 className="animate-spin"/>Buscando...</div>
                            ) : localizacao && localizacao.boxAssociado ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <p><strong>Pátio:</strong> {localizacao.patioAssociado?.nomePatio || 'N/A'}</p>
                                    <p><strong>Zona:</strong> {localizacao.zonaAssociada?.nome || 'N/A'}</p>
                                    <p><strong>Box:</strong> {localizacao.boxAssociado?.nome || 'N/A'}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400">Veículo não está estacionado em um box.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
