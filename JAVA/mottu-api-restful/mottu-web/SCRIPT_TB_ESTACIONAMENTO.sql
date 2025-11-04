-- ============================================================
-- SCRIPT: Criação da Tabela TB_ESTACIONAMENTO
-- Sistema: MOTTU - Estacionamento de Motos
-- Data: 2025-11-03
-- ============================================================

-- ============================================================
-- 1. CRIAR SEQUENCE
-- ============================================================
CREATE SEQUENCE "RELACAODIRETA"."SEQ_TB_ESTACIONAMENTO" 
    MINVALUE 1 
    MAXVALUE 9999999999999999999999999999 
    INCREMENT BY 1 
    START WITH 1 
    CACHE 20 
    NOORDER NOCYCLE NOKEEP NOSCALE GLOBAL;

-- ============================================================
-- 2. CRIAR TABELA TB_ESTACIONAMENTO
-- ============================================================
CREATE TABLE "RELACAODIRETA"."TB_ESTACIONAMENTO" 
(	
    "ID_ESTACIONAMENTO" NUMBER(19,0) NOT NULL,
    "TB_VEICULO_ID_VEICULO" NUMBER(19,0) NOT NULL,
    "TB_BOX_ID_BOX" NUMBER(19,0) NOT NULL,
    "TB_PATIO_ID_PATIO" NUMBER(19,0) NOT NULL,
    "ESTA_ESTACIONADO" NUMBER(1,0) DEFAULT 1 NOT NULL,
    "DATA_ENTRADA" TIMESTAMP(6) NOT NULL,
    "DATA_SAIDA" TIMESTAMP(6),
    "DATA_ULTIMA_ATUALIZACAO" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "OBSERVACOES" VARCHAR2(500 CHAR),
    
    CONSTRAINT "TB_ESTACIONAMENTO_PK" PRIMARY KEY ("ID_ESTACIONAMENTO"),
    CONSTRAINT "TB_ESTACIONAMENTO_VEICULO_FK" 
        FOREIGN KEY ("TB_VEICULO_ID_VEICULO") 
        REFERENCES "RELACAODIRETA"."TB_VEICULO" ("ID_VEICULO") ON DELETE CASCADE,
    CONSTRAINT "TB_ESTACIONAMENTO_BOX_FK" 
        FOREIGN KEY ("TB_BOX_ID_BOX") 
        REFERENCES "RELACAODIRETA"."TB_BOX" ("ID_BOX") ON DELETE CASCADE,
    CONSTRAINT "TB_ESTACIONAMENTO_PATIO_FK" 
        FOREIGN KEY ("TB_PATIO_ID_PATIO") 
        REFERENCES "RELACAODIRETA"."TB_PATIO" ("ID_PATIO") ON DELETE CASCADE,
    CONSTRAINT "TB_ESTACIONAMENTO_CHECK" 
        CHECK ("ESTA_ESTACIONADO" IN (0, 1))
) 
SEGMENT CREATION IMMEDIATE 
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
NOCOMPRESS LOGGING
STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
TABLESPACE "USERS";

-- ============================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Índice para consulta rápida por veículo
CREATE INDEX "RELACAODIRETA"."IDX_ESTACIONAMENTO_VEICULO" 
    ON "RELACAODIRETA"."TB_ESTACIONAMENTO" 
    ("TB_VEICULO_ID_VEICULO", "ESTA_ESTACIONADO")
    PCTFREE 10 INITRANS 2 MAXTRANS 255 
    STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
    PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
    BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
    TABLESPACE "USERS";

-- Índice para consulta rápida por box
CREATE INDEX "RELACAODIRETA"."IDX_ESTACIONAMENTO_BOX" 
    ON "RELACAODIRETA"."TB_ESTACIONAMENTO" 
    ("TB_BOX_ID_BOX", "ESTA_ESTACIONADO")
    PCTFREE 10 INITRANS 2 MAXTRANS 255 
    STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
    PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
    BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
    TABLESPACE "USERS";

-- Índice para consulta rápida por pátio
CREATE INDEX "RELACAODIRETA"."IDX_ESTACIONAMENTO_PATIO" 
    ON "RELACAODIRETA"."TB_ESTACIONAMENTO" 
    ("TB_PATIO_ID_PATIO", "ESTA_ESTACIONADO")
    PCTFREE 10 INITRANS 2 MAXTRANS 255 
    STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
    PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
    BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
    TABLESPACE "USERS";

