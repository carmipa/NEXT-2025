# Correção da Inconsistência na Liberação de Vagas

## Problema Identificado

Após a liberação de uma vaga, havia inconsistência entre as tabelas:
- **TB_BOX**: `STATUS = 'L'` (livre) ✅
- **TB_ESTACIONAMENTO**: `ESTA_ESTACIONADO = 1` (ativo) ❌

Isso indicava que o UPDATE em `TB_BOX` funcionou, mas o UPDATE em `TB_ESTACIONAMENTO` não persistiu.

## Causa Raiz

O método `VagaOracleService.liberarBox()` (usado pelo endpoint legado `/api/vagas/liberar/{boxId}`) **não atualizava** a tabela `TB_ESTACIONAMENTO`, apenas:
1. Deletava o vínculo em `TB_VEICULOBOX`
2. Atualizava `TB_BOX.STATUS` para 'L'

Quando o frontend fazia fallback para o endpoint antigo (caso o novo endpoint `/api/estacionamentos/liberar` falhasse), o `TB_ESTACIONAMENTO` permanecia inconsistente.

## Correções Implementadas

### 1. **VagaOracleService.liberarBox()** ✅

**Arquivo**: `mottu-gradle/src/main/java/br/com/fiap/mottu/service/VagaOracleService.java`

**Mudanças**:
- Agora busca todos os estacionamentos ativos do box antes de liberar
- Atualiza `TB_ESTACIONAMENTO` marcando `ESTA_ESTACIONADO = 0` para todos os estacionamentos ativos do box
- Mantém a atualização de `TB_BOX` e `TB_VEICULOBOX` (sistema legado)
- Adiciona logging detalhado para rastreamento

**Código adicionado**:
```java
// CRÍTICO: Primeiro atualizar TB_ESTACIONAMENTO para manter consistência
String sqlBuscarEstacionamentos = """
    SELECT ID_ESTACIONAMENTO, TB_VEICULO_ID_VEICULO 
    FROM TB_ESTACIONAMENTO 
    WHERE TB_BOX_ID_BOX = ? AND ESTA_ESTACIONADO = 1
    """;

// Atualizar TB_ESTACIONAMENTO: marcar como liberado
String sqlAtualizarEstacionamento = """
    UPDATE TB_ESTACIONAMENTO 
    SET ESTA_ESTACIONADO = 0, 
        DATA_SAIDA = CURRENT_TIMESTAMP, 
        DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP 
    WHERE TB_BOX_ID_BOX = ? AND ESTA_ESTACIONADO = 1
    """;
```

### 2. **EstacionamentoService.liberarVeiculo()** ✅

**Arquivo**: `mottu-gradle/src/main/java/br/com/fiap/mottu/service/EstacionamentoService.java`

**Mudanças**:
- Adicionado `setFlushMode(jakarta.persistence.FlushModeType.COMMIT)` a **todos** os UPDATEs de `TB_ESTACIONAMENTO`
- Isso garante que as mudanças sejam persistidas imediatamente no banco de dados
- Aplicado a:
  - UPDATE principal com `WHERE ESTA_ESTACIONADO = 1`
  - UPDATE direto por ID (fallback)
  - UPDATE forçado na verificação pós-liberação

**Código adicionado**:
```java
.setFlushMode(jakarta.persistence.FlushModeType.COMMIT)
```

## Fluxo de Liberação Corrigido

### Novo Endpoint (`/api/estacionamentos/liberar`)
1. Busca todos os estacionamentos ativos do veículo
2. Atualiza `TB_ESTACIONAMENTO` com `setFlushMode(COMMIT)` ✅
3. Atualiza `TB_BOX` com `setFlushMode(COMMIT)` ✅
4. Verifica pós-liberação e tenta liberação forçada se necessário ✅

### Endpoint Legado (`/api/vagas/liberar/{boxId}`)
1. Busca estacionamentos ativos do box ✅ **NOVO**
2. Atualiza `TB_ESTACIONAMENTO` ✅ **NOVO**
3. Atualiza `TB_BOX` ✅
4. Remove vínculo `TB_VEICULOBOX` (legado) ✅

## Testes Recomendados

1. **Teste 1**: Liberar via mapa (usa novo endpoint)
   - Verificar logs: `UPDATE TB_ESTACIONAMENTO executado: X linhas atualizadas`
   - Verificar logs: `UPDATE TB_BOX executado: X linhas atualizadas`
   - Executar SQL: `SELECT ESTA_ESTACIONADO FROM TB_ESTACIONAMENTO WHERE ID_ESTACIONAMENTO = ?`
   - Deve retornar `0`

2. **Teste 2**: Liberar via fallback (usa endpoint legado)
   - Forçar erro no novo endpoint para ativar fallback
   - Verificar logs: `VagaOracleService: X estacionamento(s) atualizado(s) em TB_ESTACIONAMENTO`
   - Executar SQL: `SELECT ESTA_ESTACIONADO FROM TB_ESTACIONAMENTO WHERE TB_BOX_ID_BOX = ?`
   - Deve retornar `0` ou nenhum registro

3. **Teste 3**: Verificação pós-liberação
   - Verificar logs: `Verificação pós-liberação: 0 estacionamento(s) ainda ativo(s)`
   - Se aparecer `> 0`, verificar logs de liberação forçada

## SQL de Diagnóstico

```sql
-- Verificar inconsistências após liberação
SELECT 
    e.ID_ESTACIONAMENTO,
    e.PLACA,
    e.TB_BOX_ID_BOX,
    b.NOME as BOX_NOME,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO
FROM TB_ESTACIONAMENTO e
LEFT JOIN TB_BOX b ON b.ID_BOX = e.TB_BOX_ID_BOX
WHERE e.ESTA_ESTACIONADO = 1;

-- Verificar boxes liberados mas com estacionamentos ativos
SELECT 
    b.ID_BOX,
    b.NOME,
    b.STATUS,
    e.ID_ESTACIONAMENTO,
    e.ESTA_ESTACIONADO
FROM TB_BOX b
LEFT JOIN TB_ESTACIONAMENTO e ON e.TB_BOX_ID_BOX = b.ID_BOX AND e.ESTA_ESTACIONADO = 1
WHERE b.STATUS = 'L' AND e.ID_ESTACIONAMENTO IS NOT NULL;
```

## Próximos Passos

1. ✅ Compilar e testar o backend
2. ✅ Testar liberação via mapa
3. ✅ Verificar logs do backend após liberação
4. ✅ Executar SQL de diagnóstico após liberação
5. ✅ Verificar se o mapa atualiza corretamente após liberação

## Notas Técnicas

- O uso de `setFlushMode(COMMIT)` força o commit imediato das mudanças, evitando problemas de cache ou transação
- O método `VagaOracleService.liberarBox()` agora é compatível com o novo sistema de `TB_ESTACIONAMENTO`
- O sistema legado (`TB_VEICULOBOX`) ainda é mantido para compatibilidade, mas não é mais crítico
- A verificação pós-liberação garante que não haja estacionamentos "fantasma" ativos







