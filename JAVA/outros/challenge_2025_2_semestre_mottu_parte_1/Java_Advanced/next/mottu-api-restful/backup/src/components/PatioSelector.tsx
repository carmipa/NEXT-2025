// Componente para seleção de pátio (exemplo de uso futuro)
import { useState } from 'react';
import { getAllLayouts, getLayoutById } from '../config/patioLayouts';

interface PatioSelectorProps {
    onLayoutChange: (layoutId: string) => void;
    currentLayout: string;
}

export default function PatioSelector({ onLayoutChange, currentLayout }: PatioSelectorProps) {
    const layouts = getAllLayouts();

    return (
        <div className="bg-white/90 rounded-xl shadow p-3 text-sm text-gray-700 mb-4">
            <div className="font-semibold mb-2">Selecionar Pátio</div>
            <select 
                value={currentLayout} 
                onChange={(e) => onLayoutChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
                {layouts.map((layout) => (
                    <option key={layout.id} value={layout.id}>
                        {layout.name} - {layout.description}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Exemplo de uso no componente principal:
/*
const [currentLayoutId, setCurrentLayoutId] = useState('guarulhos');

const handleLayoutChange = (layoutId: string) => {
    setCurrentLayoutId(layoutId);
    // Aqui você recarregaria o componente do mapa com o novo layout
    // ou passaria o layoutId como prop para o PatioMottu2D
};

return (
    <div>
        <PatioSelector 
            onLayoutChange={handleLayoutChange}
            currentLayout={currentLayoutId}
        />
        <PatioMottu2D layoutId={currentLayoutId} />
    </div>
);
*/
