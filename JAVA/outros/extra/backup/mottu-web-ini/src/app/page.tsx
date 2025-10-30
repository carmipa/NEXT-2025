// src/app/page.tsx
"use client";

import Link from 'next/link';
// import Image from 'next/image'; // Não precisa se não for usar o componente Image
import NavBar from '@/components/nav-bar';

export default function HomePage() {
    return (
        <>
            <NavBar active="inicio" />

            <main
                className="flex items-center justify-center min-h-screen text-white p-4" // Removido bg-cover, bg-center, bg-no-repeat
                style={{
                    backgroundColor: '#000000', // Fundo PRETO sólido
                    // REMOVIDA a linha backgroundImage COMPLETAMENTE para não causar 404
                    // backgroundImage: `none`, // Ou simplesmente não ter a propriedade
                }}
            >
                <section
                    className="max-w-3xl w-full p-8 md:p-10 rounded-2xl shadow-lg text-center border border-[var(--color-mottu-dark)]"
                    style={{
                        backgroundColor: 'var(--color-mottu-dark)', // Fundo do card central VERDE ESCURO
                        color: 'var(--color-mottu-text)', // Texto do card central BRANCO
                        // backdropFilter: 'blur(5px)', // Removido se não houver imagem de fundo
                    }}
                >
                    <div className="mb-6">
                        {/* Se você tiver um logo da Mottu na pasta public/, pode usar <Image /> */}
                        {/* <Image src="/mottu-logo.png" alt="Mottu Logo" width={200} height={80} className="mx-auto mb-4" /> */}
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-mottu-light)] tracking-tight drop-shadow-md">
                            Mottu Oficina
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
        </>
    );
}