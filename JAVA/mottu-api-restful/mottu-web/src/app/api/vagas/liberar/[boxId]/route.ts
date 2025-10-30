import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { boxId: string } }) {
    try {
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';

        const boxId = encodeURIComponent(params.boxId);
        const url = `${backendOrigin}/api/vagas/liberar/${boxId}`;

        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
        const text = await resp.text();
        let data: any = null;
        try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

        return NextResponse.json(data, { status: resp.status });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Falha ao liberar vaga' }, { status: 500 });
    }
}


