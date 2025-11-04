# Como corrigir inconsistência no banco usando SQL Developer

## Passos simples:

1. **Abra o SQL Developer** e conecte-se ao banco:
   - Host: `localhost`
   - Port: `1521`
   - Service Name: `XEPDB1`
   - Username: `relacaoDireta` ou `RELACAODIRETA`
   - Password: `paulo1`

2. **Abra o arquivo `CORRIGIR_BD.sql`** ou copie e cole o SQL abaixo:

```sql
-- Corrigir inconsistência
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
```

3. **Execute o script** (F5 ou botão "Run Script")

4. **Verifique o resultado** executando:

```sql
SELECT 
    e.ID_ESTACIONAMENTO,
    v.PLACA,
    b.STATUS as BOX_STATUS,
    e.ESTA_ESTACIONADO,
    e.DATA_SAIDA
FROM RELACAODIRETA.TB_ESTACIONAMENTO e
JOIN RELACAODIRETA.TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN RELACAODIRETA.TB_BOX b ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE v.PLACA IN ('EGX1D92', 'EGC4F67');
```

## Resultado esperado:

- ✅ `BOX_STATUS = 'L'` (livre)
- ✅ `ESTA_ESTACIONADO = 0` (liberado)
- ✅ `DATA_SAIDA` preenchida com timestamp

## Depois da correção:

1. Compile o backend: `cd mottu-gradle && ./gradlew clean build`
2. Reinicie o backend
3. Teste a liberação novamente via mapa
4. Com as correções no código (usando `JdbcTemplate`), a inconsistência não deve mais ocorrer
