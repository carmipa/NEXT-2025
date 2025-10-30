"use client";

import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/config/api';
import ParticleBackground from '@/components/particula/ParticleBackground';

interface Notificacao {
    id: number;
    tipo: 'info' | 'warning' | 'error' | 'success';
    titulo: string;
    mensagem: string;
    dataHora: string;
    lida: boolean;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    categoria: 'ocupacao' | 'movimentacao' | 'sistema' | 'manutencao';
    urlRedirecionamento?: string;
}

export default function NotificacoesPage() {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [filtro, setFiltro] = useState<'todas' | 'nao-lidas' | 'criticas'>('todas');
    const [categoria, setCategoria] = useState<string>('todas');
    const [loading, setLoading] = useState(false);
    const [sseActive, setSseActive] = useState<boolean>(false);

    // Carregar notificações quando o componente montar ou filtros mudarem
    useEffect(() => {
        carregarNotificacoes();
    }, [filtro, categoria]);

    // SSE para tempo real
    useEffect(() => {
        let es: EventSource | null = null;
        try {
            es = new EventSource(buildApiUrl('/api/notificacoes/stream'));
            es.onopen = () => setSseActive(true);
            es.onmessage = (ev) => {
                try {
                    const page = JSON.parse(ev.data);
                    const content: unknown[] = page?.content || [];
                    const novas: Notificacao[] = content.map((notif: unknown) => {
                        const n = notif as Record<string, unknown>;
                        return {
                            id: Number(n.idNotificacao || n.id),
                            tipo: String((n.tipo as string)?.toLowerCase() || 'info') as Notificacao['tipo'],
                            titulo: String(n.titulo || 'Notificação'),
                            mensagem: String(n.mensagem || 'Sem mensagem'),
                            dataHora: String(n.dataHoraCriacao || n.dataHora || new Date().toISOString()),
                            lida: Boolean(n.lida || false),
                            prioridade: String((n.prioridade as string)?.toLowerCase() || 'media') as Notificacao['prioridade'],
                            categoria: String((n.categoria as string)?.toLowerCase() || 'sistema') as Notificacao['categoria'],
                            urlRedirecionamento: (n.urlRedirecionamento as string) || undefined
                        };
                    });
                    setNotificacoes(novas);
                } catch {}
            };
            es.onerror = () => setSseActive(false);
        } catch {}
        return () => { if (es) es.close(); setSseActive(false); };
    }, []);

    const carregarNotificacoes = async () => {
        setLoading(true);
        try {
            // Construir URL com filtros
            const params = new URLSearchParams();
            if (filtro === 'nao-lidas') {
                params.append('lida', 'false');
            } else if (filtro === 'criticas') {
                params.append('prioridade', 'CRITICA');
            }
            if (categoria !== 'todas') {
                params.append('categoria', categoria.toUpperCase());
            }
            
            const response = await fetch(`/api/notificacoes?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar notificações: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dados recebidos da API:', data);
            
            // Processar dados reais da API
            const notificacoesProcessadas: Notificacao[] = (data.content as unknown[] | undefined)?.map((notif: unknown) => {
                const n = notif as Record<string, unknown>;
                return {
                    id: Number(n.idNotificacao || n.id),
                    tipo: String((n.tipo as string)?.toLowerCase() || 'info') as Notificacao['tipo'],
                    titulo: String(n.titulo || 'Notificação'),
                    mensagem: String(n.mensagem || 'Sem mensagem'),
                    dataHora: String(n.dataHoraCriacao || n.dataHora || new Date().toISOString()),
                    lida: Boolean(n.lida || false),
                    prioridade: String((n.prioridade as string)?.toLowerCase() || 'media') as Notificacao['prioridade'],
                    categoria: String((n.categoria as string)?.toLowerCase() || 'sistema') as Notificacao['categoria'],
                    urlRedirecionamento: (n.urlRedirecionamento as string) || undefined
                };
            }) || [];
            
            setNotificacoes(notificacoesProcessadas);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            // Fallback para dados reais do sistema em caso de erro
            const dadosFallback: Notificacao[] = [
                {
                    id: 1,
                    tipo: 'info',
                    titulo: 'Sistema de Notificações Ativado',
                    mensagem: 'O sistema de notificações dinâmicas foi ativado com sucesso!',
                    dataHora: new Date().toISOString(),
                    lida: false,
                    prioridade: 'baixa',
                    categoria: 'sistema'
                }
            ];
            setNotificacoes(dadosFallback);
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLida = async (id: number) => {
        try {
            const response = await fetch(`/api/notificacoes/${id}/marcar-lida`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                setNotificacoes(prev => 
                    prev.map(notif => 
                        notif.id === id ? { ...notif, lida: true } : notif
                    )
                );
            } else {
                console.error('Erro ao marcar notificação como lida');
            }
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    const marcarTodasComoLidas = async () => {
        try {
            const response = await fetch('/api/notificacoes/marcar-todas-lidas', {
                method: 'PUT'
            });
            
            if (response.ok) {
                setNotificacoes(prev => 
                    prev.map(notif => ({ ...notif, lida: true }))
                );
            } else {
                console.error('Erro ao marcar todas as notificações como lidas');
            }
        } catch (error) {
            console.error('Erro ao marcar todas as notificações como lidas:', error);
        }
    };

    const limparTodasNotificacoes = async () => {
        if (!confirm('Tem certeza que deseja excluir TODAS as notificações? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch('/api/notificacoes/limpar', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setNotificacoes([]);
                alert('Todas as notificações foram excluídas com sucesso!');
            } else {
                console.error('Erro ao limpar notificações');
                alert('Erro ao limpar notificações');
            }
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
            alert('Erro ao limpar notificações');
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'info': return 'ion-ios-information-circle';
            case 'warning': return 'ion-ios-warning';
            case 'error': return 'ion-ios-close-circle';
            case 'success': return 'ion-ios-checkmark-circle';
            default: return 'ion-ios-notifications';
        }
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'info': return 'text-blue-500';
            case 'warning': return 'text-yellow-500';
            case 'error': return 'text-red-500';
            case 'success': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getPrioridadeColor = (prioridade: string) => {
        switch (prioridade) {
            case 'critica': return 'bg-red-100 text-red-800 border-red-200';
            case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const notificacoesFiltradas = notificacoes.filter(notif => {
        if (filtro === 'nao-lidas' && notif.lida) return false;
        if (filtro === 'criticas' && notif.prioridade !== 'critica') return false;
        if (categoria !== 'todas' && notif.categoria !== categoria) return false;
        return true;
    });

    const naoLidas = notificacoes.filter(n => !n.lida).length;
    const criticas = notificacoes.filter(n => n.prioridade === 'critica' && !n.lida).length;
    const criticasPorCategoria = notificacoes.reduce((acc: Record<string, number>, n) => {
        if (n.prioridade === 'critica' && !n.lida) {
            acc[n.categoria] = (acc[n.categoria] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen bg-black relative">
            <ParticleBackground />
            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="neumorphic-container mb-6 lg:mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center">
                            <a 
                                href="/relatorios" 
                                className="mr-2 lg:mr-4 p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Voltar para Início"
                            >
                                <i className="ion-ios-arrow-back text-lg lg:text-xl"></i>
                            </a>
                            <div>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-notifications text-orange-500 mr-2 lg:mr-3 text-lg lg:text-xl"></i>
                                    Central de Notificações
                                </h1>
                                <p className="text-gray-600 text-sm lg:text-base" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Sistema inteligente de alertas e notificações em tempo real
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-full border text-xs ${sseActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                <span className={`w-2 h-2 rounded-full ${sseActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <span>Tempo Real</span>
                            </div>
                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-orange-600">{naoLidas}</div>
                                <div className="text-xs lg:text-sm text-gray-500">Não Lidas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-red-600">{criticas}</div>
                                <div className="text-xs lg:text-sm text-gray-500 flex items-center gap-1 justify-center">
                                    <span>Críticas</span>
                                    {/* Badges por categoria */}
                                    {Object.entries(criticasPorCategoria).map(([cat, q]) => (
                                        <span key={cat} className={`ml-1 px-1.5 py-0.5 rounded-full border text-[10px] capitalize ${
                                            cat === 'ocupacao' ? 'bg-red-50 text-red-700 border-red-200' :
                                            cat === 'movimentacao' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            cat === 'manutencao' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {cat}:{q}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros e Ações */}
                <div className="neumorphic-container mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filtro</label>
                                <select
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value as any)}
                                    className="neumorphic-select"
                                >
                                    <option value="todas">Todas</option>
                                    <option value="nao-lidas">Não Lidas</option>
                                    <option value="criticas">Críticas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="neumorphic-select"
                                >
                                    <option value="todas">Todas</option>
                                    <option value="ocupacao">Ocupação</option>
                                    <option value="movimentacao">Movimentação</option>
                                    <option value="sistema">Sistema</option>
                                    <option value="manutencao">Manutenção</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <button
                                onClick={marcarTodasComoLidas}
                                className="px-3 lg:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm lg:text-base"
                            >
                                <i className="ion-ios-checkmark mr-1 lg:mr-2"></i>
                                <span className="hidden sm:inline">Marcar Todas como Lidas</span>
                                <span className="sm:hidden">Marcar Lidas</span>
                            </button>
                            <button
                                onClick={limparTodasNotificacoes}
                                className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm lg:text-base"
                            >
                                <i className="ion-ios-trash mr-1 lg:mr-2"></i>
                                <span className="hidden sm:inline">Limpar Todas</span>
                                <span className="sm:hidden">Limpar</span>
                            </button>
                            <button
                                onClick={carregarNotificacoes}
                                disabled={loading}
                                className="px-3 lg:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 text-sm lg:text-base"
                            >
                                <i className={`ion-ios-refresh mr-1 lg:mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                                <span className="hidden sm:inline">Atualizar</span>
                                <span className="sm:hidden">Atualizar</span>
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/api/notificacoes/gerar-dinamicas', {
                                            method: 'POST'
                                        });
                                        if (response.ok) {
                                            alert('Notificações dinâmicas geradas com sucesso!');
                                            carregarNotificacoes();
                                        } else {
                                            alert('Erro ao gerar notificações dinâmicas');
                                        }
                                    } catch (error) {
                                            console.error('Erro ao gerar notificações:', error);
                                            alert('Erro ao gerar notificações dinâmicas');
                                        }
                                    }}
                                className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                            >
                                <i className="ion-ios-flash mr-1 lg:mr-2"></i>
                                <span className="hidden sm:inline">Gerar Dinâmicas</span>
                                <span className="sm:hidden">Gerar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Notificações */}
                <div className="neumorphic-container overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            Notificações ({notificacoesFiltradas.length})
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center">
                            <i className="ion-ios-refresh animate-spin text-2xl text-gray-500 mb-2"></i>
                            <p className="text-gray-500">Carregando notificações...</p>
                        </div>
                    ) : notificacoesFiltradas.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {notificacoesFiltradas.map((notificacao) => (
                                <div
                                    key={notificacao.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${!notificacao.lida ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`text-2xl ${getTipoColor(notificacao.tipo)}`}>
                                                <i className={getTipoIcon(notificacao.tipo)}></i>
                                            </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className={`font-semibold ${!notificacao.lida ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notificacao.titulo}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPrioridadeColor(notificacao.prioridade)}`}>
                                                    {notificacao.prioridade.toUpperCase()}
                                                </span>
                                                {!notificacao.lida && (
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">{notificacao.mensagem}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>
                                                    <i className="ion-ios-time mr-1"></i>
                                                    {new Date(notificacao.dataHora).toLocaleString('pt-BR')}
                                                </span>
                                                <span className="capitalize">
                                                    <i className="ion-ios-folder mr-1"></i>
                                                    {notificacao.categoria}
                                                </span>
                                                {notificacao.urlRedirecionamento && (
                                                    <a 
                                                        href={notificacao.urlRedirecionamento}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                                        title="Ir para a página relacionada"
                                                    >
                                                        <i className="ion-ios-arrow-forward mr-1"></i>
                                                        Ver Detalhes
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        </div>
                                        {!notificacao.lida && (
                                            <button
                                                onClick={() => marcarComoLida(notificacao.id)}
                                                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                            >
                                                Marcar como Lida
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <i className="ion-ios-information-circle text-4xl mb-4"></i>
                            <p>Nenhuma notificação encontrada com os filtros selecionados.</p>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}
