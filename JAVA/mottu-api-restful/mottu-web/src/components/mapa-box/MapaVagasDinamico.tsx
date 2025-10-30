"use client";

import { useState } from 'react';
import { MapPin, Bike, Phone, Calendar, Info } from 'lucide-react';
import { VagaCompleta, STATUS_COLORS, STATUS_LABELS, ViewMode } from '../../app/mapa-box/types/VagaCompleta';
import VistaPatio from './VistaPatio';
import VistaMapa from './VistaMapa';
import VistaGrade from './VistaGrade';
import VistaAbas from './VistaAbas';

interface MapaVagasDinamicoProps {
    vagas: VagaCompleta[];
    viewMode: ViewMode;
    loading: boolean;
    patioSelecionado?: number | null;
}

export default function MapaVagasDinamico({ vagas, viewMode, loading, patioSelecionado }: MapaVagasDinamicoProps) {
    const [vagaSelecionada, setVagaSelecionada] = useState<VagaCompleta | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Carregando visualização...</p>
                </div>
            </div>
        );
    }

    if (vagas.length === 0) {
        return (
            <div className="bg-zinc-800/50 rounded-lg p-8 text-center">
                <Bike size={48} className="mx-auto text-zinc-500 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhuma vaga encontrada</h3>
                <p className="text-zinc-500 text-sm">
                    Tente ajustar os filtros para encontrar vagas disponíveis.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Renderizar vista baseada no modo selecionado */}
            {viewMode === 'patio' && (
                <VistaPatio
                    vagas={vagas}
                    vagaSelecionada={vagaSelecionada}
                    onVagaSelect={setVagaSelecionada}
                />
            )}
                   {viewMode === 'mapa' && (
                       <VistaMapa
                           vagas={vagas}
                           vagaSelecionada={vagaSelecionada}
                           onVagaSelect={setVagaSelecionada}
                           patioSelecionado={patioSelecionado}
                       />
                   )}
            {viewMode === 'grade' && (
                <VistaGrade
                    vagas={vagas}
                    vagaSelecionada={vagaSelecionada}
                    onVagaSelect={setVagaSelecionada}
                />
            )}
            {viewMode === 'abas' && (
                <VistaAbas
                    vagas={vagas}
                    vagaSelecionada={vagaSelecionada}
                    onVagaSelect={setVagaSelecionada}
                />
            )}

            {/* Modal de detalhes da vaga selecionada */}
            {vagaSelecionada && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="neumorphic-container max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header do modal */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    Detalhes da Vaga
                                </h3>
                                <button
                                    onClick={() => setVagaSelecionada(null)}
                                    className="neumorphic-button p-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Informações da vaga */}
                            <div className="space-y-4">
                                {/* Status e nome da vaga */}
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        STATUS_COLORS[vagaSelecionada.status].bg
                                    } ${STATUS_COLORS[vagaSelecionada.status].text}`}>
                                        {STATUS_COLORS[vagaSelecionada.status].icon} {STATUS_LABELS[vagaSelecionada.status]}
                                    </div>
                                    <span className="text-lg font-semibold text-white">
                                        {vagaSelecionada.nome}
                                    </span>
                                </div>

                                {/* Informações do pátio */}
                                <div className="neumorphic-container">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin size={20} className="text-blue-500" />
                                        <span className="font-semibold text-lg">Pátio</span>
                                    </div>
                                    <p className="text-gray-700 font-medium mb-2">{vagaSelecionada.patio.nomePatio}</p>
                                    {vagaSelecionada.patio.endereco && (
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>{vagaSelecionada.patio.endereco.logradouro}, {vagaSelecionada.patio.endereco.numero}</p>
                                            <p>{vagaSelecionada.patio.endereco.bairro}, {vagaSelecionada.patio.endereco.cidade} - {vagaSelecionada.patio.endereco.estado}</p>
                                            <p>CEP: {vagaSelecionada.patio.endereco.cep}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Informações do veículo (se ocupada) */}
                                {vagaSelecionada.veiculo && (
                                    <div className="neumorphic-container">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Bike size={20} className="text-green-500" />
                                            <span className="font-semibold text-lg">Moto Estacionada</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Placa</p>
                                                <p className="text-gray-700 font-semibold">{vagaSelecionada.veiculo.placa}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Modelo</p>
                                                <p className="text-gray-700 font-semibold">{vagaSelecionada.veiculo.modelo}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Cor</p>
                                                <p className="text-gray-700 font-semibold">{vagaSelecionada.veiculo.cor}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Cliente</p>
                                                <p className="text-gray-700 font-semibold">{vagaSelecionada.veiculo.cliente.nome}</p>
                                            </div>
                                        </div>
                                        {vagaSelecionada.veiculo.cliente.telefone !== 'N/A' && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={16} />
                                                <span>{vagaSelecionada.veiculo.cliente.telefone}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Datas */}
                                <div className="neumorphic-container">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar size={20} className="text-purple-500" />
                                        <span className="font-semibold text-lg">Datas</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Data de Entrada</p>
                                            <p className="text-gray-700 font-semibold">
                                                {new Date(vagaSelecionada.dataEntrada).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Data de Saída</p>
                                            <p className="text-gray-700 font-semibold">
                                                {new Date(vagaSelecionada.dataSaida).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Observações */}
                                {vagaSelecionada.observacao && (
                                    <div className="neumorphic-container">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info size={20} className="text-yellow-500" />
                                            <span className="font-semibold text-lg">Observações</span>
                                        </div>
                                        <p className="text-gray-600">{vagaSelecionada.observacao}</p>
                                    </div>
                                )}
                            </div>

                            {/* Botões de ação */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setVagaSelecionada(null)}
                                    className="neumorphic-button flex-1"
                                >
                                    Fechar
                                </button>
                                {vagaSelecionada.status === 'L' && (
                                    <button className="neumorphic-button-advance flex-1">
                                        Reservar Vaga
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
