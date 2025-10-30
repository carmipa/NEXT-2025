// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import ParticleBackground from "@/components/particula/ParticleBackground";

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
            <link rel="stylesheet" href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css" />
            {/* Google Fonts - Montserrat */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet" />
        </head>
        {/* A classe de fundo foi adicionada aqui */}
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#000000]`}>

        {/* Fundo animado com partículas */}
        <ParticleBackground />

        {/* INÍCIO DA ALTERAÇÃO */}
        {/* Adicionamos um wrapper com padding-bottom para criar espaço para o rodapé fixo */}
        <div className="pb-24 relative z-10">
            {children}
        </div>
        {/* FIM DA ALTERAÇÃO */}

        <footer className="fixed bottom-0 left-0 w-full bg-[var(--color-mottu-dark)] text-white p-4 border-t border-slate-700 shadow-lg z-50">
            <div className="container mx-auto text-center text-sm space-y-3">
                <div>
                    <p className="font-bold text-base flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-school text-blue-400"></i>
                        Challenge-2025-FIAP-TEMMU-METAMIND SOLUTIONS
                    </p>
                    <p className="text-slate-300 text-sm flex items-center justify-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-trophy text-yellow-400"></i>
                        CHALLENGE - SPRINT 3 - FIAP 2025
                    </p>
                </div>
                <div className="flex justify-center items-center gap-3 flex-wrap">
                    <Image src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" width={80} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring" width={90} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" alt="Gradle" width={90} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle DB" width={90} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width={95} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" width={85} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" width={130} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" width={115} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" width={105} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" width={100} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV" width={95} height={38} unoptimized={true} />
                    <Image src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" width={95} height={38} unoptimized={true} />
                </div>
            </div>
        </footer>
        </body>
        </html>
    );
}