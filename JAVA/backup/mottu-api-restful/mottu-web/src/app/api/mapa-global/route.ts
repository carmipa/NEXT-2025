import { NextRequest, NextResponse } from 'next/server';

// Cachear o mapa global por 60 segundos (atualiza a cada minuto)
export const revalidate = 60;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
    try {
        console.log('🌐 Proxy: Buscando pátios do mapa global...');
        
        const response = await fetch(`${API_BASE_URL}/api/mapa-global`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('❌ Erro na API:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Erro ao buscar pátios' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('✅ Proxy: Dados recebidos:', data.length, 'pátios');
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Erro no proxy:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
