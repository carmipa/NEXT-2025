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
        <section className="space-y-10">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white font-montserrat">
                    <span className="text-white">💬</span>
                    Fale Conosco
                </h1>
                <p className="text-sm text-white/80 font-montserrat">
                    Entre em contato pelo formulário, WhatsApp ou GitHub. Nosso mapa
                    abaixo mostra a localização da equipe.
                </p>
            </header>

            {/* Cards da equipe */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((m) => (
                    <div key={m.rm} className="group rounded-xl bg-white text-slate-800 shadow-lg p-5 border border-white/10 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500/70 hover:-translate-y-2 transform">
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-full ring-4 ring-[var(--color-mottu-default)]/40 overflow-hidden transition-all duration-500 group-hover:ring-emerald-500/60 group-hover:scale-110">
                                <Image
                                    src={m.photoUrl}
                                    alt={m.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="transition-all duration-300 group-hover:text-emerald-600">
                                <h3 className="font-semibold leading-tight text-[var(--color-mottu-dark)] transition-colors duration-300 group-hover:text-emerald-700 font-montserrat">{m.name}</h3>
                                <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-emerald-600 font-montserrat">
                                    RM: {m.rm} | Turma: {m.turma}
                                </p>
                            </div>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-slate-700 transition-all duration-300 font-montserrat">
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-mail text-lg text-blue-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <span>{m.email}</span>
                            </li>
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-briefcase text-lg text-purple-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <a
                                    href={m.githubLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-emerald-600 transition-colors duration-300"
                                >
                                    @{m.githubUser}
                                </a>
                            </li>
                            <li className="flex items-center gap-2 transition-all duration-300 group-hover:text-emerald-700">
                                <i className="ion-ios-call text-lg text-green-600 transition-all duration-300 group-hover:text-emerald-600 group-hover:scale-110"></i>
                                <span>{m.phone}</span>
                            </li>
                        </ul>

                        <div className="mt-4 flex items-center gap-2">
                            <a
                                title="GitHub"
                                href={m.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-800/50 transform"
                            >
                                <i className="ion-logo-github text-white"></i>
                                <span className="font-montserrat">GitHub</span>
                            </a>
                            <a
                                title="WhatsApp"
                                href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/50 transform"
                            >
                                <i className="ion-logo-whatsapp text-white"></i>
                                <span className="font-montserrat">WhatsApp</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Novo Formulário e Mapa */}
            <ContactMapSection />

            {/* --- Repositórios do Projeto --- */}
            <div className="mt-12 rounded-xl bg-black/20 p-6 border border-white/10 text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                <h2 className="text-2xl font-bold mb-4 text-white flex items-center justify-center gap-3">
                    <i className="ion-logo-github text-purple-400 text-3xl"></i> <span className="font-montserrat">Repositórios do Projeto</span>
                </h2>
                <div className="space-y-3 max-w-2xl mx-auto">
                    <p className="flex items-center gap-2 text-left group font-montserrat">
                        <i className="ion-ios-git-branch text-cyan-400"></i>
                        <span className="font-semibold">Repositório Principal:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-cyan-400 transition-colors duration-200">
                            https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1
                        </a>
                    </p>
                    <p className="flex items-center gap-2 text-left group font-montserrat">
                        <i className="ion-ios-book text-green-400"></i>
                        <span className="font-semibold">Repositório da Matéria:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced/next" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-green-400 transition-colors duration-200">
                            .../Java_Advanced
                        </a>
                    </p>
                </div>
            </div>

        </section>
    );
}