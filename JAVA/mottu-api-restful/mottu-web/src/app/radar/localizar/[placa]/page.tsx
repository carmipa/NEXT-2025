"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EstacionamentoService } from "@/utils/api";
import Link from "next/link";

const MAP_PATH = "/vagas/mapa";

export default function LocalizarPorPlacaPage() {
    const router = useRouter();
    const { placa: raw } = useParams<{ placa: string }>();
    // Limpar e normalizar a placa
    const placa = (raw ?? "").toString().toUpperCase().trim().replace(/[^A-Z0-9]/g, '').slice(0, 7);

    const [msg, setMsg] = useState("Buscando...");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        const run = async () => {
            setIsLoading(true);
            
            if (!placa || placa.length < 7) { 
                setMsg("Placa inválida. A placa deve ter 7 caracteres no formato Mercosul (ABC1D23)."); 
                setIsLoading(false);
                return; 
            }
            
            try {
                // Usar nova API de estacionamentos
                const estacionamento = await EstacionamentoService.buscarAtivoPorPlaca(placa);
                
                if (!alive) return;

                if (estacionamento) {
                    const url = `${MAP_PATH}?highlight=${encodeURIComponent(String(estacionamento.box.idBox))}` +
                        `&placa=${encodeURIComponent(estacionamento.veiculo.placa)}` +
                        `&box=${encodeURIComponent(estacionamento.box.nome)}` +
                        `&patioId=${encodeURIComponent(String(estacionamento.patio.idPatio))}`;
                    router.replace(url);
                } else {
                    setMsg(`Placa ${placa} não encontrada em nenhuma vaga.`);
                    setIsLoading(false);
                }
            } catch (e: any) {
                if (!alive) return;
                
                // Se não encontrar (404), significa que não está estacionado
                if (e.response?.status === 404 || e.status === 404) {
                    setMsg(`Placa ${placa} não encontrada em nenhuma vaga.`);
                } else if (e.response?.status === 400) {
                    setMsg(`Placa inválida: ${e.response?.data?.message || 'Formato de placa inválido.'}`);
                } else {
                    setMsg(`Erro ao buscar: ${e?.message || 'Erro desconhecido'}`);
                }
                setIsLoading(false);
            }
        };
        run();
        return () => { alive = false; };
    }, [placa, router]);

    return (
        <>
            <main className="min-h-screen text-white flex items-center justify-center p-6 relative z-20">
                <div className="max-w-md w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Localizando placa…</h1>
                    <div className="font-mono text-emerald-300 mb-4 text-lg">{placa}</div>
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                            <p className="text-zinc-300">{msg}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-zinc-300 mb-4">{msg}</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => router.push("/radar/buscar")}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                >
                                    Buscar outra placa
                                </button>
                                <Link
                                    href="/radar"
                                    className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white transition-colors text-center"
                                >
                                    Voltar ao Radar
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
