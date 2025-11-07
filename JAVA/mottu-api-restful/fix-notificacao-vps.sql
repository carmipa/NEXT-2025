-- =====================================================
-- Script para corrigir estrutura da tabela TB_NOTIFICACAO
-- Executar no Oracle Database da VPS
-- =====================================================

-- Verificar se a coluna TB_VEICULO_ID_VEICULO existe
-- Se não existir, o script irá adicionar

-- Adicionar coluna TB_VEICULO_ID_VEICULO se não existir
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_VEICULO_ID_VEICULO NUMBER(19)';
    DBMS_OUTPUT.PUT_LINE('✅ Coluna TB_VEICULO_ID_VEICULO adicionada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Coluna TB_VEICULO_ID_VEICULO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Adicionar coluna TB_PATIO_ID_PATIO se não existir
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_PATIO_ID_PATIO NUMBER(19)';
    DBMS_OUTPUT.PUT_LINE('✅ Coluna TB_PATIO_ID_PATIO adicionada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Coluna TB_PATIO_ID_PATIO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Adicionar coluna TB_BOX_ID_BOX se não existir
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO ADD TB_BOX_ID_BOX NUMBER(19)';
    DBMS_OUTPUT.PUT_LINE('✅ Coluna TB_BOX_ID_BOX adicionada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Coluna TB_BOX_ID_BOX já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Criar Foreign Key para TB_VEICULO_ID_VEICULO
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
                       ADD CONSTRAINT FK_NOTIFICACAO_VEICULO 
                       FOREIGN KEY (TB_VEICULO_ID_VEICULO) 
                       REFERENCES RELACAODIRETA.TB_VEICULO(ID_VEICULO)';
    DBMS_OUTPUT.PUT_LINE('✅ Foreign Key FK_NOTIFICACAO_VEICULO criada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2275 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Foreign Key FK_NOTIFICACAO_VEICULO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Criar Foreign Key para TB_PATIO_ID_PATIO
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
                       ADD CONSTRAINT FK_NOTIFICACAO_PATIO 
                       FOREIGN KEY (TB_PATIO_ID_PATIO) 
                       REFERENCES RELACAODIRETA.TB_PATIO(ID_PATIO)';
    DBMS_OUTPUT.PUT_LINE('✅ Foreign Key FK_NOTIFICACAO_PATIO criada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2275 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Foreign Key FK_NOTIFICACAO_PATIO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Criar Foreign Key para TB_BOX_ID_BOX
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE RELACAODIRETA.TB_NOTIFICACAO 
                       ADD CONSTRAINT FK_NOTIFICACAO_BOX 
                       FOREIGN KEY (TB_BOX_ID_BOX) 
                       REFERENCES RELACAODIRETA.TB_BOX(ID_BOX)';
    DBMS_OUTPUT.PUT_LINE('✅ Foreign Key FK_NOTIFICACAO_BOX criada com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2275 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Foreign Key FK_NOTIFICACAO_BOX já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Criar índices para melhor performance
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_NOTIF_VEICULO ON RELACAODIRETA.TB_NOTIFICACAO(TB_VEICULO_ID_VEICULO)';
    DBMS_OUTPUT.PUT_LINE('✅ Índice IDX_NOTIF_VEICULO criado com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Índice IDX_NOTIF_VEICULO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_NOTIF_PATIO ON RELACAODIRETA.TB_NOTIFICACAO(TB_PATIO_ID_PATIO)';
    DBMS_OUTPUT.PUT_LINE('✅ Índice IDX_NOTIF_PATIO criado com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Índice IDX_NOTIF_PATIO já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_NOTIF_BOX ON RELACAODIRETA.TB_NOTIFICACAO(TB_BOX_ID_BOX)';
    DBMS_OUTPUT.PUT_LINE('✅ Índice IDX_NOTIF_BOX criado com sucesso!');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('⚠️  Índice IDX_NOTIF_BOX já existe.');
        ELSE
            RAISE;
        END IF;
END;
/

-- Verificar a estrutura final da tabela
SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'TB_NOTIFICACAO'
ORDER BY COLUMN_ID;

-- Contar registros
SELECT COUNT(*) AS TOTAL_NOTIFICACOES FROM RELACAODIRETA.TB_NOTIFICACAO;

COMMIT;





