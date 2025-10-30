import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = encodeURIComponent(params.id);
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';

        const backendUrl = `${backendOrigin}/api/patios/${id}`;
        console.log('🏢 [patios/:id] Proxy =>', backendUrl);

        const res = await fetch(backendUrl, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
        const text = await res.text();
        let data: any;
        try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error('❌ [patios/:id] ERR:', err?.message || err);
        return NextResponse.json({ error: 'Falha ao buscar pátio' }, { status: 500 });
    }
}


