// src/app/api/geocode/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'O endereço é obrigatório' }, { status: 400 });
  }

  try {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    // Adicionando um User-Agent, que é uma boa prática para a API do Nominatim
    const geoResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'Mottu-Web-App/1.0 (seu-contato@exemplo.com)' // É recomendado usar um contato real
      }
    });

    if (!geoResponse.ok) {
      const errorText = await geoResponse.text();
      console.error(`Falha na API Nominatim: ${geoResponse.status}`, errorText);
      return NextResponse.json({ error: `Falha ao buscar coordenadas: ${geoResponse.statusText}` }, { status: geoResponse.status });
    }

    const geoData = await geoResponse.json();

    return NextResponse.json(geoData);

  } catch (error) {
    console.error('Erro interno no proxy de geocodificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao processar a geocodificação.' }, { status: 500 });
  }
}
