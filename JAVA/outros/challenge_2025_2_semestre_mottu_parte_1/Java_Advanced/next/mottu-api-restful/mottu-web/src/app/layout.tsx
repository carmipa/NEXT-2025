// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/types/styles/neumorphic.css";
import Image from "next/image";
import ParticleBackground from "@/components/particula/ParticleBackground";
import NavBar from "@/components/nav-bar";

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
            {/* Ionicons CSS */}
            <link rel="stylesheet" href="https://unpkg.com/ionicons@4.6.3/dist/css/ionicons.min.css" />
            {/* Google Fonts - Montserrat */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet" />
        </head>
        {/* A classe de fundo foi adicionada aqui */}
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>

        {/* Fundo animado com partículas */}
        <ParticleBackground />

        {/* INÍCIO DA ALTERAÇÃO */}
        {/* Adicionamos um wrapper com padding-bottom para criar espaço para o rodapé fixo */}
        <div className="pb-24 relative z-10">
            <NavBar />
            {children}
        </div>
        {/* FIM DA ALTERAÇÃO */}

        <footer className="fixed bottom-0 left-0 w-full bg-[var(--color-mottu-dark)] text-white p-4 border-t border-slate-700 shadow-lg z-50 footer-gradient no-print">
            <div className="container mx-auto text-center text-sm space-y-3">
                <div>
                    <p className="font-bold text-base flex items-center justify-center gap-2 font-montserrat">
                        <i className="ion-ios-school text-blue-400"></i>
                        CHALLENGE-MOTTU-FIAP/2025-GRUPO-METAMIND-SOLUTIONS-FINALISTA-FIAP-NEXT/2025
                    </p>

                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}