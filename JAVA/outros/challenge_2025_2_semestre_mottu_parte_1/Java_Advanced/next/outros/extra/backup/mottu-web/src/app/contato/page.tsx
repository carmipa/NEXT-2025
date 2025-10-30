// src/app/contato/page.tsx
"use client";
import React, { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
// --- Ícones adicionados para as novas seções ---
import { FaGithub, FaWhatsapp, FaCodeBranch, FaBook } from "react-icons/fa";
import { MdPerson, MdAlternateEmail, MdWork, MdPhoneEnabled, MdMessage, MdSend } from "react-icons/md";

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
        try {
            setEnviado("ok");
            setNome("");
            setEmail("");
            setMensagem("");
        } catch {
            setEnviado("erro");
        }
    };

    return (
        <section className="space-y-10">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white">
                    <span className="text-white">💬</span>
                    Fale Conosco
                </h1>
                <p className="text-sm text-white/80">
                    Entre em contato pelo formulário, WhatsApp ou GitHub. Nosso mapa
                    abaixo mostra a localização da equipe.
                </p>
            </header>

            {/* Cards da equipe */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((m) => (
                    <div key={m.rm} className="rounded-xl bg-white text-slate-800 shadow-lg p-5 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-full ring-4 ring-[var(--color-mottu-default)]/40 overflow-hidden">
                                <Image
                                    src={m.photoUrl}
                                    alt={m.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold leading-tight text-[var(--color-mottu-dark)]">{m.name}</h3>
                                <p className="text-xs text-slate-600">
                                    RM: {m.rm} | Turma: {m.turma}
                                </p>
                            </div>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-slate-700">
                            <li className="flex items-center gap-2">
                                <MdAlternateEmail className="text-lg" />
                                <span>{m.email}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdWork className="text-lg" />
                                <a
                                    href={m.githubLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-[var(--color-mottu-dark)]"
                                >
                                    @{m.githubUser}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdPhoneEnabled className="text-lg" />
                                <span>{m.phone}</span>
                            </li>
                        </ul>

                        <div className="mt-4 flex items-center gap-2">
                            <a
                                title="GitHub"
                                href={m.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-700"
                            >
                                <FaGithub />
                                GitHub
                            </a>
                            <a
                                title="WhatsApp"
                                href={`https://wa.me/55${m.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-green-500 text-white px-3 py-2 text-sm font-semibold hover:bg-green-600"
                            >
                                <FaWhatsapp />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form + Mapa */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-5 border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">Envie uma Mensagem</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block text-white">
                            <span className="mb-1 flex items-center gap-2 text-sm">
                              <MdPerson /> Seu Nome
                            </span>
                            <input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500"
                                placeholder="Digite seu nome"
                            />
                        </label>

                        <label className="block text-white">
                            <span className="mb-1 flex items-center gap-2 text-sm">
                              <MdAlternateEmail /> Seu E-mail
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500"
                                placeholder="seu@email.com"
                            />
                        </label>

                        <label className="block text-white">
                            <span className="mb-1 flex items-center gap-2 text-sm">
                              <MdMessage /> Mensagem
                            </span>
                            <textarea
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                required
                                rows={4}
                                className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500"
                                placeholder="Escreva sua mensagem…"
                            />
                        </label>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-white text-[var(--color-mottu-dark)] px-4 py-2 font-semibold hover:bg-gray-200"
                        >
                            <MdSend />
                            Enviar
                        </button>

                        {enviado === "ok" && (
                            <p className="text-green-300 text-sm">Mensagem enviada!</p>
                        )}
                        {enviado === "erro" && (
                            <p className="text-red-300 text-sm">
                                Ocorreu um erro. Tente novamente.
                            </p>
                        )}
                    </form>
                </div>

                <div className="rounded-xl bg-black/20 p-5 border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">Nossa Localização</h2>
                    <div className="h-[385px] rounded-lg overflow-hidden">
                        <LeafletMap
                            position={[-23.564, -46.652]} // exemplo: região da FIAP Paulista
                            zoom={15}
                            markerText="Equipe Mottu Oficina"
                            className="h-full w-full"
                        />
                    </div>
                </div>
            </div>

            {/* --- NOVA SEÇÃO: Repositórios do Projeto --- */}
            <div className="rounded-xl bg-black/20 p-6 border border-white/10 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white flex items-center justify-center gap-3">
                    <FaGithub /> Repositórios do Projeto
                </h2>
                <div className="space-y-3 max-w-2xl mx-auto">
                    <p className="flex items-center gap-2 text-left">
                        <FaCodeBranch className="text-sky-300" />
                        <span className="font-semibold">Repositório Principal:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline truncate">
                            https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1
                        </a>
                    </p>
                    <p className="flex items-center gap-2 text-left">
                        <FaBook className="text-sky-300" />
                        <span className="font-semibold">Repositório da Matéria:</span>
                        <a href="https://github.com/carmipa/challenge_2025_2_semestre_mottu_parte_1/tree/main/Java_Advanced" target="_blank" rel="noreferrer" className="text-sky-300 hover:underline truncate">
                            .../Java_Advanced
                        </a>
                    </p>
                </div>
            </div>

            {/* --- NOVA SEÇÃO: Tecnologias Utilizadas (Shields) --- */}
            <div className="rounded-xl bg-black/20 p-6 border border-white/10">
                <div className="container mx-auto text-center text-xs space-y-3">
                    <div>
                        <p className="font-bold">Tecnologias Utilizadas no Projeto</p>
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
            </div>

        </section>
    );
}