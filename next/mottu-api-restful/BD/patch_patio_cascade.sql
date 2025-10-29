-- ============================================================================
-- MOTTU - Hardening de Integridade Referencial para operações de deleção de Pátio
-- Ambiente: Oracle XE (container) - Schema: RELACAODIRETA
-- Objetivos:
--  1) Garantir deleção em cascata de dependentes ao remover TB_PATIO
--  2) Evitar órfãos em tabelas auxiliares (RP, VP)
--  3) Ajustar NOTIFICAÇÃO para não bloquear deleções (SET NULL)
--  4) Assegurar unicidade de nome de Box por pátio
-- Execução: sqlplus relacaoDireta/paulo1@localhost:1521/XEPDB1 @BD/patch_patio_cascade.sql
-- ============================================================================

ALTER SESSION SET CURRENT_SCHEMA = RELACAODIRETA;

-- =========================
-- 1) BOX -> PATIO (CASCADE)
-- =========================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_BOX DROP CONSTRAINT FK_BOX_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_BOX
  ADD CONSTRAINT FK_BOX_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

-- =================================
-- 2) ZONA -> PATIO (CASCADE por ID)
-- Nota: A constraint aqui é por ID_PATIO.
-- Mesmo que o mapeamento JPA use duas colunas, a existência/forma da FK
-- no banco não afeta o JPA; ele usa os nomes de coluna para o join.
-- =================================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_ZONA DROP CONSTRAINT TB_ZONA_TB_PATIO_FK'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_ZONA
  ADD CONSTRAINT TB_ZONA_TB_PATIO_FK
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

-- =====================================
-- 3) Tabelas de junção N:N com Pátio (CASCADE)
-- =====================================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_CONTATOPATIO DROP CONSTRAINT FK_CONTATOPATIO_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_CONTATOPATIO
  ADD CONSTRAINT FK_CONTATOPATIO_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_ENDERECIOPATIO DROP CONSTRAINT FK_ENDERECIOPATIO_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_ENDERECIOPATIO
  ADD CONSTRAINT FK_ENDERECIOPATIO_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_VEICULOPATIO DROP CONSTRAINT FK_VEICULOPATIO_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_VEICULOPATIO
  ADD CONSTRAINT FK_VEICULOPATIO_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

-- =====================================
-- 4) Tabelas auxiliares que referenciam Pátio (CASCADE)
--    RP e VP podem não ter FKs ainda; criamos com CASCADE
-- =====================================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_RP DROP CONSTRAINT FK_RP_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_RP
  ADD CONSTRAINT FK_RP_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_VP DROP CONSTRAINT FK_VP_PATIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_VP
  ADD CONSTRAINT FK_VP_PATIO
  FOREIGN KEY (TB_PATIO_ID_PATIO)
  REFERENCES TB_PATIO(ID_PATIO)
  ON DELETE CASCADE;

-- ==================================================
-- 5) NOTIFICAÇÕES: não bloquear deleções (SET NULL)
-- ==================================================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_NOTIFICACAO DROP CONSTRAINT fk_notif_patio'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_NOTIFICACAO
  ADD CONSTRAINT fk_notif_patio
  FOREIGN KEY (tb_patio_id_patio)
  REFERENCES TB_PATIO(id_patio)
  ON DELETE SET NULL;

BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_NOTIFICACAO DROP CONSTRAINT fk_notif_box'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_NOTIFICACAO
  ADD CONSTRAINT fk_notif_box
  FOREIGN KEY (tb_box_id_box)
  REFERENCES TB_BOX(id_box)
  ON DELETE SET NULL;

-- ==========================================================
-- 6) Unicidade por pátio para nomes de boxes (evita colisão)
-- ==========================================================
BEGIN EXECUTE IMMEDIATE 'ALTER TABLE TB_BOX DROP CONSTRAINT UX_BOX_PATIO_NOME'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
ALTER TABLE TB_BOX
  ADD CONSTRAINT UX_BOX_PATIO_NOME
  UNIQUE (TB_PATIO_ID_PATIO, NOME);

COMMIT;

-- =====================
-- 7) Verificações rápidas
-- =====================
-- SELECT COUNT(*) FROM TB_BOX WHERE TB_PATIO_ID_PATIO = :id;            -- deve ser 0 após deletar o pátio
-- SELECT COUNT(*) FROM TB_ZONA WHERE TB_PATIO_ID_PATIO = :id;           -- idem
-- SELECT COUNT(*) FROM TB_VEICULOPATIO WHERE TB_PATIO_ID_PATIO = :id;   -- idem
-- SELECT COUNT(*) FROM TB_CONTATOPATIO WHERE TB_PATIO_ID_PATIO = :id;   -- idem
-- SELECT COUNT(*) FROM TB_ENDERECIOPATIO WHERE TB_PATIO_ID_PATIO = :id; -- idem
-- SELECT COUNT(*) FROM TB_RP WHERE TB_PATIO_ID_PATIO = :id;             -- idem
-- SELECT COUNT(*) FROM TB_VP WHERE TB_PATIO_ID_PATIO = :id;             -- idem



