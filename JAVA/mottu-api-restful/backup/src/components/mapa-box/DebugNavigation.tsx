"use client";

import { useState } from 'react';

interface DebugNavigationProps {
    currentView: 'cinema' | 'mapa' | 'grade' | 'abas';
    onViewChange: (view: 'cinema' | 'mapa' | 'grade' | 'abas') => void;
}

export default function DebugNavigation({ currentView, onViewChange }: DebugNavigationProps) {
    const [debugInfo, setDebugInfo] = useState<string[]>([]);

    const addDebugInfo = (info: string) => {
        setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`]);
    };

    const views: Array<{ id: 'cinema' | 'mapa' | 'grade' | 'abas'; label: string; color: string }> = [
        { id: 'cinema', label: 'Pátio', color: 'bg-blue-500' },
        { id: 'mapa', label: 'Mapa', color: 'bg-green-500' },
        { id: 'grade', label: 'Grade', color: 'bg-purple-500' },
        { id: 'abas', label: 'Abas', color: 'bg-orange-500' }
    ];

    return (
        <div className="neumorphic-container p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Debug - Navegação</h3>
            
            {/* Botões de teste */}
            <div className="flex gap-2 mb-4">
                {views.map(view => (
                    <button
                        key={view.id}
                        onClick={() => {
                            addDebugInfo(`Clicou em ${view.label}`);
                            onViewChange(view.id);
                        }}
                        className={`px-4 py-2 rounded text-white font-medium ${
                            currentView === view.id ? view.color : 'bg-gray-500'
                        }`}
                    >
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Status atual */}
            <div className="mb-4">
                <strong>View Atual:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                    views.find(v => v.id === currentView)?.color || 'bg-gray-500'
                }`}>
                    {currentView}
                </span>
            </div>

            {/* Log de debug */}
            <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>Log de Debug:</strong>
                <div className="mt-2 space-y-1">
                    {debugInfo.length === 0 ? (
                        <div className="text-gray-500">Nenhuma ação registrada</div>
                    ) : (
                        debugInfo.map((info, index) => (
                            <div key={index} className="text-gray-700">{info}</div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
