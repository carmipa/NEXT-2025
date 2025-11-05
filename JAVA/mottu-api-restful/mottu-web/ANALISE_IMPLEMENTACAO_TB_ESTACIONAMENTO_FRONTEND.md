# 📊 ANÁLISE PROFUNDA: Implementação TB_ESTACIONAMENTO no Frontend

## 🎯 OBJETIVO
Integrar a nova tabela `TB_ESTACIONAMENTO` no frontend Next.js, substituindo a lógica antiga baseada em múltiplos JOINs e melhorando a performance e experiência do usuário.

---

## 📋 SITUAÇÃO ATUAL

### **1. Estrutura Atual de Estacionamento**

#### **Arquivos Envolvidos:**
- `src/app/api/vagas/route.ts` - Busca vagas (usa boxes com veículos)
- `src/app/api/vagas/buscar-placa/[placa]/route.ts` - Busca por placa
- `src/app/api/vagas/liberar/[boxId]/route.ts` - Libera vaga
- `src/utils/api.ts` - `EstacionamentoService` básico (2 métodos)
- `src/app/radar/armazenar/page.tsx` - Estacionar veículo
- `src/app/dashboard/page.tsx` - Dashboard com SSE
- `src/app/veiculo/status/page.tsx` - Status de veículos
- `src/app/vagas/mapa/page.tsx` - Mapa de vagas

#### **Problemas Identificados:**
1. ❌ **Múltiplas chamadas API**: Busca boxes, depois veículos, depois faz JOIN no frontend
2. ❌ **SSE ineficiente**: Usa endpoint `/veiculos/estacionados/stream` que faz JOINs complexos
3. ❌ **Sem tipos TypeScript**: Não há DTOs específicos para Estacionamento
4. ❌ **Lógica espalhada**: Lógica de estacionamento está em vários lugares
5. ❌ **Performance**: Carrega todos os boxes e faz filtros no frontend

---

## 🔄 MUDANÇAS NECESSÁRIAS

### **1. Criar Tipos TypeScript**

**Arquivo:** `src/types/estacionamento.d.ts`

```typescript
export interface EstacionamentoRequestDto {
    veiculoId: number;
    boxId: number;
    patioId: number;
    estaEstacionado?: boolean;
    dataEntrada?: string;
    dataSaida?: string;
    observacoes?: string;
}

export interface EstacionamentoResponseDto {
    idEstacionamento: number;
    veiculo: {
        idVeiculo: number;
        placa: string;
        modelo: string;
        fabricante: string;
        tagBleId?: string;
        status?: string;
    };
    box: {
        idBox: number;
        nome: string;
        status: string;
        dataEntrada?: string;
        dataSaida?: string;
    };
    patio: {
        idPatio: number;
        nomePatio: string;
        status?: string;
    };
    estaEstacionado: boolean;
    dataEntrada: string;
    dataSaida?: string;
    dataUltimaAtualizacao: string;
    observacoes?: string;
    tempoEstacionadoMinutos?: number;
}

export interface EstacionamentoFilter {
    veiculoId?: number;
    placa?: string;
    modelo?: string;
    fabricante?: string;
    boxId?: number;
    boxNome?: string;
    boxStatus?: string;
    patioId?: number;
    patioNome?: string;
    estaEstacionado?: boolean;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacoes?: string;
    tempoMinimoMinutos?: number;
    tempoMaximoMinutos?: number;
}

export interface PlacaRequestDto {
    placa: string;
}
```

### **2. Atualizar EstacionamentoService**

**Arquivo:** `src/utils/api.ts` (seção EstacionamentoService)