-- ============================================================
-- 4. CRIAR TRIGGER PARA CONSISTÊNCIA AUTOMÁTICA
-- ============================================================
CREATE OR REPLACE TRIGGER "RELACAODIRETA"."TRG_ESTACIONAMENTO_CONSISTENCIA"
BEFORE INSERT OR UPDATE ON "RELACAODIRETA"."TB_ESTACIONAMENTO"
FOR EACH ROW
BEGIN
    -- Sempre atualiza DATA_ULTIMA_ATUALIZACAO
    :NEW.DATA_ULTIMA_ATUALIZACAO := CURRENT_TIMESTAMP;
    
    -- Se mudou de ESTA_ESTACIONADO = 1 para 0, fecha DATA_SAIDA
    IF :OLD.ESTA_ESTACIONADO = 1 AND :NEW.ESTA_ESTACIONADO = 0 THEN
        IF :NEW.DATA_SAIDA IS NULL THEN
            :NEW.DATA_SAIDA := CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    -- Se mudou para ESTA_ESTACIONADO = 1, limpa DATA_SAIDA
    IF :NEW.ESTA_ESTACIONADO = 1 THEN
        :NEW.DATA_SAIDA := NULL;
    END IF;
END;
/

-- ============================================================
-- 5. MIGRAR DADOS EXISTENTES (se necessário)
-- ============================================================
-- NOTA: Execute este bloco APENAS se quiser migrar dados existentes
-- de TB_VEICULOBOX para TB_ESTACIONAMENTO

/*
INSERT INTO "RELACAODIRETA"."TB_ESTACIONAMENTO" (
    ID_ESTACIONAMENTO,
    TB_VEICULO_ID_VEICULO,
    TB_BOX_ID_BOX,
    TB_PATIO_ID_PATIO,
    ESTA_ESTACIONADO,
    DATA_ENTRADA,
    DATA_ULTIMA_ATUALIZACAO
)
SELECT 
    SEQ_TB_ESTACIONAMENTO.NEXTVAL,
    vb.TB_VEICULO_ID_VEICULO,
    vb.TB_BOX_ID_BOX,
    b.TB_PATIO_ID_PATIO,
    1,  -- ESTA_ESTACIONADO = SIM
    NVL(b.DATA_ENTRADA, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM "RELACAODIRETA"."TB_VEICULOBOX" vb
JOIN "RELACAODIRETA"."TB_BOX" b ON vb.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.STATUS = 'O';  -- Apenas boxes ocupados
*/

-- ============================================================
-- 6. VIEWS ÚTEIS PARA CONSULTAS
-- ============================================================

-- View: Veículos estacionados no momento
CREATE OR REPLACE VIEW "RELACAODIRETA"."VW_VEICULOS_ESTACIONADOS" AS
SELECT 
    e.ID_ESTACIONAMENTO,
    v.ID_VEICULO,
    v.PLACA,
    v.MODELO,
    v.FABRICANTE,
    b.ID_BOX,
    b.NOME as BOX_NOME,
    p.ID_PATIO,
    p.NOME_PATIO,
    e.DATA_ENTRADA,
    e.DATA_ULTIMA_ATUALIZACAO,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.DATA_ENTRADA)) * 24 * 60 +
    EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - e.DATA_ENTRADA)) * 60 +
    EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - e.DATA_ENTRADA)) as TEMPO_ESTACIONADO_MINUTOS
FROM "RELACAODIRETA"."TB_ESTACIONAMENTO" e
JOIN "RELACAODIRETA"."TB_VEICULO" v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
JOIN "RELACAODIRETA"."TB_BOX" b ON e.TB_BOX_ID_BOX = b.ID_BOX
JOIN "RELACAODIRETA"."TB_PATIO" p ON e.TB_PATIO_ID_PATIO = p.ID_PATIO
WHERE e.ESTA_ESTACIONADO = 1;

