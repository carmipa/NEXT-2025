# 📋 Guia Completo: Como Deletar um Pátio com Segurança

## 🎯 Panorama Geral

O sistema de exclusão de Pátios foi implementado com **múltiplas camadas de segurança** para garantir que:
- ✅ Apenas pátios sem dependências críticas possam ser deletados
- ✅ Dados históricos sejam preservados quando apropriado
- ✅ Mensagens claras sejam exibidas ao usuário
- ✅ Integridade referencial seja mantida

---

## 🛡️ Camadas de Segurança Implementadas

### 1. **Validação de Estacionamentos Ativos**
- ❌ **BLOQUEIA** se houver veículos estacionados no momento
- ✅ **PERMITE** se apenas houver registros históricos (veículos que já saíram)

### 2. **Validação de Veículos Associados**
- ❌ **BLOQUEIA** se houver veículos associados ao pátio (tabela `TB_VEICULO_PATIO`)

### 3. **Limpeza Automática de Dependências**
- ✅ Deleta automaticamente:
  - Notificações relacionadas aos boxes
  - Logs de movimentação relacionados aos boxes
  - Associações VeiculoBox (tabela legada)
  - ZonaBox (se existir)

### 4. **Exclusão em Cascata**
- ✅ Boxes são deletados automaticamente (via JPA)
- ✅ Zonas são deletadas automaticamente (via JPA)
- ✅ Estacionamentos históricos são deletados (via constraint `ON DELETE CASCADE`)

---

## 📝 Passo a Passo: Como Deletar um Pátio

### **Passo 1: Preparação - Verificar Dependências**

Antes de tentar deletar, verifique:

```sql
-- 1. Verificar estacionamentos ativos
SELECT COUNT(*) 
FROM TB_ESTACIONAMENTO 
WHERE TB_PATIO_ID_PATIO = :patioId 
AND ESTA_ESTACIONADO = 1;

-- 2. Verificar veículos associados
SELECT COUNT(*) 
FROM TB_VEICULO_PATIO 
WHERE TB_PATIO_ID_PATIO = :patioId;

-- 3. Verificar boxes do pátio
SELECT COUNT(*) 
FROM TB_BOX 
WHERE PATIO_ID = :patioId;

-- 4. Verificar zonas do pátio
SELECT COUNT(*) 
FROM TB_ZONA 
WHERE TB_PATIO_ID_PATIO = :patioId;
```

### **Passo 2: Liberar Dependências Críticas**

#### ✅ **Liberar Veículos Estacionados**

Se houver veículos estacionados, você precisa:

1. **Via Interface Web:**
   - Acesse a lista de estacionamentos ativos
   - Localize os veículos do pátio em questão
   - Realize a saída de cada veículo

2. **Via API:**
   ```http
   POST /api/estacionamentos/{estacionamentoId}/saida
   ```

3. **Via SQL (EMERGÊNCIA - não recomendado):**
   ```sql
   -- ATENÇÃO: Use apenas em emergências e após backup!
   UPDATE TB_ESTACIONAMENTO 
   SET ESTA_ESTACIONADO = 0,
       DATA_SAIDA = CURRENT_TIMESTAMP
   WHERE TB_PATIO_ID_PATIO = :patioId 
   AND ESTA_ESTACIONADO = 1;
   ```

#### ✅ **Remover Associações de Veículos**

Se houver veículos associados ao pátio:

1. **Via Interface Web:**
   - Acesse o pátio
   - Vá em "Veículos Associados"
   - Remova cada associação

2. **Via API:**
   ```http
   DELETE /api/patios/{patioId}/veiculos/{veiculoId}/desassociar
   ```

3. **Via SQL (EMERGÊNCIA):**
   ```sql
   -- ATENÇÃO: Use apenas em emergências!
   DELETE FROM TB_VEICULO_PATIO 
   WHERE TB_PATIO_ID_PATIO = :patioId;
   ```

### **Passo 3: Executar a Exclusão**

#### **Opção A: Via Interface Web**

