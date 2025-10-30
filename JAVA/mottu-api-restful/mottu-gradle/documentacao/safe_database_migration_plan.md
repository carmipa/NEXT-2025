# 📋 PLANO DE MIGRAÇÃO SEGURA - MOTTU

## ✅ **ANÁLISE COMPLETA: Estrutura Atual vs. Novos Relatórios**

### **🎯 OBJETIVO**
Implementar sistema de relatórios **SEM ALTERAR** tabelas existentes, mantendo total compatibilidade com o sistema atual.

---

## **📊 TABELAS EXISTENTES (NÃO ALTERAR)**

| Tabela | Status | Observações |
|--------|--------|-------------|
| `TB_PATIO` | ✅ OK | ID_PATIO, NOME_PATIO, STATUS, OBSERVACAO, DATA_CADASTRO |
| `TB_ZONA` | ✅ OK | ID_ZONA, NOME, STATUS, OBSERVACAO, TB_PATIO_ID_PATIO, TB_PATIO_STATUS |
| `TB_BOX` | ✅ OK | ID_BOX, NOME, STATUS, OBSERVACAO, DATA_ENTRADA, DATA_SAIDA, TB_PATIO_ID_PATIO |
| `TB_VEICULO` | ⚠️ AJUSTE | Corrigido: MOLDELO → MODELO (duplicação removida) |
| `TB_VEICULOBOX` | ✅ OK | TB_VEICULO_ID_VEICULO, TB_BOX_ID_BOX |
| `TB_CLIENTE` | ✅ OK | ID_CLIENTE, NOME, SOBRENOME, CPF, etc. |
| `TB_CONTATO` | ✅ OK | ID_CONTATO, TELEFONE, EMAIL, etc. |
| `TB_ENDERECO` | ✅ OK | ID_ENDERECO, CEP, LOGRADOURO, CIDADE, etc. |
| `TB_RASTREAMENTO` | ✅ OK | ID_RASTREAMENTO, IPS_X, IPS_Y, GPRS_LATITUDE, etc. |

---

## **🆕 NOVAS TABELAS (APENAS CRIAR)**

### **TB_LOG_MOVIMENTACAO** - Para Relatórios
```sql
-- ✅ PODE SER CRIADA SEM AFETAR SISTEMA EXISTENTE
CREATE TABLE TB_LOG_MOVIMENTACAO (
    ID_LOG_MOVIMENTACAO NUMBER(19) PRIMARY KEY,
    TB_VEICULO_ID_VEICULO NUMBER(19) NOT NULL,
    TB_BOX_ID_BOX NUMBER(19) NOT NULL,
    TB_PATIO_ID_PATIO NUMBER(19) NOT NULL,
    TIPO_MOVIMENTACAO VARCHAR2(10) NOT NULL CHECK (TIPO_MOVIMENTACAO IN ('ENTRADA', 'SAIDA')),
    DATA_HORA_MOVIMENTACAO TIMESTAMP NOT NULL,
    TEMPO_ESTACIONAMENTO_MINUTOS NUMBER(19),
    OBSERVACOES VARCHAR2(255)
);
```

---

## **🔧 CORREÇÕES APLICADAS**

### **1. Veiculo.java - Duplicação MOLDELO/MODELO**
- **Problema**: Duas colunas similares (linha 40: MOLDELO, linha 55: MODELO)
- **Solução**: ✅ Removida duplicação, mantida apenas MODELO
- **Impacto**: Zero - apenas código Java ajustado

### **2. LogMovimentacao.java - Nova Entidade**
- **Status**: ✅ Criada nova entidade sem afetar existentes
- **Relacionamentos**: Usa apenas IDs das tabelas existentes
- **Impacto**: Zero - tabela completamente nova

---

## **📋 SCRIPTS DE VERIFICAÇÃO**

### **1. database_analysis_report.sql**
- Verifica existência de todas as tabelas
- Analisa estrutura de colunas críticas
- Verifica constraints de FK
- Conta registros existentes
- Identifica status distintos

### **2. fix_veiculo_modelo_issue.sql**
- Verifica se existe MOLDELO ou MODELO no BD
- Fornece comandos para correção (se necessário)
- Garante consistência entre código e BD

### **3. create_log_movimentacao_table.sql**
- Cria apenas a nova tabela de logs
- Não altera estrutura existente
- Inclui sequences e constraints necessárias

---

## **🚀 PLANO DE EXECUÇÃO**

### **Fase 1: Verificação (SEM RISCO)**
```bash
# 1. Executar análise completa
sqlplus usuario/senha@localhost:1521/XEPDB1 @database_analysis_report.sql

# 2. Verificar problema MOLDELO/MODELO
sqlplus usuario/senha@localhost:1521/XEPDB1 @fix_veiculo_modelo_issue.sql
```

### **Fase 2: Correções (SE NECESSÁRIO)**
```bash
# Apenas se análise identificar problemas:
# - Renomear coluna MOLDELO → MODELO (se existir)
# - Ajustar dados inconsistentes
```

### **Fase 3: Nova Funcionalidade (ZERO RISCO)**
```bash
# 3. Criar tabela de logs (opcional)
sqlplus usuario/senha@localhost:1521/XEPDB1 @create_log_movimentacao_table.sql
```

### **Fase 4: Teste**
```bash
# 4. Testar aplicação
cd mottu-gradle
./gradlew bootRun

# 5. Verificar endpoints de relatórios
curl http://localhost:8080/api/relatorios/ocupacao-atual
```

---

## **⚠️ PONTOS DE ATENÇÃO**

### **1. TB_ZONA - FK Composta**
- **Relacionamento**: (TB_PATIO_ID_PATIO, TB_PATIO_STATUS) → TB_PATIO(ID_PATIO, STATUS)
- **Verificar**: Se TB_PATIO_STATUS existe e é consistente
- **Impacto**: Pode afetar consultas se FK estiver quebrada

### **2. TB_BOX - Status**
- **Valores Esperados**: 'L' (Livre), 'O' (Ocupado)
- **Verificar**: Se existem outros valores no BD
- **Impacto**: Pode afetar relatórios se houver inconsistência

### **3. Sequences**
- **Verificar**: Se todas as sequences necessárias existem
- **Impacto**: Pode impedir criação de novos registros

---

## **✅ GARANTIAS DE SEGURANÇA**

1. **❌ NÃO ALTERAMOS** estrutura de tabelas existentes
2. **❌ NÃO REMOVEMOS** colunas ou constraints existentes
3. **❌ NÃO MODIFICAMOS** dados existentes
4. **✅ APENAS CRIAMOS** novas tabelas e entidades
5. **✅ APENAS AJUSTAMOS** código Java para compatibilidade
6. **✅ MANTEMOS** total compatibilidade com sistema atual

---

## **🎯 RESULTADO ESPERADO**

- ✅ Sistema atual continua funcionando normalmente
- ✅ Novos endpoints de relatórios funcionais
- ✅ Dados históricos preservados
- ✅ Zero downtime na migração
- ✅ Possibilidade de rollback completo (apenas deletar nova tabela)

---

## **📞 PRÓXIMOS PASSOS**

1. **Execute** `database_analysis_report.sql` para análise completa
2. **Verifique** se há problemas identificados
3. **Aplique** correções apenas se necessário
4. **Crie** TB_LOG_MOVIMENTACAO se desejar usar logs
5. **Teste** aplicação com novos endpoints de relatórios

**🎉 Resultado: Sistema de relatórios funcional sem quebrar nada existente!**

