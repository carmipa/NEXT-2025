# 📊 DIAGRAMA VISUAL: Sistema de Estacionamento MOTTU

## 🏗️ ARQUITETURA DE DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE ESTACIONAMENTO                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  TB_PATIO    │         │   TB_BOX     │         │ TB_VEICULO   │
│              │         │   (VAGAS)    │         │  (MOTOS)     │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ ID_PATIO     │◄───┐    │ ID_BOX       │    ┌───►│ ID_VEICULO   │
│ NOME_PATIO   │    │    │ NOME         │    │    │ PLACA        │
│ STATUS       │    │    │ STATUS       │    │    │ MODELO       │
│              │    │    │ DATA_ENTRADA │    │    │ STATUS       │
└──────────────┘    │    │ DATA_SAIDA   │    │    │ TAG_BLE_ID   │
                    │    │ PATIO_ID_FK  │───┘    └──────────────┘
                    │    └──────────────┘
                    │           ▲
                    │           │
                    │    ┌──────┴──────┐
                    │    │             │
                    └────┤ TB_VEICULOBOX │  ⭐ TABELA DE RELACIONAMENTO
                         │             │
                         ├─────────────┤
                         │ BOX_ID_FK   │
                         │ VEICULO_FK  │
                         └─────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │ TB_LOG_MOVIMENT  │
                         │  (HISTÓRICO)     │
                         ├──────────────────┤
                         │ ID_LOG           │
                         │ TIPO (ENTRADA/   │
                         │       SAIDA)     │
                         │ DATA_HORA        │
                         │ BOX_ID_FK        │
                         │ PATIO_ID_FK      │
                         │ VEICULO_ID_FK    │
                         └──────────────────┘
```

## 🔄 FLUXO DE ESTACIONAMENTO

```
┌──────────────────────────────────────────────────────────────────┐
│                    PROCESSO DE ESTACIONAMENTO                   │
└──────────────────────────────────────────────────────────────────┘

1. SCAN DE PLACA
   │
   ├─► OCR Scanner (câmera)
   │   └─► Reconhece placa: "EGX4D33"
   │
   └─► Ou entrada manual
       └─► Usuário digita: "EGX4D33"

2. VALIDAÇÃO
   │
   ├─► Verifica se veículo existe (TB_VEICULO)
   │   ├─ SIM → Continua
   │   └─ NÃO → Modal "Cadastrar nova moto?"
   │
   ├─► Verifica status do veículo
   │   ├─ OPERACIONAL → ✅ Pode estacionar
   │   ├─ EM_MANUTENCAO → ✅ Pode estacionar
   │   └─ INATIVO/BLOQUEADO → ❌ Não pode estacionar
   │
   └─► Verifica se já está estacionado
       ├─ Consulta TB_VEICULOBOX
       ├─ Se encontrado → Mostra "Já está no box X"
       └─ Se não encontrado → Continua

3. SELEÇÃO DE VAGA
   │
   ├─► Lista pátios disponíveis (TB_PATIO)
   │
   ├─► Busca boxes livres no pátio selecionado
   │   └─ SELECT * FROM TB_BOX 
   │       WHERE STATUS = 'L' 
   │       AND PATIO_ID = [selecionado]
   │
   └─► Usuário escolhe:
       ├─ Vaga automática (primeira disponível)
       └─ Vaga manual (seleciona de lista)

4. PROCESSO DE ESTACIONAMENTO (Backend)
   │
   ├─► BEGIN TRANSACTION
   │
   ├─► Atualiza TB_BOX:
   │   ├─ STATUS = 'O' (Ocupado)
   │   ├─ DATA_ENTRADA = NOW()
   │   └─ DATA_SAIDA = NULL
   │
   ├─► Insere em TB_VEICULOBOX:
   │   ├─ TB_BOX_ID_BOX = [box selecionado]
   │   └─ TB_VEICULO_ID_VEICULO = [veículo]
   │
   ├─► Insere em TB_LOG_MOVIMENTACAO:
   │   ├─ TIPO_MOVIMENTACAO = 'ENTRADA'
   │   ├─ DATA_HORA_MOVIMENTACAO = NOW()
   │   ├─ TB_BOX_ID_BOX = [box]
   │   ├─ TB_PATIO_ID_PATIO = [pátio]
   │   └─ TB_VEICULO_ID_VEICULO = [veículo]
   │
   └─► COMMIT TRANSACTION

5. RESULTADO
   │
   └─► Redireciona para mapa
       └─ Destaca box ocupado
