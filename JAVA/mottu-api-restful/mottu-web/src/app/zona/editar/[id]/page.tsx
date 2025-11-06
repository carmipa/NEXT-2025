// src/app/zona/editar/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ZonaService, PatioService } from '@/utils/api';
import { ZonaResponseDto } from '@/types/zona';
import { PatioResponseDto } from '@/types/patio';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EditarZonaPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

    const [nomeZona, setNomeZona] = useState('');
    const [observacaoZona, setObservacaoZona] = useState('');
    const [zonaOriginal, setZonaOriginal] = useState<ZonaResponseDto | null>(null);
    const [zonasDoPatio, setZonasDoPatio] = useState<ZonaResponseDto[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!id) {
            setError("ID da zona não fornecido na URL.");
            setIsFetching(false);
            return;
        }

            const fetchZonaData = async () => {
                setIsFetching(true);
                setError(null);
                try {
                    const data: ZonaResponseDto = await ZonaService.getById(id);
                    setZonaOriginal(data);
                    setNomeZona(data.nome || '');
                    setObservacaoZona(data.observacao || '');
                    
                    // Garantir que temos valores válidos para pátio
                    if (!data.patioId && data.patio?.idPatio) {
                        data.patioId = data.patio.idPatio;
                    }
                    if (!data.patioStatus && data.patio?.status) {
                        data.patioStatus = data.patio.status;
                    }
                    if (!data.status) {
                        data.status = 'A'; // Padrão Ativo
                    }

                    // Buscar todas as zonas do pátio inicialmente
                    const carregarZonas = async () => {
                        try {
                            if (data.patioId && data.patioStatus) {
                                const zonasResponse = await ZonaService.listarPorPatio(data.patioId, data.patioStatus, 0, 100);
                                // Ordenar por nome em ordem crescente
                                const zonasOrdenadas = (zonasResponse.content || []).sort((a, b) => 
                                    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
                                );
                                setZonasDoPatio(zonasOrdenadas);
                            } else if (data.patio?.idPatio) {
                                const patioInfo = await PatioService.getById(data.patio.idPatio);
                                const zonasResponse = await ZonaService.listarPorPatio(data.patio.idPatio, patioInfo.status, 0, 100);
                                // Ordenar por nome em ordem crescente
                                const zonasOrdenadas = (zonasResponse.content || []).sort((a, b) => 
                                    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
                                );
                                setZonasDoPatio(zonasOrdenadas);
                            }
                        } catch (err) {
                            console.warn("Erro ao buscar zonas do pátio:", err);
                        }
                    };
                    
                    await carregarZonas();

                    // Configurar SSE para atualização em tempo real
                    const setupSSE = () => {
                        try {
                            const patioIdZona = data.patioId || data.patio?.idPatio;
                            const patioStatusZona = data.patioStatus || data.patio?.status;

                            if (!patioIdZona || !patioStatusZona) {
                                return null;
                            }

                            // Usar URL absoluta para SSE
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://72.61.219.15:8080';
                            const sseUrl = `${apiUrl}/api/zonas/stream?patioId=${patioIdZona}&patioStatus=${patioStatusZona}`;
                            
                            const eventSource = new EventSource(sseUrl);

                            eventSource.onopen = () => {
                                console.log('✅ SSE de zonas conectado');
                            };

                            eventSource.onmessage = (event) => {
                                try {
                                    const zonasData = JSON.parse(event.data) as ZonaResponseDto[];
                                    // Ordenar por nome em ordem crescente
                                    const zonasOrdenadas = zonasData.sort((a, b) => 
                                        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
                                    );
                                    setZonasDoPatio(zonasOrdenadas);
                                    console.log('✅ Zonas atualizadas via SSE:', zonasOrdenadas.length);
                                } catch (err) {
                                    console.error('❌ Erro ao processar dados SSE de zonas:', err);
                                }
                            };

                            eventSource.onerror = (error) => {
                                console.error('❌ Erro no SSE de zonas:', error);
                                eventSource.close();
                                // Tentar reconectar após 5 segundos
                                setTimeout(() => {
                                    setupSSE();
                                }, 5000);
                            };

                            return eventSource;
                        } catch (err) {
                            console.error('❌ Erro ao criar EventSource de zonas:', err);
                            return null;
                        }
                    };

                    // Configurar SSE
                    const eventSource = setupSSE();

                    // Retornar função de cleanup
                    return () => {
                        if (eventSource) {
                            eventSource.close();
                        }
                    };
                } catch (err: any) {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados da zona.");
                    console.error("Erro ao buscar zona:", err);
                } finally {
                    setIsFetching(false);
                }
            };

        fetchZonaData();
    }, [id]);

    const handleSalvar = async () => {
        // Validação
        const errors: Record<string, string> = {};
        
        if (nomeZona.trim() === '') {
            errors.nome = 'O nome da zona não pode ser vazio.';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        if (!id || !zonaOriginal) {
            setError("Dados da zona não disponíveis.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setValidationErrors({});

        try {
            // Preparar dados para atualização - garantir que todos os campos obrigatórios estejam presentes
            const statusZona = zonaOriginal.status || 'A';
            const patioIdZona = zonaOriginal.patioId || zonaOriginal.patio?.idPatio;
            
            // Buscar status do pátio se não tivermos
            let patioStatusZona = zonaOriginal.patioStatus || zonaOriginal.patio?.status;
            
            if (!patioStatusZona && patioIdZona) {
                try {
                    const patioInfo = await PatioService.getById(patioIdZona);
                    patioStatusZona = patioInfo.status || 'A';
                } catch (err) {
                    console.warn("Erro ao buscar status do pátio, usando padrão:", err);
                    patioStatusZona = 'A'; // Fallback para padrão
                }
            }
            
            if (!patioIdZona) {
                setError("Não foi possível identificar o pátio da zona. Por favor, tente novamente.");
                return;
            }

            if (!patioStatusZona) {
                patioStatusZona = 'A'; // Último fallback
            }

            const zonaUpdateData = {
                nome: nomeZona.trim(),
                observacao: observacaoZona.trim() || undefined,
                status: statusZona,
                patioId: patioIdZona,
                patioStatus: patioStatusZona
            };

            // Preferir usar método hierárquico se tiver informações do pátio
            let updatedZona: ZonaResponseDto;
            if (patioIdZona && patioStatusZona) {
                try {
                    // Tentar usar método hierárquico primeiro
                    updatedZona = await ZonaService.updatePorPatio(
                        patioIdZona,
                        patioStatusZona,
                        id,
                        {
                            nome: zonaUpdateData.nome,
                            observacao: zonaUpdateData.observacao
                        }
                    );
                } catch (err: any) {
                    // Se falhar, usar método tradicional
                    console.warn("Método hierárquico falhou, usando método tradicional:", err);
                    updatedZona = await ZonaService.update(id, {
                        nome: zonaUpdateData.nome,
                        observacao: zonaUpdateData.observacao,
                        status: zonaUpdateData.status,
                        patioId: zonaUpdateData.patioId,
                        patioStatus: zonaUpdateData.patioStatus
                    });
                }
            } else {
                // Fallback para método tradicional - precisa incluir todos os campos obrigatórios
                updatedZona = await ZonaService.update(id, {
                    nome: zonaUpdateData.nome,
                    observacao: zonaUpdateData.observacao,
                    status: zonaUpdateData.status,
                    patioId: zonaUpdateData.patioId,
                    patioStatus: zonaUpdateData.patioStatus
                });
            }

            setSuccess(`Zona "${updatedZona.nome}" atualizada com sucesso!`);
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/gerenciamento-patio/zona');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao atualizar zona.');
            console.error("Erro ao atualizar zona:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletar = async () => {
        if (!id || !zonaOriginal) {
            setError("Dados da zona não disponíveis.");
            return;
        }

        const confirmacao = confirm(`Tem certeza que deseja remover a zona "${zonaOriginal.nome}"? Esta ação não pode ser desfeita e removerá todos os boxes associados a esta zona.`);
        
        if (!confirmacao) {
            return;
        }

        setIsDeleting(true);
        setError(null);
        setSuccess(null);

        try {
            // Usar método hierárquico se tiver informações do pátio
            let patioStatus = zonaOriginal.patioStatus || zonaOriginal.patio?.status;
            if (!patioStatus && zonaOriginal.patio?.idPatio) {
                const patioInfo = await PatioService.getById(zonaOriginal.patio.idPatio);
                patioStatus = patioInfo.status || 'A';
            }

            if (zonaOriginal.patio?.idPatio && patioStatus) {
                await ZonaService.deletePorPatio(
                    zonaOriginal.patio.idPatio,
                    patioStatus,
                    id
                );
            } else {
                // Fallback para método tradicional
                await ZonaService.delete(id);
            }

            setSuccess(`Zona "${zonaOriginal.nome}" deletada com sucesso!`);
            
            // Recarregar lista de zonas (ordenar por nome crescente)
            if (zonaOriginal.patio?.idPatio && patioStatus) {
                const zonasResponse = await ZonaService.listarPorPatio(zonaOriginal.patio.idPatio, patioStatus, 0, 100);
                const zonasOrdenadas = (zonasResponse.content || []).sort((a, b) => 
                    a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
                );
                setZonasDoPatio(zonasOrdenadas);
            }
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/gerenciamento-patio/zona');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao deletar zona.');
            console.error("Erro ao deletar zona:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemoverZona = async (zonaId: number, zonaNome: string) => {
        if (!confirm(`Tem certeza que deseja remover a zona "${zonaNome}"? Esta ação não pode ser desfeita e removerá todos os boxes associados a esta zona.`)) {
            return;
        }

        if (!zonaOriginal) {
            setError("Dados da zona não disponíveis.");
            return;
        }

        setIsDeleting(true);
        setError(null);
        setSuccess(null);

        try {
            const patioIdZona = zonaOriginal.patioId || zonaOriginal.patio?.idPatio;
            let patioStatusZona = zonaOriginal.patioStatus || zonaOriginal.patio?.status;

            if (!patioStatusZona && patioIdZona) {
                try {
                    const patioInfo = await PatioService.getById(patioIdZona);
                    patioStatusZona = patioInfo.status || 'A';
                } catch (err) {
                    console.warn("Erro ao buscar status do pátio:", err);
                    patioStatusZona = 'A';
                }
            }

            if (patioIdZona && patioStatusZona) {
                await ZonaService.deletePorPatio(patioIdZona, patioStatusZona, zonaId);
            } else {
                await ZonaService.delete(zonaId);
            }

            // Atualizar lista de zonas
            if (patioIdZona && patioStatusZona) {
                const zonasResponse = await ZonaService.listarPorPatio(patioIdZona, patioStatusZona, 0, 100);
                setZonasDoPatio(zonasResponse.content || []);
            }

            // Se deletou a zona atual, redirecionar
            if (zonaId === id) {
                setSuccess(`Zona "${zonaNome}" deletada com sucesso!`);
                setTimeout(() => {
                    router.push('/gerenciamento-patio/zona');
                }, 2000);
            } else {
                setSuccess(`Zona "${zonaNome}" deletada com sucesso!`);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha ao deletar zona.');
            console.error("Erro ao deletar zona:", err);
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
                        <span className="text-white">Carregando dados da zona...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !zonaOriginal) {
        return (
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center neumorphic-container p-8 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link 
                        href="/gerenciamento-patio/zona"
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
                        <i className="ion-ios-map text-green-400"></i> 
                        Editar Zona
                    </h2>
                    <p className="text-slate-300">
                        {zonaOriginal && `Editando: ${zonaOriginal.nome} (ID: ${zonaOriginal.idZona})`}
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
                            <i className="ion-ios-create text-green-400"></i>
                            Editar Informações da Zona
                        </h3>

                        <div className="group">
                            <label htmlFor="nomeZona" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-create text-blue-500 text-lg"></i> 
                                Nome da Zona <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nomeZona"
                                value={nomeZona}
                                onChange={(e) => {
                                    setNomeZona(e.target.value);
                                    if (validationErrors.nome) {
                                        setValidationErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.nome;
                                            return newErrors;
                                        });
                                    }
                                }}
                                maxLength={50}
                                placeholder="Ex: Setor A - Coberto"
                                className={`neumorphic-input h-10 ${validationErrors.nome ? 'border-red-500' : ''}`}
                            />
                            {validationErrors.nome && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.nome}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">
                                {nomeZona.length}/50 caracteres
                            </p>
                        </div>

                        <div>
                            <label htmlFor="observacaoZona" className="neumorphic-label text-slate-700 mb-1 flex items-center gap-2">
                                <i className="ion-ios-document text-purple-500 text-lg"></i> 
                                Observação (Opcional)
                            </label>
                            <textarea
                                id="observacaoZona"
                                value={observacaoZona}
                                onChange={(e) => setObservacaoZona(e.target.value)}
                                rows={4}
                                maxLength={300}
                                placeholder="Ex: Próximo à entrada principal"
                                className="neumorphic-textarea"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                {observacaoZona.length}/300 caracteres
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
                                href="/gerenciamento-patio/zona"
                                className="neumorphic-button flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <i className="ion-ios-arrow-back"></i>
                                Cancelar
                            </Link>
                        </div>
                    </div>

                    {/* Lado Direito: Informações da zona e lista de zonas do pátio */}
                    <div className="space-y-6">
                        {/* Informações da zona atual */}
                        <div className="p-4 md:p-6 rounded-lg neumorphic-container">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <i className="ion-ios-information-circle text-blue-400"></i>
                                Informações da Zona
                            </h3>
                            
                            {zonaOriginal && (
                                <div className="space-y-3">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-green-400 border-2 p-4 rounded-lg animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                                                <i className="ion-ios-location text-blue-500 text-lg"></i>
                                                {zonaOriginal.nome}
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Editando</span>
                                            </p>
                                            
                                            {zonaOriginal.observacao && (
                                                <p className="text-xs text-slate-600 mt-2 pl-6">
                                                    {zonaOriginal.observacao}
                                                </p>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-slate-600 space-y-1">
                                                <p className="flex items-center gap-1">
                                                    <i className="ion-ios-information-circle text-blue-500"></i>
                                                    <strong>ID:</strong> {zonaOriginal.idZona}
                                                </p>
                                                {zonaOriginal.patio && (
                                                    <p className="flex items-center gap-1">
                                                        <i className="ion-ios-home text-blue-500"></i>
                                                        <strong>Pátio:</strong> {zonaOriginal.patio.nomePatio}
                                                    </p>
                                                )}
                                                {zonaOriginal.status && (
                                                    <p className="flex items-center gap-1">
                                                        <i className={`ion-ios-checkmark-circle ${zonaOriginal.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                                        <strong>Status:</strong> {zonaOriginal.status === 'A' ? 'Ativo' : 'Inativo'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <button
                                                onClick={handleDeletar}
                                                disabled={isDeleting || isLoading}
                                                className="w-full bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                                title={`Remover zona ${zonaOriginal.nome}`}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Removendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ion-ios-trash text-sm"></i>
                                                        Remover Zona
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
                                        <p>Você pode editar o nome e a observação da zona. Os campos de data são gerenciados automaticamente pelo sistema.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Lista de zonas do pátio */}
                        <div className="p-4 md:p-6 rounded-lg neumorphic-container">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <i className="ion-ios-list text-blue-400"></i>
                                Outras Zonas do Pátio ({zonasDoPatio.length})
                            </h3>
                            
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {zonasDoPatio.length > 0 ? (
                                    zonasDoPatio
                                        .filter(zona => zona.idZona !== id) // Excluir a zona atual
                                        .map((zona) => (
                                            <Link
                                                key={zona.idZona}
                                                href={`/zona/editar/${zona.idZona}`}
                                                className="block bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-3 rounded-lg animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                            >
                                                <p className="font-bold text-slate-700 flex items-center gap-2 mb-1">
                                                    <i className="ion-ios-location text-blue-500 text-lg"></i>
                                                    {zona.nome}
                                                </p>
                                                
                                                {zona.observacao && (
                                                    <p className="text-xs text-slate-600 mt-1 pl-6">
                                                        {zona.observacao}
                                                    </p>
                                                )}

                                                <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-slate-600 space-y-1">
                                                    <p className="flex items-center gap-1">
                                                        <i className="ion-ios-information-circle text-blue-500"></i>
                                                        <strong>ID:</strong> {zona.idZona}
                                                    </p>
                                                    {zona.status && (
                                                        <p className="flex items-center gap-1">
                                                            <i className={`ion-ios-checkmark-circle ${zona.status === 'A' ? 'text-green-500' : 'text-red-500'}`}></i>
                                                            <strong>Status:</strong> {zona.status === 'A' ? 'Ativo' : 'Inativo'}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))
                                ) : (
                                    <div className="text-center text-slate-500 py-10">
                                        <i className="ion-ios-map text-4xl mb-2 block"></i>
                                        <p>Nenhuma outra zona encontrada para este pátio.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

