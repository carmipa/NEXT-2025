"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '@/types/styles/pesquisar.css';

// Dados de busca - mapeamento de termos para páginas
const searchData = [
    { term: 'dashboard', page: '/dashboard', label: 'Dashboard Principal' },
    { term: 'radar', page: '/radar', label: 'Radar Principal' },
    { term: 'armazenar', page: '/radar/armazenar', label: 'Armazenar Moto' },
    { term: 'buscar', page: '/radar/buscar', label: 'Buscar Moto' },
    { term: 'clientes', page: '/clientes/listar', label: 'Listar Clientes' },
    { term: 'cadastrar cliente', page: '/clientes/cadastrar', label: 'Cadastrar Cliente' },
    { term: 'motos', page: '/veiculo/listar', label: 'Listar Motos' },
    { term: 'cadastrar moto', page: '/veiculo/cadastrar', label: 'Cadastrar Moto' },
    { term: 'pátios', page: '/patio/listar', label: 'Listar Pátios' },
    { term: 'cadastrar pátio', page: '/patio/cadastrar', label: 'Cadastrar Pátio' },
    { term: 'zonas', page: '/zona/listar', label: 'Listar Zonas' },
    { term: 'boxes', page: '/box/listar', label: 'Listar Boxes' },
    { term: 'vagas', page: '/vagas/mapa', label: 'Mapa de Vagas' },
    { term: 'mapa', page: '/mapa-2d', label: 'Mapa 2D do Pátio' },
    { term: 'contato', page: '/contato', label: 'Fale Conosco' },
    { term: 'administração', page: '/unidades/administracao', label: 'Administração' },
    { term: 'teste api', page: '/teste-api', label: 'Teste API' },
    { term: 'inicio', page: '/', label: 'Página Inicial' },
    { term: 'mapa do site', page: '/mapa-do-site', label: 'Mapa do Site' },
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