```

## 🔍 CONSULTAS SQL ÚTEIS

### **Verificar se veículo está estacionado:**
```sql
SELECT 
    v.PLACA,
    v.MODELO,
    b.NOME as BOX_NOME,
    b.STATUS,
    b.DATA_ENTRADA,
    p.NOME_PATIO
FROM TB_VEICULO v
LEFT JOIN TB_VEICULOBOX vb ON v.ID_VEICULO = vb.TB_VEICULO_ID_VEICULO
LEFT JOIN TB_BOX b ON vb.TB_BOX_ID_BOX = b.ID_BOX
LEFT JOIN TB_PATIO p ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE v.PLACA = 'EGX4D33';
```

### **Listar todos os boxes ocupados:**
```sql
SELECT 
    b.ID_BOX,
    b.NOME,
    v.PLACA,
    v.MODELO,
    b.DATA_ENTRADA,
    p.NOME_PATIO
FROM TB_BOX b
JOIN TB_VEICULOBOX vb ON b.ID_BOX = vb.TB_BOX_ID_BOX
JOIN TB_VEICULO v ON vb.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN TB_PATIO p ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE b.STATUS = 'O'
ORDER BY b.DATA_ENTRADA DESC;
```

### **Histórico de movimentações de um veículo:**
```sql
SELECT 
    lm.TIPO_MOVIMENTACAO,
    lm.DATA_HORA_MOVIMENTACAO,
    b.NOME as BOX_NOME,
    p.NOME_PATIO,
    lm.OBSERVACOES
FROM TB_LOG_MOVIMENTACAO lm
JOIN TB_BOX b ON lm.TB_BOX_ID_BOX = b.ID_BOX
JOIN TB_PATIO p ON lm.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE lm.TB_VEICULO_ID_VEICULO = (
    SELECT ID_VEICULO FROM TB_VEICULO WHERE PLACA = 'EGX4D33'
)
ORDER BY lm.DATA_HORA_MOVIMENTACAO DESC;
```

### **Estatísticas de ocupação por pátio:**
```sql
SELECT 
    p.NOME_PATIO,
    COUNT(CASE WHEN b.STATUS = 'O' THEN 1 END) as OCUPADAS,
    COUNT(CASE WHEN b.STATUS = 'L' THEN 1 END) as LIVRES,
    COUNT(b.ID_BOX) as TOTAL_BOXES,
    ROUND(
        COUNT(CASE WHEN b.STATUS = 'O' THEN 1 END) * 100.0 / COUNT(b.ID_BOX), 
        2
    ) as PERCENTUAL_OCUPACAO
FROM TB_PATIO p
LEFT JOIN TB_BOX b ON p.ID_PATIO = b.TB_PATIO_ID_PATIO
GROUP BY p.ID_PATIO, p.NOME_PATIO
ORDER BY p.NOME_PATIO;
```

## 📊 ESTADOS DO SISTEMA

### **Estado: Box Livre**
```
TB_BOX:
  STATUS = 'L'
  DATA_ENTRADA = NULL
  DATA_SAIDA = NULL

TB_VEICULOBOX:
  (Sem registro)
```

### **Estado: Box Ocupado**
```
TB_BOX:
  STATUS = 'O'
  DATA_ENTRADA = '2025-11-03 21:14:06'
  DATA_SAIDA = NULL

TB_VEICULOBOX:
  TB_BOX_ID_BOX = 1173
  TB_VEICULO_ID_VEICULO = 21

TB_LOG_MOVIMENTACAO:
  TIPO_MOVIMENTACAO = 'ENTRADA'
  DATA_HORA_MOVIMENTACAO = '2025-11-03 21:14:06'
```

### **Estado: Após Liberação**
```
TB_BOX:
  STATUS = 'L'
  DATA_ENTRADA = '2025-11-03 21:14:06'
  DATA_SAIDA = '2025-11-03 22:30:15'

TB_VEICULOBOX:
  (Registro removido)

TB_LOG_MOVIMENTACAO:
  (2 registros: ENTRADA + SAIDA)
```

## 🎯 PONTOS-CHAVE

1. **A tabela TB_VEICULOBOX é a chave do sistema**
   - Sem registro aqui = veículo não está estacionado
   - Com registro aqui = veículo está estacionado

2. **O status do box (TB_BOX.STATUS) é o indicador visual**
   - 'L' = Livre (verde)
   - 'O' = Ocupado (vermelho)

3. **O histórico completo está em TB_LOG_MOVIMENTACAO**
   - Todas as entradas e saídas são registradas
   - Permite análises e relatórios

4. **Não há campo direto na tabela de veículos**
   - A informação de estacionamento é derivada
   - Consulta via JOIN com TB_VEICULOBOX

