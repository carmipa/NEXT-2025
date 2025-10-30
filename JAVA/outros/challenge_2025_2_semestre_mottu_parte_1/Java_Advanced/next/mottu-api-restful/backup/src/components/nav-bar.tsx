// src/components/nav-bar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from 'react';
import '@/types/styles/neumorphic.css';
import Pesquisar from './pesquisar/Pesquisar';

// Estrutura de navegação simplificada e reordenada
const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "ion-ios-analytics", basePath: "/dashboard" },
    {
        href: "/gerenciamento-patio",
        label: "Gerenciamento",
        icon: "ion-ios-settings",
        basePath: "/gerenciamento-patio",
    },
    { href: "/radar", label: "Radar", icon: "ion-ios-navigate", basePath: "/radar" },
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
    { href: "/mapa-2d", label: "Mapa2D", icon: "ion-ios-map", basePath: "/mapa-2d" },
    { href: "/mapa-do-site", label: "Sitemap", icon: "ion-ios-compass", basePath: "/mapa-do-site" },
    { href: "/contato", label: "Contato", icon: "ion-ios-mail", basePath: "/contato" },
];

export default function NavBar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isItemActive = (item: typeof navItems[0]) => {
        // Garante que o basePath não seja nulo antes de chamar startsWith
        return item.basePath && pathname?.startsWith(item.basePath);
    };

    return (
        <header className="w-full sticky top-0 z-50">
            <nav className="w-full bg-[var(--color-mottu-dark)] text-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className={`font-bold text-xl px-3 py-2 rounded-lg transition ${pathname === '/' ? 'bg-white text-[var(--color-mottu-dark)] font-semibold' : 'hover:bg-white/10'}`} style={{fontFamily: 'Montserrat, sans-serif'}}>Mottu Oficina</Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <ul className="flex items-center gap-2">
                                {navItems.map((item) => {
                                    const isActive = isItemActive(item);
                                    if (!item.subItems) {
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
                                            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base transition w-full text-left ${isActive ? "bg-white text-[var(--color-mottu-dark)] font-semibold" : "hover:bg-white/10"}`} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                <i className={`${item.icon} text-xl`}></i>
                                                <span>{item.label}</span>
                                            </button>
                                            {openMenu === item.label && (
                                                <div className="absolute left-0 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                                                    <div className="py-1">
                                                        {item.subItems.map(sub => (
                                                            <Link key={sub.href} href={sub.href} className="flex items-center gap-3 px-4 py-2 text-base text-slate-200 hover:bg-slate-700 hover:text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                                                <i className={`${sub.icon}`}></i>
                                                                {sub.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            
                            <div className="w-8"></div>
                            
                            <Pesquisar />
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{fontFamily: 'Montserrat, sans-serif'}}>
                                {isMobileMenuOpen ? <i className="ion-ios-close text-2xl"></i> : <i className="ion-ios-menu text-2xl"></i>}
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[var(--color-mottu-dark)] border-t border-slate-700">
                        <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item) => {
                                const isActive = isItemActive(item);
                                if (!item.subItems) {
                                    return (
                                        <li key={item.href}><Link href={item.href!} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium ${isActive ? "bg-white text-[var(--color-mottu-dark)]" : "hover:bg-white/10"}`} style={{fontFamily: 'Montserrat, sans-serif'}}><i className={`${item.icon}`}></i>{item.label}</Link></li>
                                    )
                                }
                                return (
                                    <li key={item.label}>
                                        <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium ${isActive ? "bg-slate-700" : ""}`} style={{fontFamily: 'Montserrat, sans-serif'}}><i className={`${item.icon}`}></i>{item.label}</span>
                                        <ul className="pl-8 pt-1 space-y-1">
                                            {item.subItems.map(sub => (
                                                <li key={sub.href}><Link href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-base hover:bg-white/10" style={{fontFamily: 'Montserrat, sans-serif'}}><i className={`${sub.icon}`}></i>{sub.label}</Link></li>
                                            ))}
                                        </ul>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}