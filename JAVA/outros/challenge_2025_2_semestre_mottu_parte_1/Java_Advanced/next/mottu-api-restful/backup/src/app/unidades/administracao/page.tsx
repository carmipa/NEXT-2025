// src/app/unidades/administracao/page.tsx
"use client";

/**
 * Administração de Unidades
 * - Abas: Pátios | Zonas | Boxes | Importar Pátios (JSON)
 * - Usa o util de API existente (axios base) para chamar os endpoints atuais.
 * - NÃO altera seu schema Oracle; apenas orquestra os mesmos CRUDs já presentes.
 *
 * Observações:
 * - Se seus services tipados já existem em "@/utils/api" (BoxService/ZonaService/PatioService),
 *   este arquivo usa-os. Caso estejam com nomes ligeiramente diferentes,
 *   ajuste os imports conforme o seu projeto.
 */

import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/nav-bar";
import {
    MdApartment, MdMap, MdViewModule, MdUpload, MdSave, MdClear, MdCheckCircle,
    MdErrorOutline, MdSearch, MdAddCircleOutline, MdChevronLeft, MdChevronRight
} from "react-icons/md";

// ---------- TIPOS BÁSICOS (locais). Se você já os tem em "@/types/*", troque os imports) ----------
type SpringPage<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

type PatioResponseDto = {
    idPatio: number;
    nome: string;
    observacao?: string | null;
};

type PatioRequestDto = {
    nome: string;
    observacao?: string | null;
};

type ZonaResponseDto = {
    idZona: number;
    nome: string;
    observacao?: string | null;
};

type ZonaRequestDto = {
    nome: string;
    observacao?: string | null;
};

type BoxResponseDto = {
    idBox: number;
    nome: string;
    status: "L" | "O";
    dataEntrada?: string;
    dataSaida?: string;
    observacao?: string | null;
};

type BoxRequestDto = {
    nome: string;
    status: "L" | "O";
    dataEntrada: string; // yyyy-MM-dd
    dataSaida: string;   // yyyy-MM-dd
    observacao?: string | null;
};

// ---------- SERVICES ----------
import api from "@/utils/api"; // seu axios base, já existente no projeto (NEXT_PUBLIC_API_BASE_URL etc.) :contentReference[oaicite:3]{index=3}

const PatioService = {
    async listar(page = 0, size = 10, sort = "idPatio,asc"): Promise<SpringPage<PatioResponseDto>> {
        const { data } = await api.get(`/api/patio`, { params: { page, size, sort } });
        return data;
    },
    async create(body: PatioRequestDto): Promise<PatioResponseDto> {
        const { data } = await api.post(`/api/patio`, body);
        return data;
    },
    async getById(id: number): Promise<PatioResponseDto> {
        const { data } = await api.get(`/api/patio/${id}`);
        return data;
    }
};

const ZonaService = {
    async listar(page = 0, size = 10, sort = "idZona,asc"): Promise<SpringPage<ZonaResponseDto>> {
        const { data } = await api.get(`/api/zona`, { params: { page, size, sort } });
        return data;
    },
    async create(body: ZonaRequestDto): Promise<ZonaResponseDto> {
        const { data } = await api.post(`/api/zona`, body);
        return data;
    },
    async getById(id: number): Promise<ZonaResponseDto> {
        const { data } = await api.get(`/api/zona/${id}`);
        return data;
    }
};

const BoxService = {
    async listar(page = 0, size = 12, sort = "idBox,asc"): Promise<SpringPage<BoxResponseDto>> {
        const { data } = await api.get(`/api/box`, { params: { page, size, sort } });
        return data;
    },
    async create(body: BoxRequestDto): Promise<BoxResponseDto> {
        const { data } = await api.post(`/api/box`, body);
        return data;
    },
    async getById(id: number): Promise<BoxResponseDto> {
        const { data } = await api.get(`/api/box/${id}`);
        return data;
    }
};

