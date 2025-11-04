# 🔧 CORREÇÃO: Página de Status de Veículos

## 🐛 PROBLEMA IDENTIFICADO

A página `/veiculo/status` está mostrando que **nenhuma moto está estacionada**, mesmo havendo veículos estacionados no sistema.

### **Causa Raiz:**

1. **Endpoint incorreto:** A página chama `/api/vagas`, mas esse endpoint não existe
2. **Formato de dados incompatível:** O endpoint `/api/vagas/status/all` retorna `{ success: true, data: [...] }`, mas a página espera um array direto
3. **Estrutura de dados:** A página procura por `vaga.veiculo?.placa`, mas precisa verificar a estrutura real retornada

---

## ✅ SOLUÇÃO 1: Criar Endpoint `/api/vagas` Compatível

### **Criar arquivo:** `src/app/api/vagas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchVagasCompletas } from '../vagas/status/all/route';

export async function GET(request: NextRequest) {
    try {
        // Buscar todas as vagas completas
        const vagas = await fetchVagasCompletas();
        
        // Retornar apenas o array (sem wrapper { success, data })
        // Formato esperado pela página de status
        return NextResponse.json(vagas);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vagas' },
            { status: 500 }
        );
    }
}
```

### **Modificar:** `src/app/api/vagas/status/all/route.ts`

Adicionar export da função `fetchVagasCompletas`:

```typescript
// ... código existente ...

// Exportar função para uso em outros endpoints
export async function fetchVagasCompletas(): Promise<VagaCompleta[]> {
    // ... código existente ...
}
```

---

## ✅ SOLUÇÃO 2: Corrigir Página de Status

### **Modificar:** `src/app/veiculo/status/page.tsx`

```typescript
// Linha 48-49: ANTES
const vagas = await fetchMapas<any[]>('/api/vagas');

// DEPOIS - Usar endpoint correto e ajustar estrutura
const vagasResponse = await fetch('/api/vagas/status/all', { cache: 'no-store' });
const vagasData = await vagasResponse.json();
const vagas = vagasData.data || vagasData; // Compatível com ambos formatos

// Criar mapa de placas para vagas
const mapaPlacasVagas = new Map<string, { patioNome: string; boxNome: string }>();
vagas.forEach((vaga: any) => {
    // Verificar múltiplas estruturas possíveis
    const placa = vaga.veiculo?.placa || vaga.placa;
    const nomeBox = vaga.nomeBox || vaga.nome || vaga.boxNome;
    const nomePatio = vaga.patio?.nomePatio || vaga.patioNome;
    
    if (placa) {
        mapaPlacasVagas.set(placa.toUpperCase(), {
            patioNome: nomePatio || 'N/A',
            boxNome: nomeBox || 'N/A'
        });
    }
});
```

---

## 🔗 RELAÇÕES DA TABELA TB_ESTACIONAMENTO

### **Diagrama de Relacionamentos:**

```
TB_VEICULO (1) ←─── (N) TB_ESTACIONAMENTO
                         │
                         ├─── (1) TB_BOX
                         │
                         └─── (1) TB_PATIO
```

### **Foreign Keys (Chaves Estrangeiras):**

1. **TB_ESTACIONAMENTO → TB_VEICULO**
   ```sql
   TB_VEICULO_ID_VEICULO → TB_VEICULO.ID_VEICULO
   ```
   - **Relação:** N:1 (Muitos estacionamentos para um veículo)
   - **Propósito:** Identificar qual veículo está estacionado
   - **Uso:** Consultar veículos estacionados por placa/ID

2. **TB_ESTACIONAMENTO → TB_BOX**
   ```sql
   TB_BOX_ID_BOX → TB_BOX.ID_BOX
   ```
   - **Relação:** N:1 (Muitos estacionamentos para um box - histórico)
   - **Propósito:** Identificar em qual box o veículo está/p esteve
   - **Uso:** Consultar ocupação de boxes, histórico por box

3. **TB_ESTACIONAMENTO → TB_PATIO**
   ```sql
   TB_PATIO_ID_PATIO → TB_PATIO.ID_PATIO
   ```
   - **Relação:** N:1 (Muitos estacionamentos para um pátio)
   - **Propósito:** Identificar em qual pátio ocorreu o estacionamento
   - **Uso:** Estatísticas por pátio, relatórios de ocupação

### **Regras de Negócio:**

1. **Um veículo pode ter apenas 1 estacionamento ativo:**
   ```sql
   -- Constraint: ESTA_ESTACIONADO = 1 deve ser único por veículo
   WHERE TB_VEICULO_ID_VEICULO = X AND ESTA_ESTACIONADO = 1
   -- Retorna no máximo 1 registro
   ```

2. **Um box pode ter apenas 1 estacionamento ativo:**
   ```sql
   -- Constraint: ESTA_ESTACIONADO = 1 deve ser único por box
   WHERE TB_BOX_ID_BOX = X AND ESTA_ESTACIONADO = 1
   -- Retorna no máximo 1 registro
   ```

3. **Histórico é mantido:**
   - Quando `ESTA_ESTACIONADO = 0`, o registro não é deletado
   - Permite consultar histórico completo de estacionamentos
   - Facilita relatórios e análises

---

## 📊 EXEMPLOS DE CONSULTAS COM TB_ESTACIONAMENTO

### **1. Verificar se veículo está estacionado:**
```sql
SELECT 
    e.ESTA_ESTACIONADO,
    b.NOME as BOX_NOME,
    p.NOME_PATIO,
    e.DATA_ENTRADA
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA = 'EGX4D33'
  AND e.ESTA_ESTACIONADO = 1;
