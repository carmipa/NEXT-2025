# 🔍 ANÁLISE PROFUNDA: Sistema de Estacionamento de Motos - MOTTU

## 📋 SUMÁRIO EXECUTIVO

O sistema MOTTU utiliza uma arquitetura baseada em **Boxes (Vagas)** para armazenar motos. O estacionamento é feito através de uma **tabela de relacionamento** (`TB_VEICULOBOX`) que conecta veículos a boxes, com controle de status e registro de movimentações.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### 1. **Tabelas Principais**

#### **TB_BOX** (Vagas de Estacionamento)
```sql
CREATE TABLE "RELACAODIRETA"."TB_BOX" 
(	
    "ID_BOX" NUMBER,                    -- ID único da vaga
    "NOME" VARCHAR2(50 BYTE),            -- Nome da vaga (ex: "Renta001", "guarulhos021")
    "STATUS" VARCHAR2(1 CHAR),          -- 'L' = Livre, 'O' = Ocupado
    "DATA_ENTRADA" DATE,                 -- Data/hora de entrada do veículo
    "DATA_SAIDA" DATE,                   -- Data/hora de saída do veículo
    "OBSERVACAO" VARCHAR2(100 BYTE),    -- Observações sobre a vaga
    "TB_PATIO_ID_PATIO" NUMBER          -- FK: Pátio ao qual a vaga pertence
)
```

**Campos Importantes:**
- `STATUS`: Controla se a vaga está livre (`L`) ou ocupada (`O`)
- `DATA_ENTRADA` / `DATA_SAIDA`: Rastreamento temporal de ocupação
- `TB_PATIO_ID_PATIO`: Relacionamento com o pátio

#### **TB_VEICULO** (Motos)
```sql
CREATE TABLE "RELACAODIRETA"."TB_VEICULO" 
(	
    "ID_VEICULO" NUMBER,
    "PLACA" VARCHAR2(10 BYTE),          -- Placa do veículo (ex: "EGX4D33")
    "RENAVAM" VARCHAR2(11 CHAR),
    "CHASSI" VARCHAR2(17 CHAR),
    "FABRICANTE" VARCHAR2(50 BYTE),
    "MODELO" VARCHAR2(60 CHAR),
    "STATUS" VARCHAR2(20 BYTE),         -- OPERACIONAL, EM_MANUTENCAO, INATIVO
    "STATUS_OPERACIONAL" VARCHAR2(20 CHAR),
    "TAG_BLE_ID" VARCHAR2(50 CHAR)      -- Tag Bluetooth para rastreamento
)
```

#### **TB_VEICULOBOX** ⭐ **TABELA DE RELACIONAMENTO**
```sql
CREATE TABLE "RELACAODIRETA"."TB_VEICULOBOX" 
(	
    "TB_BOX_ID_BOX" NUMBER(19,0),       -- FK: ID do Box
    "TB_VEICULO_ID_VEICULO" NUMBER(19,0) -- FK: ID do Veículo
)
```

**⚠️ ESTA É A TABELA CHAVE!** 
- Relaciona **N:1** (um veículo pode estar em apenas um box por vez)
- Quando um veículo é estacionado, um registro é criado aqui
- Quando o veículo sai, o registro é removido

#### **TB_LOG_MOVIMENTACAO** (Histórico de Movimentações)
```sql
CREATE TABLE "RELACAODIRETA"."TB_LOG_MOVIMENTACAO" 
(	
    "ID_LOG_MOVIMENTACAO" NUMBER(19,0),
    "DATA_HORA_MOVIMENTACAO" TIMESTAMP(6),
    "OBSERVACOES" VARCHAR2(500 CHAR),
    "TEMPO_ESTACIONAMENTO_MINUTOS" NUMBER(19,0),
    "TIPO_MOVIMENTACAO" VARCHAR2(20 CHAR), -- 'ENTRADA' ou 'SAIDA'
    "TB_BOX_ID_BOX" NUMBER(19,0),         -- FK: Box onde ocorreu
    "TB_PATIO_ID_PATIO" NUMBER(19,0),     -- FK: Pátio onde ocorreu
    "TB_VEICULO_ID_VEICULO" NUMBER(19,0)  -- FK: Veículo movimentado
)
```

**CHECK Constraint:**
```sql
ALTER TABLE "TB_LOG_MOVIMENTACAO" 
ADD CHECK (tipo_movimentacao in ('ENTRADA','SAIDA'))
```

---

## 🔄 FLUXO DE ESTACIONAMENTO

### **Processo Completo:**

