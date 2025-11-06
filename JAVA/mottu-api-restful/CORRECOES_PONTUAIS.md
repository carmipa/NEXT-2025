# 🔧 CORREÇÕES PONTUAIS NECESSÁRIAS NO SISTEMA MOTTU

**Data:** 2025-01-27  
**Status:** ⚠️ Ações necessárias identificadas

---

## 📋 RESUMO DAS CORREÇÕES NECESSÁRIAS

### 🔴 CRÍTICO - Correção de Inconsistências TB_BOX ↔ TB_ESTACIONAMENTO

#### Problema Identificado

Quando uma vaga é liberada, pode ocorrer inconsistência:
- `TB_BOX.STATUS` = 'L' (livre) ✅
- `TB_ESTACIONAMENTO.ESTA_ESTACIONADO` = 1 (ainda ativo) ❌

Isso causa problemas no mapa de vagas e relatórios.

#### Solução Imediata (SQL)

Execute no SQL Developer conectado ao banco Oracle:

```sql
-- 1. VERIFICAR inconsistências antes
SELECT 
    'ANTES DA CORREÇÃO' as STATUS,
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.ID_BOX,
    b.NOME as BOX_NOME,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.STATUS = 'L' AND e.ESTA_ESTACIONADO = 1;

-- 2. CORRIGIR inconsistências
UPDATE RELACAODIRETA.TB_ESTACIONAMENTO e
SET 
    e.ESTA_ESTACIONADO = 0,
    e.DATA_SAIDA = CURRENT_TIMESTAMP,
    e.DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
WHERE e.ESTA_ESTACIONADO = 1
AND EXISTS (
    SELECT 1 
    FROM RELACAODIRETA.TB_BOX b 
    WHERE b.ID_BOX = e.TB_BOX_ID_BOX 
    AND b.STATUS = 'L'
);

COMMIT;

-- 3. VERIFICAR após correção
SELECT 
    'APÓS CORREÇÃO' as STATUS,
    COUNT(*) as INCONSISTENCIAS_RESTANTES
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.STATUS = 'L' AND e.ESTA_ESTACIONADO = 1;
-- Deve retornar 0
```

#### Solução no Código (Backend)

**Arquivo:** `mottu-gradle/src/main/java/br/com/fiap/mottu/service/EstacionamentoService.java`

Verificar se o método `liberarVeiculo()` está atualizando corretamente ambas as tabelas.

**Arquivo:** `mottu-gradle/src/main/java/br/com/fiap/mottu/service/VagaOracleService.java`

Verificar se o método `liberarBox()` está atualizando `TB_ESTACIONAMENTO` além de `TB_BOX`.

---

### 🟡 IMPORTANTE - Verificar Múltiplos Estacionamentos Ativos

#### Problema

Um mesmo veículo pode ter múltiplos estacionamentos ativos simultaneamente.

#### Verificação SQL

```sql
-- Verificar veículos com múltiplos estacionamentos ativos
SELECT 
    v.PLACA,
    COUNT(*) as ESTACIONAMENTOS_ATIVOS
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
WHERE e.ESTA_ESTACIONADO = 1
GROUP BY v.PLACA
HAVING COUNT(*) > 1;

-- Se houver resultados, corrigir mantendo apenas o mais recente
UPDATE RELACAODIRETA.TB_ESTACIONAMENTO e
SET ESTA_ESTACIONADO = 0,
    DATA_SAIDA = CURRENT_TIMESTAMP,
    DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
WHERE e.ESTA_ESTACIONADO = 1
AND e.ID_ESTACIONAMENTO NOT IN (
    SELECT MAX(e2.ID_ESTACIONAMENTO)
    FROM RELACAODIRETA.TB_ESTACIONAMENTO e2
    WHERE e2.TB_VEICULO_ID_VEICULO = e.TB_VEICULO_ID_VEICULO
    AND e2.ESTA_ESTACIONADO = 1
    GROUP BY e2.TB_VEICULO_ID_VEICULO
);

COMMIT;
```

---

### 🟢 DESEJÁVEL - Criar Trigger de Sincronização Automática

#### Objetivo

Garantir que quando `TB_BOX.STATUS` muda para 'L', o `TB_ESTACIONAMENTO` seja automaticamente atualizado.

#### SQL para Criar Trigger

