"use client";

import { ReactNode } from 'react';

interface TabItem {
    id: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
}

interface TabNavigationProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export default function TabNavigation({ 
    tabs, 
    activeTab, 
    onTabChange, 
    className = "" 
}: TabNavigationProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Navegação das Abas */}
            <div className="neumorphic-container p-1">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div className="neumorphic-container">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
}
