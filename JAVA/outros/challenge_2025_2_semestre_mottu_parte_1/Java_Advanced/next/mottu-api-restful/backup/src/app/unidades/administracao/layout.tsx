// src/app/unidades/administracao/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavBar from "@/components/nav-bar";
import { ReactNode } from "react";
import { MdHome, MdApartment, MdDesignServices, MdViewModule, MdMap, MdUpload } from "react-icons/md";

function SubLink({
                     href,
                     label,
                     icon,
                 }: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                active
                    ? "bg-white text-[var(--color-mottu-dark)] shadow"
                    : "bg-black/30 text-white hover:bg-black/40"
            }`}
            aria-current={active ? "page" : undefined}
        >
            {icon}
            {label}
        </Link>
    );
}

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            {/* NavBar global do teu projeto */}
            <NavBar active="patio" />

            <main className="min-h-screen bg-black text-white">
                {/* Cabeçalho da seção */}
                <header className="bg-[var(--color-mottu-default)] py-8 shadow">
                    <div className="container mx-auto px-4">
                        <nav aria-label="Breadcrumb" className="text-white/90 text-sm mb-2">
                            <ol className="flex items-center gap-2">
                                <li>
                                    <Link href="/" className="underline flex items-center gap-1">
                                        <MdHome /> Início
                                    </Link>
                                </li>
                                <li aria-hidden>›</li>
                                <li className="text-white">Administração de Unidades</li>
                            </ol>
                        </nav>

                        <h1 className="text-2xl md:text-3xl font-bold">
                            Administração de Unidades
                        </h1>
                        <p className="text-white/90 mt-1 text-sm">
                            Gerencie Pátios, Zonas e Boxes, importe pátios via JSON e desenhe
                            a planta utilizando o Designer do Pátio.
                        </p>

                        {/* Navegação local da seção */}
                        <div
                            className="flex flex-wrap gap-2 mt-4"
                            role="navigation"
                            aria-label="Navegação da Administração"
                        >
                            <SubLink
                                href="/unidades/administracao"
                                label="Pátios/Zonas/Boxes"
                                icon={<MdApartment />}
                            />
                            <SubLink
                                href="/unidades/designer"
                                label="Designer do Pátio"
                                icon={<MdDesignServices />}
                            />
                            <SubLink
                                href="/patio/listar"
                                label="CRUD Pátio"
                                icon={<MdApartment />}
                            />
                            <SubLink
                                href="/zona/listar"
                                label="CRUD Zona"
                                icon={<MdMap />}
                            />
                            <SubLink
                                href="/box/listar"
                                label="CRUD Box"
                                icon={<MdViewModule />}
                            />
                            <SubLink
                                href="/unidades/administracao?tab=import"
                                label="Importar Pátios (JSON)"
                                icon={<MdUpload />}
                            />
                        </div>
                    </div>
                </header>

                {/* Conteúdo das páginas filhas */}
                <section className="container mx-auto px-4 py-8">{children}</section>

                <footer className="container mx-auto px-4 pb-10 text-center text-white/50 text-xs">
                    Se preferir, use as telas de CRUD já existentes em{" "}
                    <Link href="/patio/listar" className="underline">
                        /patio/*
                    </Link>
                    ,{" "}
                    <Link href="/zona/listar" className="underline">
                        /zona/*
                    </Link>{" "}
                    e{" "}
                    <Link href="/box/listar" className="underline">
                        /box/*
                    </Link>
                    .
                </footer>
            </main>

            <style jsx global>{`
        :root {
          --color-mottu-dark: #102d1a;
          --color-mottu-default: #1e8c4f;
        }
      `}</style>
        </>
    );
}