```typescript
// ---------------- ESTACIONAMENTO ---------------- (COMPLETO)
export const EstacionamentoService = {
    // Listar todos com paginação
    listarPaginadoFiltrado: async (
        filter: EstacionamentoFilter = {},
        page = 0,
        size = 10,
        sort = "dataUltimaAtualizacao,desc"
    ): Promise<SpringPage<EstacionamentoResponseDto>> => {
        const params = { ...cleanFilterParams(filter), page, size, sort };
        const { data } = await api.get<SpringPage<EstacionamentoResponseDto>>(
            "/estacionamentos/search",
            { params }
        );
        return data;
    },

    // Buscar por ID
    getById: async (id: number): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.get<EstacionamentoResponseDto>(`/estacionamentos/${id}`);
        return data;
    },

    // Listar estacionamentos ativos
    listarAtivos: async (
        page = 0,
        size = 100,
        sort = "dataUltimaAtualizacao,desc"
    ): Promise<SpringPage<EstacionamentoResponseDto>> => {
        const { data } = await api.get<SpringPage<EstacionamentoResponseDto>>(
            "/estacionamentos/ativos",
            { params: { page, size, sort } }
        );
        return data;
    },

    // Listar todos os ativos (sem paginação, para SSE)
    listarTodosAtivos: async (): Promise<EstacionamentoResponseDto[]> => {
        const { data } = await api.get<EstacionamentoResponseDto[]>(
            "/estacionamentos/ativos/todos"
        );
        return data;
    },

    // Buscar ativo por placa
    buscarAtivoPorPlaca: async (placa: string): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.get<EstacionamentoResponseDto>(
            `/estacionamentos/placa/${placa}`
        );
        return data;
    },

    // Verificar se está estacionado
    verificarSeEstaEstacionado: async (placa: string): Promise<boolean> => {
        const { data } = await api.get<boolean>(
            `/estacionamentos/placa/${placa}/verificar`
        );
        return data;
    },

    // Listar ativos por pátio
    listarAtivosPorPatio: async (patioId: number): Promise<EstacionamentoResponseDto[]> => {
        const { data } = await api.get<EstacionamentoResponseDto[]>(
            `/estacionamentos/patio/${patioId}/ativos`
        );
        return data;
    },

    // Histórico por veículo
    buscarHistoricoPorVeiculo: async (
        veiculoId: number,
        page = 0,
        size = 20
    ): Promise<SpringPage<EstacionamentoResponseDto>> => {
        const { data } = await api.get<SpringPage<EstacionamentoResponseDto>>(
            `/estacionamentos/veiculo/${veiculoId}/historico`,
            { params: { page, size } }
        );
        return data;
    },

    // Histórico por placa
    buscarHistoricoPorPlaca: async (
        placa: string,
        page = 0,
        size = 20
    ): Promise<SpringPage<EstacionamentoResponseDto>> => {
        const { data } = await api.get<SpringPage<EstacionamentoResponseDto>>(
            `/estacionamentos/placa/${placa}/historico`,
            { params: { page, size } }
        );
        return data;
    },

    // Estacionar veículo (NOVO - usa nova API)
    estacionar: async (
        placa: string,
        boxId?: number | null,
        observacoes?: string
    ): Promise<EstacionamentoResponseDto> => {
        const payload: PlacaRequestDto = { placa };
        const params: Record<string, any> = {};
        if (boxId !== undefined && boxId !== null) params.boxId = boxId;
        if (observacoes) params.observacoes = observacoes;
        
        const { data } = await api.post<EstacionamentoResponseDto>(
            "/estacionamentos/estacionar",
            payload,
            { params }
        );
        return data;
    },

    // Liberar veículo (NOVO - usa nova API)
    liberar: async (placa: string, observacoes?: string): Promise<EstacionamentoResponseDto> => {
        const payload: PlacaRequestDto = { placa };
        const params: Record<string, any> = {};
        if (observacoes) params.observacoes = observacoes;
        
        const { data } = await api.post<EstacionamentoResponseDto>(
            "/estacionamentos/liberar",
            payload,
            { params }
        );
        return data;
    },

    // Criar estacionamento (genérico)
    criar: async (payload: EstacionamentoRequestDto): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.post<EstacionamentoResponseDto>("/estacionamentos", payload);
        return data;
    },

    // Atualizar estacionamento
    atualizar: async (
        id: number,
        payload: EstacionamentoRequestDto
    ): Promise<EstacionamentoResponseDto> => {
        const { data } = await api.put<EstacionamentoResponseDto>(
            `/estacionamentos/${id}`,
            payload
        );
        return data;
    },

    // Deletar estacionamento
    deletar: async (id: number): Promise<void> => {
        await api.delete(`/estacionamentos/${id}`);
    },

    // Estatísticas
    contarEstacionados: async (): Promise<number> => {
        const { data } = await api.get<number>("/estacionamentos/estatisticas/total-ativos");
        return data;
    },

    contarEstacionadosPorPatio: async (patioId: number): Promise<number> => {
        const { data } = await api.get<number>(
            `/estacionamentos/estatisticas/patio/${patioId}/total-ativos`
        );
        return data;
    },

    // DataTable support
    buscarParaDataTable: async (
        request: DataTableRequest,
        filter?: EstacionamentoFilter
    ): Promise<DataTableResponse<EstacionamentoResponseDto>> => {
        const { data } = await api.post<DataTableResponse<EstacionamentoResponseDto>>(
            "/estacionamentos/datatable",
            request,
            { params: cleanFilterParams(filter || {}) }
        );
        return data;
    },
};
```

