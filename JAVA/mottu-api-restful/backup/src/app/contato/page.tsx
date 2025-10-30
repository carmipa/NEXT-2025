// src/app/contato/page.tsx
"use client";
import React from "react";
import Image from "next/image";
import ContactMapSection from '@/components/ContactMapSection';
import '@/types/styles/neumorphic.css';

interface TeamMember {
    name: string;
    rm: string;
    turma: string;
    email: string;
    githubUser: string;
    githubLink: string;
    phone: string;
    photoUrl: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Paulo André Carminati",
        rm: "557881",
        turma: "2-TDSPZ",
        email: "rm557881@fiap.com.br",
        githubUser: "carmipa",
        githubLink: "https://github.com/carmipa",
        phone: "(11) 97669-2633",
        photoUrl: "/fotos-equipe/paulo.jpg",
    },
    {
        name: "Arthur Bispo de Lima",
        rm: "557568",
        turma: "2-TDSPV",
        email: "rm557568@fiap.com.br",
        githubUser: "ArthurBispo00",
        githubLink: "https://github.com/ArthurBispo00",
        phone: "(11) 99145-6219",
        photoUrl: "/fotos-equipe/arthur.jpg",
    },
    {
        name: "João Paulo Moreira",
        rm: "557808",
        turma: "2-TDSPV",
        email: "rm557808@fiap.com.br",
        githubUser: "joao1015",
        githubLink: "https://github.com/joao1015",
        phone: "(11) 98391-1385",
        photoUrl: "/fotos-equipe/joao.jpg",
    },
];

export default function ContactsPage() {

    return (
        <section className="space-y-6 sm:space-y-8 lg:space-y-10">
            <header className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-white font-montserrat">
                    <span className="text-white text-lg sm:text-xl md:text-2xl">💬</span>
                    <span>Fale Conosco</span>
                </h1>
                <p className="text-xs sm:text-sm text-white/80 font-montserrat">
                    Entre em contato pelo formulário, WhatsApp ou GitHub. Nosso mapa
                    abaixo mostra a localização da equipe.
                </p>
            </header>

            {/* Cards da equipe */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((m) => (
                    <div key={m.rm} className="group rounded-xl bg-white text-slate-800 shadow-lg p-3 sm:p-4 md:p-5 border border-white/10 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500/70 hover:-translate-y-2 transform">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full ring-4 ring-[var(--color-mottu-default)]/40 overflow-hidden transition-all duration-500 group-hover:ring-emerald-500/60 group-hover:scale-110">
                                <Image
                                    src={m.photoUrl}
                                    alt={m.name}
                                    fill
                                    sizes="(max-width: 640px) 64px, 80px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="transition-all duration-300 group-hover:text-emerald-600">
                                <h3 className="font-semibold leading-tight text-[var(--color-mottu-dark)] transition-colors duration-300 group-hover:text-emerald-700 font-montserrat text-sm sm:text-base">{m.name}</h3>
                                <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-emerald-600 font-montserrat">
                                    RM: {m.rm} | Turma: {m.turma}
                                </p>
                            </div>
                        </div>

                        <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-700 transition-all duration-300 font-montserrat">
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-mail text-sm sm:text-lg text-blue-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <span className="truncate">{m.email}</span>
                            </li>
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-briefcase text-sm sm:text-lg text-purple-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <a
                                    href={m.githubLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-emerald-600 transition-colors duration-300 truncate"
                                >
                                    @{m.githubUser}
                                </a>
                            </li>
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-call text-sm sm:text-lg text-green-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <span>{m.phone}</span>
                            </li>
                        </ul>

                        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <a
                                title="GitHub"
                                href={m.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-800/50 transform"
                            >
                                <i className="ion-logo-github text-white text-sm sm:text-base"></i>
                                <span className="font-montserrat">GitHub</span>
                            </a>
                            <a
                                title="WhatsApp"
                                href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/50 transform"
                            >
                                <i className="ion-logo-whatsapp text-white text-sm sm:text-base"></i>
                                <span className="font-montserrat">WhatsApp</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Novo Formulário e Mapa */}
            <ContactMapSection />

            {/* --- Repositórios do Projeto --- */}
            <div className="mt-8 sm:mt-10 lg:mt-12 rounded-xl bg-black/20 p-4 sm:p-6 border border-white/10 text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white flex items-center justify-center gap-2 sm:gap-3">
                    <i className="ion-logo-github text-purple-400 text-xl sm:text-2xl md:text-3xl"></i> 
                    <span className="font-montserrat">Repositórios do Projeto</span>
                </h2>
                <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-left group font-montserrat text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <i className="ion-ios-git-branch text-cyan-400 text-sm sm:text-base"></i>
                            <span className="font-semibold">Repositório Principal:</span>
                        </div>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-cyan-400 transition-colors duration-200 text-xs sm:text-sm">
                            https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1
                        </a>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-left group font-montserrat text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <i className="ion-ios-book text-green-400 text-sm sm:text-base"></i>
                            <span className="font-semibold">Repositório da Matéria:</span>
                        </div>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced/next" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-green-400 transition-colors duration-200 text-xs sm:text-sm">
                            .../Java_Advanced
                        </a>
                    </div>
                </div>
            </div>

        </section>
    );
}