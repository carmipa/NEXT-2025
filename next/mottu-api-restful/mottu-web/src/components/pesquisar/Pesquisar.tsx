"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '@/types/styles/pesquisar.css';

// Dados de busca - mapeamento de termos para páginas (atualizado com páginas existentes)
const searchData = [
    // Dashboard e Início
    { term: 'dashboard', page: '/dashboard', label: 'Dashboard Principal' },
    { term: 'inicio', page: '/inicio', label: 'Página Inicial' },
    { term: 'home', page: '/', label: 'Página Inicial' },
    
    // Radar e Motos
    { term: 'radar', page: '/radar', label: 'Radar Principal' },
    { term: 'armazenar', page: '/radar/armazenar', label: 'Armazenar Moto' },
    { term: 'buscar moto', page: '/radar/buscar', label: 'Buscar Moto' },
    { term: 'localizar', page: '/radar/buscar', label: 'Localizar Moto' },
    { term: 'app download', page: '/radar/app-download', label: 'Download do App' },
    
    // Clientes
    { term: 'clientes', page: '/clientes/listar', label: 'Listar Clientes' },
    { term: 'cadastrar cliente', page: '/clientes/cadastrar', label: 'Cadastrar Cliente' },
    { term: 'buscar cliente', page: '/clientes/buscar', label: 'Buscar Cliente' },
    
    // Veículos/Motos
    { term: 'motos', page: '/veiculo/listar', label: 'Listar Motos' },
    { term: 'veiculos', page: '/veiculo/listar', label: 'Listar Veículos' },
    { term: 'cadastrar moto', page: '/veiculo/cadastrar', label: 'Cadastrar Moto' },
    { term: 'cadastrar veiculo', page: '/veiculo/cadastrar', label: 'Cadastrar Veículo' },
    { term: 'buscar veiculo', page: '/veiculo/buscar', label: 'Buscar Veículo' },
    
    // Pátios
    { term: 'pátios', page: '/patio/listar', label: 'Listar Pátios' },
    { term: 'patios', page: '/patio/listar', label: 'Listar Pátios' },
    { term: 'cadastrar pátio', page: '/patio/cadastrar', label: 'Cadastrar Pátio' },
    { term: 'buscar pátio', page: '/patio/buscar', label: 'Buscar Pátio' },
    { term: 'novo assistente', page: '/patio/novo-assistente', label: 'Novo Assistente' },
    
    // Zonas
    { term: 'zonas', page: '/zona/buscar', label: 'Buscar Zona' },
    { term: 'buscar zona', page: '/zona/buscar', label: 'Buscar Zona' },
    
    // Boxes
    { term: 'boxes', page: '/box/listar', label: 'Listar Boxes' },
    { term: 'buscar box', page: '/box/buscar', label: 'Buscar Box' },
    { term: 'cadastrar box', page: '/box/cadastrar', label: 'Cadastrar Box' },
    { term: 'gerar box', page: '/box/gerar', label: 'Gerar Box' },
    
    // Vagas e Mapas
    { term: 'vagas', page: '/vagas/mapa', label: 'Mapa de Vagas' },
    { term: 'buscar vaga', page: '/vagas/buscar', label: 'Buscar Vaga' },
    { term: 'mapa', page: '/mapa-2d', label: 'Mapa 2D do Pátio' },
    { term: 'mapa 2d', page: '/mapa-2d', label: 'Mapa 2D do Pátio' },
    
    // Gerenciamento
    { term: 'gerenciamento', page: '/gerenciamento-patio', label: 'Gerenciamento de Pátio' },
    { term: 'gerenciar pátio', page: '/gerenciamento-patio', label: 'Gerenciar Pátio' },
    { term: 'gerenciar patio', page: '/gerenciamento-patio', label: 'Gerenciar Pátio' },
    
    // Relatórios
    { term: 'relatorios', page: '/relatorios', label: 'Relatórios' },
    { term: 'relatórios', page: '/relatorios', label: 'Relatórios' },
    { term: 'movimentacao', page: '/relatorios/movimentacao', label: 'Relatório de Movimentação' },
    { term: 'movimentação', page: '/relatorios/movimentacao', label: 'Relatório de Movimentação' },
    { term: 'ocupacao', page: '/relatorios/ocupacao-diaria', label: 'Relatório de Ocupação' },
    { term: 'ocupação', page: '/relatorios/ocupacao-diaria', label: 'Relatório de Ocupação' },
    { term: 'heatmap', page: '/relatorios/heatmap', label: 'Heatmap de Ocupação' },
    { term: 'comportamental', page: '/relatorios/comportamental', label: 'Análise Comportamental' },
    { term: 'dashboard ia', page: '/relatorios/dashboard-ia', label: 'Dashboard IA' },
    { term: 'relatorios avancados', page: '/relatorios/avancados', label: 'Relatórios Avançados' },
    { term: 'relatórios avançados', page: '/relatorios/avancados', label: 'Relatórios Avançados' },
    { term: 'notificacoes', page: '/relatorios/notificacoes', label: 'Central de Notificações' },
    { term: 'notificações', page: '/relatorios/notificacoes', label: 'Central de Notificações' },
    
    // Unidades
    { term: 'administração', page: '/unidades/administracao', label: 'Administração' },
    { term: 'administracao', page: '/unidades/administracao', label: 'Administração' },
    { term: 'designer', page: '/unidades/designer', label: 'Designer' },
    
    // Contato e Navegação
    { term: 'contato', page: '/contato', label: 'Fale Conosco' },
    { term: 'fale conosco', page: '/contato', label: 'Fale Conosco' },
    { term: 'mapa do site', page: '/mapa-do-site', label: 'Mapa do Site' },
    { term: 'sitemap', page: '/mapa-do-site', label: 'Mapa do Site' },
    { term: 'feedback', page: '/ajuda/feedback', label: 'Feedback' },
    { term: 'ajuda', page: '/ajuda/feedback', label: 'Feedback' },
];

