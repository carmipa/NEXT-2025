import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Fazer proxy para o backend Java
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        const { searchParams } = new URL(request.url);
        
        // Construir URL com todos os parâmetros
        const backendUrlWithParams = new URL(`${backendUrl}/api/vagas/mapa`);
        searchParams.forEach((value, key) => {
            backendUrlWithParams.searchParams.set(key, value);
        });
        
        console.log('🔄 API Route: Fazendo proxy para:', backendUrlWithParams.toString());
        
        const response = await fetch(backendUrlWithParams.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 60, // Cache por 1 minuto
                tags: ['mapas', 'vagas']
            }
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 API Route: Dados recebidos do backend:', {
            totalBoxes: data.boxes?.length,
            firstBox: data.boxes?.[0],
            lastBox: data.boxes?.[data.boxes?.length - 1]
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar dados do mapa:', error);
        return NextResponse.json(
            { error: 'Falha ao buscar dados do mapa' },
            { status: 500 }
        );
    }
}