```
1. SCAN DE PLACA (OCR/Manual)
   ↓
2. VERIFICAÇÃO DO VEÍCULO
   ├─ Existe no banco? (TB_VEICULO)
   ├─ Status válido? (OPERACIONAL, DISPONIVEL, EM_MANUTENCAO)
   └─ Já está estacionado? (TB_VEICULOBOX)
   ↓
3. SELEÇÃO DE VAGA
   ├─ Busca boxes livres (STATUS = 'L')
   ├─ Seleção manual ou automática
   └─ Validação de disponibilidade
   ↓
4. ESTACIONAMENTO (API: /estacionamento/estacionar)
   ├─ Atualiza TB_BOX:
   │   ├─ STATUS = 'O' (Ocupado)
   │   ├─ DATA_ENTRADA = NOW()
   │   └─ DATA_SAIDA = NULL
   ├─ Cria registro em TB_VEICULOBOX:
   │   ├─ TB_BOX_ID_BOX = [box selecionado]
   │   └─ TB_VEICULO_ID_VEICULO = [veículo]
   └─ Cria log em TB_LOG_MOVIMENTACAO:
       ├─ TIPO_MOVIMENTACAO = 'ENTRADA'
       ├─ DATA_HORA_MOVIMENTACAO = NOW()
       └─ TB_BOX_ID_BOX, TB_PATIO_ID_PATIO, TB_VEICULO_ID_VEICULO
   ↓
5. CONFIRMAÇÃO E REDIRECIONAMENTO
   └─ Redireciona para mapa de vagas com highlight
```

---

## 💻 IMPLEMENTAÇÃO NO FRONTEND

### **Arquivo Principal: `src/app/radar/armazenar/page.tsx`**

#### **Função de Estacionamento:**
```typescript
const handlePark = async (boxId: number | null) => {
    // 1. Se boxId for null, busca automaticamente uma vaga livre
    if (boxId === null && selectedPatioId) {
        const response = await BoxService.listarPorPatio(
            parseInt(selectedPatioId), 
            patio.status, 
            0, 
            500
        );
        const freeBoxes = response.content.filter(
            box => box.status === 'L' || box.status === 'S' || box.status === 'LIVRE'
        );
        boxId = freeBoxes[0].idBox;
    }
    
    // 2. Chama API de estacionamento
    vagaEncontrada = await EstacionamentoService.estacionar(
        recognizedPlate, 
        boxId
    );
    
    // 3. Redireciona para mapa
    router.push(`/vagas/mapa?highlight=${vagaEncontrada.idBox}&placa=${recognizedPlate}`);
}
```

#### **Serviço de Estacionamento: `src/utils/api.ts`**
```typescript
export const EstacionamentoService = {
    estacionar: async (placa: string, boxId?: number | null): Promise<BoxResponseDto> => {
        const params: Record<string, any> = { placa };
        if (boxId !== undefined && boxId !== null) params.boxId = boxId;
        const { data } = await api.post<BoxResponseDto>(
            "/estacionamento/estacionar",
            null,
            { params }
        );
        return data;
    },
    
    liberarVaga: async (placa: string): Promise<void> => {
        await api.post("/estacionamento/liberar", null, { params: { placa } });
    },
};
```

---

## 🔍 COMO IDENTIFICAR SE UM VEÍCULO ESTÁ ESTACIONADO

### **Método 1: Consulta Direta na TB_VEICULOBOX**
```sql
SELECT v.PLACA, b.NOME as BOX_NOME, p.NOME_PATIO as PATIO_NOME
FROM TB_VEICULOBOX vb
JOIN TB_VEICULO v ON vb.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON vb.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA = 'EGX4D33';
```

### **Método 2: Consulta via Status do Box**
```sql
SELECT v.PLACA, b.NOME, b.STATUS, b.DATA_ENTRADA
FROM TB_BOX b
JOIN TB_VEICULOBOX vb ON b.ID_BOX = vb.TB_BOX_ID_BOX
JOIN TB_VEICULO v ON vb.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
WHERE b.STATUS = 'O'  -- Ocupado
AND v.PLACA = 'EGX4D33';
```

### **Método 3: API Frontend**
```typescript
// Endpoint: /api/vagas/buscar-placa/[placa]
const response = await fetch(`/api/vagas/buscar-placa/${placa}`);
const data = await response.json();
// Retorna: { found: true, boxId: 1173, boxNome: "guarulhos001", patioId: 18 }
```

---

## 📊 STATUS E ESTADOS

### **Status do Box (TB_BOX.STATUS)**
- **`'L'`** = Livre (Livre para estacionar)
- **`'O'`** = Ocupado (Veículo estacionado)
- **`'S'`** = Suspenso (Pode aparecer em alguns casos)

