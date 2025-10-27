import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, apiRequest } from '@/config/api';

// Interface para a resposta da API
interface VagaCompleta {
    idBox: number;
    nome: string;
    status: 'L' | 'O' | 'M'; // L=Livre, O=Ocupado, M=Manutenção
    dataEntrada: string;
    dataSaida: string;
    observacao?: string;
    patio: {
        idPatio: number;
        nomePatio: string;
        endereco?: {
            logradouro: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
            cep: string;
            latitude?: number;
            longitude?: number;
        };
    };
    veiculo?: {
        idVeiculo: number;
        placa: string;
        modelo: string;
        cor: string;
        cliente: {
            nome: string;
            telefone: string;
        };
    };
}

// Função para buscar dados da API backend
async function fetchVagasCompletas(): Promise<VagaCompleta[]> {
    try {
        console.log('🏢 Buscando pátios...');
        // Buscar todos os pátios primeiro
        const patiosResponse = await apiRequest<any>(API_CONFIG.ENDPOINTS.PATIO.LISTAR);
        const patios = patiosResponse.content || [];
        console.log('📋 Pátios encontrados:', patios.length);

        // Para cada pátio, buscar os boxes
        const vagasCompletas: VagaCompleta[] = [];
        
        for (const patio of patios) {
            console.log(`🔍 Processando pátio: ${patio.nomePatio} (ID: ${patio.idPatio})`);
            try {
                // Buscar boxes do pátio
                const mapaData = await apiRequest<any>(`${API_CONFIG.ENDPOINTS.BOX.MAPA}?patioId=${patio.idPatio}`);
                console.log(`📦 Boxes encontrados no pátio ${patio.nomePatio}:`, mapaData.boxes?.length || 0);
                
                // Processar cada box
                if (mapaData.boxes) {
                    for (const box of mapaData.boxes) {
                        const vagaCompleta: VagaCompleta = {
                            idBox: box.idBox,
                            nome: box.nome,
                            status: box.status,
                            dataEntrada: box.dataEntrada,
                            dataSaida: box.dataSaida,
                            observacao: box.observacao,
                            patio: {
                                idPatio: patio.idPatio,
                                nomePatio: patio.nomePatio,
                                endereco: patio.endereco ? {
                                    logradouro: patio.endereco.logradouro,
                                    numero: patio.endereco.numero,
                                    complemento: patio.endereco.complemento,
                                    bairro: patio.endereco.bairro,
                                    cidade: patio.endereco.cidade,
                                    estado: patio.endereco.estado,
                                    cep: patio.endereco.cep,
                                    latitude: patio.endereco.latitude,
                                    longitude: patio.endereco.longitude
                                } : undefined
                            }
                        };

                        // Se o box estiver ocupado, buscar dados do veículo
                        if (box.status === 'O' && box.veiculo) {
                            vagaCompleta.veiculo = {
                                idVeiculo: box.veiculo.idVeiculo,
                                placa: box.veiculo.placa,
                                modelo: box.veiculo.modelo,
                                cor: box.veiculo.cor,
                                cliente: box.veiculo.cliente ? {
                                    nome: box.veiculo.cliente.nome,
                                    telefone: box.veiculo.cliente.telefone
                                } : {
                                    nome: 'N/A',
                                    telefone: 'N/A'
                                }
                            };
                        }

                        vagasCompletas.push(vagaCompleta);
                    }
                }
            } catch (error) {
                console.error(`Erro ao buscar boxes do pátio ${patio.nomePatio}:`, error);
                continue;
            }
        }

        console.log('✅ Total de vagas processadas:', vagasCompletas.length);
        return vagasCompletas;
    } catch (error) {
        console.error('Erro ao buscar vagas completas:', error);
        throw error;
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('🚀 Iniciando busca de vagas...');
        const { searchParams } = new URL(request.url);
        
        // Parâmetros de filtro opcionais
        const patioId = searchParams.get('patioId');
        const status = searchParams.get('status');
        const placa = searchParams.get('placa');
        const nomeBox = searchParams.get('nomeBox');

        console.log('📋 Filtros aplicados:', { patioId, status, placa, nomeBox });

        // Buscar todas as vagas
        let vagas = await fetchVagasCompletas();
        console.log('📊 Total de vagas encontradas:', vagas.length);

        // Aplicar filtros
        if (patioId) {
            vagas = vagas.filter(vaga => vaga.patio.idPatio === parseInt(patioId));
        }

        if (status) {
            vagas = vagas.filter(vaga => vaga.status === status);
        }

        if (placa) {
            vagas = vagas.filter(vaga => 
                vaga.veiculo?.placa.toLowerCase().includes(placa.toLowerCase())
            );
        }

        if (nomeBox) {
            vagas = vagas.filter(vaga => 
                vaga.nome.toLowerCase().includes(nomeBox.toLowerCase())
            );
        }

        // Estatísticas resumidas
        const estatisticas = {
            total: vagas.length,
            livres: vagas.filter(v => v.status === 'L').length,
            ocupados: vagas.filter(v => v.status === 'O').length,
            manutencao: vagas.filter(v => v.status === 'M').length,
            patios: [...new Set(vagas.map(v => v.patio.idPatio))].length
        };

        return NextResponse.json({
            success: true,
            data: vagas,
            estatisticas,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro na API /api/vagas/status/all:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
