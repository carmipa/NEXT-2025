"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import '@/styles/neumorphic.css';

type BuscarResp = {
    found: boolean;
    placa: string;
    boxId?: number;
    boxNome?: string;
    status?: string;
};

export default function BuscarMotoPage() {
    const router = useRouter();
    const [placa, setPlaca] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const normaliza = (p: string) => p.trim().toUpperCase();

    const onBuscar = async (e: React.FormEvent) => {
        e.preventDefault();
        const p = normaliza(placa);
        if (!p) {
            setMsg("Informe a placa.");
            return;
        }
        setLoading(true);
        setMsg(null);
        try {
            const res = await fetch(`/api/vagas/buscar-placa/${encodeURIComponent(p)}`);
            if (!res.ok) {
                const t = await res.text();
                setMsg(`Erro ao buscar: ${res.status} ${t}`);
                return;
            }
            const data = (await res.json()) as BuscarResp;
            if (data.found && data.boxId != null) {
                // ✅ redireciona para o mapa com destaque no box, placa e pátio correto
                const qs = new URLSearchParams({
                    highlight: String(data.boxId),
                    placa: data.placa,
                    box: data.boxNome || ''
                });
                if (data.patioId != null) qs.set('patioId', String(data.patioId));
                router.push(`/vagas/mapa?${qs.toString()}`);
            } else {
                setMsg(`Placa ${p} não encontrada em nenhuma vaga.`);
            }
        } catch (e: any) {
            setMsg(`Falha de rede: ${e?.message ?? e}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen  text-white p-6 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <i className="ion-ios-search text-3xl"></i>
                    Buscar Moto por Placa
                </h1>
                <form onSubmit={onBuscar} className="flex gap-2">
                    <input
                        className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 outline-none"
                        placeholder="Ex.: ABC1D23"
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        style={{fontFamily: 'Montserrat, sans-serif'}}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        style={{fontFamily: 'Montserrat, sans-serif'}}
                    >
                        {loading ? (
                            <>
                                <i className="ion-ios-sync animate-spin"></i>
                                Buscando...
                            </>
                        ) : (
                            <>
                                <i className="ion-ios-search"></i>
                                Buscar
                            </>
                        )}
                    </button>
                </form>
                {msg && (
                    <div className="mt-4 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-amber-200 flex items-center gap-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
                        <i className="ion-ios-information-circle text-xl"></i>
                        {msg}
                    </div>
                )}
            </div>
        </main>
    );
}