1. Acesse: `http://localhost:3000/gerenciamento-patio/patio`
2. Localize o pátio que deseja deletar
3. Clique no botão **"Deletar"** ou ícone de lixeira
4. Confirme a exclusão no diálogo

#### **Opção B: Via API REST**

```http
DELETE /api/patios/{patioId}
```

**Exemplo com cURL:**
```bash
curl -X DELETE "http://localhost:8080/api/patios/1" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

#### **Opção C: Via Postman/Insomnia**

1. Método: `DELETE`
2. URL: `http://localhost:8080/api/patios/{patioId}`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {token}` (se autenticação estiver habilitada)

### **Passo 4: Verificar Resultado**

#### ✅ **Sucesso (Status 204 No Content)**

A exclusão foi bem-sucedida se:
- Status HTTP: `204 No Content`
- Pátio não aparece mais na listagem
- Boxes e zonas foram deletados automaticamente

#### ❌ **Erro: Estacionamentos Ativos (Status 409)**

**Mensagem esperada:**
```json
{
  "timestamp": "2025-11-05T10:30:00",
  "status": 409,
  "error": "Recurso em Uso",
  "message": "Não é possível excluir o Pátio 'Pátio Central' (ID: 1) pois possui 3 veículo(s) estacionado(s) no momento. Por favor, libere todos os veículos estacionados antes de excluir o pátio.",
  "path": "/api/patios/1"
}
```

**Ações necessárias:**
1. Liste os estacionamentos ativos do pátio
2. Realize a saída de cada veículo
3. Tente novamente a exclusão

#### ❌ **Erro: Veículos Associados (Status 409)**

**Mensagem esperada:**
```json
{
  "timestamp": "2025-11-05T10:30:00",
  "status": 409,
  "error": "Recurso em Uso",
  "message": "Não é possível excluir o Pátio 'Pátio Central' (ID: 1) pois possui 5 veículo(s) associado(s). Por favor, remova as associações dos veículos antes de excluir o pátio.",
  "path": "/api/patios/1"
}
```

**Ações necessárias:**
1. Acesse as associações do pátio
2. Remova cada associação veículo-pátio
3. Tente novamente a exclusão

#### ❌ **Erro: Problema ao Processar Dependências (Status 403)**

**Mensagem esperada:**
```json
{
  "timestamp": "2025-11-05T10:30:00",
  "status": 403,
  "error": "Operação Não Permitida",
  "message": "Não foi possível excluir o Pátio 'Pátio Central' (ID: 1) devido a um erro ao processar as dependências dos boxes. Erro: [detalhes do erro]. Por favor, tente novamente ou entre em contato com o suporte.",
  "path": "/api/patios/1"
}
```

**Ações necessárias:**
1. Verifique os logs do servidor para detalhes
2. Entre em contato com o suporte técnico
3. Não tente deletar manualmente via SQL sem orientação

#### ❌ **Erro: Pátio Não Encontrado (Status 404)**

**Mensagem esperada:**
```json
{
  "timestamp": "2025-11-05T10:30:00",
  "status": 404,
  "error": "Não Encontrado",
  "message": "Pátio com ID 999 não encontrado",
  "path": "/api/patios/999"
}
```

**Ações necessárias:**
1. Verifique se o ID do pátio está correto
2. Confirme que o pátio ainda existe na base de dados

---

## ✅ Checklist de Segurança Antes de Deletar

Use este checklist antes de tentar deletar um pátio:

- [ ] **Verificar Estacionamentos Ativos**
  - [ ] Não há veículos estacionados no momento
  - [ ] Todos os veículos foram liberados

- [ ] **Verificar Veículos Associados**
  - [ ] Não há veículos associados ao pátio
  - [ ] Todas as associações foram removidas

- [ ] **Backup (Recomendado)**
  - [ ] Backup do banco de dados realizado
  - [ ] Backup dos dados do pátio exportado

- [ ] **Verificar Impacto**
  - [ ] Confirmar que não há processos críticos usando o pátio
  - [ ] Verificar se há relatórios ou análises dependentes dos dados

