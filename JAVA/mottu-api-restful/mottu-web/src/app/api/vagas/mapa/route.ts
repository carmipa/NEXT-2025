import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patioId = searchParams.get('patioId');
        
        // Se não há patioId, retornar todos os boxes de todos os pátios
        if (!patioId) {
            console.log('🔄 API Route: Buscando dados do mapa sem filtro de pátio (todos os pátios)');
            
            const backendOrigin =
                process.env.NEXT_PUBLIC_BACKEND_ORIGIN
                || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
                || 'http://localhost:8080';

            // Buscar todos os estacionamentos ativos
            const estacionamentosResponse = await fetch(
                `${backendOrigin}/api/estacionamentos/ativos/todos`,
                { cache: 'no-store' }
            );

            const estacionamentosAtivos = estacionamentosResponse.ok 
                ? await estacionamentosResponse.json() 
                : [];

            // Criar mapa de estacionamentos por boxId
            const estacionamentosPorBoxId = new Map(
                estacionamentosAtivos.map((e: any) => {
                    const boxId = e.box?.idBox || e.boxId;
                    if (!boxId) return null;
                    return [boxId, e];
                }).filter((item): item is [number, any] => item !== null)
            );

            // Buscar boxes de todos os pátios
            // Primeiro, buscar lista de pátios usando endpoint paginado
            const patiosResponse = await fetch(
                `${backendOrigin}/api/patios?page=0&size=1000&_t=${Date.now()}`,
                { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }
            );

            if (!patiosResponse.ok) {
                throw new Error(`Erro ao buscar pátios: ${patiosResponse.status}`);
            }

            const patiosData = await patiosResponse.json();
            const patios = patiosData.content || patiosData || [];
            const allBoxes: any[] = [];

            // Buscar boxes de cada pátio
            for (const patio of patios) {
                try {
                    const boxesUrl = `${backendOrigin}/api/patios/${patio.idPatio}/status/A/boxes?page=0&size=1000&sort=nome,asc`;
                    const boxesResponse = await fetch(boxesUrl, { 
                        cache: 'no-store',
                        headers: { 'Cache-Control': 'no-cache' }
                    });
                    
                    if (boxesResponse.ok) {
                        const boxesPage = await boxesResponse.json();
                        const boxes = boxesPage.content || boxesPage || [];
                        allBoxes.push(...boxes);
                    } else {
                        console.warn(`⚠️ Erro ao buscar boxes do pátio ${patio.idPatio}:`, boxesResponse.status, boxesResponse.statusText);
                    }
                } catch (err: any) {
                    console.error(`❌ Erro ao buscar boxes do pátio ${patio.idPatio}:`, err.message || err);
                    // Continuar mesmo se houver erro em um pátio
                }
            }

            // Combinar dados
            const boxesComVeiculo = allBoxes.map((box: any) => {
                const estacionamento = estacionamentosPorBoxId.get(box.idBox);
                // CRÍTICO: Priorizar TB_ESTACIONAMENTO sobre box.status
                // Se não há estacionamento ativo em TB_ESTACIONAMENTO, o box está livre
                const estaOcupado = estacionamento !== undefined;
                const status = estaOcupado ? 'O' : 'L';

                return {
                    idBox: box.idBox,
                    nome: box.nome,
                    status: status,
                    veiculo: estacionamento ? {
                        placa: estacionamento.veiculo?.placa || estacionamento.placa || '',
                        modelo: estacionamento.veiculo?.modelo || estacionamento.modelo || '',
                        fabricante: estacionamento.veiculo?.fabricante || estacionamento.fabricante || '',
                        tagBleId: estacionamento.veiculo?.tagBleId || estacionamento.tagBleId || null
                    } : null
                };
            });

            const data = {
                rows: Math.ceil(Math.sqrt(boxesComVeiculo.length)),
                cols: Math.ceil(Math.sqrt(boxesComVeiculo.length)),
                boxes: boxesComVeiculo
            };

            return NextResponse.json(data);
        }

        // Validar patioId se fornecido
        const patioIdNum = parseInt(patioId, 10);
        if (isNaN(patioIdNum)) {
            return NextResponse.json(
                { error: 'patioId deve ser um número válido' },
                { status: 400 }
            );
        }

        console.log('🔄 API Route: Buscando dados do mapa para pátio:', patioIdNum);

        // Obter URL base do backend
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';

        // Buscar boxes do pátio e estacionamentos ativos em paralelo
        const boxesUrl = `${backendOrigin}/api/patios/${patioIdNum}/status/A/boxes?page=0&size=1000&sort=nome,asc&_t=${Date.now()}`;
        const estacionamentosUrl = `${backendOrigin}/api/estacionamentos/patio/${patioIdNum}/ativos?_t=${Date.now()}`;
        
        console.log('🔗 URLs para buscar:', { boxesUrl, estacionamentosUrl });
        
        let boxesResponse: Response;
        let estacionamentosResponse: Response;
        
        try {
            [boxesResponse, estacionamentosResponse] = await Promise.all([
                fetch(boxesUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                }),
                fetch(estacionamentosUrl, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                })
            ]);
        } catch (fetchError: any) {
            console.error('❌ Erro ao fazer fetch:', fetchError);
            console.error('❌ Tipo do erro:', fetchError.constructor.name);
            console.error('❌ Mensagem:', fetchError.message);
            console.error('❌ Stack:', fetchError.stack);
            throw new Error(`Erro de conexão com o backend: ${fetchError.message}. Verifique se o backend está rodando em ${backendOrigin}`);
        }

        if (!boxesResponse.ok) {
            const errorText = await boxesResponse.text();
            console.error('❌ Erro ao buscar boxes:', boxesResponse.status, errorText);
            throw new Error(`Erro ao buscar boxes: ${boxesResponse.status}`);
        }

        if (!estacionamentosResponse.ok && estacionamentosResponse.status !== 404) {
            const errorText = await estacionamentosResponse.text();
            console.error('❌ Erro ao buscar estacionamentos:', estacionamentosResponse.status, errorText);
            throw new Error(`Erro ao buscar estacionamentos: ${estacionamentosResponse.status}`);
        }

        const boxesPage = await boxesResponse.json();
        const estacionamentosAtivos = estacionamentosResponse.ok 
            ? await estacionamentosResponse.json() 
            : [];

        // Extrair content da página de boxes
        const boxes = boxesPage.content || boxesPage || [];

        console.log('📦 Boxes recebidos:', boxes.length);
        console.log('🚗 Estacionamentos ativos:', estacionamentosAtivos.length);

        // Criar mapa de estacionamentos por boxId para busca rápida
        const estacionamentosPorBoxId = new Map(
            estacionamentosAtivos.map((e: any) => {
                const boxId = e.box?.idBox || e.boxId;
                if (!boxId) {
                    console.warn('⚠️ Estacionamento sem boxId:', e);
                    return null;
                }
                return [boxId, e];
            }).filter((item): item is [number, any] => item !== null)
        );

        console.log('🗺️ Mapa de estacionamentos criado:', estacionamentosPorBoxId.size, 'boxes ocupados');

        // Combinar dados: boxes com informações de estacionamento
        const boxesComVeiculo = boxes.map((box: any) => {
            const estacionamento = estacionamentosPorBoxId.get(box.idBox);
            
            // CRÍTICO: Priorizar TB_ESTACIONAMENTO sobre box.status
            // Se não há estacionamento ativo em TB_ESTACIONAMENTO, o box está livre
            // Mesmo que box.status seja 'O' (legado ou inconsistência)
            const estaOcupado = estacionamento !== undefined;
            const status = estaOcupado ? 'O' : 'L';

            return {
                idBox: box.idBox,
                nome: box.nome,
                status: status,
                veiculo: estacionamento ? {
                    placa: estacionamento.veiculo?.placa || estacionamento.placa || '',
                    modelo: estacionamento.veiculo?.modelo || estacionamento.modelo || '',
                    fabricante: estacionamento.veiculo?.fabricante || estacionamento.fabricante || '',
                    tagBleId: estacionamento.veiculo?.tagBleId || estacionamento.tagBleId || null
                } : null
            };
        });

        const data = {
            rows: Math.ceil(Math.sqrt(boxesComVeiculo.length)),
            cols: Math.ceil(Math.sqrt(boxesComVeiculo.length)),
            boxes: boxesComVeiculo
        };

        console.log('📊 API Route: Dados combinados do mapa:', {
            totalBoxes: data.boxes.length,
            boxesOcupados: data.boxes.filter(b => b.status === 'O').length,
            boxesLivres: data.boxes.filter(b => b.status === 'L').length,
            estacionamentosAtivos: estacionamentosAtivos.length
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('❌ Erro ao buscar dados do mapa:', error);
        console.error('❌ Stack trace:', error.stack);
        console.error('❌ Detalhes do erro:', {
            message: error.message,
            cause: error.cause,
            name: error.name
        });
        
        // Se for erro de fetch (network error), retornar erro mais específico
        if (error.message?.includes('fetch failed') || error.cause?.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { 
                    error: 'Falha ao conectar com o backend', 
                    details: 'Verifique se o backend está rodando em http://localhost:8080' 
                },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { error: 'Falha ao buscar dados do mapa', details: error.message },
            { status: 500 }
        );
    }
}
