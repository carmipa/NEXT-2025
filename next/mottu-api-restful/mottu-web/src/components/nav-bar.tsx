// src/components/nav-bar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from 'react';
import '@/types/styles/neumorphic.css';
import Pesquisar from './pesquisar/Pesquisar';

// Estrutura de navegação simplificada e reordenada
type SubItem = { href: string; label: string; icon: string };
type SubGroup = { title: string; icon?: string; items: SubItem[] };

const navItems: Array<{
    href?: string;
    label: string;
    icon: string;
    basePath?: string;
    subItems?: SubItem[];
    subGroups?: SubGroup[];
}> = [
    { href: "/dashboard", label: "Dashboard", icon: "ion-ios-analytics", basePath: "/dashboard" },
    {
        href: "/gerenciamento-patio",
        label: "Gerenciamento",
        icon: "ion-ios-settings",
        basePath: "/gerenciamento-patio",
        subGroups: [
            {
                title: "Início",
                icon: "ion-ios-home",
                items: [
                    { href: "/gerenciamento-patio", label: "Tela Principal", icon: "ion-ios-home" },
                    { href: "/patio/novo-assistente", label: "Novo Pátio", icon: "ion-ios-add" }
                ]
            },
            {
                title: "Pátio",
                icon: "ion-ios-home",
                items: [
                    { href: "/gerenciamento-patio/patio", label: "Listar", icon: "ion-ios-list" },
                    { href: "/patio/buscar", label: "Buscar", icon: "ion-ios-search" },
                ]
            },
            {
                title: "Zona",
                icon: "ion-ios-map",
                items: [
                    { href: "/gerenciamento-patio/zona", label: "Listar", icon: "ion-ios-list" },
                    { href: "/zona/buscar", label: "Buscar", icon: "ion-ios-search" },
                ]
            },
            {
                title: "Box",
                icon: "ion-ios-grid",
                items: [
                    { href: "/gerenciamento-patio/box", label: "Listar", icon: "ion-ios-list" },
                    { href: "/box/buscar", label: "Buscar", icon: "ion-ios-search" },
                ]
            }
        ]
    },
    {
        basePath: "/relatorios", label: "Relatórios", icon: "ion-ios-analytics",
        subItems: [
            { href: "/relatorios", label: "Relatórios", icon: "ion-ios-analytics" },
            { href: "/relatorios/ocupacao-diaria", label: "Ocupação Diária", icon: "ion-ios-calendar" },
            { href: "/relatorios/movimentacao", label: "Movimentação", icon: "ion-ios-swap" },
            { href: "/relatorios/heatmap", label: "Heatmap de Ocupação", icon: "ion-ios-map" },
            { href: "/relatorios/comportamental", label: "Análise Comportamental", icon: "ion-ios-people" },
            { href: "/relatorios/dashboard-ia", label: "Dashboard IA", icon: "ion-ios-analytics" },
            { href: "/relatorios/performance-sistema", label: "Performance do Sistema", icon: "ion-ios-speedometer" },
            { href: "/relatorios/manutencao", label: "Relatório de Manutenção", icon: "ion-ios-construct" },
            { href: "/relatorios/analytics", label: "Analytics Avançado", icon: "ion-ios-analytics" },
            { href: "/relatorios/notificacoes", label: "Central de Notificações", icon: "ion-ios-notifications" }
        ]
    },
    {
        basePath: "/radar", label: "Radar", icon: "ion-ios-navigate",
        subItems: [
            { href: "/radar", label: "Início", icon: "ion-ios-home" },
            { href: "/radar/armazenar", label: "Armazenar", icon: "ion-ios-add" },
            { href: "/radar/buscar", label: "Buscar", icon: "ion-ios-search" },
            { href: "/radar/app-download", label: "App Download", icon: "ion-ios-download" },
        ]
    },
    {
        basePath: "/clientes", label: "Clientes", icon: "ion-ios-people",
        subItems: [
            { href: "/clientes/listar", label: "Listar", icon: "ion-ios-list" },
            { href: "/clientes/cadastrar", label: "Cadastrar", icon: "ion-ios-person-add" },
            { href: "/clientes/buscar", label: "Buscar", icon: "ion-ios-search" },
        ]
    },
    {
        basePath: "/veiculo", label: "Motos", icon: "ion-ios-bicycle",
        subItems: [
            { href: "/veiculo/listar", label: "Listar", icon: "ion-ios-list" },
            { href: "/veiculo/cadastrar", label: "Cadastrar", icon: "ion-ios-add" },
            { href: "/veiculo/buscar", label: "Buscar", icon: "ion-ios-search" },
        ]
    },
        {
            basePath: "/mapas", label: "Mapas", icon: "ion-ios-map",
            subItems: [
                { href: "/mapas", label: "Selecionar Pátio", icon: "ion-ios-home" },
                { href: "/mapa-box", label: "Mapa de Vagas", icon: "ion-ios-grid" }
            ]
        },
    {
        basePath: "/ajuda", label: "Ajuda", icon: "ion-ios-help-circle",
        subItems: [
            { href: "/mapa-do-site", label: "Mapa do Site", icon: "ion-ios-compass" },
            { href: "/ajuda/feedback", label: "Feedback", icon: "ion-ios-chatbubbles" },
            { href: "http://72.61.219.15:8080/swagger-ui/index.html", label: "Swagger", icon: "ion-ios-code" },
        ]
    },
    { href: "/contato", label: "Contato", icon: "ion-ios-mail", basePath: "/contato" },
];

