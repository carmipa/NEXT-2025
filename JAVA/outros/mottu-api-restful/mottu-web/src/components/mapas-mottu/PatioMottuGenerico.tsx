import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Tipos
interface MappedBox {
    layoutId: string;
    dbId: number;
    nome: string; // Nome do box
    x: number; y: number; w: number; h: number;
    status: 'Livre' | 'Ocupado';
    veiculo?: {
        placa: string;
        modelo: string;
        fabricante: string;
        tagBleId?: string;
    };
}

interface MapaData {
    boxes: Array<{
        idBox: number;
        nome: string;
        status: 'L' | 'O';
        veiculo?: {
            placa: string;
            modelo: string;
            fabricante: string;
            tagBleId?: string;
        };
    }>;
}

interface PatioMottuGenericoProps {
    highlightBoxId?: string | null;
    nomePatio: string;
}

export default function PatioMottuGenerico({ highlightBoxId, nomePatio }: PatioMottuGenericoProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [boxes, setBoxes] = useState<MappedBox[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
    const [patioInfo, setPatioInfo] = useState<{ id: number; nome: string } | null>(null);

    // Configurações de pan e zoom
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [k, setK] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Função para calcular posição dos boxes baseada no nome
    const getBoxPositionFromName = (nome: string): { x: number; y: number } => {
        // Extrai número do nome (ex: "GUA001" -> 1, "LIMAO001" -> 1)
        const match = nome.match(/(\d+)$/);
        if (!match) return { x: 50, y: 50 };
        
        const numero = parseInt(match[1]);
        const baseX = 50;
        const baseY = 200;
        const w = 3;
        const h = 4;
        const gap = 1;
        const cols = 10; // 10 boxes por linha
        
        const row = Math.floor((numero - 1) / cols);
        const col = (numero - 1) % cols;
        return { 
            x: baseX + col * (w + gap), 
            y: baseY + row * (h + gap) 
        };
    };

    useEffect(() => {
        const loadBoxData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Primeiro, busca o pátio pelo nome para obter o ID correto
                const patiosResponse = await fetch('/api/patios');
                if (!patiosResponse.ok) throw new Error("Falha ao buscar pátios.");
                const patiosData = await patiosResponse.json();
                
                // Encontra o pátio pelo nome
                const patio = patiosData.content?.find((p: any) => 
                    p.nomePatio.toLowerCase().includes(nomePatio.toLowerCase())
                );
                
                if (!patio) {
                    throw new Error(`Pátio "${nomePatio}" não encontrado.`);
                }
                
                setPatioInfo({ id: patio.idPatio, nome: patio.nomePatio });
                console.log('🏢 Pátio encontrado:', patio.nomePatio, 'ID:', patio.idPatio);
                
                // Busca dados específicos do pátio
                const response = await fetch(`/api/vagas/mapa?patioId=${patio.idPatio}`);
                if (!response.ok) throw new Error("Falha ao buscar dados do mapa.");
                const mapaData: MapaData = await response.json();

                console.log('📊 Dados do mapa recebidos:', {
                    totalBoxes: mapaData.boxes?.length,
                    boxesOcupados: mapaData.boxes?.filter(b => b.status === 'O').length,
                    boxesLivres: mapaData.boxes?.filter(b => b.status === 'L').length
                });

                const mappedBoxes: MappedBox[] = mapaData.boxes.map(apiBox => {
                    const position = getBoxPositionFromName(apiBox.nome);
                    return {
                        layoutId: `box-${apiBox.idBox}`, 
                        dbId: apiBox.idBox,
                        nome: apiBox.nome, // Incluir nome do box
                        x: position.x, y: position.y, w: 3, h: 4,
                        status: apiBox.status === 'L' ? 'Livre' : 'Ocupado',
                        veiculo: apiBox.veiculo
                    };
                });
                setBoxes(mappedBoxes);
            } catch (err: any) {
                console.error("Falha ao buscar dados do mapa:", err);
                setError(`Não foi possível carregar o status das vagas: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        loadBoxData();
        
        // Atualiza os dados a cada 30 segundos para mostrar mudanças em tempo real
        const interval = setInterval(loadBoxData, 30000);
        return () => clearInterval(interval);
    }, [nomePatio]);

    // Handlers de mouse para pan e zoom
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Botão esquerdo
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
        if (tooltip) {
            setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setK(prev => Math.max(0.5, Math.min(3, prev * scaleFactor)));
    };

    const handleMouseEnterBox = (e: React.MouseEvent, box: MappedBox) => {
        console.log('Mouse enter box Genérico:', { status: box.status, nome: box.nome, veiculo: box.veiculo });
        if (box.status === 'Ocupado' && box.veiculo) {
            setTooltip({
                x: e.clientX,
                y: e.clientY,
                content: (
                    <div className="text-xs bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                        <div className="font-bold text-yellow-400 mb-2">📦 {box.nome}</div>
                        <div className="font-bold text-green-400 mb-1">🏍️ Placa: {box.veiculo.placa}</div>
                        <div className="text-gray-300"><strong>Modelo:</strong> {box.veiculo.modelo}</div>
                        <div className="text-gray-300"><strong>Fabricante:</strong> {box.veiculo.fabricante}</div>
                        <div className="text-gray-300"><strong>Tag BLE:</strong> {box.veiculo.tagBleId || 'N/A'}</div>
                    </div>
                )
            });
        }
    };

    const handleMouseLeaveBox = () => {
        setTooltip(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Carregando mapa do pátio {nomePatio}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <p className="text-red-600 font-medium">Erro ao carregar mapa</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${k})` }}
            >
                {/* Definições para ícones */}
                <defs>
                    <g id="helmet-icon">
                        <path d="M5 2 L7 2 L7 4 L9 4 L9 6 L7 6 L7 8 L5 8 L5 6 L3 6 L3 4 L5 4 Z" fill="currentColor"/>
                    </g>
                </defs>

                {/* Fundo do pátio */}
                <rect width="400" height="300" fill="#f0f0f0" />
                
                {/* Área coberta (telhado) */}
                <rect x="40" y="180" width="320" height="100" fill="#c9cdd3" stroke="#a0a0a0" strokeWidth="1" />
                
                {/* Título do pátio */}
                <text x="200" y="30" textAnchor="middle" className="text-lg font-bold fill-gray-800">
                    Pátio {patioInfo?.nome || nomePatio}
                </text>
                
                {/* Boxes */}
                <g>
                    {boxes.map((box) => (
                        <g key={box.layoutId}>
                            <rect
                                x={box.x}
                                y={box.y}
                                width={box.w}
                                height={box.h}
                                fill={box.status === 'Livre' ? '#4ade80' : '#ef4444'}
                                stroke={box.status === 'Livre' ? '#22c55e' : '#dc2626'}
                                strokeWidth="0.5"
                                rx="0.2"
                                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                onMouseEnter={(e) => handleMouseEnterBox(e, box)}
                                onMouseLeave={handleMouseLeaveBox}
                            />
                            {box.status === 'Ocupado' && (
                                <use
                                    href="#helmet-icon"
                                    x={box.x + 0.5}
                                    y={box.y + 0.5}
                                    width={box.w - 1}
                                    height={box.h - 1}
                                    fill="white"
                                />
                            )}
                            {highlightBoxId === box.layoutId && (
                                <rect
                                    x={box.x - 0.2}
                                    y={box.y - 0.2}
                                    width={box.w + 0.4}
                                    height={box.h + 0.4}
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="0.3"
                                    rx="0.3"
                                />
                            )}
                        </g>
                    ))}
                </g>
            </svg>

            {/* Contador de status */}
            <div className="absolute right-3 top-3 bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700 pointer-events-none">
                <div className="font-semibold mb-2">Status do Pátio</div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{boxes.filter(b => b.status === 'Livre').length}</div>
                        <div className="text-gray-600">Livres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{boxes.filter(b => b.status === 'Ocupado').length}</div>
                        <div className="text-gray-600">Ocupados</div>
                    </div>
                </div>
                <div className="font-semibold mb-1">Legenda</div>
                <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm" style={{ background: "#c9cdd3" }} /> Telhado (Área Coberta)</li>
                    <li><span className="inline-block w-3 h-3 align-middle mr-2 rounded-sm bg-green-400" /> Vaga Livre</li>
                    <li className="flex items-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" className="mr-2">
                            <rect width="24" height="24" fill="rgb(239, 68, 68)" rx="2"/>
                            <use href="#helmet-icon" width="20" height="20" x="2" y="2" fill="white"/>
                        </svg>
                        Vaga Ocupada
                    </li>
                </ul>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-gray-900 text-white p-2 rounded shadow-lg pointer-events-none"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
}








