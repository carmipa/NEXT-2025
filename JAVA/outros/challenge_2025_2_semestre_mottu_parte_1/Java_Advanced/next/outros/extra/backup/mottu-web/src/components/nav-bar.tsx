"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from 'react';
import {
    MdHome, MdPeople, MdDirectionsCar, MdWarehouse, MdInventory2, MdMap, MdContactMail,
    MdList, MdAdd, MdSearch, MdMenu, MdClose, MdExplore, MdDashboard
} from "react-icons/md";

// Estrutura de dados para os itens de navegação com submenus
const navItems = [
    { href: "/", label: "Início", icon: MdHome, basePath: "/" },
    {
        basePath: "/clientes", label: "Clientes", icon: MdPeople,
        subItems: [
            { href: "/clientes/listar", label: "Listar", icon: MdList },
            { href: "/clientes/cadastrar", label: "Cadastrar", icon: MdAdd },
            { href: "/clientes/buscar", label: "Buscar", icon: MdSearch },
        ]
    },
    {
        basePath: "/veiculo", label: "Veículos", icon: MdDirectionsCar,
        subItems: [
            { href: "/veiculo/listar", label: "Listar", icon: MdList },
            { href: "/veiculo/cadastrar", label: "Cadastrar", icon: MdAdd },
            { href: "/veiculo/buscar", label: "Buscar", icon: MdSearch },
        ]
    },
    {
        basePath: "/patio", label: "Pátios", icon: MdWarehouse,
        subItems: [
            { href: "/patio/listar", label: "Listar", icon: MdList },
            { href: "/patio/cadastrar", label: "Cadastrar", icon: MdAdd },
            { href: "/patio/buscar", label: "Buscar", icon: MdSearch },
        ]
    },
    {
        basePath: "/box", label: "Boxes", icon: MdInventory2,
        subItems: [
            { href: "/box/listar", label: "Listar", icon: MdList },
            { href: "/box/cadastrar", label: "Cadastrar", icon: MdAdd },
            { href: "/box/buscar", label: "Buscar", icon: MdSearch },
        ]
    },
    {
        basePath: "/zona", label: "Zonas", icon: MdMap,
        subItems: [
            { href: "/zona/listar", label: "Listar", icon: MdList },
            { href: "/zona/cadastrar", label: "Cadastrar", icon: MdAdd },
            { href: "/zona/buscar", label: "Buscar", icon: MdSearch },
        ]
    },
    { href: "/radar", label: "Radar", icon: MdExplore, basePath: "/radar" },
    { href: "/dashboard", label: "Dashboard", icon: MdDashboard, basePath: "/dashboard" },
    { href: "/mapa-2d", label: "Mapa 2D", icon: MdMap, basePath: "/mapa-2d" },
    { href: "/mapa-do-site", label: "Mapa do Site", icon: MdExplore, basePath: "/mapa-do-site" },
    { href: "/contato", label: "Fale Conosco", icon: MdContactMail, basePath: "/contato" },
];

export default function NavBar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Função para determinar se um item está ativo (considerando sub-rotas)
    const isItemActive = (item: typeof navItems[0]) => {
        if (item.basePath === "/") {
            return pathname === "/";
        }
        return item.basePath && pathname?.startsWith(item.basePath);
    };

    return (
        <header className="w-full sticky top-0 z-50">
            <nav className="w-full bg-[var(--color-mottu-dark)] text-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="font-bold text-lg">Mottu Oficina</Link>
                        </div>

                        <ul className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = isItemActive(item);
                                if (!item.subItems) {
                                    return (
                                        <li key={item.href}>
                                            <Link href={item.href!} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-white text-[var(--color-mottu-dark)] font-semibold" : "hover:bg-white/10"}`}>
                                                <item.icon className="text-xl" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.label)} onMouseLeave={() => setOpenMenu(null)}>
                                        <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition w-full text-left ${isActive ? "bg-white text-[var(--color-mottu-dark)] font-semibold" : "hover:bg-white/10"}`}>
                                            <item.icon className="text-xl" />
                                            <span>{item.label}</span>
                                        </button>
                                        {openMenu === item.label && (
                                            <div className="absolute left-0 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                                                <div className="py-1">
                                                    {item.subItems.map(sub => (
                                                        <Link key={sub.href} href={sub.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-white">
                                                            <sub.icon />
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

                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
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
                                        <li key={item.href}><Link href={item.href!} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium ${isActive ? "bg-white text-[var(--color-mottu-dark)]" : "hover:bg-white/10"}`}><item.icon />{item.label}</Link></li>
                                    )
                                }
                                return (
                                    <li key={item.label}>
                                        <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium ${isActive ? "bg-slate-700" : ""}`}><item.icon />{item.label}</span>
                                        <ul className="pl-8 pt-1 space-y-1">
                                            {item.subItems.map(sub => (
                                                <li key={sub.href}><Link href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-white/10"><sub.icon />{sub.label}</Link></li>
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

