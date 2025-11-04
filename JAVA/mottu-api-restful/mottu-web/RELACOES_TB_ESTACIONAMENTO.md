# 🔗 RELAÇÕES DA TABELA TB_ESTACIONAMENTO

## 📋 PERGUNTA DO USUÁRIO

> "Essa tabela estacionamento se relacionaria com quem?"

---

## 🎯 RESPOSTA DIRETA

A tabela **TB_ESTACIONAMENTO** se relaciona com **3 tabelas principais**:

1. **TB_VEICULO** - Qual veículo está estacionado
2. **TB_BOX** - Em qual box/vaga está estacionado
3. **TB_PATIO** - Em qual pátio está estacionado

---

## 🗄️ DIAGRAMA DE RELACIONAMENTOS

```
┌─────────────────────────────────────────────────────────────┐
│                    TB_ESTACIONAMENTO                        │
│  (Tabela Central - Controle de Estacionamento)             │
├─────────────────────────────────────────────────────────────┤
│  ID_ESTACIONAMENTO (PK)                                     │
│  TB_VEICULO_ID_VEICULO (FK) ────┐                          │
│  TB_BOX_ID_BOX (FK) ────────────┤                          │
│  TB_PATIO_ID_PATIO (FK) ────────┤                          │
│  ESTA_ESTACIONADO (1/0)         │                          │
│  DATA_ENTRADA                    │                          │
│  DATA_SAIDA                      │                          │
│  DATA_ULTIMA_ATUALIZACAO         │                          │
└──────────────────────────────────┼──────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
        │  TB_VEICULO   │  │   TB_BOX      │  │  TB_PATIO     │
        │  (MOTOS)      │  │   (VAGAS)     │  │  (PÁTIOS)     │
        ├───────────────┤  ├───────────────┤  ├───────────────┤
        │ ID_VEICULO    │  │ ID_BOX        │  │ ID_PATIO      │
        │ PLACA         │  │ NOME          │  │ NOME_PATIO    │
        │ MODELO        │  │ STATUS        │  │ STATUS        │
        │ FABRICANTE    │  │ DATA_ENTRADA  │  │ ENDERECO      │
        │ STATUS        │  │ DATA_SAIDA    │  │ CONTATO       │
        └───────────────┘  └───────────────┘  └───────────────┘
```

---

## 🔑 FOREIGN KEYS (Chaves Estrangeiras)

### **1. TB_ESTACIONAMENTO → TB_VEICULO**

```sql
TB_VEICULO_ID_VEICULO → TB_VEICULO.ID_VEICULO
```

**Relação:** N:1 (Muitos estacionamentos para um veículo)

**Propósito:**
- Identificar **qual veículo** está estacionado
- Permitir consultar histórico de estacionamentos de um veículo
- Rastrear onde um veículo específico está estacionado

**Exemplo de Uso:**
```sql
-- Verificar se veículo está estacionado
SELECT e.*, v.PLACA, v.MODELO
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
WHERE v.PLACA = 'EGX4D33'
  AND e.ESTA_ESTACIONADO = 1;
```

---

### **2. TB_ESTACIONAMENTO → TB_BOX**

```sql
TB_BOX_ID_BOX → TB_BOX.ID_BOX
```

**Relação:** N:1 (Muitos estacionamentos para um box - histórico)

**Propósito:**
- Identificar **em qual box/vaga** o veículo está estacionado
- Consultar ocupação atual de um box
- Histórico de quais veículos já estacionaram em um box

**Exemplo de Uso:**
```sql
-- Verificar qual veículo está em um box
SELECT e.*, v.PLACA, b.NOME as BOX_NOME
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.ID_BOX = 1173
  AND e.ESTA_ESTACIONADO = 1;
```

---

### **3. TB_ESTACIONAMENTO → TB_PATIO**

```sql
TB_PATIO_ID_PATIO → TB_PATIO.ID_PATIO
```

**Relação:** N:1 (Muitos estacionamentos para um pátio)

**Propósito:**
- Identificar **em qual pátio** ocorreu o estacionamento
- Estatísticas de ocupação por pátio
- Relatórios de movimentação por pátio

**Exemplo de Uso:**
```sql
-- Listar veículos estacionados em um pátio
SELECT e.*, v.PLACA, b.NOME as BOX_NOME, p.NOME_PATIO
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE p.ID_PATIO = 18
  AND e.ESTA_ESTACIONADO = 1;
```

---

## 📊 RELACIONAMENTOS COMPLETOS

### **Estrutura Completa:**