- [ ] **Notificar Usuários (Se Aplicável)**
  - [ ] Usuários foram notificados sobre a exclusão
  - [ ] Alternativas foram fornecidas

---

## 🔄 Fluxo Completo de Exclusão

```
┌─────────────────────────────────────┐
│  USUÁRIO SOLICITA EXCLUSÃO DO PÁTIO  │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  1. Buscar Pátio por ID            │
│     - Valida se existe              │
└──────────────┬───────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Validar Estacionamentos Ativos │
│     - Conta estacionamentos com    │
│       ESTA_ESTACIONADO = 1          │
└──────────────┬───────────────────────┘
               │
       ┌───────┴───────┐
       │               │
      ❌ SIM          ✅ NÃO
       │               │
       │               ▼
       │   ┌───────────────────────────┐
       │   │ 3. Validar Veículos        │
       │   │    Associados              │
       │   │    - Conta em             │
       │   │      TB_VEICULO_PATIO      │
       │   └───────┬───────────────────┘
       │           │
       │    ┌──────┴───────┐
       │    │               │
       │   ❌ SIM          ✅ NÃO
       │    │               │
       │    │               ▼
       │    │   ┌───────────────────────────┐
       │    │   │ 4. Deletar Dependências     │
       │    │   │    dos Boxes                │
       │    │   │    - TB_NOTIFICACAO         │
       │    │   │    - TB_LOG_MOVIMENTACAO    │
       │    │   │    - TB_VEICULOBOX          │
       │    │   │    - TB_ZONABOX             │
       │    │   └───────┬───────────────────┘
       │    │           │
       │    │           ▼
       │    │   ┌───────────────────────────┐
       │    │   │ 5. Deletar Pátio          │
       │    │   │    - Boxes (cascata JPA)  │
       │    │   │    - Zonas (cascata JPA)  │
       │    │   │    - Estacionamentos      │
       │    │   │      (cascata DB)         │
       │    │   └───────┬───────────────────┘
       │    │           │
       │    │           ▼
       │    │   ┌───────────────────────────┐
       │    │   │ 6. Invalidar Cache         │
       │    │   │    - Cache do mapa global  │
       │    │   │    - Cache de listagem     │
       │    │   └───────┬───────────────────┘
       │    │           │
       │    │           ▼
       │    │   ┌───────────────────────────┐
       │    │   │ ✅ SUCESSO (204)           │
       │    │   └────────────────────────────┘
       │    │
       │    └───► ❌ ERRO: Veículos Associados (409)
       │
       └───────► ❌ ERRO: Estacionamentos Ativos (409)
```

---

## 📊 Tabelas Afetadas pela Exclusão

| Tabela | Ação | Quando | Método |
|--------|------|--------|--------|
| **TB_PATIO** | DELETE | Sempre | Direto |
| **TB_BOX** | DELETE | Sempre | Cascata (JPA) |
| **TB_ZONA** | DELETE | Sempre | Cascata (JPA) |
| **TB_ESTACIONAMENTO** | DELETE | Se histórico | Cascata (DB) |
| **TB_NOTIFICACAO** | DELETE | Se relacionado | Manual (SQL) |
| **TB_LOG_MOVIMENTACAO** | DELETE | Se relacionado | Manual (SQL) |
| **TB_VEICULOBOX** | DELETE | Se relacionado | Manual (Repository) |
| **TB_ZONABOX** | DELETE | Se existir | Manual (SQL) |

---

## 🚨 Cenários Especiais

### **Cenário 1: Pátio com Muitos Boxes**

**Situação:** Pátio com 100+ boxes e muitos registros relacionados

**Solução:** O sistema deleta automaticamente todas as dependências. O processo pode levar alguns segundos.

**Recomendação:** 
- Execute fora do horário de pico
- Monitore os logs do servidor
- Verifique o tempo de resposta

### **Cenário 2: Pátio com Estacionamentos Históricos**

**Situação:** Pátio com muitos registros históricos de estacionamentos