### **Status do Veículo (TB_VEICULO.STATUS)**
- **`'OPERACIONAL'`** = Pode estacionar ✅
- **`'EM_MANUTENCAO'`** = Pode estacionar (em área de manutenção) ✅
- **`'DISPONIVEL'`** = Pode estacionar ✅
- **`'INATIVO'`** = Não pode estacionar ❌
- **`'BLOQUEADO'`** = Não pode estacionar ❌

---

## 🔐 CONSTRAINTS E INTEGRIDADE

### **Primary Keys:**
- `TB_BOX`: `ID_BOX` (PK)
- `TB_VEICULO`: `ID_VEICULO` (PK)
- `TB_VEICULOBOX`: `(TB_BOX_ID_BOX, TB_VEICULO_ID_VEICULO)` (PK composta)

### **Foreign Keys:**
```sql
-- TB_VEICULOBOX → TB_BOX
ALTER TABLE "TB_VEICULOBOX" 
ADD CONSTRAINT "FK5YOWO94RQX413PF50BOSQUOM" 
FOREIGN KEY ("TB_BOX_ID_BOX") REFERENCES "TB_BOX" ("ID_BOX");

-- TB_VEICULOBOX → TB_VEICULO
ALTER TABLE "TB_VEICULOBOX" 
ADD CONSTRAINT "FKSRK3YSSEW1MEKV7K3NOYOTVGO" 
FOREIGN KEY ("TB_VEICULO_ID_VEICULO") REFERENCES "TB_VEICULO" ("ID_VEICULO");
```

### **Unique Constraints:**
- `TB_BOX`: `(TB_PATIO_ID_PATIO, NOME)` - Nome único por pátio
- `TB_VEICULO`: `TAG_BLE_ID` - Tag Bluetooth única

---

## 📝 EXEMPLOS DE DADOS

### **Exemplo de Box Ocupado:**
```sql
-- TB_BOX
ID_BOX: 1173
NOME: 'guarulhos001'
STATUS: 'O'  -- Ocupado
DATA_ENTRADA: '2025-11-03 21:14:06'
DATA_SAIDA: NULL
TB_PATIO_ID_PATIO: 18

-- TB_VEICULOBOX
TB_BOX_ID_BOX: 1173
TB_VEICULO_ID_VEICULO: 21

-- TB_LOG_MOVIMENTACAO
ID_LOG_MOVIMENTACAO: 41
TIPO_MOVIMENTACAO: 'ENTRADA'
DATA_HORA_MOVIMENTACAO: '2025-11-03 21:14:06'
TB_BOX_ID_BOX: 1173
TB_PATIO_ID_PATIO: 18
TB_VEICULO_ID_VEICULO: 21
```

---

## 🎯 CONCLUSÃO

### **Resumo do Armazenamento:**

1. **Não há um campo direto na tabela de veículos** indicando estacionamento
2. **A relação é feita através da tabela `TB_VEICULOBOX`** (tabela de relacionamento)
3. **O status do box (`TB_BOX.STATUS`)** indica se está ocupado (`'O'`) ou livre (`'L'`)
4. **As datas de entrada/saída** ficam em `TB_BOX.DATA_ENTRADA` e `TB_BOX.DATA_SAIDA`
5. **O histórico completo** é registrado em `TB_LOG_MOVIMENTACAO`

### **Vantagens desta Arquitetura:**
- ✅ Separação de responsabilidades (Box vs Veículo)
- ✅ Histórico completo de movimentações
- ✅ Facilita consultas de disponibilidade
- ✅ Permite múltiplos pátios com boxes independentes
- ✅ Rastreamento temporal completo

### **Como Verificar se uma Moto Está Estacionada:**
```sql
-- Query completa
SELECT 
    v.PLACA,
    v.MODELO,
    b.NOME as BOX_NOME,
    b.STATUS as BOX_STATUS,
    b.DATA_ENTRADA,
    p.NOME_PATIO
FROM TB_VEICULO v
LEFT JOIN TB_VEICULOBOX vb ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
LEFT JOIN TB_BOX b ON vb.TB_BOX_ID_BOX = b.ID_BOX
LEFT JOIN TB_PATIO p ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA = 'EGX4D33';
-- Se retornar registro com BOX_NOME não nulo, está estacionado!
```

---

## 📞 INFORMAÇÕES DE CONEXÃO

**String de Conexão Oracle:**
```
sqlplus relacaoDireta/paulo1@localhost:1521/XEPDB1
```

**Schema:** `RELACAODIRETA`
**Banco:** Oracle Database (Docker)
**Porta:** 1521
**Service:** XEPDB1

---

**Data da Análise:** 2025-11-03
**Versão do Sistema:** MOTTU Web + MOTTU Gradle (Backend)