export default function NavBar({ active }: { active?: string }) {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isItemActive = (item: typeof navItems[0]) => {
        if (active && item.label.toLowerCase().includes(active.toLowerCase())) return true;
        return item.basePath && pathname?.startsWith(item.basePath);
    };

    return (
        // Restaurado o z-50 para garantir que a NavBar e seus dropdowns fiquem acima de todo o conteúdo.
        <header className="w-full sticky top-0 z-50">
            <nav className="w-full bg-[var(--color-mottu-dark)] text-white shadow-md navbar-gradient">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className={`font-bold text-xl px-3 py-2 rounded-lg transition ${pathname === '/' ? 'bg-white text-[var(--color-mottu-dark)] font-semibold' : 'hover:bg-white/10'}`} style={{fontFamily: 'Montserrat, sans-serif'}}>Mottu Oficina</Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <ul className="flex items-center gap-2">
                                {navItems.map((item) => {
                                    const isActive = isItemActive(item);
                                    if (!(item.subItems || item.subGroups)) {
                                        return (
                                            <li key={item.href}>
                                                <Link href={item.href!} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base transition ${isActive ? "bg-white text-[var(--color-mottu-dark)] font-semibold" : "hover:bg-white/10"}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                    <i className={`${item.icon} text-xl`}></i>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.label)} onMouseLeave={() => setOpenMenu(null)}>
                                            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base transition w-full text-left cursor-pointer ${isActive ? "bg-white text-[var(--color-mottu-dark)] font-semibold" : "hover:bg-white/10"}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                <i className={`${item.icon} text-xl`}></i>
                                                <span>{item.label}</span>
                                            </button>
                                            {/* Toggle on click for accessibility */}
                                            <div className="absolute inset-0" onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)} aria-hidden="true"></div>
                                            {openMenu === item.label && (
                                                (() => {
                                                    const hasGroups = !!(item.subGroups && item.subGroups.length);
                                                    const containerWidth = hasGroups ? 'w-[min(90vw,420px)]' : 'w-[min(90vw,240px)]';
                                                    return (
                                                        <div className={`absolute left-0 ${containerWidth} rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50`}>
                                                            {hasGroups ? (
                                                                <div className="py-2 px-2 grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
                                                                    {item.subGroups!.map((group) => (
                                                                        <div key={group.title} className="bg-slate-700/40 rounded-md">
                                                                            <div className="px-3 py-2 text-slate-100 font-semibold flex items-center gap-2">
                                                                                {group.icon && <i className={`${group.icon}`}></i>}
                                                                                {group.title}
                                                                            </div>
                                                                            <div className="py-1">
                                                                                {group.items.map(sub => (
                                                                                    <Link key={sub.href} href={sub.href} className="flex items-center gap-3 px-4 py-2 text-base text-slate-200 hover:bg-slate-700 hover:text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                                        <i className={`${sub.icon}`}></i>
                                                                                        {sub.label}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="py-2 max-h-[70vh] overflow-y-auto">
                                                                    {item.subItems!.map(sub => (
                                                                        <Link key={sub.href} href={sub.href} className="flex items-center gap-3 px-4 py-2 text-base text-slate-200 hover:bg-slate-700 hover:text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                            <i className={`${sub.icon}`}></i>
                                                                            {sub.label}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            
                            <div className="w-8"></div>
                            
                            <Pesquisar />
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="cursor-pointer" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                {isMobileMenuOpen ? <i className="ion-ios-close text-2xl"></i> : <i className="ion-ios-menu text-2xl"></i>}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[var(--color-mottu-dark)] border-t border-slate-700 navbar-gradient max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item) => {
                                const isActive = isItemActive(item);
                                if (!item.subItems && !item.subGroups) {
                                    return (
                                        <li key={item.href}>
                                            <Link href={item.href!} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium ${isActive ? "bg-white text-[var(--color-mottu-dark)]" : "hover:bg-white/10"}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                <i className={`${item.icon}`}></i>{item.label}
                                            </Link>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={item.label}>
                                        <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium cursor-pointer ${isActive ? "bg-slate-700" : ""}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            <i className={`${item.icon}`}></i>{item.label}
                                        </span>
                                        <div className="pl-3 pt-2 grid grid-cols-1 gap-2">
                                            {item.subGroups && item.subGroups.map(group => (
                                                <div key={group.title}>
                                                    <div className="px-3 py-1 text-slate-100 font-semibold flex items-center gap-2">
                                                        {group.icon && <i className={`${group.icon}`}></i>}
                                                        {group.title}
                                                    </div>
                                                    <ul className="pl-8 pt-1 space-y-1">
                                                        {group.items.map(sub => (
                                                            <li key={sub.href}>
                                                                <Link href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-white/10" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                    <i className={`${sub.icon}`}></i>{sub.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            {item.subItems && (
                                                <ul className="pt-1 space-y-1">
                                                    {item.subItems.map(sub => (
                                                        <li key={sub.href}>
                                                            <Link href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-white/10" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                <i className={`${sub.icon}`}></i>{sub.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}
