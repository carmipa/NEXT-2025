"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";

type BuscarResp =
    | { found: true; placa: string; boxId: number; boxNome: string; status: string }
    | { found: false; placa: string };

const MAP_PATH = "/vagas/mapa"; // se seu mapa estiver noutro caminho, ajuste aqui

export default function LocalizarPorPlacaPage() {
    const router = useRouter();
    const { placa: raw } = useParams<{ placa: string }>();
    const placa = (raw ?? "").toString().toUpperCase();

    const [msg, setMsg] = useState("Buscando...");

    useEffect(() => {
        let alive = true;
        const run = async () => {
            if (!placa) { setMsg("Placa inválida."); return; }
            try {
                const res = await fetch(`/api/vagas/buscar-placa/${encodeURIComponent(placa)}`);
                if (!res.ok) { setMsg(`Erro ${res.status} ao buscar a placa.`); return; }
                const data = (await res.json()) as BuscarResp;
                if (!alive) return;

                if (data.found) {
                    const url = `${MAP_PATH}?highlight=${encodeURIComponent(String(data.boxId))}` +
                        `&placa=${encodeURIComponent(data.placa)}` +
                        `&box=${encodeURIComponent(data.boxNome)}`;
                    router.replace(url);
                } else {
                    setMsg(`Placa ${data.placa} não encontrada em nenhuma vaga.`);
                }
            } catch (e: any) {
                setMsg(`Falha de rede: ${e?.message ?? e}`);
            }
        };
        run();
        return () => { alive = false; };
    }, [placa, router]);

    return (
        <>
            <NavBar active="radar" />
            <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Localizando placa…</h1>
                    <div className="font-mono text-emerald-300 mb-4">{placa}</div>
                    <p className="text-zinc-300">{msg}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => router.push("/radar/buscar")}
                            className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600"
                        >
                            Buscar outra
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
