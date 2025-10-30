-- Script para truncar todas as tabelas do banco na ordem correta
-- Ordem: filhos primeiro, depois pais (respeitando as FKs)

SET SERVEROUTPUT ON
DECLARE
  PROCEDURE try_truncate(p_table IN VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE 'TRUNCATE TABLE '||p_table;
    DBMS_OUTPUT.PUT_LINE('OK: '||p_table);
  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('ERRO: '||p_table||' -> '||SQLERRM);
  END;
BEGIN
  DBMS_OUTPUT.PUT_LINE('=== INICIANDO TRUNCATE DE TODAS AS TABELAS ===');
  
  -- Tabelas filhas primeiro (sem dependências)
  try_truncate('TB_VEICULORASTREAMENTO');
  try_truncate('TB_VEICULOZONA');
  try_truncate('TB_VEICULOPATIO');
  try_truncate('TB_VEICULOBOX');
  try_truncate('TB_VB');
  try_truncate('TB_VP');
  try_truncate('TB_VR');
  try_truncate('TB_RP');
  try_truncate('TB_CV');
  try_truncate('TB_CLIENTEVEICULO');
  try_truncate('TB_CONTATOPATIO');
  try_truncate('TB_ENDERECIOPATIO');
  try_truncate('TB_LOG_MOVIMENTACAO');
  try_truncate('TB_ZONA');
  try_truncate('TB_BOX');
  try_truncate('TB_VEICULO');
  try_truncate('TB_RASTREAMENTO');
  try_truncate('TB_PATIO');
  try_truncate('TB_CNH');
  try_truncate('TB_CONTATO');
  try_truncate('TB_ENDERECO');
  try_truncate('TB_CLIENTE');
  
  DBMS_OUTPUT.PUT_LINE('=== TRUNCATE CONCLUÍDO ===');
END;
/

-- Verificar se todas as tabelas foram limpas
SELECT 'VERIFICAÇÃO APÓS TRUNCATE:' as INFO FROM DUAL;
SELECT 'TB_CLIENTE:' as TABELA, COUNT(*) as REGISTROS FROM TB_CLIENTE
UNION ALL
SELECT 'TB_CONTATO:', COUNT(*) FROM TB_CONTATO
UNION ALL
SELECT 'TB_ENDERECO:', COUNT(*) FROM TB_ENDERECO
UNION ALL
SELECT 'TB_PATIO:', COUNT(*) FROM TB_PATIO
UNION ALL
SELECT 'TB_CNH:', COUNT(*) FROM TB_CNH
UNION ALL
SELECT 'TB_VEICULO:', COUNT(*) FROM TB_VEICULO
UNION ALL
SELECT 'TB_BOX:', COUNT(*) FROM TB_BOX
UNION ALL
SELECT 'TB_ZONA:', COUNT(*) FROM TB_ZONA;

-- Atualizar estatísticas
BEGIN
  DBMS_STATS.GATHER_SCHEMA_STATS(
    ownname => USER,
    options => 'GATHER AUTO'
  );
  DBMS_OUTPUT.PUT_LINE('Estatísticas atualizadas com sucesso!');
END;
/

SELECT 'Banco totalmente limpo e pronto para uso!' as RESULTADO FROM DUAL;



