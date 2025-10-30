// src/app/page.tsx
"use client";

import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import Image from "next/image";

export default function HomePage() {
    return (
        <>
            <NavBar active="inicio" />

            <main
                className="flex items-center justify-center min-h-screen text-white p-4"
                style={{
                    backgroundColor: '#000000',
                }}
            >
                <section
                    className="max-w-3xl w-full p-8 md:p-10 rounded-2xl shadow-lg text-center border border-[var(--color-mottu-dark)]"
                    style={{
                        backgroundColor: 'var(--color-mottu-dark)',
                        color: 'var(--color-mottu-text)',
                    }}
                >
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-mottu-light)] tracking-tight drop-shadow-md">
                            Gestão de veículos
                        </h1>
                        <p className="mt-2 text-lg text-[var(--color-mottu-text)]">Sua plataforma de gestão de veículos e pátios</p>
                    </div>

                    <p className="mb-8 text-lg md:text-xl leading-relaxed text-[var(--color-mottu-text)]">
                        Simplifique a gestão da sua frota e otimize o controle de pátios e boxes. Com a Mottu Oficina, você tem o poder de organizar, rastrear e manter seus veículos com eficiência e inteligência.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/clientes/listar">
                            <button className="w-full sm:w-auto px-8 py-3 font-semibold text-[var(--color-mottu-text)] bg-[var(--color-mottu-default)] rounded-full shadow-lg hover:bg-[var(--color-mottu-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-light)] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 ease-in-out">
                                Começar Agora
                            </button>
                        </Link>
                        <Link href="/contato">
                            <button className="w-full sm:w-auto px-8 py-3 font-semibold text-[var(--color-mottu-text)] bg-transparent border-2 border-[var(--color-mottu-default)] rounded-full shadow-lg hover:bg-[var(--color-mottu-light)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-light)] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 ease-in-out">
                                Fale Conosco
                            </button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* ========== RODAPÉ COM A CORREÇÃO "unoptimized" ========== */}
            <footer className="fixed bottom-0 left-0 w-full bg-[var(--color-mottu-dark)] text-white p-4 border-t border-slate-700 shadow-lg">
                <div className="container mx-auto text-center text-xs space-y-3">
                    <div>
                        <p className="font-bold">Challenge-2025-FIAP-TEMMU-METAMIND SOLUTIONS</p>
                        <p className="text-slate-300">CHALLENGE - SPRINT 3 - FIAP 2025</p>
                    </div>
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                        <Image src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" width={60} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring" width={70} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" alt="Gradle" width={70} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle DB" width={70} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width={75} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" width={65} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" width={110} height={28} unoptimized={true} />
                        <Image src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" width={95} height={28} unoptimized={true} />
                    </div>
                </div>
            </footer>
        </>
    );
}