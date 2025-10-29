"use client";

import React from 'react';

interface BoxStatus {
  id: string;
  numero: number;
  status: 'ocupado' | 'livre' | 'manutencao';
  veiculo?: string;
  placa?: string;
}

interface HeatmapVisualProps {
  patio: {
    id: number;
    nome: string;
    ocupacaoAtual: number;
    media: number;
    maxima: number;
    trend: 'crescendo' | 'diminuindo' | 'estavel';
    boxes: BoxStatus[];
  };
  showNumbers?: boolean;
  showPlacas?: boolean;
}

export default function HeatmapVisual({ 
  patio, 
  showNumbers = true, 
  showPlacas = false 
}: HeatmapVisualProps) {
  
  // Debug completo dos dados
  console.log('=== HEATMAP VISUAL DEBUG ===');
  console.log('Patio recebido:', patio);
  console.log('Boxes recebidos:', patio.boxes);
  console.log('Quantidade de boxes:', patio.boxes?.length);
  
  if (patio.boxes && patio.boxes.length > 0) {
    console.log('Primeiro box:', patio.boxes[0]);
    console.log('Status do primeiro box:', patio.boxes[0].status);
    console.log('Tipo do status:', typeof patio.boxes[0].status);
    
    // Teste de cores
    const primeiroBox = patio.boxes[0];
    console.log('=== TESTE DE CORES ===');
    console.log('Status do primeiro box:', primeiroBox.status);
    console.log('É igual a "livre"?', primeiroBox.status === 'livre');
    console.log('É igual a "ocupado"?', primeiroBox.status === 'ocupado');
    console.log('É igual a "manutencao"?', primeiroBox.status === 'manutencao');
    
    // Teste de contagem
    const livres = patio.boxes.filter(b => b.status === 'L' || b.status === 'livre').length;
    const ocupados = patio.boxes.filter(b => b.status === 'O' || b.status === 'ocupado').length;
    const manutencao = patio.boxes.filter(b => b.status === 'M' || b.status === 'manutencao').length;
    
    console.log('=== TESTE DE CONTAGEM ===');
    console.log('Livres encontrados:', livres);
    console.log('Ocupados encontrados:', ocupados);
    console.log('Manutenção encontrados:', manutencao);
  }
  
  const getBoxColor = (status: string) => {
    console.log('getBoxColor chamado com status:', status);
    let colorClass = '';
    
    // Mapear status do backend para cores
    switch (status) {
      case 'O': // Ocupado
      case 'ocupado':
        colorClass = 'bg-red-500 hover:bg-red-600';
        break;
      case 'L': // Livre
      case 'livre':
        colorClass = 'bg-green-500 hover:bg-green-600';
        break;
      case 'M': // Manutenção
      case 'manutencao':
        colorClass = 'bg-yellow-500 hover:bg-yellow-600';
        break;
      default:
        colorClass = 'bg-gray-400 hover:bg-gray-500';
        console.log('Status desconhecido, usando cinza:', status);
        break;
    }
    
    console.log('getBoxColor retornando:', colorClass);
    return colorClass;
  };

  const getBoxIcon = (status: string) => {
    switch (status) {
      case 'O': // Ocupado
      case 'ocupado':
        return '🚗';
      case 'L': // Livre
      case 'livre':
        return '🅿️';
      case 'M': // Manutenção
      case 'manutencao':
        return '🔧';
      default:
        return '❓';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'crescendo':
        return '📈';
      case 'diminuindo':
        return '📉';
      case 'estavel':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'crescendo':
        return 'text-red-500';
      case 'diminuindo':
        return 'text-green-500';
      case 'estavel':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
      {/* Header do Pátio */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{patio.nome}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              {getTrendIcon(patio.trend)}
              <span className={`font-medium ${getTrendColor(patio.trend)}`}>
                {patio.trend === 'crescendo' ? 'Crescendo' : 
                 patio.trend === 'diminuindo' ? 'Diminuindo' : 'Estável'}
              </span>
            </span>
          </div>
        </div>
        
        {/* Ocupação Atual */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            {patio.ocupacaoAtual}%
          </div>
          <div className="text-xs text-gray-500">Ocupação</div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 mb-3"></div>

      {/* Status dos Boxes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Status dos Boxes</h4>
        
        {/* Teste Visual de Cores */}
        <div className="mb-2 p-2 bg-gray-100 rounded">
          <div className="text-xs text-gray-600 mb-1">Teste de Cores:</div>
          <div className="flex gap-2">
            <div style={{ width: '20px', height: '20px', backgroundColor: '#22c55e', borderRadius: '4px' }}></div>
            <span className="text-xs">Verde (livre)</span>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
            <span className="text-xs">Vermelho (ocupado)</span>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#eab308', borderRadius: '4px' }}></div>
            <span className="text-xs">Amarelo (manutenção)</span>
          </div>
        </div>
        
        {/* Grid de Boxes - Compacto */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          {patio.boxes.slice(0, 20).map((box, index) => {
            const boxColor = getBoxColor(box.status);
            console.log(`Box ${index + 1}:`, {
              id: box.id,
              numero: box.numero,
              status: box.status,
              color: boxColor
            });
            
            return (
            <div
              key={box.id}
                     style={{
                       position: 'relative',
                       width: '40px',
                       height: '40px',
                       borderRadius: '6px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontWeight: 'bold',
                       fontSize: '12px',
                       cursor: 'pointer',
                       backgroundColor: (box.status === 'O' || box.status === 'ocupado') ? '#ef4444' : 
                                      (box.status === 'L' || box.status === 'livre') ? '#22c55e' : 
                                      (box.status === 'M' || box.status === 'manutencao') ? '#eab308' : '#9ca3af',
                       transition: 'all 0.2s ease',
                       border: 'none',
                       outline: 'none'
                     }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title={`Box ${box.numero} - ${box.status}${box.placa ? ` (${box.placa})` : ''}`}
            >
              {/* Número do Box */}
              {showNumbers && (
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {box.numero}
                </span>
              )}
              
              {/* Ícone do Status */}
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                fontSize: '8px',
                opacity: 0.8
              }}>
                {getBoxIcon(box.status)}
              </div>
              
              {/* Placa do Veículo (se ocupado) */}
              {showPlacas && box.placa && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '2px',
                  right: '2px',
                  fontSize: '6px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '2px',
                  padding: '1px'
                }}>
                  {box.placa}
                </div>
              )}
            </div>
            );
          })}
        </div>
        
        {/* Mostrar mais boxes se houver */}
        {patio.boxes.length > 20 && (
          <div className="text-center mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              +{patio.boxes.length - 20} mais boxes
            </span>
          </div>
        )}
        
        {/* Legenda Compacta */}
        <div className="flex flex-wrap gap-2 text-xs">
          {(() => {
            const livres = patio.boxes.filter(b => b.status === 'L' || b.status === 'livre').length;
            const ocupados = patio.boxes.filter(b => b.status === 'O' || b.status === 'ocupado').length;
            const manutencao = patio.boxes.filter(b => b.status === 'M' || b.status === 'manutencao').length;
            
            console.log('=== CONTAGENS DA LEGENDA ===');
            console.log('Total boxes:', patio.boxes.length);
            console.log('Livres:', livres);
            console.log('Ocupados:', ocupados);
            console.log('Manutenção:', manutencao);
            console.log('Status dos boxes:', patio.boxes.map(b => b.status));
            
            return (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Livre ({livres})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Ocupado ({ocupados})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Manutenção ({manutencao})</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