-- View: Estatísticas de ocupação por pátio
CREATE OR REPLACE VIEW "RELACAODIRETA"."VW_OCUPACAO_PATIO" AS
SELECT 
    p.ID_PATIO,
    p.NOME_PATIO,
    COUNT(DISTINCT CASE WHEN e.ESTA_ESTACIONADO = 1 THEN e.ID_ESTACIONAMENTO END) as VEICULOS_ESTACIONADOS,
    COUNT(DISTINCT b.ID_BOX) as TOTAL_BOXES,
    COUNT(DISTINCT CASE WHEN b.STATUS = 'L' THEN b.ID_BOX END) as BOXES_LIVRES,
    COUNT(DISTINCT CASE WHEN b.STATUS = 'O' THEN b.ID_BOX END) as BOXES_OCUPADOS,
    ROUND(
        COUNT(DISTINCT CASE WHEN b.STATUS = 'O' THEN b.ID_BOX END) * 100.0 / 
        NULLIF(COUNT(DISTINCT b.ID_BOX), 0), 
        2
    ) as PERCENTUAL_OCUPACAO
FROM "RELACAODIRETA"."TB_PATIO" p
LEFT JOIN "RELACAODIRETA"."TB_BOX" b ON p.ID_PATIO = b.TB_PATIO_ID_PATIO
LEFT JOIN "RELACAODIRETA"."TB_ESTACIONAMENTO" e ON b.ID_BOX = e.TB_BOX_ID_BOX
GROUP BY p.ID_PATIO, p.NOME_PATIO;

-- ============================================================
-- 7. PROCEDURES ÚTEIS
-- ============================================================

-- Procedure: Estacionar veículo
CREATE OR REPLACE PROCEDURE "RELACAODIRETA"."SP_ESTACIONAR_VEICULO" (
    p_veiculo_id IN NUMBER,
    p_box_id IN NUMBER,
    p_patio_id IN NUMBER,
    p_observacoes IN VARCHAR2 DEFAULT NULL
) AS
    v_box_status VARCHAR2(1);
    v_ja_estacionado NUMBER;
BEGIN
    -- Verifica se box está livre
    SELECT STATUS INTO v_box_status
    FROM "RELACAODIRETA"."TB_BOX"
    WHERE ID_BOX = p_box_id;
    
    IF v_box_status = 'O' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Box já está ocupado!');
    END IF;
    
    -- Verifica se veículo já está estacionado
    SELECT COUNT(*) INTO v_ja_estacionado
    FROM "RELACAODIRETA"."TB_ESTACIONAMENTO"
    WHERE TB_VEICULO_ID_VEICULO = p_veiculo_id
      AND ESTA_ESTACIONADO = 1;
    
    IF v_ja_estacionado > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Veículo já está estacionado!');
    END IF;
    
    -- Insere registro de estacionamento
    INSERT INTO "RELACAODIRETA"."TB_ESTACIONAMENTO" (
        ID_ESTACIONAMENTO,
        TB_VEICULO_ID_VEICULO,
        TB_BOX_ID_BOX,
        TB_PATIO_ID_PATIO,
        ESTA_ESTACIONADO,
        DATA_ENTRADA,
        OBSERVACOES
    ) VALUES (
        SEQ_TB_ESTACIONAMENTO.NEXTVAL,
        p_veiculo_id,
        p_box_id,
        p_patio_id,
        1,
        CURRENT_TIMESTAMP,
        p_observacoes
    );
    
    -- Atualiza box
    UPDATE "RELACAODIRETA"."TB_BOX"
    SET STATUS = 'O',
        DATA_ENTRADA = CURRENT_TIMESTAMP,
        DATA_SAIDA = NULL
    WHERE ID_BOX = p_box_id;
    
    -- Cria log de movimentação
    INSERT INTO "RELACAODIRETA"."TB_LOG_MOVIMENTACAO" (
        ID_LOG_MOVIMENTACAO,
        DATA_HORA_MOVIMENTACAO,
        TIPO_MOVIMENTACAO,
        TB_BOX_ID_BOX,
        TB_PATIO_ID_PATIO,
        TB_VEICULO_ID_VEICULO,
        OBSERVACOES
    ) VALUES (
        SEQ_TB_LOG_MOVIMENTACAO.NEXTVAL,
        CURRENT_TIMESTAMP,
        'ENTRADA',
        p_box_id,
        p_patio_id,
        p_veiculo_id,
        'Estacionamento registrado via TB_ESTACIONAMENTO'
    );
    
    COMMIT;
END;
/

