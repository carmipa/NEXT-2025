// src/app/box/editar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BoxService } from '@/utils/api';
import { BoxResponseDto } from '@/types/box';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EditarBoxPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [nomeBox, setNomeBox] = useState('');
    const [statusBox, setStatusBox] = useState<'L' | 'O'>('L');
    const [observacaoBox, setObservacaoBox] = useState('');
    const [dataEntrada, setDataEntrada] = useState('');
    const [dataSaida, setDataSaida] = useState('');
    const [boxOriginal, setBoxOriginal] = useState<BoxResponseDto | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!id) {
            setError("ID do box não fornecido na URL.");
            setIsFetching(false);
            return;
        }

        const fetchBoxData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: BoxResponseDto = await BoxService.getById(id);
                setBoxOriginal(data);
                setNomeBox(data.nome || '');
                setStatusBox(data.status || 'L');
                setObservacaoBox(data.observacao || '');
                
                // Formatar datas para input datetime-local
                if (data.dataEntrada) {
                    const dataEntradaObj = new Date(data.dataEntrada);
                    setDataEntrada(dataEntradaObj.toISOString().slice(0, 16));
                }
                if (data.dataSaida) {
                    const dataSaidaObj = new Date(data.dataSaida);
                    setDataSaida(dataSaidaObj.toISOString().slice(0, 16));
                }
                
                // Garantir que temos valores válidos para pátio
                if (!data.patioId && data.patio?.idPatio) {
                    data.patioId = data.patio.idPatio;
                }
                if (!data.patioStatus && data.patio?.status) {
                    data.patioStatus = data.patio.status;
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados do box.");
                console.error("Erro ao buscar box:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchBoxData();
    }, [id]);

    const handleSalvar = async () => {
        // Validação
        const errors: Record<string, string> = {};
        
        if (nomeBox.trim() === '') {
            errors.nome = 'O nome do box não pode ser vazio.';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        if (!id || !boxOriginal) {
            setError("Dados do box não disponíveis.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setValidationErrors({});

        try {
            // Preparar dados para atualização - garantir que todos os campos obrigatórios estejam presentes
            const statusBoxFinal = statusBox || 'L';
            const patioIdBox = boxOriginal.patioId || boxOriginal.patio?.idPatio;
            
            // Buscar status do pátio se não tivermos
            let patioStatusBox = boxOriginal.patioStatus || boxOriginal.patio?.status;
            
            if (!patioStatusBox && patioIdBox) {
                try {
                    const patioInfo = await PatioService.getById(patioIdBox);
                    patioStatusBox = patioInfo.status || 'A';
                } catch (err) {
                    console.warn("Erro ao buscar status do pátio, usando padrão:", err);
                    patioStatusBox = 'A'; // Fallback para padrão
                }
            }
            
            if (!patioIdBox) {
                setError("Não foi possível identificar o pátio do box. Por favor, tente novamente.");
                return;
            }

            if (!patioStatusBox) {
                patioStatusBox = 'A'; // Último fallback
            }

            // Converter datas para ISO string
            const dataEntradaISO = dataEntrada ? new Date(dataEntrada).toISOString() : undefined;
            const dataSaidaISO = dataSaida ? new Date(dataSaida).toISOString() : undefined;

            const boxUpdateData = {
                nome: nomeBox.trim(),
                status: statusBoxFinal,
                observacao: observacaoBox.trim() || undefined,
                dataEntrada: dataEntradaISO,
                dataSaida: dataSaidaISO,
                patioId: patioIdBox,
                patioStatus: patioStatusBox
            };

            // Preferir usar método hierárquico se tiver informações do pátio
            let updatedBox: BoxResponseDto;
            if (patioIdBox && patioStatusBox) {
                try {
                    // Tentar usar método hierárquico primeiro
                    updatedBox = await BoxService.updatePorPatio(
                        patioIdBox,
                        patioStatusBox,
                        id,
                        {
                            nome: boxUpdateData.nome,
                            status: boxUpdateData.status,
                            observacao: boxUpdateData.observacao,
                            dataEntrada: boxUpdateData.dataEntrada,
                            dataSaida: boxUpdateData.dataSaida
                        }
                    );
                } catch (err: any) {
                    // Se falhar, usar método tradicional
                    console.warn("Método hierárquico falhou, usando método tradicional:", err);
                    updatedBox = await BoxService.update(id, {
                        nome: boxUpdateData.nome,
                        status: boxUpdateData.status,
                        observacao: boxUpdateData.observacao,
                        dataEntrada: boxUpdateData.dataEntrada,
                        dataSaida: boxUpdateData.dataSaida,
                        patioId: boxUpdateData.patioId,
                        patioStatus: boxUpdateData.patioStatus
                    });
                }
            } else {
                // Fallback para método tradicional - precisa incluir todos os campos obrigatórios
                updatedBox = await BoxService.update(id, {
                    nome: boxUpdateData.nome,
                    status: boxUpdateData.status,
                    observacao: boxUpdateData.observacao,
                    dataEntrada: boxUpdateData.dataEntrada,
                    dataSaida: boxUpdateData.dataSaida,
                    patioId: boxUpdateData.patioId,
                    patioStatus: boxUpdateData.patioStatus
                });
            }

            setSuccess(`Box "${updatedBox.nome}" atualizado com sucesso!`);
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/gerenciamento-patio/box');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao atualizar box.');
            console.error("Erro ao atualizar box:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletar = async () => {
        if (!id || !boxOriginal) {
            setError("Dados do box não disponíveis.");
            return;
        }

        const confirmacao = confirm(`Tem certeza que deseja remover o box "${boxOriginal.nome}"? Esta ação não pode ser desfeita.`);
        
        if (!confirmacao) {
            return;
        }

        setIsDeleting(true);
        setError(null);
        setSuccess(null);

        try {
            // Usar método hierárquico se tiver informações do pátio
            let patioStatus = boxOriginal.patioStatus || boxOriginal.patio?.status;
            if (!patioStatus && boxOriginal.patio?.idPatio) {
                const patioInfo = await PatioService.getById(boxOriginal.patio.idPatio);
                patioStatus = patioInfo.status || 'A';
            }

            if (boxOriginal.patio?.idPatio && patioStatus) {
                await BoxService.deletePorPatio(
                    boxOriginal.patio.idPatio,
                    patioStatus,
                    id
                );
            } else {
                // Fallback para método tradicional
                await BoxService.delete(id);
            }

            setSuccess(`Box "${boxOriginal.nome}" deletado com sucesso!`);
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/gerenciamento-patio/box');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao deletar box.');
            console.error("Erro ao deletar box:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isFetching) {
        return (
            <main className="flex justify-center items-center min-h-screen relative z-20">
                <div className="neumorphic-container p-8 rounded-lg">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        <span className="text-white">Carregando dados do box...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !boxOriginal) {
        return (
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center neumorphic-container p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link 
                        href="/gerenciamento-patio/box"
                        className="neumorphic-button-primary px-6 py-3 transition-colors font-medium inline-block"
                    >
                        <i className="ion-ios-arrow-back mr-2"></i>
                        Voltar ao Gerenciamento
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in min-h-screen p-4 md:p-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-cube text-purple-400"></i> 
                        Editar Box
                    </h2>
                    <p className="text-slate-300">
                        {boxOriginal && `Editando: ${boxOriginal.nome} (ID: ${boxOriginal.idBox})`}
                    </p>
                </div>

                {/* Mensagens de feedback */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-4 flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="ml-auto text-red-300 hover:text-red-200"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/50 border border-green-500 p-4 rounded-lg mb-4 flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lado Esquerdo: Formulário de edição */}
                    <div className="p-4 md:p-6 rounded-lg space-y-4 neumorphic-container">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
                            <i className="ion-ios-create text-purple-400"></i>
                            Editar Informações do Box
                        </h3>

                        <div className="group">
                            <label htmlFor="nomeBox" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-create text-blue-500 text-lg"></i> 
                                Nome do Box <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nomeBox"
                                value={nomeBox}
                                onChange={(e) => {
                                    setNomeBox(e.target.value);
                                    if (validationErrors.nome) {
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.nome;
                                            return newErrors;
                                        });
                                    }
                                }}
                                maxLength={50}
                                placeholder="Ex: guarulhos001"
                                className={`neumorphic-input h-10 ${validationErrors.nome ? 'border-red-500' : ''}`}
                            />
                            {validationErrors.nome && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.nome}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                {nomeBox.length}/50 caracteres
                            </p>
                        </div>

                        <div>
                            <label htmlFor="statusBox" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-flag text-orange-500 text-lg"></i> 
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="statusBox"
                                value={statusBox}
                                onChange={(e) => setStatusBox(e.target.value as 'L' | 'O')}
                                className="neumorphic-select h-10"
                            >
                                <option value="L">Livre</option>
                                <option value="O">Ocupado</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dataEntrada" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-calendar text-green-500 text-lg"></i> 
                                Data de Entrada
                            </label>
                            <input
                                type="datetime-local"
                                id="dataEntrada"
                                value={dataEntrada}
                                onChange={(e) => setDataEntrada(e.target.value)}
                                className="neumorphic-input h-10"
                            />
                        </div>

                        <div>
                            <label htmlFor="dataSaida" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-calendar text-red-500 text-lg"></i> 
                                Data de Saída
                            </label>
                            <input
                                type="datetime-local"
                                id="dataSaida"
                                value={dataSaida}
                                onChange={(e) => setDataSaida(e.target.value)}
                                className="neumorphic-input h-10"
                            />
                        </div>

                        <div>
                            <label htmlFor="observacaoBox" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-document text-purple-500 text-lg"></i> 
                                Observação (Opcional)
                            </label>
                            <textarea
                                id="observacaoBox"
                                value={observacaoBox}
                                onChange={(e) => setObservacaoBox(e.target.value)}
                                rows={4}
                                maxLength={300}
                                placeholder="Ex: Box próximo à entrada principal"
                                className="neumorphic-textarea"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                {observacaoBox.length}/300 caracteres
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleSalvar}
                                disabled={isLoading}
                                className="neumorphic-button-green flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ion-ios-checkmark-circle"></i>
                                        Salvar Alterações
                                    </>
                                )}
                            </button>

                            <Link
                                href="/gerenciamento-patio/box"
                                className="neumorphic-button flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <i className="ion-ios-arrow-back"></i>
                                Cancelar
                            </Link>
                        </div>
                    </div>

                    {/* Lado Direito: Informações do box e lista de boxes do pátio */}
                    <div className="space-y-6">
                        {/* Informações do box atual */}
                        <div className="p-4 md:p-6 rounded-lg neumorphic-container">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <i className="ion-ios-information-circle text-blue-400"></i>
                                Informações do Box
                            </h3>
                            
                            {boxOriginal && (
                                <div className="space-y-3">
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-400 border-2 p-4 rounded-lg animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                                                <i className="ion-ios-cube text-purple-500 text-lg"></i>
                                                {boxOriginal.nome}
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Editando</span>
                                            </p>
                                            
                                            {boxOriginal.observacao && (
                                                <p className="text-xs text-slate-600 mt-2 pl-6">
                                                    {boxOriginal.observacao}
                                                </p>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-purple-200 text-xs text-slate-600 space-y-1">
                                                <p className="flex items-center gap-1">
                                                    <i className="ion-ios-information-circle text-blue-500"></i>
                                                    <strong>ID:</strong> {boxOriginal.idBox}
                                                </p>
                                                {boxOriginal.patio && (
                                                    <p className="flex items-center gap-1">
                                                        <i className="ion-ios-home text-blue-500"></i>
                                                        <strong>Pátio:</strong> {boxOriginal.patio.nomePatio}
                                                    </p>
                                                )}
                                                {boxOriginal.status && (
                                                    <p className="flex items-center gap-1">
                                                        <i className={`ion-ios-flag ${boxOriginal.status === 'L' ? 'text-green-500' : 'text-red-500'}`}></i>
                                                        <strong>Status:</strong> {boxOriginal.status === 'L' ? 'Livre' : 'Ocupado'}
                                                    </p>
                                                )}
                                                {boxOriginal.dataEntrada && (
                                                    <p className="flex items-center gap-1">
                                                        <i className="ion-ios-calendar text-green-500"></i>
                                                        <strong>Data Entrada:</strong> {new Date(boxOriginal.dataEntrada).toLocaleString('pt-BR')}
                                                    </p>
                                                )}
                                                {boxOriginal.dataSaida && (
                                                    <p className="flex items-center gap-1">
                                                        <i className="ion-ios-calendar text-red-500"></i>
                                                        <strong>Data Saída:</strong> {new Date(boxOriginal.dataSaida).toLocaleString('pt-BR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-purple-200">
                                            <button
                                                onClick={handleDeletar}
                                                disabled={isDeleting || isLoading}
                                                className="w-full bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                                title={`Remover box ${boxOriginal.nome}`}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Removendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ion-ios-trash text-sm"></i>
                                                        Remover Box
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-400">
                                        <p className="flex items-center gap-2 mb-2">
                                            <i className="ion-ios-information-circle"></i>
                                            <strong>Dica:</strong>
                                        </p>
                                        <p>Você pode editar o nome, status, datas e observação do box. Os campos de data são opcionais e podem ser deixados em branco.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
