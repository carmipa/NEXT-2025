import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { boxId: string } }) {
    try {
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';

        const boxId = params.boxId;
        console.log('🔓 [API Route] Tentando liberar box:', boxId);
        
        // Primeiro, tentar buscar o estacionamento ativo por boxId
        try {
            const buscarUrl = `${backendOrigin}/api/estacionamentos/search?boxId=${boxId}&estaEstacionado=true&size=1`;
            console.log('🔍 [API Route] Buscando estacionamento ativo:', buscarUrl);
            
            const buscarResponse = await fetch(buscarUrl, { 
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 [API Route] Resposta da busca:', {
                status: buscarResponse.status,
                ok: buscarResponse.ok
            });

            if (buscarResponse.ok) {
                const buscarData = await buscarResponse.json();
                console.log('📋 [API Route] Dados da busca:', buscarData);
                
                const estacionamento = buscarData.content?.[0];

                if (estacionamento && estacionamento.veiculo?.placa) {
                    console.log('✅ [API Route] Estacionamento encontrado, liberando box específico:', boxId);
                    
                    // CRÍTICO: Liberar apenas o box específico, não todos os estacionamentos da placa
                    const liberarUrl = `${backendOrigin}/api/estacionamentos/liberar/box/${boxId}`;
                    console.log('🔓 [API Route] Chamando endpoint de liberação por boxId:', liberarUrl);
                    
                    const liberarResponse = await fetch(liberarUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store'
                    });

                    console.log('📥 [API Route] Resposta da liberação:', {
                        status: liberarResponse.status,
                        ok: liberarResponse.ok
                    });

                    if (!liberarResponse.ok) {
                        const errorText = await liberarResponse.text();
                        console.error('❌ [API Route] Erro ao liberar estacionamento:', liberarResponse.status, errorText);
                        return NextResponse.json(
                            { error: `Erro ao liberar estacionamento: ${errorText}` },
                            { status: liberarResponse.status }
                        );
                    }

                    const liberarData = await liberarResponse.json();
                    console.log('✅ [API Route] Estacionamento liberado com sucesso:', liberarData);
                    return NextResponse.json({ ok: true, boxId: Number(boxId), ...liberarData });
                } else {
                    console.warn('⚠️ [API Route] Estacionamento não encontrado ou sem placa, tentando endpoint antigo');
                }
            } else {
                const errorText = await buscarResponse.text().catch(() => buscarResponse.statusText);
                console.warn('⚠️ [API Route] Erro ao buscar estacionamento:', buscarResponse.status, errorText);
            }
        } catch (estacionamentoError: any) {
            console.warn('⚠️ [API Route] Erro ao buscar por estacionamento, tentando endpoint antigo:', estacionamentoError.message);
        }

        // Fallback: tentar o endpoint antigo /api/vagas/liberar/{boxId}
        console.log('🔄 [API Route] Tentando endpoint antigo:', `${backendOrigin}/api/vagas/liberar/${boxId}`);
        const url = `${backendOrigin}/api/vagas/liberar/${encodeURIComponent(boxId)}`;
        const resp = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            cache: 'no-store' 
        });
        
        console.log('📥 [API Route] Resposta do endpoint antigo:', {
            status: resp.status,
            ok: resp.ok
        });
        
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('❌ [API Route] Erro ao liberar vaga (endpoint antigo):', resp.status, errorText);
            return NextResponse.json(
                { error: `Erro ao liberar vaga: ${errorText}` },
                { status: resp.status }
            );
        }

        const text = await resp.text();
        let data: any = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { raw: text, ok: true };
        }

        console.log('✅ [API Route] Vaga liberada (endpoint antigo):', data);
        return NextResponse.json(data, { status: resp.status });
    } catch (err: any) {
        console.error('❌ [API Route] Erro geral ao liberar vaga:', err);
        return NextResponse.json(
            { error: err?.message || 'Falha ao liberar vaga' },
            { status: 500 }
        );
    }
}