### **3. Criar Hook para SSE de Estacionamentos**

**Arquivo:** `src/hooks/useEstacionamentosSSE.ts` (NOVO)

```typescript
import { useState, useEffect } from 'react';
import { EstacionamentoResponseDto } from '@/types/estacionamento';
import { buildApiUrl } from '@/config/api';

export function useEstacionamentosSSE(enabled = true) {
    const [estacionamentos, setEstacionamentos] = useState<EstacionamentoResponseDto[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const sseUrl = buildApiUrl('/api/estacionamentos/ativos/todos');
        // Para SSE, usar endpoint específico quando disponível
        // Por enquanto, usar polling com listarTodosAtivos
        
        let es: EventSource | null = null;
        
        try {
            // Tentar SSE quando backend implementar
            // es = new EventSource(sseUrl.replace('/ativos/todos', '/stream'));
            // es.onopen = () => setIsConnected(true);
            // es.onmessage = (ev) => {
            //     try {
            //         const data = JSON.parse(ev.data);
            //         if (Array.isArray(data)) {
            //             setEstacionamentos(data);
            //         }
            //     } catch {}
            // };
            // es.onerror = () => setIsConnected(false);
        } catch (e) {
            console.warn('SSE não disponível, usando polling');
        }

        // Polling de fallback
        const fetchData = async () => {
            try {
                const response = await fetch(sseUrl, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setEstacionamentos(Array.isArray(data) ? data : []);
                    setError(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Erro ao buscar estacionamentos'));
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Atualiza a cada 5s

        return () => {
            if (es) es.close();
            clearInterval(interval);
            setIsConnected(false);
        };
    }, [enabled]);

    return { estacionamentos, isConnected, error };
}
```

### **4. Atualizar Rotas de API do Next.js**

