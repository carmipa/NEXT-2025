"use client";

import Link from "next/link";
// import ParallaxBox from '@/components/ParallaxBox/ParallaxBox'; // <- não precisamos mais aqui
import PcarTiltCard from "@/components/efeitoCard/PcarTiltCard";
import { useEffect } from "react";

export default function HomePage() {
    useEffect(() => {
        // Remove scrollbar apenas na página inicial
        document.body.style.overflowY = 'hidden';
        
        // Limpa o efeito quando sair da página
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, []);

    return (
        <>

            <main
                className="flex items-center justify-center h-screen text-white overflow-hidden relative z-20"
                style={{ perspective: "1000px", paddingTop: "20px", paddingBottom: "180px" }}
            >
                {/* Card central com efeito 3D */}
                <PcarTiltCard imageSrc="/fotos-equipe/fundo_pcar.png">
                    {/* ====== CONTEÚDO ORIGINAL PRESERVADO ====== */}
                    <div className="mb-4 pcar-title">
                        <h1 className="text-[24px] md:text-[36px] font-extrabold text-[var(--color-mottu-text)] tracking-tight mb-2 [text-shadow:2px_2px_6px_rgba(0,0,0,0.5)] font-poppins">
                            Gestão de veículos
                        </h1>

                        <p className="font-poppins text-[14px] md:text-[18px] text-white/80 [text-shadow:1px_1px_4px_rgba(0,0,0,0.4)]">
                            Sua plataforma de gestão de veículos e pátios
                        </p>
                    </div>

                    <div className="bg-black rounded-xl p-3 max-w-xl mx-auto mb-6 border border-white/10 pcar-text">
                        <p className="font-lato text-[12px] md:text-[14px] leading-relaxed text-white text-center">
                            Simplifique a gestão da sua frota e otimize o controle de pátios e boxes.
                            Com a Mottu Oficina, você tem o poder de organizar, rastrear e manter seus veículos
                            com eficiência e inteligência.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-2 pcar-actions mt-4">
                        <Link href="/dashboard">
                            <button className="font-poppins w-full sm:w-auto px-6 py-2 text-sm font-semibold text-[var(--color-mottu-text)] bg-[var(--color-mottu-default)] rounded-full shadow-lg hover:bg-[var(--color-mottu-light)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-light)] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 ease-in-out transform-gpu">
                                Começar Agora
                            </button>
                        </Link>
                        <Link href="/contato">
                            <button className="font-poppins w-full sm:w-auto px-6 py-2 text-sm font-semibold text-[var(--color-mottu-text)] bg-[var(--color-mottu-default)] rounded-full shadow-lg hover:bg-[var(--color-mottu-light)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-light)] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 ease-in-out transform-gpu">
                                Fale Conosco
                            </button>
                        </Link>
                    </div>
                    {/* ====== FIM DO CONTEÚDO ORIGINAL ====== */}
                </PcarTiltCard>
            </main>
        </>
    );
}
