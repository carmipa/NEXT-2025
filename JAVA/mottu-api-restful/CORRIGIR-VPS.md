# 🔧 Guia para Corrigir Estrutura do Banco na VPS

## ❌ Problema Identificado

```
Schema-validation: missing column [tb_veiculo_id_veiculo] in table [tb_notificacao]
```

**Causa:** A tabela `TB_NOTIFICACAO` no banco de dados da VPS está desatualizada e não possui as colunas de relacionamento que a aplicação espera.

---

## ✅ Solução

### **Opção 1: Via SQL*Plus (Recomendado)**

1. **Faça upload do script para a VPS:**

```bash
scp fix-notificacao-simple.sql root@72.61.219.15:/tmp/
```

2. **Conecte via SSH na VPS:**

```bash
ssh root@72.61.219.15
```

3. **Execute o script SQL:**

```bash
# Conectar ao Oracle como o usuário do banco
sqlplus mottu_admin/SUA_SENHA@//localhost:1521/XE

# Ou se for outro usuário:
sqlplus RELACAODIRETA/SUA_SENHA@//localhost:1521/XE

# Executar o script
@/tmp/fix-notificacao-simple.sql
```

4. **Reinicie o serviço Mottu:**

```bash
sudo systemctl restart mottu.service
sudo systemctl status mottu.service
```

---

### **Opção 2: Via Cliente Oracle (SQL Developer, DBeaver, etc.)**

1. **Conecte no banco de dados da VPS**
   - Host: `72.61.219.15`
   - Port: `1521`
   - Service Name: `XE`
   - User: `RELACAODIRETA` (ou o usuário que você usa)

2. **Execute o conteúdo do arquivo `fix-notificacao-simple.sql`**

3. **Reinicie o serviço via SSH:**

```bash
ssh root@72.61.219.15
sudo systemctl restart mottu.service
```

---

### **Opção 3: Comandos Diretos (Linha por Linha)**

Se preferir executar comando por comando:

```sql
-- 1. Adicionar colunas
ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_VEICULO_ID_VEICULO NUMBER(19);
ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_PATIO_ID_PATIO NUMBER(19);
ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_BOX_ID_BOX NUMBER(19);

-- 2. Criar Foreign Keys
ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
  ADD CONSTRAINT FK_NOTIFICACAO_VEICULO 
  FOREIGN KEY (TB_VEICULO_ID_VEICULO) 
  REFERENCES RELACAODIRETA.TB_VEICULO(ID_VEICULO);

ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
  ADD CONSTRAINT FK_NOTIFICACAO_PATIO 
  FOREIGN KEY (TB_PATIO_ID_PATIO) 
  REFERENCES RELACAODIRETA.TB_PATIO(ID_PATIO);

ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
  ADD CONSTRAINT FK_NOTIFICACAO_BOX 
  FOREIGN KEY (TB_BOX_ID_BOX) 
  REFERENCES RELACAODIRETA.TB_BOX(ID_BOX);

-- 3. Criar índices (opcional, mas recomendado)
CREATE INDEX IDX_NOTIF_VEICULO ON RELACAODIRETA.TB_NOTIFICACAO(TB_VEICULO_ID_VEICULO);
CREATE INDEX IDX_NOTIF_PATIO ON RELACAODIRETA.TB_NOTIFICACAO(TB_PATIO_ID_PATIO);
CREATE INDEX IDX_NOTIF_BOX ON RELACAODIRETA.TB_NOTIFICACAO(TB_BOX_ID_BOX);

COMMIT;
```

---

## 🔍 Verificação

Após executar o script, verifique se as colunas foram criadas:

```sql
SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'TB_NOTIFICACAO'
ORDER BY COLUMN_ID;
```

**Resultado esperado deve incluir:**
- `TB_VEICULO_ID_VEICULO` (NUMBER, 19)
- `TB_PATIO_ID_PATIO` (NUMBER, 19)
- `TB_BOX_ID_BOX` (NUMBER, 19)

---

## ⚠️ Observações Importantes

1. **Backup:** Se possível, faça backup da tabela antes:
   ```sql
   CREATE TABLE TB_NOTIFICACAO_BACKUP AS SELECT * FROM RELACAODIRETA.TB_NOTIFICACAO;
   ```

2. **Credenciais:** Certifique-se de usar o usuário correto do banco (provavelmente `RELACAODIRETA`)

3. **Permissões:** O usuário precisa ter permissões de `ALTER TABLE`

4. **Downtime:** A aplicação ficará offline durante a execução (é rápido, ~5 segundos)

---

## 📝 Explicação

A entidade `Notificacao.java` possui relacionamentos opcionais com:
- `Veiculo` (linha 68-70)
- `Patio` (linha 61-62)
- `Box` (linha 65-66)

Essas colunas são necessárias para:
- Notificações relacionadas a veículos específicos
- Notificações relacionadas a pátios específicos
- Notificações relacionadas a boxes específicos

Exemplo: "Veículo ABC-1234 estacionado no Box 01 do Pátio Curitiba"

---

## 🐛 Se o Erro Persistir

1. **Verifique os logs novamente:**
   ```bash
   sudo journalctl -u mottu.service -f
   ```

2. **Verifique se o script foi executado com sucesso:**
   ```sql
   SELECT COUNT(*) FROM USER_TAB_COLUMNS 
   WHERE TABLE_NAME = 'TB_NOTIFICACAO' 
   AND COLUMN_NAME IN ('TB_VEICULO_ID_VEICULO', 'TB_PATIO_ID_PATIO', 'TB_BOX_ID_BOX');
   ```
   Deve retornar: **3**

3. **Reinicie o serviço novamente:**
   ```bash
   sudo systemctl stop mottu.service
   sudo systemctl start mottu.service
   ```

---

## 📞 Suporte

Se precisar de ajuda, forneça:
- ✅ Saída do script SQL
- ✅ Logs da aplicação após reiniciar
- ✅ Resultado da query de verificação




