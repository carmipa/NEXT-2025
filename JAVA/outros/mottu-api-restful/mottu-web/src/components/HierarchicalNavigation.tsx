'use client';

import { useState } from 'react';
import '@/types/styles/neumorphic.css';
import { Building, MapPin } from 'lucide-react';

interface Patio {
  idPatio: number;
  nomePatio: string;
  status?: string;
}

interface Zona {
  idZona: number;
  nome: string;
}

interface HierarchicalNavigationProps {
  currentLevel: 'patio' | 'zona' | 'box';
  selectedPatio?: Patio | null;
  selectedZona?: Zona | null;
  onPatioSelect: (patio: Patio) => void;
  onZonaSelect: (zona: Zona) => void;
  onBack: () => void;
  onHome: () => void;
}

/**
 * Componente de navegação hierárquica para o sistema Mottu
 * Permite navegação drill-down: Pátios → Zonas → Boxes
 * Mantém design e cores da Mottu
 */
export default function HierarchicalNavigation({
  currentLevel,
  selectedPatio,
  selectedZona,
  onPatioSelect,
  onZonaSelect,
  onBack,
  onHome
}: HierarchicalNavigationProps) {
  
  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'Pátios',
        icon: 'ion-ios-home',
        level: 'patio',
        active: currentLevel === 'patio'
      }
    ];

    if (selectedPatio) {
      items.push({
        label: selectedPatio.nomePatio,
        icon: 'ion-ios-map',
        level: 'zona',
        active: currentLevel === 'zona'
      });
    }

    if (selectedZona) {
      items.push({
        label: selectedZona.nome,
        icon: 'ion-ios-grid',
        level: 'box',
        active: currentLevel === 'box'
      });
    }

    return items;
  };

  const getLevelInfo = () => {
    switch (currentLevel) {
      case 'patio':
        return {
          title: 'Gerenciar Pátios',
          description: 'Selecione um pátio para gerenciar suas zonas e boxes',
          icon: 'ion-ios-home',
          color: 'text-blue-400'
        };
      case 'zona':
        return {
          title: `Zonas - ${selectedPatio?.nomePatio}`,
          description: 'Gerencie as zonas deste pátio',
          icon: 'ion-ios-map',
          color: 'text-green-400'
        };
      case 'box':
        return {
          title: `Boxes - ${selectedPatio?.nomePatio}`,
          description: 'Gerencie os boxes deste pátio',
          icon: 'ion-ios-grid',
          color: 'text-purple-400'
        };
    }
  };

  const levelInfo = getLevelInfo();
  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        <button
          onClick={onHome}
          className="flex items-center gap-1 px-3 py-2 text-white rounded-md transition-colors"
          style={{ backgroundColor: '#1a5f3f' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15553a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a5f3f'}
          title="Voltar ao início"
        >
          <i className="ion-ios-home"></i>
          <span style={{fontFamily: 'Montserrat, sans-serif'}}>Início</span>
        </button>
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <i className="ion-ios-arrow-forward text-slate-500"></i>
              <button
                onClick={() => {
                  if (item.level === 'patio') onHome();
                  // Adicione lógica para outros níveis se necessário
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-white"
                style={{ 
                  backgroundColor: item.active ? '#1a5f3f' : '#1a5f3f',
                  opacity: item.active ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#15553a';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a5f3f';
                  e.currentTarget.style.opacity = item.active ? '1' : '0.7';
                }}
              >
                <i className={item.icon}></i>
                <span style={{fontFamily: 'Montserrat, sans-serif'}}>{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Header com informações do nível atual */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg text-white" style={{ backgroundColor: '#1a5f3f' }}>
            <i className={`${levelInfo.icon} text-3xl`}></i>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
              {levelInfo.title}
            </h1>
            <p className="text-slate-300 mt-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
              {levelInfo.description}
            </p>
          </div>
        </div>

        {/* Botão de voltar - aparece quando não está no nível raiz */}
        {currentLevel !== 'patio' && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: '#1a5f3f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15553a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a5f3f'}
          >
            <i className="ion-ios-arrow-back"></i>
            <span style={{fontFamily: 'Montserrat, sans-serif'}}>Voltar</span>
          </button>
        )}
      </div>

      {/* Informações do contexto atual */}
      {(selectedPatio || selectedZona) && (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center gap-4">
            {selectedPatio && (
              <div className="flex items-center gap-2">
                <Building size={20} className="text-blue-400" />
                <div>
                  <span className="text-slate-400 text-sm">Pátio:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedPatio.nomePatio} (ID: {selectedPatio.idPatio})
                  </span>
                </div>
              </div>
            )}
            
            {selectedZona && (
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-green-400" />
                <div>
                  <span className="text-slate-400 text-sm">Zona:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedZona.nome} (ID: {selectedZona.idZona})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


