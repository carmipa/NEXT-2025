// src/components/nav-bar.tsx
"use client";

import Link from 'next/link';
import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Importe os ícones que você já está usando
import {
    MdHome, MdPeople, MdDirectionsCar, MdBuild, MdList, MdAddCircleOutline, MdSearch, MdContactMail
} from 'react-icons/md';
import { Home as HomeIcon, Users, Car, Box, Wrench, Stethoscope } from 'lucide-react';

// ===============================================================
// DEFINIÇÃO DAS INTERFACES (MOVIDAS PARA O TOPO!)
// ===============================================================
interface SubMenuItem {
    label: string;
    href: string;
    icon: ReactNode;
}

interface NavMenuItem {
    label: string;
    href?: string; // Opcional se tiver submenus
    icon: ReactNode;
    key: string; // Chave para identificar o item ativo
    subMenus?: SubMenuItem[]; // Array de submenus
}
// ===============================================================


export default function NavBar({ active }: { active: string }) {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (menuKey: string) => {
        setOpenMenu(current => (current === menuKey ? null : menuKey));
    };

    const isActive = (href: string) => {
        if (href === '/inicio') {
            return pathname === '/inicio' || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    // Define os itens da navegação
    const navItems: NavMenuItem[] = [
        { label: "Início", href: "/inicio", icon: <HomeIcon size={18} />, key: "inicio" },
        {
            label: "Clientes",
            icon: <Users size={18} />,
            key: "clientes",
            subMenus: [
                { label: "Listar", href: "/clientes/listar", icon: <MdList /> },
                { label: "Cadastrar", href: "/clientes/cadastrar", icon: <MdAddCircleOutline /> },
                { label: "Buscar", href: "/clientes/buscar", icon: <MdSearch /> },
            ]
        },
        {
            label: "Veículos",
            icon: <Car size={18} />,
            key: "veiculo",
            subMenus: [
                { label: "Listar", href: "/veiculo/listar", icon: <MdList /> },
                { label: "Cadastrar", href: "/veiculo/cadastrar", icon: <MdAddCircleOutline /> },
                { label: "Buscar", href: "/veiculo/buscar", icon: <MdSearch /> },
            ]
        },
        {
            label: "Boxes",
            icon: <Box size={18} />,
            key: "box",
            subMenus: [
                { label: "Listar", href: "/box/listar", icon: <MdList /> },
                { label: "Cadastrar", href: "/box/cadastrar", icon: <MdAddCircleOutline /> },
                { label: "Buscar", href: "/box/buscar", icon: <MdSearch /> },
            ]
        },
        {
            label: "Pátios",
            icon: <Wrench size={18} />,
            key: "patio",
            subMenus: [
                { label: "Listar", href: "/patio/listar", icon: <MdList /> },
                { label: "Cadastrar", href: "/patio/cadastrar", icon: <MdAddCircleOutline /> },
                { label: "Buscar", href: "/patio/buscar", icon: <MdSearch /> },
            ]
        },
        {
            label: "Zonas",
            icon: <Stethoscope size={18} />,
            key: "zona",
            subMenus: [
                { label: "Listar", href: "/zona/listar", icon: <MdList /> },
                { label: "Cadastrar", href: "/zona/cadastrar", icon: <MdAddCircleOutline /> },
                { label: "Buscar", href: "/zona/buscar", icon: <MdSearch /> },
            ]
        },
        { label: "Contato", href: "/contato", icon: <MdContactMail />, key: "contato" },
    ];

    // ===============================================================
    // CLASSES CSS E ESTILOS PARA O TEMA MOTTU
    // USANDO VARIÁVEIS CSS E FORÇANDO TEXTO BRANCO
    // ===============================================================

    // Fundo da barra de navegação (verde escuro da Mottu)
    const baseNavBg = 'bg-[var(--color-mottu-dark)]';

    // Classe base para os links dos menus principais:
    // Força a cor do texto BRANCA.
    // Hover em verde claro.
    const baseLinkClass = `flex items-center px-1 pb-1 transition-colors duration-200 ease-in-out text-white hover:text-[var(--color-mottu-light)]`;

    // Classe para o link ativo:
    // Negrito, borda inferior verde clara, e garante texto branco
    const activeLinkClass = `font-semibold border-b-2 border-[var(--color-mottu-light)] text-white`;

    // Fundo para os submenus (verde padrão da Mottu)
    const subMenuBgClass = `bg-[var(--color-mottu-default)]`;

    // Classe para os links dentro dos submenus:
    // Cor do texto BRANCA, hover em verde claro
    const subMenuLinkClass = `flex items-center gap-2 block px-4 py-2 text-sm text-white hover:bg-[var(--color-mottu-light)] transition-colors`;


    return (
        <nav className={`flex justify-between items-center p-4 md:p-6 ${baseNavBg} text-white shadow-md relative z-50`}>
            <Link href="/inicio" onClick={() => setOpenMenu(null)}>
                <h1 className="flex items-center text-xl md:text-2xl font-bold cursor-pointer hover:text-[var(--color-mottu-light)] transition-colors" style={{ color: 'var(--color-mottu-text)' }}> {/* Força branco */}
                    {/* Ícone com a cor da Mottu */}
                    <span className="text-[var(--color-mottu-light)] mr-2">⚙️</span> Mottu Oficina
                </h1>
            </Link>

            <ul className="flex flex-wrap gap-3 md:gap-5 text-sm md:text-base items-center">
                {navItems.map((item) => (
                    <li key={item.key} className="relative">
                        {item.href ? (
                            <Link href={item.href} className={`${baseLinkClass} ${isActive(item.href) ? activeLinkClass : ''}`} onClick={() => setOpenMenu(null)}>
                                {/* Texto e ícone: forçar branco */}
                                <span className="mr-1" style={{ color: 'white' }}>{item.icon}</span>
                                <span style={{ color: 'white' }}>{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => toggleMenu(item.key)}
                                className={`${baseLinkClass} ${isActive(`/${item.key}`) ? activeLinkClass : ''} cursor-pointer`}
                            >
                                {/* Texto e ícone: forçar branco */}
                                <span className="mr-1" style={{ color: 'white' }}>{item.icon}</span>
                                <span style={{ color: 'white' }}>{item.label}</span>
                            </button>
                        )}
                        {item.subMenus && openMenu === item.key && (
                            <ul className={`absolute left-0 mt-2 w-48 ${subMenuBgClass} rounded-md shadow-lg py-1 animate-fade-in-down z-10`}>
                                {item.subMenus.map((subItem) => (
                                    <li key={subItem.href}>
                                        <Link href={subItem.href} className={subMenuLinkClass} onClick={() => setOpenMenu(null)}>
                                            <span className="mr-1" style={{ color: 'white' }}>{subItem.icon}</span>
                                            <span style={{ color: 'white' }}>{subItem.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            {/* Avatar do usuário (mantido) */}
            <img
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[var(--color-mottu-light)]"
                src="https://avatars.githubusercontent.com/u/4350623?v=4" // Seu avatar do GitHub
                alt="Avatar do usuário"
            />

            {/* Animação do Menu Dropdown */}
            <style jsx>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
            `}</style>
        </nav>
    );
}