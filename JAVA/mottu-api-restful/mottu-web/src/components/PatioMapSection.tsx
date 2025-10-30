'use client';
import { useState, useEffect } from 'react';
import { MapPin, Building, Users, Car, Clock } from 'lucide-react';
import VistaPatio from './mapa-box/VistaPatio';
import VistaMapa from './mapa-box/VistaMapa';
import VistaGrade from './mapa-box/VistaGrade';
import VistaAbas from './mapa-box/VistaAbas';

interface Vaga {
    idVaga: number;
    nomeBox: string;
    status: string;
    placa: string | null;
    patio: {
        idPatio: number;
        nomePatio: string;
        endereco: string;
    };
    dataHoraOcupacao: string | null;
    dataHoraLiberacao: string | null;
}

interface PatioMapSectionProps {
    vagas: Vaga[];
    loading: boolean;
    onRefresh: () => void;
}

export default function PatioMapSection({ vagas, loading, onRefresh }: PatioMapSectionProps) {
    const [patioSelecionado, setPatioSelecionado] = useState<number | null>(null);
    const [visualizacao, setVisualizacao] = useState<'patio' | 'mapa' | 'grade' | 'abas'>('patio');
    
    // Agrupar vagas por pátio
    const patios = vagas.reduce((acc, vaga) => {
        const patioId = vaga.patio.idPatio;
        if (!acc[patioId]) {
            acc[patioId] = {
                id: patioId,
                nome: vaga.patio.nomePatio,
                endereco: vaga.patio.endereco,
                vagas: []
            };
        }
        acc[patioId].vagas.push(vaga);
        return acc;
    }, {} as Record<number, any>);

    const patiosArray = Object.values(patios);
    
    // Selecionar primeiro pátio por padrão
    useEffect(() => {
        if (patiosArray.length > 0 && !patioSelecionado) {
            setPatioSelecionado(patiosArray[0].id);
        }
    }, [patiosArray.length, patioSelecionado]);

    const patioAtual = patiosArray.find(p => p.id === patioSelecionado);
    const vagasPatioAtual = patioAtual?.vagas || [];

    // Calcular estatísticas do pátio atual
    const estatisticas = {
        total: vagasPatioAtual.length,
        livres: vagasPatioAtual.filter(v => v.status === 'L').length,
        ocupadas: vagasPatioAtual.filter(v => v.status === 'O').length,
        manutencao: vagasPatioAtual.filter(v => v.status === 'M').length
    };

    const renderVisualizacao = () => {
        const props = {
            vagas: vagasPatioAtual,
            loading,
            onRefresh,
            estatisticas
        };

        switch (visualizacao) {
            case 'patio':
                return <VistaPatio {...props} />;
            case 'mapa':
                return <VistaMapa {...props} />;
            case 'grade':
                return <VistaGrade {...props} />;
            case 'abas':
                return <VistaAbas {...props} />;
            default:
                return <VistaPatio {...props} />;
        }
    };

    return (
        <section className="pcw-row">
            {/* ESQUERDA: LISTA DE PÁTIOS */}
            <div className="pcw-form">
                <div className="pcw-heading">Pátios Disponíveis</div>
                
                {/* Navegação por Abas dos Pátios */}
                <div className="space-y-2">
                    {patiosArray.map((patio) => (
                        <button
                            key={patio.id}
                            onClick={() => setPatioSelecionado(patio.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                                patioSelecionado === patio.id
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Building size={20} />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{patio.nome}</h3>
                                    <p className="text-sm opacity-80">{patio.vagas.length} vagas</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs">
                                        {patio.vagas.filter(v => v.status === 'L').length} 🟢
                                    </div>
                                    <div className="text-xs">
                                        {patio.vagas.filter(v => v.status === 'O').length} 🔴
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Botões de Visualização */}
                <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-600">Visualização:</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setVisualizacao('patio')}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                visualizacao === 'patio'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            🏢 Pátio
                        </button>
                        <button
                            onClick={() => setVisualizacao('mapa')}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                visualizacao === 'mapa'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            🗺️ Mapa
                        </button>
                        <button
                            onClick={() => setVisualizacao('grade')}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                visualizacao === 'grade'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            📊 Grade
                        </button>
                        <button
                            onClick={() => setVisualizacao('abas')}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                visualizacao === 'abas'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            📋 Abas
                        </button>
                    </div>
                </div>

                {/* Informações do Pátio Selecionado */}
                {patioAtual && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <MapPin size={16} />
                            {patioAtual.nome}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{patioAtual.endereco}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{estatisticas.livres} Livres</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>{estatisticas.ocupadas} Ocupadas</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>{estatisticas.manutencao} Manutenção</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>{estatisticas.total} Total</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DIREITA: MAPA E CARD */}
            <div className="h-full flex flex-col">
                {patioAtual ? (
                    <div className="h-full">
                        {/* Card do Pátio */}
                        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Building size={20} className="text-emerald-600" />
                                        {patioAtual.nome}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{patioAtual.endereco}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {estatisticas.total} vagas
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Car size={14} />
                                            {estatisticas.ocupadas} ocupadas
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {estatisticas.livres} disponíveis
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Pátio ID</div>
                                    <div className="text-xs font-mono">
                                        #{patioAtual.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visualização Selecionada */}
                        <div className="flex-1">
                            {renderVisualizacao()}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <Building size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Selecione um pátio para visualizar</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
