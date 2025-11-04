import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint /api/vagas
 * Retorna todas as vagas com informações de veículos estacionados
 * ATUALIZADO: Usa nova API de estacionamentos (TB_ESTACIONAMENTO)
 * Formato compatível com VagaCompleta para mapa-box
 */
export async function GET(request: NextRequest) {
    try {
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';
        
        console.log('🔍 [api/vagas] Buscando vagas do backend usando nova API:', backendOrigin);
        
        // Buscar todos os pátios com endereço
        const patiosResponse = await fetch(`${backendOrigin}/api/patios?page=0&size=1000`, {
            cache: 'no-store'
        });
        
        if (!patiosResponse.ok) {
            throw new Error(`Erro ao buscar pátios: ${patiosResponse.status}`);
        }
        
        const patiosData = await patiosResponse.json();
        const patios = patiosData.content || [];
        console.log('📋 [api/vagas] Pátios encontrados:', patios.length);
        
        // Criar mapa de pátios por ID para busca rápida
        const patiosMap = new Map(
            patios.map((p: any) => [p.idPatio, {
                idPatio: p.idPatio,
                nomePatio: p.nomePatio,
                endereco: p.endereco || { cidade: '', estado: '' }
            }])
        );
        
        const vagas: any[] = [];
        
        // Para cada pátio, buscar boxes e estacionamentos em paralelo
        const promises = patios.map(async (patio: any) => {
            try {
                // Buscar boxes do pátio e estacionamentos ativos em paralelo
                const [boxesResponse, estacionamentosResponse] = await Promise.all([
                    fetch(`${backendOrigin}/api/patios/${patio.idPatio}/status/A/boxes?page=0&size=1000&sort=nome,asc`, {
                        cache: 'no-store'
                    }),
                    fetch(`${backendOrigin}/api/estacionamentos/patio/${patio.idPatio}/ativos`, {
                        cache: 'no-store'
                    })
                ]);
                
                if (!boxesResponse.ok) {
                    console.warn(`⚠️ Erro ao buscar boxes do pátio ${patio.nomePatio}: ${boxesResponse.status}`);
                    return [];
                }
                
                const boxesPage = await boxesResponse.json();
                const boxes = boxesPage.content || boxesPage || [];
                
                const estacionamentosAtivos = estacionamentosResponse.ok 
                    ? await estacionamentosResponse.json() 
                    : [];
                
                // Criar mapa de estacionamentos por boxId
                const estacionamentosPorBoxId = new Map(
                    estacionamentosAtivos.map((e: any) => {
                        const boxId = e.box?.idBox || e.boxId;
                        return boxId ? [boxId, e] : null;
                    }).filter((item): item is [number, any] => item !== null)
                );
                
                // Transformar boxes em vagas completas
                const vagasPatio = boxes.map((box: any) => {
                    const estacionamento = estacionamentosPorBoxId.get(box.idBox);
                    const estaOcupado = estacionamento !== undefined || box.status === 'O';
                    const status = estaOcupado ? 'O' : 'L';
                    
                    return {
                        idBox: box.idBox,
                        nome: box.nome || `Box ${box.idBox}`,
                        nomeBox: box.nome || `Box ${box.idBox}`,
                        status: status, // 'L' = Livre (verde), 'O' = Ocupado (vermelho)
                        dataEntrada: box.dataEntrada || null,
                        dataSaida: box.dataSaida || null,
                        patio: {
                            idPatio: patio.idPatio,
                            nomePatio: patio.nomePatio,
                            endereco: {
                                cidade: patio.endereco?.cidade || '',
                                estado: patio.endereco?.estado || ''
                            }
                        },
                        veiculo: estacionamento ? {
                            placa: estacionamento.veiculo?.placa || '',
                            modelo: estacionamento.veiculo?.modelo || '',
                            fabricante: estacionamento.veiculo?.fabricante || ''
                        } : null
                    };
                });
                
                // Log para debug
                if (vagasPatio.length > 0) {
                    const ocupadas = vagasPatio.filter(v => v.status === 'O').length;
                    const livres = vagasPatio.filter(v => v.status === 'L').length;
                    console.log(`📊 [api/vagas] Pátio ${patio.nomePatio}: ${vagasPatio.length} vagas (${livres} livres, ${ocupadas} ocupadas)`);
                }
                
                return vagasPatio;
            } catch (error) {
                console.error(`❌ Erro ao buscar boxes do pátio ${patio.nomePatio}:`, error);
                return [];
            }
        });
        
        // Aguardar todas as promessas e achatá-las
        const vagasPorPatio = await Promise.all(promises);
        vagas.push(...vagasPorPatio.flat());
        
        console.log('✅ [api/vagas] Total de vagas processadas:', vagas.length);
        console.log('📊 [api/vagas] Vagas ocupadas:', vagas.filter(v => v.status === 'O' && v.veiculo).length);
        console.log('📊 [api/vagas] Vagas livres:', vagas.filter(v => v.status === 'L').length);
        
        // Retornar array direto (sem wrapper) para compatibilidade
        return NextResponse.json(vagas, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar vagas:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao buscar vagas',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