```sql
CREATE OR REPLACE TRIGGER RELACAODIRETA.TRG_SYNC_BOX_ESTACIONAMENTO
AFTER UPDATE OF STATUS ON RELACAODIRETA.TB_BOX
FOR EACH ROW
WHEN (NEW.STATUS = 'L' AND OLD.STATUS != 'L')
BEGIN
    -- Quando box é liberado, atualizar estacionamentos ativos
    UPDATE RELACAODIRETA.TB_ESTACIONAMENTO
    SET ESTA_ESTACIONADO = 0,
        DATA_SAIDA = CURRENT_TIMESTAMP,
        DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
    WHERE TB_BOX_ID_BOX = :NEW.ID_BOX
    AND ESTA_ESTACIONADO = 1;
    
    DBMS_OUTPUT.PUT_LINE('Trigger: Box ' || :NEW.ID_BOX || ' liberado. Estacionamentos atualizados.');
END;
/

-- Testar trigger
UPDATE RELACAODIRETA.TB_BOX 
SET STATUS = 'L' 
WHERE ID_BOX = [ID_DE_TESTE];
COMMIT;
```

---

## 📝 CHECKLIST DE CORREÇÕES

### Fase 1: Diagnóstico (Hoje)
- [ ] Conectar ao banco Oracle via SQL Developer
- [ ] Executar query de verificação de inconsistências
- [ ] Executar query de múltiplos estacionamentos ativos
- [ ] Documentar quantas inconsistências foram encontradas

### Fase 2: Correção Manual (Hoje)
- [ ] Executar script SQL de correção de inconsistências
- [ ] Executar script SQL de correção de múltiplos estacionamentos
- [ ] Verificar que não há mais inconsistências
- [ ] Fazer backup do banco antes de aplicar correções

### Fase 3: Prevenção (Esta semana)
- [ ] Criar trigger de sincronização automática
- [ ] Testar trigger em ambiente de desenvolvimento
- [ ] Revisar código do backend para garantir atualização consistente
- [ ] Adicionar logs de validação

### Fase 4: Monitoramento (Contínuo)
- [ ] Criar query de monitoramento para executar periodicamente
- [ ] Configurar alertas se inconsistências forem detectadas
- [ ] Documentar processo de correção

---

## 🔍 QUERIES ÚTEIS PARA MONITORAMENTO

### Status Geral do Sistema

```sql
-- Dashboard rápido de status
SELECT 
    'Boxes Livres' as METRICA,
    COUNT(*) as VALOR
FROM RELACAODIRETA.TB_BOX 
WHERE STATUS = 'L'
UNION ALL
SELECT 
    'Boxes Ocupados' as METRICA,
    COUNT(*) as VALOR
FROM RELACAODIRETA.TB_BOX 
WHERE STATUS = 'O'
UNION ALL
SELECT 
    'Estacionamentos Ativos' as METRICA,
    COUNT(*) as VALOR
FROM RELACAODIRETA.TB_ESTACIONAMENTO 
WHERE ESTA_ESTACIONADO = 1
UNION ALL
SELECT 
    'Inconsistências' as METRICA,
    COUNT(*) as VALOR
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.STATUS = 'L' AND e.ESTA_ESTACIONADO = 1;
```

### Estatísticas por Pátio

```sql
-- Ocupação por pátio
SELECT 
    p.NOME_PATIO,
    COUNT(b.ID_BOX) as TOTAL_BOXES,
    SUM(CASE WHEN b.STATUS = 'L' THEN 1 ELSE 0 END) as LIVRES,
    SUM(CASE WHEN b.STATUS = 'O' THEN 1 ELSE 0 END) as OCUPADOS,
    ROUND(SUM(CASE WHEN b.STATUS = 'O' THEN 1 ELSE 0 END) * 100.0 / COUNT(b.ID_BOX), 2) as PERCENTUAL_OCUPACAO
FROM RELACAODIRETA.TB_PATIO p
LEFT JOIN RELACAODIRETA.TB_BOX b ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
GROUP BY p.ID_PATIO, p.NOME_PATIO
ORDER BY PERCENTUAL_OCUPACAO DESC;
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **SEMPRE fazer backup** antes de executar scripts de correção
2. **Testar em ambiente de desenvolvimento** primeiro
3. **Verificar logs do backend** após correções
4. **Monitorar comportamento** do sistema após correções

---

## 📞 SUPORTE

Se encontrar problemas durante as correções:
1. Verificar logs do backend Spring Boot
2. Verificar logs do Oracle Database
3. Consultar documentação em `CORRECAO_LIBERACAO_INCONSISTENCIA.md`
4. Executar queries de diagnóstico antes e depois

---

**Última atualização:** 2025-01-27