// ---------- PEÇAS DE UI ----------
function PillTab({
                     label, active, onClick, icon
                 }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition
        ${active ? "bg-white text-[var(--color-mottu-dark)] shadow" : "bg-black/30 text-white hover:bg-black/40"}`}
            aria-pressed={active}
            role="tab"
        >
            {icon} {label}
        </button>
    );
}

function Alert({
                   type, message, onClose
               }: { type: "success" | "error"; message: string; onClose?: () => void }) {
    if (!message) return null;
    const base = type === "success"
        ? "text-green-900 bg-green-200 border-green-400"
        : "text-red-200 bg-red-800/80 border-red-600";
    const Icon = type === "success" ? MdCheckCircle : MdErrorOutline;

    return (
        <div className={`relative p-4 pr-10 rounded border ${base}`} role="alert">
            <div className="flex items-center gap-2">
                <Icon className="text-xl" />
                <span>{message}</span>
            </div>
            {onClose && (
                <button
                    type="button"
                    className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:opacity-80"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <span className="text-xl">&times;</span>
                </button>
            )}
        </div>
    );
}

function SectionCard({
                         title, icon, children
                     }: { title: string; icon: React.ReactNode; children: React.ReactNode; }) {
    return (
        <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl w-full">
            <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold mb-6 text-white">
                {icon} {title}
            </h2>
            <div>{children}</div>
        </div>
    );
}

// ---------- ABAS: FORMULÁRIOS E LISTAS ----------
function PatioTab() {
    // listagem
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<PatioResponseDto> | null>(null);
    const [page, setPage] = useState(0);
    const [loadingList, setLoadingList] = useState(false);
    const [errList, setErrList] = useState("");

    // form
    const [form, setForm] = useState<PatioRequestDto>({ nome: "", observacao: "" });
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState("");
    const [err, setErr] = useState("");

    const fetchData = async (p = 0) => {
        setLoadingList(true); setErrList("");
        try {
            const data = await PatioService.listar(p, 10, "idPatio,asc");
            setPatios(data.content);
            setPageInfo(data);
            setPage(data.number);
        } catch (e: any) {
            setErrList(e?.response?.data?.message || e?.message || "Falha ao listar pátios.");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchData(0); }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true); setOk(""); setErr("");
        try {
            const created = await PatioService.create(form);
            setOk(`Pátio "${created.nome}" (ID: ${created.idPatio}) criado com sucesso.`);
            setForm({ nome: "", observacao: "" });
            fetchData(page); // atualiza lista
        } catch (error: any) {
            setErr(error?.response?.data?.message || error?.message || "Falha ao criar pátio.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Novo Pátio" icon={<MdApartment className="text-2xl" />}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-white text-sm">Nome do Pátio *</span>
                        <input
                            className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            value={form.nome}
                            onChange={(e)=>setForm({...form, nome: e.target.value})}
                            placeholder="Ex.: Pátio Guarulhos"
                            required
                            maxLength={60}
                        />
                    </label>
                    <label className="block">
                        <span className="text-white text-sm">Observação (endereço/resumo)</span>
                        <textarea
                            className="w-full p-2 rounded bg-white text-slate-900"
                            value={form.observacao || ""}
                            onChange={(e)=>setForm({...form, observacao: e.target.value})}
                            rows={3}
                            placeholder="Rua/CEP/cidade ou outras observações…"
                            maxLength={255}
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            className="flex items-center justify-center gap-2 px-5 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md disabled:opacity-50"
                            disabled={saving}
                        >
                            <MdSave size={18}/> {saving ? "Salvando..." : "Salvar Pátio"}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 font-medium text-slate-800 bg-gray-200 rounded-md hover:bg-gray-300"
                            onClick={()=>{ setForm({nome:"", observacao:""}); setErr(""); setOk(""); }}
                        >
                            <MdClear className="inline -mt-1 mr-1"/> Limpar
                        </button>
                    </div>

                    {ok && <Alert type="success" message={ok} onClose={()=>setOk("")} />}
                    {err && <Alert type="error" message={err} onClose={()=>setErr("")} />}
                </form>
            </SectionCard>

            <SectionCard title="Pátios cadastrados" icon={<MdSearch className="text-2xl" />}>
                {loadingList && <p className="text-white/90">Carregando...</p>}
                {errList && <Alert type="error" message={errList} onClose={()=>setErrList("")} />}
                {!loadingList && !errList && (
                    <>
                        <ul className="space-y-3">
                            {patios.map((p)=>(
                                <li key={p.idPatio} className="bg-white rounded p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-800 font-bold">{p.nome}</p>
                                        {p.observacao && <p className="text-slate-600 text-sm">{p.observacao}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/patio/detalhes/${p.idPatio}`} className="text-blue-700 hover:underline">Detalhes</Link>
                                        <Link href={`/patio/alterar/${p.idPatio}`} className="text-yellow-700 hover:underline">Editar</Link>
                                        <Link href={`/patio/deletar/${p.idPatio}`} className="text-red-700 hover:underline">Excluir</Link>
                                    </div>
                                </li>
                            ))}
                            {patios.length === 0 && <li className="text-white/90">Nenhum pátio cadastrado.</li>}
                        </ul>
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    disabled={page <= 0}
                                    onClick={()=>fetchData(page-1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    <MdChevronLeft/> Anterior
                                </button>
                                <span className="text-white/80 text-sm">
                  Página {pageInfo.number + 1} de {pageInfo.totalPages}
                </span>
                                <button
                                    disabled={page >= pageInfo.totalPages - 1}
                                    onClick={()=>fetchData(page+1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    Próxima <MdChevronRight/>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </SectionCard>
        </div>
    );
}

function ZonaTab() {
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ZonaResponseDto> | null>(null);
    const [page, setPage] = useState(0);
    const [loadingList, setLoadingList] = useState(false);
    const [errList, setErrList] = useState("");

    const [form, setForm] = useState<ZonaRequestDto>({ nome: "", observacao: "" });
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState("");
    const [err, setErr] = useState("");

    const fetchData = async (p = 0) => {
        setLoadingList(true); setErrList("");
        try {
            const data = await ZonaService.listar(p, 10, "idZona,asc");
            setZonas(data.content);
            setPageInfo(data);
            setPage(data.number);
        } catch (e: any) {
            setErrList(e?.response?.data?.message || e?.message || "Falha ao listar zonas.");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchData(0); }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true); setOk(""); setErr("");
        try {
            const created = await ZonaService.create(form);
            setOk(`Zona "${created.nome}" (ID: ${created.idZona}) criada com sucesso.`);
            setForm({ nome: "", observacao: "" });
            fetchData(page);
        } catch (error: any) {
            setErr(error?.response?.data?.message || error?.message || "Falha ao criar zona.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Nova Zona" icon={<MdMap className="text-2xl" />}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-white text-sm">Nome da Zona *</span>
                        <input
                            className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            value={form.nome}
                            onChange={(e)=>setForm({...form, nome: e.target.value})}
                            placeholder="Ex.: Zona Coberta A"
                            required
                            maxLength={60}
                        />
                    </label>
                    <label className="block">
                        <span className="text-white text-sm">Observação</span>
                        <textarea
                            className="w-full p-2 rounded bg-white text-slate-900"
                            value={form.observacao || ""}
                            onChange={(e)=>setForm({...form, observacao: e.target.value})}
                            rows={3}
                            placeholder="Características dessa zona…"
                            maxLength={255}
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            className="flex items-center justify-center gap-2 px-5 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md disabled:opacity-50"
                            disabled={saving}
                        >
                            <MdSave size={18}/> {saving ? "Salvando..." : "Salvar Zona"}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 font-medium text-slate-800 bg-gray-200 rounded-md hover:bg-gray-300"
                            onClick={()=>{ setForm({nome:"", observacao:""}); setErr(""); setOk(""); }}
                        >
                            <MdClear className="inline -mt-1 mr-1"/> Limpar
                        </button>
                    </div>

                    {ok && <Alert type="success" message={ok} onClose={()=>setOk("")} />}
                    {err && <Alert type="error" message={err} onClose={()=>setErr("")} />}
                </form>
            </SectionCard>

            <SectionCard title="Zonas cadastradas" icon={<MdSearch className="text-2xl" />}>
                {loadingList && <p className="text-white/90">Carregando...</p>}
                {errList && <Alert type="error" message={errList} onClose={()=>setErrList("")} />}
                {!loadingList && !errList && (
                    <>
                        <ul className="space-y-3">
                            {zonas.map((z)=>(
                                <li key={z.idZona} className="bg-white rounded p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-800 font-bold">{z.nome}</p>
                                        {z.observacao && <p className="text-slate-600 text-sm">{z.observacao}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/zona/detalhes/${z.idZona}`} className="text-blue-700 hover:underline">Detalhes</Link>
                                        <Link href={`/zona/alterar/${z.idZona}`} className="text-yellow-700 hover:underline">Editar</Link>
                                        <Link href={`/zona/deletar/${z.idZona}`} className="text-red-700 hover:underline">Excluir</Link>
                                    </div>
                                </li>
                            ))}
                            {zonas.length === 0 && <li className="text-white/90">Nenhuma zona cadastrada.</li>}
                        </ul>
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    disabled={page <= 0}
                                    onClick={()=>fetchData(page-1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    <MdChevronLeft/> Anterior
                                </button>
                                <span className="text-white/80 text-sm">
                  Página {pageInfo.number + 1} de {pageInfo.totalPages}
                </span>
                                <button
                                    disabled={page >= pageInfo.totalPages - 1}
                                    onClick={()=>fetchData(page+1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    Próxima <MdChevronRight/>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </SectionCard>
        </div>
    );
}

function BoxTab() {
    const today = useMemo(()=> new Date().toISOString().split("T")[0], []);
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<BoxResponseDto> | null>(null);
    const [page, setPage] = useState(0);
    const [loadingList, setLoadingList] = useState(false);
    const [errList, setErrList] = useState("");

    const [form, setForm] = useState<BoxRequestDto>({
        nome: "", status: "L", dataEntrada: today, dataSaida: today, observacao: ""
    });
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState("");
    const [err, setErr] = useState("");

    const fetchData = async (p = 0) => {
        setLoadingList(true); setErrList("");
        try {
            const data = await BoxService.listar(p, 12, "idBox,asc");
            setBoxes(data.content);
            setPageInfo(data);
            setPage(data.number);
        } catch (e: any) {
            setErrList(e?.response?.data?.message || e?.message || "Falha ao listar boxes.");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchData(0); }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true); setOk(""); setErr("");
        try {
            const created = await BoxService.create(form);
            setOk(`Box "${created.nome}" (ID: ${created.idBox}) criado com sucesso.`);
            setForm({ ...form, nome: "", observacao: "" });
            fetchData(page);
        } catch (error: any) {
            setErr(error?.response?.data?.message || error?.message || "Falha ao criar box.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Novo Box" icon={<MdViewModule className="text-2xl" />}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-white text-sm">Nome do Box *</span>
                        <input
                            className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            value={form.nome}
                            onChange={(e)=>setForm({...form, nome: e.target.value})}
                            placeholder="Ex.: A-01"
                            required
                            maxLength={50}
                        />
                    </label>

                    <label className="block">
                        <span className="text-white text-sm">Status *</span>
                        <select
                            className="w-full p-2 h-10 rounded bg-white text-slate-900"
                            value={form.status}
                            onChange={(e)=>setForm({...form, status: e.target.value as "L" | "O"})}
                            required
                        >
                            <option value="L">Livre</option>
                            <option value="O">Ocupado</option>
                        </select>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-white text-sm">Data Entrada *</span>
                            <input
                                type="date"
                                className="w-full p-2 h-10 rounded bg-white text-slate-900"
                                value={form.dataEntrada}
                                onChange={(e)=>setForm({...form, dataEntrada: e.target.value})}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-white text-sm">Data Saída *</span>
                            <input
                                type="date"
                                className="w-full p-2 h-10 rounded bg-white text-slate-900"
                                value={form.dataSaida}
                                onChange={(e)=>setForm({...form, dataSaida: e.target.value})}
                                required
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-white text-sm">Observação</span>
                        <textarea
                            className="w-full p-2 rounded bg-white text-slate-900"
                            value={form.observacao || ""}
                            onChange={(e)=>setForm({...form, observacao: e.target.value})}
                            rows={3}
                            maxLength={255}
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            className="flex items-center justify-center gap-2 px-5 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md disabled:opacity-50"
                            disabled={saving}
                        >
                            <MdSave size={18}/> {saving ? "Salvando..." : "Salvar Box"}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 font-medium text-slate-800 bg-gray-200 rounded-md hover:bg-gray-300"
                            onClick={()=>{ setForm({ ...form, nome: "", observacao: "" }); setErr(""); setOk(""); }}
                        >
                            <MdClear className="inline -mt-1 mr-1"/> Limpar
                        </button>
                    </div>

                    {ok && <Alert type="success" message={ok} onClose={()=>setOk("")} />}
                    {err && <Alert type="error" message={err} onClose={()=>setErr("")} />}
                </form>
            </SectionCard>

            <SectionCard title="Boxes cadastrados" icon={<MdSearch className="text-2xl" />}>
                {loadingList && <p className="text-white/90">Carregando...</p>}
                {errList && <Alert type="error" message={errList} onClose={()=>setErrList("")} />}
                {!loadingList && !errList && (
                    <>
                        <ul className="space-y-3">
                            {boxes.map((b)=>(
                                <li key={b.idBox} className="bg-white rounded p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-800 font-bold">{b.nome}</p>
                                        <p className={`text-sm font-bold ${b.status === "L" ? "text-green-600" : "text-red-600"}`}>
                                            {b.status === "L" ? "Livre" : "Ocupado"}
                                        </p>
                                        {b.observacao && <p className="text-slate-600 text-sm">{b.observacao}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/box/detalhes/${b.idBox}`} className="text-blue-700 hover:underline">Detalhes</Link>
                                        <Link href={`/box/alterar/${b.idBox}`} className="text-yellow-700 hover:underline">Editar</Link>
                                        <Link href={`/box/deletar/${b.idBox}`} className="text-red-700 hover:underline">Excluir</Link>
                                    </div>
                                </li>
                            ))}
                            {boxes.length === 0 && <li className="text-white/90">Nenhum box cadastrado.</li>}
                        </ul>
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    disabled={page <= 0}
                                    onClick={()=>fetchData(page-1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    <MdChevronLeft/> Anterior
                                </button>
                                <span className="text-white/80 text-sm">
                  Página {pageInfo.number + 1} de {pageInfo.totalPages}
                </span>
                                <button
                                    disabled={page >= pageInfo.totalPages - 1}
                                    onClick={()=>fetchData(page+1)}
                                    className="px-3 py-1 bg-black/30 text-white rounded disabled:opacity-50 flex items-center gap-1"
                                >
                                    Próxima <MdChevronRight/>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </SectionCard>
        </div>
    );
}

type PatioJsonItem = {
    estado?: string | null;
    cidade?: string | null;
    bairro?: string | null;
    logradouro?: string | null;
    cep?: string | null;
    observacao?: string | null;
};

function ImportTab() {
    const [fileName, setFileName] = useState<string>("");
    const [items, setItems] = useState<PatioJsonItem[]>([]);
    const [ok, setOk] = useState("");
    const [err, setErr] = useState("");
    const [creating, setCreating] = useState(false);

    // Lê um arquivo JSON no formato do seu /mnt/data/mottu_patios.json e popula `items`.
    const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
        setOk(""); setErr(""); setItems([]);
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            // Tenta ler em json.patios_mottu[] (como no exemplo que você mandou)
            const arr: PatioJsonItem[] = Array.isArray(json) ? json
                : Array.isArray(json?.patios_mottu) ? json.patios_mottu
                    : [];
            if (!Array.isArray(arr) || arr.length === 0) {
                setErr("JSON sem itens reconhecíveis (esperado campo 'patios_mottu' ou array raiz).");
                return;
            }
            setItems(arr);
        } catch (e: any) {
            setErr(e?.message || "Falha ao ler o arquivo JSON.");
        }
    };

    const montarObservacao = (i: PatioJsonItem) => {
        const partes = [
            i.logradouro || undefined,
            i.bairro || undefined,
            i.cidade || undefined,
            i.estado || undefined,
            i.cep ? `CEP ${i.cep}` : undefined,
            i.observacao || undefined
        ].filter(Boolean);
        return partes.join(" | ");
    };

    const enviarTudo = async () => {
        if (items.length === 0) return;
        setCreating(true); setOk(""); setErr("");
        let okCount = 0; let failCount = 0;

        for (const it of items) {
            const nome = [it.cidade, it.bairro].filter(Boolean).join(" - ") || (it.cidade ?? "Pátio");
            const obs = montarObservacao(it);
            try {
                await PatioService.create({ nome, observacao: obs });
                okCount++;
            } catch {
                failCount++;
            }
        }
        setCreating(false);
        setOk(`Importação concluída. Sucesso: ${okCount} | Falhas: ${failCount}`);
    };

    return (
        <div className="space-y-6">
            <SectionCard title="Importar Pátios (JSON)" icon={<MdUpload className="text-2xl" />}>
                <div className="space-y-4">
                    <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFile}
                        className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold
                       file:bg-white file:text-[var(--color-mottu-dark)] hover:file:bg-gray-100"
                        aria-label="Selecionar arquivo JSON de pátios"
                    />
                    {fileName && <p className="text-white/80 text-sm">Arquivo selecionado: <b>{fileName}</b></p>}

                    {err && <Alert type="error" message={err} onClose={()=>setErr("")} />}
                    {ok && <Alert type="success" message={ok} onClose={()=>setOk("")} />}

                    {items.length > 0 && (
                        <>
                            <p className="text-white/80 text-sm">
                                Itens reconhecidos: <b>{items.length}</b>. Revise abaixo um preview antes de enviar.
                            </p>
                            <div className="max-h-64 overflow-auto rounded bg-white">
                                <table className="w-full text-sm text-slate-800">
                                    <thead className="bg-slate-100 sticky top-0">
                                    <tr>
                                        <th className="text-left p-2">Cidade</th>
                                        <th className="text-left p-2">Bairro</th>
                                        <th className="text-left p-2">Logradouro</th>
                                        <th className="text-left p-2">CEP</th>
                                        <th className="text-left p-2">Observação</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {items.map((i, idx)=>(
                                        <tr key={idx} className="border-t">
                                            <td className="p-2">{i.cidade || "-"}</td>
                                            <td className="p-2">{i.bairro || "-"}</td>
                                            <td className="p-2">{i.logradouro || "-"}</td>
                                            <td className="p-2">{i.cep || "-"}</td>
                                            <td className="p-2">{montarObservacao(i) || "-"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                onClick={enviarTudo}
                                disabled={creating}
                                className="mt-4 flex items-center gap-2 px-5 py-2 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md disabled:opacity-50"
                            >
                                <MdAddCircleOutline size={20}/> {creating ? "Importando..." : "Importar tudo como Pátios"}
                            </button>
                        </>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}

// ---------- PÁGINA PRINCIPAL ----------
export default function AdministracaoUnidadesPage() {
    const router = useRouter();
    const [active, setActive] = useState<"patios" | "zonas" | "boxes" | "import">("patios");

    return (
        <>
            <NavBar active="patio" />
            <main className="min-h-screen bg-black text-white">
                <header className="bg-[var(--color-mottu-default)] py-8 shadow">
                    <div className="container mx-auto px-4">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            Administração de Unidades
                        </h1>
                        <p className="text-white/90 mt-2 text-sm">
                            Gerencie Pátios, Zonas e Boxes e faça importação rápida de pátios via JSON.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4" role="tablist" aria-label="Abas de Administração">
                            <PillTab label="Pátios"  active={active==="patios"}  onClick={()=>setActive("patios")}  icon={<MdApartment/>} />
                            <PillTab label="Zonas"   active={active==="zonas"}   onClick={()=>setActive("zonas")}   icon={<MdMap/>} />
                            <PillTab label="Boxes"   active={active==="boxes"}   onClick={()=>setActive("boxes")}   icon={<MdViewModule/>} />
                            <PillTab label="Importar Pátios (JSON)" active={active==="import"} onClick={()=>setActive("import")} icon={<MdUpload/>} />
                        </div>
                    </div>
                </header>

                <section className="container mx-auto px-4 py-8 space-y-6">
                    {active === "patios"  && <PatioTab />}
                    {active === "zonas"   && <ZonaTab />}
                    {active === "boxes"   && <BoxTab />}
                    {active === "import"  && <ImportTab />}
                </section>

                <footer className="container mx-auto px-4 pb-10 text-center text-white/50 text-xs">
                    Dica: caso prefira usar as telas de CRUD já existentes, elas continuam ativas em
                    {" "}<Link href="/patio/listar" className="underline">/patio/*</Link>,
                    {" "}<Link href="/zona/listar" className="underline">/zona/*</Link> e
                    {" "}<Link href="/box/listar" className="underline">/box/*</Link>. :contentReference[oaicite:4]{index=4}
                </footer>
            </main>
            <style jsx global>{`
        :root { --color-mottu-dark: #102d1a; --color-mottu-default: #1e8c4f; }
      `}</style>
        </>
    );
}