```

### **2. Listar todos os veículos estacionados (para SSE):**
```sql
SELECT 
    v.ID_VEICULO,
    v.PLACA,
    v.MODELO,
    b.ID_BOX,
    b.NOME as BOX_NOME,
    p.ID_PATIO,
    p.NOME_PATIO,
    e.DATA_ENTRADA,
    e.DATA_ULTIMA_ATUALIZACAO
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE e.ESTA_ESTACIONADO = 1
ORDER BY e.DATA_ULTIMA_ATUALIZACAO DESC;
```

### **3. Histórico de estacionamentos de um veículo:**
```sql
SELECT 
    e.ESTA_ESTACIONADO,
    b.NOME as BOX_NOME,
    p.NOME_PATIO,
    e.DATA_ENTRADA,
    e.DATA_SAIDA,
    CASE 
        WHEN e.DATA_SAIDA IS NOT NULL THEN
            EXTRACT(DAY FROM (e.DATA_SAIDA - e.DATA_ENTRADA)) * 24 * 60 +
            EXTRACT(HOUR FROM (e.DATA_SAIDA - e.DATA_ENTRADA)) * 60 +
            EXTRACT(MINUTE FROM (e.DATA_SAIDA - e.DATA_ENTRADA))
        ELSE NULL
    END as TEMPO_MINUTOS
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA = 'EGX4D33'
ORDER BY e.DATA_ENTRADA DESC;
```

---

## 🔧 IMPLEMENTAÇÃO RECOMENDADA

### **Passo 1: Criar endpoint `/api/vagas`**

Criar arquivo: `src/app/api/vagas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendOrigin =
            process.env.NEXT_PUBLIC_BACKEND_ORIGIN
            || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/?api\/?$/, '') : undefined)
            || 'http://localhost:8080';
        
        // Buscar todos os pátios
        const patiosResponse = await fetch(`${backendOrigin}/api/patios?page=0&size=1000`);
        const patiosData = await patiosResponse.json();
        const patios = patiosData.content || [];
        
        const vagas: any[] = [];
        
        // Para cada pátio, buscar boxes
        for (const patio of patios) {
            try {
                const mapaResponse = await fetch(
                    `${backendOrigin}/api/vagas/mapa?patioId=${patio.idPatio}`,
                    { cache: 'no-store' }
                );
                const mapaData = await mapaResponse.json();
                
                if (mapaData.boxes) {
                    for (const box of mapaData.boxes) {
                        vagas.push({
                            idBox: box.idBox,
                            nome: box.nome,
                            nomeBox: box.nome, // Alias para compatibilidade
                            status: box.status,
                            patio: {
                                idPatio: patio.idPatio,
                                nomePatio: patio.nomePatio,
                            },
                            veiculo: box.veiculo ? {
                                idVeiculo: box.veiculo.idVeiculo,
                                placa: box.veiculo.placa,
                                modelo: box.veiculo.modelo,
                                fabricante: box.veiculo.fabricante,
                            } : null
                        });
                    }
                }
            } catch (error) {
                console.error(`Erro ao buscar boxes do pátio ${patio.nomePatio}:`, error);
                continue;
            }
        }
        
        return NextResponse.json(vagas);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vagas' },
            { status: 500 }
        );
    }
}
```

### **Passo 2: Testar a correção**

1. Acesse: `http://localhost:3000/veiculo/status`
2. Abra o Console do navegador (F12)
3. Verifique se os dados estão sendo retornados corretamente
4. Verifique se os veículos estacionados aparecem

### **Passo 3: Adicionar logs para debug**

```typescript
// Na página de status, adicionar:
console.log('📊 Vagas recebidas:', vagas);
console.log('📊 Mapa de placas:', Array.from(mapaPlacasVagas.entries()));
console.log('📊 Veículos processados:', veiculosComLocalizacao.filter(v => v.estaEstacionado));
```

---

## 📝 RESUMO DAS RELAÇÕES

### **TB_ESTACIONAMENTO se relaciona com:**

1. **TB_VEICULO** (FK: TB_VEICULO_ID_VEICULO)
   - **Relação:** N:1
   - **Uso:** Identificar qual veículo está estacionado

2. **TB_BOX** (FK: TB_BOX_ID_BOX)
   - **Relação:** N:1
   - **Uso:** Identificar em qual box está o veículo

3. **TB_PATIO** (FK: TB_PATIO_ID_PATIO)
   - **Relação:** N:1
   - **Uso:** Identificar em qual pátio ocorreu o estacionamento

### **Vantagens desta estrutura:**

✅ **Consultas rápidas** - Um único JOIN para verificar estacionamento
✅ **Histórico completo** - Mantém todos os estacionamentos (não deleta)
✅ **SSE eficiente** - Consulta simples: `WHERE ESTA_ESTACIONADO = 1`
✅ **Consistência** - Um veículo só pode estar em um box por vez
✅ **Rastreabilidade** - DATAs de entrada/saída e última atualização

---

**Data da Correção:** 2025-11-03
**Status:** 🔄 Aguardando Implementação