**Solução:** Os registros históricos são deletados automaticamente via constraint `ON DELETE CASCADE`.

**Observação:** Apenas registros com `ESTA_ESTACIONADO = 0` são deletados automaticamente.

### **Cenário 3: Erro ao Deletar Dependências**

**Situação:** Erro ao processar dependências dos boxes

**Solução:** 
1. Verifique os logs do servidor
2. Execute manualmente as queries de limpeza:
   ```sql
   -- Deletar notificações
   DELETE FROM TB_NOTIFICACAO 
   WHERE TB_BOX_ID_BOX IN (
     SELECT ID_BOX FROM TB_BOX WHERE PATIO_ID = :patioId
   );
   
   -- Deletar logs
   DELETE FROM TB_LOG_MOVIMENTACAO 
   WHERE TB_BOX_ID_BOX IN (
     SELECT ID_BOX FROM TB_BOX WHERE PATIO_ID = :patioId
   );
   ```
3. Tente novamente a exclusão

---

## 🔍 Monitoramento e Logs

### **Logs de Sucesso**

```
INFO  - Deletando pátio ID: 1 - Nome: Pátio Central (100 box(es) e 5 zona(s) serão deletados em cascata)
INFO  - Iniciando exclusão de dependências dos boxes do pátio ID: 1
INFO  - Dependências dos boxes deletadas: 50 notificações, 200 logs de movimentação, 10 VeiculoBox, 0 ZonaBox
INFO  - Pátio ID 1 deletado com sucesso (100 box(es) e 5 zona(s) foram deletados em cascata).
INFO  - 🗑️ Cache do mapa global invalidado após exclusão do pátio 1
```

### **Logs de Erro**

```
ERROR - Erro ao deletar dependências dos boxes do pátio ID 1: [detalhes do erro]
WARN  - Erro ao deletar notificações do box 5: [detalhes]
```

---

## ✅ Validação Pós-Exclusão

Após deletar um pátio, verifique:

```sql
-- 1. Confirmar que o pátio foi deletado
SELECT COUNT(*) FROM TB_PATIO WHERE ID_PATIO = :patioId;
-- Resultado esperado: 0

-- 2. Confirmar que boxes foram deletados
SELECT COUNT(*) FROM TB_BOX WHERE PATIO_ID = :patioId;
-- Resultado esperado: 0

-- 3. Confirmar que zonas foram deletadas
SELECT COUNT(*) FROM TB_ZONA WHERE TB_PATIO_ID_PATIO = :patioId;
-- Resultado esperado: 0

-- 4. Confirmar que estacionamentos históricos foram deletados
SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE TB_PATIO_ID_PATIO = :patioId;
-- Resultado esperado: 0 (ou apenas se houver registros órfãos)
```

---

## 📞 Suporte

Se encontrar problemas durante a exclusão:

1. **Verifique os logs** do servidor para detalhes do erro
2. **Capture a mensagem de erro** completa
3. **Verifique o estado do banco** com as queries de validação
4. **Entre em contato** com o suporte técnico fornecendo:
   - ID do pátio
   - Mensagem de erro completa
   - Logs do servidor
   - Resultado das queries de validação

---

## 🎯 Resumo Executivo

### ✅ **O que É PERMITIDO deletar:**
- Pátios sem veículos estacionados
- Pátios sem veículos associados
- Pátios com boxes e zonas (deletados automaticamente)
- Pátios com registros históricos (deletados automaticamente)

### ❌ **O que NÃO É PERMITIDO deletar:**
- Pátios com veículos estacionados no momento
- Pátios com veículos associados
- Pátios com erro ao processar dependências

### 🔄 **O que é DELETADO AUTOMATICAMENTE:**
- Boxes do pátio
- Zonas do pátio
- Estacionamentos históricos
- Notificações relacionadas
- Logs de movimentação relacionados
- Associações VeiculoBox

---

**Última atualização:** 2025-11-05  
**Versão:** 1.0  
**Status:** ✅ Implementado e Testado

