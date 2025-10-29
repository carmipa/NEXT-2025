--------------------------------------------------------
--  Script para apagar todas as tabelas, sequences e objetos relacionados
--  Schema: RELACAODIRETA
--  CUIDADO: Este script apaga TODOS os objetos do schema!
--------------------------------------------------------

SET SERVEROUTPUT ON;

DECLARE
   v_sql VARCHAR2(4000);
   v_error_count NUMBER := 0;
BEGIN
   DBMS_OUTPUT.PUT_LINE('===========================================');
   DBMS_OUTPUT.PUT_LINE('Iniciando remoção de objetos...');
   DBMS_OUTPUT.PUT_LINE('===========================================');
   
   -- 1. Apagar todas as Foreign Key Constraints (evita problemas de referência)
   DBMS_OUTPUT.PUT_LINE('--- Removendo Foreign Keys ---');
   FOR c IN (
      SELECT constraint_name, table_name
      FROM user_constraints
      WHERE constraint_type = 'R'
      AND table_name IN (
         SELECT table_name
         FROM user_tables
      )
   ) LOOP
      BEGIN
         v_sql := 'ALTER TABLE "' || c.table_name || '" DROP CONSTRAINT "' || c.constraint_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   FK removida: ' || c.constraint_name || ' da tabela ' || c.table_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover FK ' || c.constraint_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 2. Apagar todas as tabelas com CASCADE CONSTRAINTS
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Tabelas ---');
   FOR c IN (
      SELECT table_name
      FROM user_tables
      ORDER BY table_name
   ) LOOP
      BEGIN
         v_sql := 'DROP TABLE "' || c.table_name || '" CASCADE CONSTRAINTS PURGE';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Tabela removida: ' || c.table_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover tabela ' || c.table_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 3. Apagar todas as Sequences
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Sequences ---');
   FOR c IN (
      SELECT sequence_name
      FROM user_sequences
      ORDER BY sequence_name
   ) LOOP
      BEGIN
         v_sql := 'DROP SEQUENCE "' || c.sequence_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Sequence removida: ' || c.sequence_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover sequence ' || c.sequence_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 4. Apagar todas as Views (se existirem)
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Views ---');
   FOR c IN (
      SELECT view_name
      FROM user_views
      ORDER BY view_name
   ) LOOP
      BEGIN
         v_sql := 'DROP VIEW "' || c.view_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   View removida: ' || c.view_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover view ' || c.view_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 5. Apagar todos os Triggers (se existirem)
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Triggers ---');
   FOR c IN (
      SELECT trigger_name
      FROM user_triggers
      ORDER BY trigger_name
   ) LOOP
      BEGIN
         v_sql := 'DROP TRIGGER "' || c.trigger_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Trigger removido: ' || c.trigger_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover trigger ' || c.trigger_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 6. Apagar todos os Procedures (se existirem)
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Procedures ---');
   FOR c IN (
      SELECT object_name
      FROM user_objects
      WHERE object_type = 'PROCEDURE'
      ORDER BY object_name
   ) LOOP
      BEGIN
         v_sql := 'DROP PROCEDURE "' || c.object_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Procedure removida: ' || c.object_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover procedure ' || c.object_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 7. Apagar todas as Functions (se existirem)
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Functions ---');
   FOR c IN (
      SELECT object_name
      FROM user_objects
      WHERE object_type = 'FUNCTION'
      ORDER BY object_name
   ) LOOP
      BEGIN
         v_sql := 'DROP FUNCTION "' || c.object_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Function removida: ' || c.object_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover function ' || c.object_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- 8. Apagar todos os Packages (se existirem)
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('--- Removendo Packages ---');
   FOR c IN (
      SELECT object_name
      FROM user_objects
      WHERE object_type IN ('PACKAGE', 'PACKAGE BODY')
      ORDER BY object_type DESC, object_name
   ) LOOP
      BEGIN
         v_sql := 'DROP ' || (SELECT object_type FROM user_objects WHERE object_name = c.object_name AND ROWNUM = 1) || ' "' || c.object_name || '"';
         EXECUTE IMMEDIATE v_sql;
         DBMS_OUTPUT.PUT_LINE('   Package removido: ' || c.object_name);
      EXCEPTION
         WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('   ERRO ao remover package ' || c.object_name || ': ' || SQLERRM);
            v_error_count := v_error_count + 1;
      END;
   END LOOP;
   
   -- Resumo final
   DBMS_OUTPUT.PUT_LINE('');
   DBMS_OUTPUT.PUT_LINE('===========================================');
   IF v_error_count = 0 THEN
      DBMS_OUTPUT.PUT_LINE('Processo concluído com SUCESSO!');
   ELSE
      DBMS_OUTPUT.PUT_LINE('Processo concluído com ' || v_error_count || ' ERRO(S)!');
   END IF;
   DBMS_OUTPUT.PUT_LINE('===========================================');
   
EXCEPTION
   WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('ERRO GERAL: ' || SQLERRM);
      RAISE;
END;
/