const Pesquisar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<typeof searchData>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filtra sugestões baseado no termo de busca
    useEffect(() => {
        if (searchTerm.length > 0) {
            const filtered = searchData.filter(item =>
                item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5)); // Máximo 5 sugestões
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm]);

    // Fecha sugestões quando clica fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchClick = () => {
        setIsOpen(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleInputClick = () => {
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Busca exata primeiro
            const exactMatch = searchData.find(item =>
                item.term.toLowerCase() === searchTerm.toLowerCase()
            );
            
            if (exactMatch) {
                router.push(exactMatch.page);
            } else if (suggestions.length > 0) {
                // Se não encontrar exato, vai para a primeira sugestão
                router.push(suggestions[0].page);
            }
            
            // Limpa e fecha
            setSearchTerm('');
            setIsOpen(false);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (page: string) => {
        router.push(page);
        setSearchTerm('');
        setIsOpen(false);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={containerRef} className="pesquisar-container">
            <form onSubmit={handleSubmit} className={`pesquisar-form ${isOpen ? 'pesquisar-open' : ''}`}>
                <input
                    ref={inputRef}
                    id="pesquisar-input"
                    name="search"
                    type="text"
                    placeholder="Buscar no sistema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={handleInputClick}
                    className="pesquisar-input"
                />
                <button
    id="pesquisar-submit"
    type="submit"
    aria-label="Buscar" // Melhor para acessibilidade
    onClick={handleSearchClick}
    className="pesquisar-submit"
>
    <i className="ion-ios-search"></i>
</button>
                
                {/* Sugestões */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="pesquisar-suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="pesquisar-suggestion"
                                onClick={() => handleSuggestionClick(suggestion.page)}
                            >
                                <i className="ion-ios-search text-emerald-500 mr-2"></i>
                                <span className="font-medium">{suggestion.label}</span>
                                <span className="text-sm text-gray-500 ml-2">({suggestion.term})</span>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Pesquisar;