-- Procedure: Liberar veículo
CREATE OR REPLACE PROCEDURE "RELACAODIRETA"."SP_LIBERAR_VEICULO" (
    p_veiculo_id IN NUMBER,
    p_observacoes IN VARCHAR2 DEFAULT NULL
) AS
    v_box_id NUMBER;
    v_patio_id NUMBER;
    v_data_entrada TIMESTAMP;
BEGIN
    -- Busca estacionamento ativo
    SELECT TB_BOX_ID_BOX, TB_PATIO_ID_PATIO, DATA_ENTRADA
    INTO v_box_id, v_patio_id, v_data_entrada
    FROM "RELACAODIRETA"."TB_ESTACIONAMENTO"
    WHERE TB_VEICULO_ID_VEICULO = p_veiculo_id
      AND ESTA_ESTACIONADO = 1;
    
    IF v_box_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20003, 'Veículo não está estacionado!');
    END IF;
    
    -- Atualiza estacionamento
    UPDATE "RELACAODIRETA"."TB_ESTACIONAMENTO"
    SET ESTA_ESTACIONADO = 0,
        DATA_SAIDA = CURRENT_TIMESTAMP,
        OBSERVACOES = NVL(p_observacoes, OBSERVACOES)
    WHERE TB_VEICULO_ID_VEICULO = p_veiculo_id
      AND ESTA_ESTACIONADO = 1;
    
    -- Atualiza box
    UPDATE "RELACAODIRETA"."TB_BOX"
    SET STATUS = 'L',
        DATA_SAIDA = CURRENT_TIMESTAMP
    WHERE ID_BOX = v_box_id;
    
    -- Calcula tempo de estacionamento
    DECLARE
        v_tempo_minutos NUMBER;
    BEGIN
        v_tempo_minutos := EXTRACT(DAY FROM (CURRENT_TIMESTAMP - v_data_entrada)) * 24 * 60 +
                          EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - v_data_entrada)) * 60 +
                          EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - v_data_entrada));
        
        -- Cria log de movimentação
        INSERT INTO "RELACAODIRETA"."TB_LOG_MOVIMENTACAO" (
            ID_LOG_MOVIMENTACAO,
            DATA_HORA_MOVIMENTACAO,
            TIPO_MOVIMENTACAO,
            TB_BOX_ID_BOX,
            TB_PATIO_ID_PATIO,
            TB_VEICULO_ID_VEICULO,
            TEMPO_ESTACIONAMENTO_MINUTOS,
            OBSERVACOES
        ) VALUES (
            SEQ_TB_LOG_MOVIMENTACAO.NEXTVAL,
            CURRENT_TIMESTAMP,
            'SAIDA',
            v_box_id,
            v_patio_id,
            p_veiculo_id,
            v_tempo_minutos,
            NVL(p_observacoes, 'Saída registrada via TB_ESTACIONAMENTO')
        );
    END;
    
    COMMIT;
END;
/

-- ============================================================
-- 8. EXEMPLOS DE USO
-- ============================================================

-- Exemplo 1: Estacionar veículo
/*
EXEC "RELACAODIRETA"."SP_ESTACIONAR_VEICULO"(
    p_veiculo_id => 21,
    p_box_id => 1173,
    p_patio_id => 18,
    p_observacoes => 'Estacionamento via TB_ESTACIONAMENTO'
);
*/

-- Exemplo 2: Liberar veículo
/*
EXEC "RELACAODIRETA"."SP_LIBERAR_VEICULO"(
    p_veiculo_id => 21,
    p_observacoes => 'Saída registrada'
);
*/

-- Exemplo 3: Consultar veículos estacionados
/*
SELECT * FROM "RELACAODIRETA"."VW_VEICULOS_ESTACIONADOS";
*/

-- Exemplo 4: Consultar ocupação por pátio
/*
SELECT * FROM "RELACAODIRETA"."VW_OCUPACAO_PATIO";
*/

-- Exemplo 5: Verificar se veículo está estacionado
/*
SELECT 
    CASE 
        WHEN ESTA_ESTACIONADO = 1 THEN 'SIM'
        ELSE 'NÃO'
    END as ESTA_ESTACIONADO,
    BOX_NOME,
    NOME_PATIO,
    DATA_ENTRADA
FROM "RELACAODIRETA"."VW_VEICULOS_ESTACIONADOS"
WHERE PLACA = 'EGX4D33';
*/

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================