#### **4.1. Nova Rota: `/api/estacionamentos/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8080';
        const { searchParams } = new URL(request.url);
        
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            params.append(key, value);
        });

        const url = `${backendOrigin}/api/estacionamentos?${params.toString()}`;
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar estacionamentos', message: error.message },
            { status: 500 }
        );
    }
}
```

#### **4.2. Atualizar `/api/vagas/route.ts`**

Substituir lógica antiga por chamada à nova API:

```typescript
export async function GET(request: NextRequest) {
    try {
        const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8080';
        
        // Usar nova API de estacionamentos ativos
        const response = await fetch(
            `${backendOrigin}/api/estacionamentos/ativos/todos`,
            { cache: 'no-store' }
        );
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar estacionamentos: ${response.status}`);
        }

        const estacionamentos: EstacionamentoResponseDto[] = await response.json();
        
        // Converter para formato compatível com código existente
        const vagas = estacionamentos.map(e => ({
            idBox: e.box.idBox,
            nome: e.box.nome,
            nomeBox: e.box.nome,
            status: e.box.status,
            dataEntrada: e.dataEntrada,
            dataSaida: e.dataSaida,
            patio: {
                idPatio: e.patio.idPatio,
                nomePatio: e.patio.nomePatio,
            },
            veiculo: {
                idVeiculo: e.veiculo.idVeiculo,
                placa: e.veiculo.placa,
                modelo: e.veiculo.modelo,
                fabricante: e.veiculo.fabricante,
            }
        }));

        return NextResponse.json(vagas, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar vagas', message: error.message },
            { status: 500 }
        );
    }
}
```

#### **4.3. Atualizar `/api/vagas/buscar-placa/[placa]/route.ts`**

```typescript
export async function GET(request: NextRequest, { params }: { params: { placa: string } }) {
    try {
        const placa = decodeURIComponent(params.placa || '').toUpperCase();
        const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8080';

        // Usar nova API
        const response = await fetch(
            `${backendOrigin}/api/estacionamentos/placa/${encodeURIComponent(placa)}`,
            { cache: 'no-store' }
        );

        if (response.status === 404) {
            return NextResponse.json({ found: false });
        }

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const estacionamento: EstacionamentoResponseDto = await response.json();
        
        // Converter para formato compatível
        return NextResponse.json({
            found: true,
            placa: estacionamento.veiculo.placa,
            boxId: estacionamento.box.idBox,
            boxNome: estacionamento.box.nome,
            patioId: estacionamento.patio.idPatio,
            patioNome: estacionamento.patio.nomePatio,
            dataEntrada: estacionamento.dataEntrada,
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Falha ao buscar placa' }, { status: 500 });
    }
}
```

#### **4.4. Atualizar `/api/vagas/liberar/[boxId]/route.ts`**

```typescript
export async function POST(request: NextRequest, { params }: { params: { boxId: string } }) {
    try {
        const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8080';
        
        // Buscar estacionamento por boxId primeiro
        const buscarResponse = await fetch(
            `${backendOrigin}/api/estacionamentos/search?boxId=${params.boxId}&estaEstacionado=true&size=1`,
            { cache: 'no-store' }
        );

        if (!buscarResponse.ok) {
            throw new Error('Erro ao buscar estacionamento');
        }

        const buscarData = await buscarResponse.json();
        const estacionamento = buscarData.content?.[0];

        if (!estacionamento) {
            return NextResponse.json({ error: 'Box não está ocupado' }, { status: 404 });
        }

        // Liberar usando placa
        const liberarResponse = await fetch(
            `${backendOrigin}/api/estacionamentos/liberar`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ placa: estacionamento.veiculo.placa }),
                cache: 'no-store'
            }
        );

        if (!liberarResponse.ok) {
            throw new Error('Erro ao liberar estacionamento');
        }

        const data = await liberarResponse.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Falha ao liberar vaga' },
            { status: 500 }
        );
    }
}
```

### **5. Atualizar Componentes**

#### **5.1. Dashboard (`src/app/dashboard/page.tsx`)**

```typescript
// ANTES:
const sseUrl = `${API_BASE_URL}/veiculos/estacionados/stream`;

// DEPOIS:
const sseUrl = `${API_BASE_URL}/api/estacionamentos/ativos/todos`;
// Usar hook useEstacionamentosSSE ou chamar diretamente
```

#### **5.2. Status Veículos (`src/app/veiculo/status/page.tsx`)**

```typescript
// ANTES: Busca /api/vagas e faz JOIN no frontend
const vagasResponse = await fetch('/api/vagas', { cache: 'no-store' });

// DEPOIS: Usar nova API
const estacionamentos = await EstacionamentoService.listarTodosAtivos();
// Converter para formato necessário
```

#### **5.3. Radar Armazenar (`src/app/radar/armazenar/page.tsx`)**

```typescript
// ANTES:
vagaEncontrada = await EstacionamentoService.estacionar(recognizedPlate, boxId);

// DEPOIS: (mesmo método, mas agora retorna EstacionamentoResponseDto)
const estacionamento = await EstacionamentoService.estacionar(recognizedPlate, boxId);
// Usar estacionamento.box.idBox, estacionamento.patio.idPatio, etc.
```

---

## ✅ BENEFÍCIOS ESPERADOS

1. **Performance**: 
   - Redução de 70-80% no tempo de resposta
   - Menos requisições ao backend
   - SSE mais eficiente

2. **Manutenibilidade**:
   - Código mais limpo e organizado
   - Tipos TypeScript garantem segurança
   - Lógica centralizada

3. **Experiência do Usuário**:
   - Atualizações em tempo real mais rápidas
   - Menos latência
   - Interface mais responsiva

4. **Escalabilidade**:
   - Suporta mais usuários simultâneos
   - Menos carga no banco de dados
   - Cache mais eficiente

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `src/types/estacionamento.d.ts`
- [ ] Atualizar `src/utils/api.ts` - EstacionamentoService completo
- [ ] Criar `src/hooks/useEstacionamentosSSE.ts`
- [ ] Criar `src/app/api/estacionamentos/route.ts`
- [ ] Atualizar `src/app/api/vagas/route.ts`
- [ ] Atualizar `src/app/api/vagas/buscar-placa/[placa]/route.ts`
- [ ] Atualizar `src/app/api/vagas/liberar/[boxId]/route.ts`
- [ ] Atualizar `src/app/dashboard/page.tsx`
- [ ] Atualizar `src/app/veiculo/status/page.tsx`
- [ ] Atualizar `src/app/radar/armazenar/page.tsx`
- [ ] Atualizar `src/app/vagas/mapa/page.tsx`
- [ ] Testar todas as funcionalidades
- [ ] Documentar mudanças

---

## 🚀 PRÓXIMOS PASSOS

1. Implementar tipos TypeScript
2. Atualizar EstacionamentoService
3. Criar/atualizar rotas de API
4. Atualizar componentes principais
5. Testar e validar
6. Documentar






