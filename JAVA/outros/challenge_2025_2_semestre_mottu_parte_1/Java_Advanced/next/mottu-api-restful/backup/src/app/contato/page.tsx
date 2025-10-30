// src/app/contato/page.tsx
"use client";
import React, { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import '@/types/styles/neumorphic.css';

// Mapa dinâmico (SSR safe)
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[350px] w-full rounded-lg bg-gray-700 flex items-center justify-center text-white">
            <p>Carregando mapa…</p>
        </div>
    ),
});

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
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviado, setEnviado] = useState<null | "ok" | "erro">(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Não fazemos mais o envio aqui, apenas validamos o formulário
        if (!nome || !email || !mensagem) {
            setEnviado("erro");
            return;
        }
        setEnviado("ok");
    };

    const handleGmailClick = () => {
        const assunto = encodeURIComponent("Contato via Site Mottu");
        const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=contato@mottu.com&su=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    const handleOutlookClick = () => {
        const assunto = encodeURIComponent("Contato via Site Mottu");
        const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
        const url = `https://outlook.live.com/mail/0/deeplink/compose?to=contato@mottu.com&subject=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    const handleGenericEmailClick = () => {
        const assunto = encodeURIComponent("Contato via Site Mottu");
        const corpo = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
        const url = `mailto:contato@mottu.com?subject=${assunto}&body=${corpo}`;
        window.open(url, '_blank');
    };

    return (
        <section className="space-y-10">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <span className="text-white">💬</span>
                    Fale Conosco
                </h1>
                <p className="text-sm text-white/80" style={{fontFamily: 'Montserrat, sans-serif'}}>
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
                                <h3 className="font-semibold leading-tight text-[var(--color-mottu-dark)] transition-colors duration-300 group-hover:text-emerald-700" style={{fontFamily: 'Montserrat, sans-serif'}}>{m.name}</h3>
                                <p className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-emerald-600" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    RM: {m.rm} | Turma: {m.turma}
                                </p>
                            </div>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-slate-700 transition-all duration-300" style={{fontFamily: 'Montserrat, sans-serif'}}>
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
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>GitHub</span>
                            </a>
                            <a
                                title="WhatsApp"
                                href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-green-500 text-white px-3 py-2 text-sm font-semibold hover:bg-green-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 transform"
                            >
                                <i className="ion-logo-whatsapp text-white"></i>
                                <span style={{fontFamily: 'Montserrat, sans-serif'}}>WhatsApp</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form + Mapa */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="neumorphic-fieldset">
                    <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Envie uma Mensagem</legend>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <div className="group">
                            <label className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-person text-lg"></i> Seu Nome:
                            </label>
                            <input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                className="neumorphic-input"
                                placeholder="Digite seu nome"
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            />
                        </div>

                        <div className="group">
                            <label className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-mail text-lg"></i> Seu E-mail:
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="neumorphic-input"
                                placeholder="seu@email.com"
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            />
                        </div>

                        <div className="group">
                            <label className="neumorphic-label flex items-center gap-1" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                <i className="ion-ios-chatbubbles text-lg"></i> Mensagem:
                            </label>
                            <textarea
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                required
                                rows={5}
                                className="neumorphic-textarea"
                                placeholder="Escreva sua mensagem..."
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            />
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                type="submit"
                                className="neumorphic-button-green w-full"
                                style={{fontFamily: 'Montserrat, sans-serif'}}
                            >
                                <i className="ion-ios-checkmark-circle mr-2"></i>
                                <span>Validar Formulário</span>
                            </button>
                            
                            {enviado === "ok" && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={handleGmailClick}
                                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/50"
                                        style={{fontFamily: 'Montserrat, sans-serif'}}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 8.155l6.545 4.939V3.821h3.819A1.636 1.636 0 0 1 24 5.457z"/>
                                        </svg>
                                        <span className="hidden sm:inline">Gmail</span>
                                    </button>
                                    <button
                                        onClick={handleOutlookClick}
                                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/50"
                                        style={{fontFamily: 'Montserrat, sans-serif'}}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.462 11.85l4.538 2.9v-5.8l-4.538 2.9zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                                        </svg>
                                        <span className="hidden sm:inline">Outlook</span>
                                    </button>
                                    <button
                                        onClick={handleGenericEmailClick}
                                        className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-600/50"
                                        style={{fontFamily: 'Montserrat, sans-serif'}}
                                    >
                                        <i className="ion-ios-mail text-lg"></i>
                                        <span className="hidden sm:inline">Email</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {enviado === "erro" && (
                            <div className="mt-4 p-3 rounded-lg bg-red-600/20 border border-red-400/50">
                                <p className="text-red-200 text-sm flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                    <i className="ion-ios-warning text-lg"></i>
                                    Por favor, preencha todos os campos antes de continuar.
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                <div className="neumorphic-fieldset">
                    <legend className="neumorphic-legend" style={{fontFamily: 'Montserrat, sans-serif'}}>Nossa Localização</legend>
                    <div className="h-[450px] rounded-lg overflow-hidden mt-6 w-full">
                        <LeafletMap
                            position={[-23.564, -46.652]} // exemplo: região da FIAP Paulista
                            zoom={15}
                            markerText="Equipe Mottu Oficina"
                            className="h-full w-full"
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* --- NOVA SEÇÃO: Repositórios do Projeto --- */}
            <div className="rounded-xl bg-black/20 p-6 border border-white/10 text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                <h2 className="text-2xl font-bold mb-4 text-white flex items-center justify-center gap-3">
                    <i className="ion-logo-github text-purple-400 text-3xl"></i> <span style={{fontFamily: 'Montserrat, sans-serif'}}>Repositórios do Projeto</span>
                </h2>
                <div className="space-y-3 max-w-2xl mx-auto">
                    <p className="flex items-center gap-2 text-left group" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-git-branch text-cyan-400"></i>
                        <span className="font-semibold">Repositório Principal:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-cyan-400 transition-colors duration-200">
                            https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1
                        </a>
                    </p>
                    <p className="flex items-center gap-2 text-left group" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-book text-green-400"></i>
                        <span className="font-semibold">Repositório da Matéria:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced/next" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline truncate hover:text-green-400 transition-colors duration-200">
                            .../Java_Advanced
                        </a>
                    </p>
                </div>
            </div>

            {/* --- Créditos do Projeto --- */}
            <div className="rounded-xl bg-black/20 p-6 border border-white/10 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="container mx-auto text-center space-y-2">
                    <p className="text-lg font-bold text-white">CHALLENGE - NEXT/2025 - FIAP 2025</p>
                    <p className="text-base text-slate-300">
                        Produzido e desenvolvido pela equipe <span className="font-semibold text-emerald-400">MetaMind Solutions</span>
                    </p>
                </div>
            </div>

        </section>
    );
}