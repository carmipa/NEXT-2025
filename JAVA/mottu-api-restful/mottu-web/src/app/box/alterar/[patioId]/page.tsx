// Caminho: src/app/box/alterar/[patioId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PatioService, BoxService } from '@/utils/api';
import { PatioResponseDto } from '@/types/patio';
import { BoxResponseDto } from '@/types/box';
import EtapaBoxes from '@/components/wizard-steps/EtapaBoxes';
import { WizardData } from '@/app/patio/novo-assistente/page';

export default function EditarBoxesLotePage() {
    const router = useRouter();
    const params = useParams();
    const patioId = typeof params.patioId === 'string' ? parseInt(params.patioId, 10) : null;
    const messageRef = useRef<HTMLDivElement>(null);

    const [patio, setPatio] = useState<PatioResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    // Cache de 1 minuto para dados do pátio e boxes
    const CACHE_TTL = 60 * 1000; // 1 minuto

    const [wizardData, setWizardData] = useState<WizardData>({
        patio: {
            nomePatio: '',
            status: 'A',
            observacao: ''
        },
        contato: {
            email: '',
            ddd: 11,
            ddi: 55,
            telefone1: '',
            telefone2: '',
            telefone3: '',
            celular: '',
            outro: '',
            observacao: ''
        },
        endereco: {
            cep: '',
            numero: 0,
            complemento: '',
            observacao: ''
        },
        dadosViaCep: {
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: '',
            pais: 'Brasil'
        },
        zonas: [],
        boxes: []
    });

    // Carregar dados do pátio e boxes existentes
    const fetchPatioAndBoxes = useCallback(async () => {
        if (!patioId) {
            setError("ID do pátio inválido.");
            setIsFetching(false);
            return;
        }

        // Verificar cache
        const now = Date.now();
        if (now - lastFetchTime < CACHE_TTL && patio && wizardData.boxes.length > 0) {
            console.log('🎯 Cache HIT: Usando dados do cache');
            return;
        }

        setIsFetching(true);
        setError(null);
        try {
            const patioData = await PatioService.getById(patioId);
            // Buscar TODOS os boxes do pátio (não apenas os primeiros 10)
            const boxesData = await BoxService.listarPorPatio(patioId, patioData.status, 0, 9999);
            console.log(`📦 Carregando ${boxesData.content?.length || 0} boxes do pátio ${patioData.nomePatio}`);

            setPatio(patioData);
            
            // Converter BoxResponseDto[] para o formato esperado pelo WizardData
            const boxesFormatados = (boxesData.content || boxesData || []).map((box: BoxResponseDto) => ({
                nome: box.nome,
                status: (box.status || 'L') as 'L' | 'O',
                zonaNome: 'Padrão',
                observacao: box.observacao || '',
                patioId: box.patioId,
                patioStatus: box.patioStatus || patioData.status
            }));

            setWizardData({
                patio: {
                    nomePatio: patioData.nomePatio,
                    status: patioData.status,
                    observacao: patioData.observacao || ''
                },
                contato: patioData.contato ? {
                    email: patioData.contato.email || '',
                    ddd: patioData.contato.ddd || 11,
                    ddi: patioData.contato.ddi || 55,
                    telefone1: patioData.contato.telefone1 || '',
                    telefone2: patioData.contato.telefone2 || '',
                    telefone3: patioData.contato.telefone3 || '',
                    celular: patioData.contato.celular || '',
                    outro: patioData.contato.outro || '',
                    observacao: patioData.contato.observacao || ''
                } : {
                    email: '',
                    ddd: 11,
                    ddi: 55,
                    telefone1: '',
                    telefone2: '',
                    telefone3: '',
                    celular: '',
                    outro: '',
                    observacao: ''
                },
                endereco: patioData.endereco ? {
                    cep: patioData.endereco.cep || '',
                    numero: patioData.endereco.numero || 0,
                    complemento: patioData.endereco.complemento || '',
                    observacao: patioData.endereco.observacao || ''
                } : {
                    cep: '',
                    numero: 0,
                    complemento: '',
                    observacao: ''
                },
                dadosViaCep: patioData.endereco ? {
                    logradouro: patioData.endereco.logradouro || '',
                    bairro: patioData.endereco.bairro || '',
                    cidade: patioData.endereco.cidade || '',
                    estado: patioData.endereco.estado || '',
                    pais: patioData.endereco.pais || 'Brasil'
                } : {
                    logradouro: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    pais: 'Brasil'
                },
                zonas: [],
                boxes: boxesFormatados
            });

            setLastFetchTime(now);
            console.log('✅ Dados do pátio e boxes carregados e cacheados');
        } catch (err: any) {
            setError(err.response?.data?.message || "Falha ao carregar dados do pátio e boxes.");
            console.error("Erro ao buscar dados:", err);
        } finally {
            setIsFetching(false);
        }
    }, [patioId, lastFetchTime]); // REMOVIDO wizardData.boxes.length e patio das dependências para evitar recarregar ao editar

    useEffect(() => {
        // Só busca dados na montagem inicial ou quando o cache expirar
        fetchPatioAndBoxes();
    }, [patioId]); // Simplificado para só recarregar quando mudar de pátio

    // Rolar para a mensagem quando ela aparecer
    useEffect(() => {
        if ((error || success) && messageRef.current) {
            setTimeout(() => {
                messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [error, success]);

    // Salvar alterações nos boxes
    const handleSalvar = async () => {
        if (!patioId || !patio) {
            setError("Dados do pátio inválidos.");
            return;
        }

        // Validação: não permitir salvar sem boxes
        if (wizardData.boxes.length === 0) {
            setError("Não é possível salvar as alterações. Um pátio deve ter pelo menos um box. Adicione boxes antes de continuar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Buscar TODOS os boxes existentes (sem paginação)
            console.log('🔍 Buscando todos os boxes do pátio para comparação...');
            const boxesExistentesResponse = await BoxService.listarPorPatio(patioId, patio.status, 0, 9999);
            const boxesExistentes = boxesExistentesResponse.content || [];
            console.log(`📦 Total de boxes no servidor: ${boxesExistentes.length}`);

            // Criar mapa de boxes existentes por nome (case-insensitive)
            const boxesExistentesMap = new Map<string, BoxResponseDto>();
            boxesExistentes.forEach(b => boxesExistentesMap.set(b.nome.toLowerCase(), b));

            // Criar mapa de boxes do wizard por nome
            const boxesWizardMap = new Map<string, typeof wizardData.boxes[0]>();
            wizardData.boxes.forEach(b => boxesWizardMap.set(b.nome.toLowerCase(), b));

            // Deletar boxes que foram removidos do wizard
            const boxesParaDeletar = boxesExistentes.filter(b => !boxesWizardMap.has(b.nome.toLowerCase()));
            console.log(`🗑️ Boxes marcados para deleção: ${boxesParaDeletar.length}`);
            console.log(`📝 Boxes no wizard: ${wizardData.boxes.length}`);
            console.log(`🔄 Boxes para atualizar: ${wizardData.boxes.filter(b => boxesExistentesMap.has(b.nome.toLowerCase())).length}`);
            console.log(`➕ Boxes para criar: ${wizardData.boxes.filter(b => !boxesExistentesMap.has(b.nome.toLowerCase())).length}`);
            
            let boxesDeletados = 0;
            let boxesNaoDeletados: string[] = [];
            let ultimoBoxBloqueado = false;

            for (const boxExistente of boxesParaDeletar) {
                try {
                    await BoxService.delete(boxExistente.idBox);
                    boxesDeletados++;
                    console.log(`✅ Box "${boxExistente.nome}" removido com sucesso`);
                } catch (err: any) {
                    const status = err.response?.status;
                    const message = err.response?.data?.message || err.message;
                    
                    console.warn(`⚠️ Erro ao remover box "${boxExistente.nome}" (ID: ${boxExistente.idBox}):`, message);
                    
                    if (status === 403) {
                        // Erro 403: Tentou deletar o último box do pátio
                        ultimoBoxBloqueado = true;
                        boxesNaoDeletados.push(`"${boxExistente.nome}" (é o último box do pátio)`);
                    } else if (status === 409) {
                        // Erro 409: Box está em uso (ocupado ou com veículos)
                        boxesNaoDeletados.push(`"${boxExistente.nome}" (em uso)`);
                    } else {
                        // Outro erro
                        boxesNaoDeletados.push(`"${boxExistente.nome}" (${message})`);
                    }
                }
            }

            // Log do resultado da deleção
            console.log(`📊 Resultado da deleção: ${boxesDeletados}/${boxesParaDeletar.length} boxes removidos`);
            if (boxesNaoDeletados.length > 0) {
                console.log(`⚠️ Boxes não deletados: ${boxesNaoDeletados.join(', ')}`);
            }

            // Criar ou atualizar boxes do wizard
            let boxesAtualizados = 0;
            let boxesCriados = 0;
            
            for (const box of wizardData.boxes) {
                const boxExistente = boxesExistentesMap.get(box.nome.toLowerCase());

                if (boxExistente) {
                    // Box já existe, atualizar apenas se necessário
                    try {
                        console.log(`🔄 Atualizando box "${box.nome}" (ID: ${boxExistente.idBox})...`);
                        const boxPayload = {
                            nome: box.nome,
                            status: (box.status || boxExistente.status || 'L') as 'L' | 'O',
                            dataEntrada: boxExistente.dataEntrada || new Date().toISOString(),
                            dataSaida: boxExistente.dataSaida || new Date().toISOString(),
                            observacao: box.observacao || boxExistente.observacao || '',
                            patioId: patioId,
                            patioStatus: patio.status
                        };
                        await BoxService.update(boxExistente.idBox, boxPayload);
                        boxesAtualizados++;
                        console.log(`✅ Box "${box.nome}" atualizado (${boxesAtualizados})`);
                    } catch (err: any) {
                        console.error(`❌ Erro ao atualizar box ${box.nome}:`, err);
                        const apiMessage = err.response?.data?.message || err.message;
                        const suggestion = err.response?.data?.suggestion;
                        if (err.response?.status === 409) {
                            throw new Error(`Falha ao atualizar box "${box.nome}": ${apiMessage}. ${suggestion || ''}`);
                        }
                        throw err;
                    }
                } else {
                    // Box NÃO existe no mapa, MAS pode existir no banco!
                    // Verificar novamente antes de criar para evitar duplicação
                    console.log(`➕ Box "${box.nome}" NÃO encontrado no mapa local. Tentando criar...`);
                    
                    try {
                        const boxPayload = {
                            nome: box.nome,
                            status: (box.status || 'L') as 'L' | 'O',
                            dataEntrada: new Date().toISOString(),
                            dataSaida: new Date().toISOString(),
                            observacao: box.observacao || '',
                            patioId: patioId,
                            patioStatus: patio.status
                        };
                        await BoxService.create(boxPayload);
                        boxesCriados++;
                        console.log(`✅ Box "${box.nome}" criado com sucesso (${boxesCriados})`);
                    } catch (err: any) {
                        console.error(`❌ ERRO CRÍTICO ao criar box ${box.nome}:`, err);
                        const apiMessage = err.response?.data?.message || err.message;
                        
                        if (err.response?.status === 409) {
                            const erroMsg = `❌ ERRO DE SINCRONIZAÇÃO!\n\n` +
                                          `Tentou criar box "${box.nome}", mas ele JÁ EXISTE no servidor.\n\n` +
                                          `📊 ESTADO ATUAL:\n` +
                                          `- Boxes buscados do servidor: ${boxesExistentes.length}\n` +
                                          `- Boxes no wizard: ${wizardData.boxes.length}\n` +
                                          `- Boxes deletados: ${boxesDeletados}\n` +
                                          `- Boxes atualizados: ${boxesAtualizados}\n` +
                                          `- Boxes criados até agora: ${boxesCriados}\n\n` +
                                          `🔄 SOLUÇÃO:\n` +
                                          `1. Recarregue a página (F5) para ver TODOS os boxes do servidor\n` +
                                          `2. Verifique quantos boxes realmente existem\n` +
                                          `3. Tente novamente com cuidado\n\n` +
                                          `💡 DICA: Se você quer substituir TODOS os boxes, remova-os primeiro e espere salvar antes de adicionar novos.`;
                            
                            setError(erroMsg);
                            throw new Error(erroMsg);
                        }
                        throw err;
                    }
                }
            }
            
            console.log(`\n📊 RESUMO DAS OPERAÇÕES:`);
            console.log(`   🗑️ Deletados: ${boxesDeletados}/${boxesParaDeletar.length}`);
            console.log(`   🔄 Atualizados: ${boxesAtualizados}`);
            console.log(`   ➕ Criados: ${boxesCriados}`);
            console.log(`   📦 Total no wizard: ${wizardData.boxes.length}\n`);

            // Invalidar cache e recarregar dados atualizados
            setLastFetchTime(0);
            await fetchPatioAndBoxes();
            
            // Construir mensagem de sucesso baseada no resultado
            let mensagemSucesso = "Alterações salvas com sucesso!";
            
            if (boxesParaDeletar.length > 0) {
                if (boxesDeletados === boxesParaDeletar.length) {
                    mensagemSucesso += ` ${boxesDeletados} box(es) removido(s).`;
                } else if (boxesDeletados > 0) {
                    mensagemSucesso += ` ${boxesDeletados} de ${boxesParaDeletar.length} box(es) removido(s).`;
                    if (ultimoBoxBloqueado) {
                        mensagemSucesso += " O último box do pátio não pode ser removido.";
                    }
                } else {
                    if (ultimoBoxBloqueado) {
                        mensagemSucesso = "Alterações salvas. Não é possível remover todos os boxes - um pátio deve ter pelo menos um box.";
                    } else {
                        mensagemSucesso += " Alguns boxes não puderam ser removidos pois estão em uso.";
                    }
                }
            }
            
            // Adicionar informação sobre boxes não deletados
            if (boxesNaoDeletados.length > 0 && boxesNaoDeletados.length <= 3) {
                mensagemSucesso += ` Boxes não removidos: ${boxesNaoDeletados.join(', ')}.`;
            }
            
            setSuccess(mensagemSucesso);
            
            setTimeout(() => {
                router.push('/gerenciamento-patio');
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.message || err.response?.data?.message || "Erro ao salvar alterações nos boxes.";
            setError(errorMessage);
            console.error("Erro ao salvar boxes:", err);
            
            // Mesmo com erro, recarregar dados para mostrar o estado atual
            setLastFetchTime(0);
            await fetchPatioAndBoxes();
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <main className="flex justify-center items-center min-h-screen relative z-20">
                <div className="neumorphic-container p-8 rounded-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="text-white">Carregando dados do pátio...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !patio) {
        return (
            <main className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center neumorphic-container p-8 rounded-lg">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link 
                        href="/gerenciamento-patio"
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
        <main className="min-h-screen text-white p-4 md:p-8 pb-32 relative z-20">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 lg:p-8 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center mb-4 lg:mb-0">
                            <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 lg:mr-6">
                                <i className="ion-ios-grid text-white text-2xl lg:text-3xl"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Editar Boxes em Lote
                                </h1>
                                <p className="text-gray-300 text-sm lg:text-lg" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    {patio ? `Pátio: ${patio.nomePatio}` : 'Carregando...'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Link
                                href="/gerenciamento-patio"
                                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 lg:py-4 px-4 lg:px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400 hover:border-orange-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2 lg:gap-3">
                                    <div className="p-1.5 lg:p-2 bg-white/25 rounded-full">
                                        <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm lg:text-lg font-black">VOLTAR</div>
                                        <div className="text-xs text-orange-100 font-semibold hidden lg:block">Gerenciamento</div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Componente EtapaBoxes */}
                {patio && (
                    <div className="neumorphic-container p-6 md:p-8">
                        <EtapaBoxes wizardData={wizardData} setWizardData={setWizardData} />
                        
                        {/* Alerta quando não há boxes */}
                        {wizardData.boxes.length === 0 && (
                            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
                                <div className="flex items-center">
                                    <i className="ion-ios-warning text-2xl mr-3"></i>
                                    <div>
                                        <p className="font-bold">Atenção: Nenhum box adicionado!</p>
                                        <p className="text-sm">Um pátio deve ter pelo menos um box. Adicione boxes usando o formulário acima antes de salvar.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Messages - Exibidas acima do botão de salvar */}
                        {error && (
                            <div ref={messageRef} className="mt-6 text-center text-red-700 p-4 rounded-md bg-red-100 border border-red-400 shadow-lg animate-fade-in">
                                <i className="ion-ios-alert mr-2 text-xl"></i>
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div ref={messageRef} className="mt-6 text-center text-green-700 p-4 rounded-md bg-green-100 border border-green-400 shadow-lg animate-fade-in">
                                <i className="ion-ios-checkmark-circle mr-2 text-xl"></i>
                                <span className="font-semibold">{success}</span>
                            </div>
                        )}
                        
                        {/* Botão de Salvar */}
                        <div className="mt-8 flex justify-end gap-4">
                            <Link
                                href="/gerenciamento-patio"
                                className="px-6 py-3 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                            >
                                Cancelar
                            </Link>
                            <button
                                onClick={handleSalvar}
                                disabled={isLoading || wizardData.boxes.length === 0}
                                className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 flex items-center gap-2"
                                title={wizardData.boxes.length === 0 ? "Adicione pelo menos um box antes de salvar" : ""}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ion-ios-checkmark-circle"></i>
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