```
TB_ESTACIONAMENTO
├── TB_VEICULO_ID_VEICULO (FK)
│   └── TB_VEICULO
│       ├── ID_VEICULO (PK)
│       ├── PLACA
│       ├── MODELO
│       └── STATUS
│
├── TB_BOX_ID_BOX (FK)
│   └── TB_BOX
│       ├── ID_BOX (PK)
│       ├── NOME
│       ├── STATUS ('L' ou 'O')
│       ├── DATA_ENTRADA
│       ├── DATA_SAIDA
│       └── TB_PATIO_ID_PATIO (FK)
│
└── TB_PATIO_ID_PATIO (FK)
    └── TB_PATIO
        ├── ID_PATIO (PK)
        ├── NOME_PATIO
        ├── STATUS
        ├── ENDERECO (FK → TB_ENDERECO)
        └── CONTATO (FK → TB_CONTATO)
```

---

## 🔄 FLUXO DE RELACIONAMENTOS

### **Quando um veículo é estacionado:**

```
1. Usuário seleciona:
   - Veículo (TB_VEICULO.ID_VEICULO)
   - Box (TB_BOX.ID_BOX)
   - Pátio (TB_PATIO.ID_PATIO) - derivado do box

2. Sistema cria registro em TB_ESTACIONAMENTO:
   INSERT INTO TB_ESTACIONAMENTO (
       TB_VEICULO_ID_VEICULO,  ← Relaciona com veículo
       TB_BOX_ID_BOX,          ← Relaciona com box
       TB_PATIO_ID_PATIO,      ← Relaciona com pátio
       ESTA_ESTACIONADO = 1
   )

3. Atualiza TB_BOX:
   UPDATE TB_BOX SET STATUS = 'O' WHERE ID_BOX = X

4. Cria log em TB_LOG_MOVIMENTACAO:
   INSERT INTO TB_LOG_MOVIMENTACAO (
       TB_VEICULO_ID_VEICULO,
       TB_BOX_ID_BOX,
       TB_PATIO_ID_PATIO,
       TIPO_MOVIMENTACAO = 'ENTRADA'
   )
```

### **Quando um veículo sai:**

```
1. Sistema atualiza TB_ESTACIONAMENTO:
   UPDATE TB_ESTACIONAMENTO 
   SET ESTA_ESTACIONADO = 0,
       DATA_SAIDA = NOW()
   WHERE TB_VEICULO_ID_VEICULO = X
     AND ESTA_ESTACIONADO = 1

2. Atualiza TB_BOX:
   UPDATE TB_BOX SET STATUS = 'L' WHERE ID_BOX = Y

3. Cria log em TB_LOG_MOVIMENTACAO:
   INSERT INTO TB_LOG_MOVIMENTACAO (
       TIPO_MOVIMENTACAO = 'SAIDA'
   )
```

---

## ✅ VANTAGENS DAS RELAÇÕES

### **1. Consultas Eficientes**
```sql
-- Uma única consulta para saber tudo sobre um estacionamento
SELECT 
    v.PLACA,
    b.NOME as BOX,
    p.NOME_PATIO,
    e.DATA_ENTRADA
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE e.ESTA_ESTACIONADO = 1;
```

### **2. Integridade Referencial**
- Se um veículo for deletado, os estacionamentos relacionados também são deletados (CASCADE)
- Se um box for deletado, os estacionamentos relacionados também são deletados (CASCADE)
- Garante que não existam estacionamentos "órfãos"

### **3. Histórico Completo**
- Mantém histórico de todos os estacionamentos
- Permite análises de uso de boxes
- Facilita relatórios de ocupação

### **4. Rastreabilidade**
- Sabe exatamente onde cada veículo está/p esteve
- Rastreia movimentações entre pátios
- Facilita auditoria

---

## 🎯 RESUMO

### **TB_ESTACIONAMENTO se relaciona com:**

| Tabela | Foreign Key | Relação | Propósito |
|--------|-------------|---------|-----------|
| **TB_VEICULO** | `TB_VEICULO_ID_VEICULO` | N:1 | Identificar qual veículo |
| **TB_BOX** | `TB_BOX_ID_BOX` | N:1 | Identificar qual box/vaga |
| **TB_PATIO** | `TB_PATIO_ID_PATIO` | N:1 | Identificar qual pátio |

### **Regras de Negócio:**
- ✅ Um veículo pode ter apenas **1 estacionamento ativo** (`ESTA_ESTACIONADO = 1`)
- ✅ Um box pode ter apenas **1 estacionamento ativo** (`ESTA_ESTACIONADO = 1`)
- ✅ Histórico é mantido (não deleta, apenas marca `ESTA_ESTACIONADO = 0`)
- ✅ Integridade referencial garantida (CASCADE)

---

**Data:** 2025-11-03
**Status:** ✅ Documentação Completa

