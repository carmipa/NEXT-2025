import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { placa: string } }) {
    try {
        const placa = decodeURIComponent(params.placa || '').toUpperCase();
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';

        // Log de entrada
        const urlObj = new URL(request.url);
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        console.log('🔎 [buscar-placa] IN =>', { placa, clientIp, query: Object.fromEntries(urlObj.searchParams.entries()) });

        const backendUrl = `${backendOrigin}/api/vagas/buscar-placa/${encodeURIComponent(placa)}`;
        console.log('🔄 [buscar-placa] Proxy =>', backendUrl);

        const response = await fetch(backendUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });

        const text = await response.text();
        let data: any;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (e) {
            console.warn('⚠️ [buscar-placa] Resposta não-JSON do backend:', text?.slice(0, 500));
            data = { raw: text };
        }

        console.log('✅ [buscar-placa] OUT <=', {
            status: response.status,
            found: data?.found,
            boxId: data?.boxId,
            boxNome: data?.boxNome,
            patioId: data?.patioId,
            placa: data?.placa || placa,
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('❌ [buscar-placa] ERR:', error?.message || error);
        return NextResponse.json({ error: 'Falha ao buscar placa' }, { status: 500 });
    }
}


