// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/types/styles/neumorphic.css";
import ParticleBackground from "@/components/particula/ParticleBackground";
import NavBar from "@/components/nav-bar";

// Revalidação padrão para todas as páginas do app (aplicado ao subtree)
export const revalidate = 60;

// Garantir carregamento dos ícones Ionicons
if (typeof window !== 'undefined') {
    // Verificar se já existe
    const existingLink = document.querySelector('link[href*="ionicons"]');
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }
}

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export const metadata: Metadata = {
    title: "Gestão de veículos",
    description: "Gestão de veículos, pátios, boxes e zonas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
        <head>
            <link rel="stylesheet" href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css" crossOrigin="anonymous" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black flex flex-col min-h-screen`}>

            {/* Camada da NavBar: Renderizada PRIMEIRO para garantir visibilidade. */}
            <NavBar />

            {/* Camada de Fundo: Renderizada segundo. */}
            <ParticleBackground />

            {/* Conteúdo Principal: Com padding para não ser coberto pela NavBar e com z-index para ficar acima do fundo. */}
            <main className="pt-16 pb-20 relative z-10">
                {children}
            </main>

            {/* Camada do Footer: Fixa na base, renderizada sobre o main. */}
            {/* O gradiente foi removido para evitar o bug de stacking context. */}
            <footer className="fixed bottom-0 left-0 w-full z-40 bg-[var(--color-mottu-dark)] text-white p-2 sm:p-4 border-t border-slate-700 shadow-lg no-print">
                <div className="container mx-auto text-center text-xs sm:text-sm space-y-2 sm:space-y-3">
                    <div>
                        <p className="font-bold text-xs sm:text-sm lg:text-base flex items-center justify-center gap-1 sm:gap-2 font-montserrat">
                            <i className="ion-ios-school text-blue-400 text-sm sm:text-base"></i>
                            <span className="hidden xs:inline">CHALLENGE-MOTTU-FIAP/2025-GRUPO-METAMIND-SOLUTIONS-FINALISTA-FIAP-NEXT/2025</span>
                            <span className="xs:hidden">CHALLENGE-MOTTU-FIAP/2025</span>
                        </p>
                    </div>
                </div>
            </footer>

        </body>
        </html>
    );
}