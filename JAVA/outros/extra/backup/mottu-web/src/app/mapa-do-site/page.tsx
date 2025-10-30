"use client";

import NavBar from '@/components/nav-bar';
import Link from 'next/link';
import {
    MdPeople, MdDirectionsCar, MdWarehouse, MdInventory2, MdMap,
    MdList, MdAdd, MdSearch, MdExplore, MdDashboard, MdRadar
} from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";

// Estrutura de dados para descrever as seções do site
const sections = [
    {
        name: "Operações Radar",
        icon: <MdRadar className="text-3xl text-white" />,
        description: "Funcionalidades centrais para a operação diária do pátio, focadas no usuário final.",
        links: [
            { name: "Armazenar / Buscar Moto", path: "/radar", icon: <MdExplore />, detail: "Acesse a interface para escanear placas, estacionar motos em vagas livres e localizar veículos no pátio." },
            { name: "Dashboard Gerencial", path: "/dashboard", icon: <MdDashboard />, detail: "Visualize dados agregados do pátio, como total de vagas, ocupação e lista de motos estacionadas em tempo real." },
        ]
    },
    {
        name: "Visualizações",
        icon: <MdMap className="text-3xl text-white" />,
        description: "Ferramentas visuais para análise e navegação no sistema.",
        links: [
            { name: "Mapa 2D do Pátio", path: "/mapa-2d", icon: <MdMap />, detail: "Explore um modelo esquemático 2D do pátio de Guarulhos, com a disposição de galpões, acessos e áreas de circulação." },
        ]
    },
    {
        name: "Gerenciamento de Dados (Admin)",
        isGroup: true,
        description: "Área administrativa para o cadastro e manutenção das entidades base do sistema: Clientes, Veículos e a Estrutura Física do pátio.",
        items: [
            {
                name: "Clientes",
                icon: <MdPeople className="text-2xl text-white" />,
                description: "Centralize todas as informações dos seus clientes.",
                links: [
                    { name: "Listar Clientes", path: "/clientes/listar", icon: <MdList /> },
                    { name: "Cadastrar Cliente", path: "/clientes/cadastrar", icon: <MdAdd /> },
                    { name: "Buscar Clientes", path: "/clientes/buscar", icon: <MdSearch /> },
                ]
            },
            {
                name: "Veículos",
                icon: <MdDirectionsCar className="text-2xl text-white" />,
                description: "Gerencie toda a sua frota de veículos e suas tags BLE.",
                links: [
                    { name: "Listar Veículos", path: "/veiculo/listar", icon: <MdList /> },
                    { name: "Cadastrar Veículo", path: "/veiculo/cadastrar", icon: <MdAdd /> },
                    { name: "Buscar Veículos", path: "/veiculo/buscar", icon: <MdSearch /> },
                ]
            },
        ]
    },
    {
        name: "Estrutura Física (Admin)",
        isGroup: true,
        description: "Organize os espaços físicos do seu estacionamento. O controle é dividido em Pátios, Zonas e Boxes para máxima flexibilidade.",
        items: [
            {
                name: "Pátios",
                icon: <MdWarehouse className="text-2xl text-white" />,
                description: "Representam as grandes áreas, como um estacionamento principal.",
                links: [
                    { name: "Listar Pátios", path: "/patio/listar", icon: <MdList /> },
                    { name: "Cadastrar Pátio", path: "/patio/cadastrar", icon: <MdAdd /> },
                ]
            },
            {
                name: "Zonas",
                icon: <MdMap className="text-2xl text-white" />,
                description: "São subdivisões dentro de um pátio, como 'Setor A'.",
                links: [
                    { name: "Listar Zonas", path: "/zona/listar", icon: <MdList /> },
                    { name: "Cadastrar Zona", path: "/zona/cadastrar", icon: <MdAdd /> },
                ]
            },
            {
                name: "Boxes (Vagas)",
                icon: <MdInventory2 className="text-2xl text-white" />,
                description: "São as unidades finais de alocação, como uma vaga específica.",
                links: [
                    { name: "Listar Boxes", path: "/box/listar", icon: <MdList /> },
                    { name: "Cadastrar Box", path: "/box/cadastrar", icon: <MdAdd /> },
                ]
            }
        ]
    }
];

export default function MapaDoSitePage() {
    return (
        <>
            <NavBar active="mapa-do-site" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white tracking-tight">Mapa do Site e Guia de Funcionalidades</h1>
                        <p className="mt-4 text-lg text-slate-200 max-w-3xl mx-auto">
                            Bem-vindo ao guia do Radar Motu. Aqui você encontra uma visão geral de todas as seções e funcionalidades do sistema para facilitar sua navegação.
                        </p>
                    </header>

                    <div className="space-y-10">
                        {sections.map(section => (
                            section.isGroup ? (
                                <div key={section.name} className="bg-black/20 p-6 rounded-lg border border-slate-700/50">
                                    <h2 className="text-2xl font-semibold text-white mb-2">{section.name}</h2>
                                    <p className="text-slate-300 mb-6">{section.description}</p>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {section.items?.map(item => (
                                            <div key={item.name} className="bg-slate-800 p-4 rounded-md">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {item.icon}
                                                    <h3 className="text-xl font-bold text-[var(--color-mottu-light)]">{item.name}</h3>
                                                </div>
                                                <p className="text-sm text-slate-300 mb-4">{item.description}</p>
                                                <ul className="space-y-2">
                                                    {item.links.map(link => (
                                                        <li key={link.path}>
                                                            <Link href={link.path} className="flex items-center gap-2 text-sky-300 hover:text-sky-100 hover:underline">
                                                                {link.icon} {link.name} <FaExternalLinkAlt size={10} />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div key={section.name} className="bg-black/20 p-6 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-4 mb-4">
                                        {section.icon}
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{section.name}</h2>
                                            <p className="text-slate-300">{section.description}</p>
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                                        {section.links.map(link => (
                                            <div key={link.path}>
                                                <Link href={link.path} className="flex items-center gap-2 text-lg font-semibold text-sky-300 hover:text-sky-100 hover:underline">
                                                    {link.icon} {link.name} <FaExternalLinkAlt size={12} />
                                                </Link>
                                                <p className="text-sm text-slate-400 pl-7">{link.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
