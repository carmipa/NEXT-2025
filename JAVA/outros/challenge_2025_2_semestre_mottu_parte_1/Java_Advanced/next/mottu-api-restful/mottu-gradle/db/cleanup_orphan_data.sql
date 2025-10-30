-- Script para limpar contatos e endereços órfãos
-- Execute este script para remover registros que não estão mais associados a nenhum cliente

-- Primeiro, vamos ver quantos registros órfãos temos
SELECT 'CONTATOS ÓRFÃOS:' as INFO;
SELECT COUNT(*) as TOTAL_CONTATOS_ORFAOS
FROM TB_CONTATO c 
WHERE NOT EXISTS (
    SELECT 1 FROM TB_CLIENTE cl 
    WHERE cl.TB_CONTATO_ID_CONTATO = c.ID_CONTATO
);

SELECT 'ENDEREÇOS ÓRFÃOS:' as INFO;
SELECT COUNT(*) as TOTAL_ENDERECOS_ORFAOS
FROM TB_ENDERECO e 
WHERE NOT EXISTS (
    SELECT 1 FROM TB_CLIENTE cl 
    WHERE cl.TB_ENDERECO_ID_ENDERECO = e.ID_ENDERECO
);

-- Listar contatos órfãos antes de deletar
SELECT 'CONTATOS ÓRFÃOS (serão deletados):' as INFO;
SELECT ID_CONTATO, EMAIL, TELEFONE1, CELULAR
FROM TB_CONTATO c 
WHERE NOT EXISTS (
    SELECT 1 FROM TB_CLIENTE cl 
    WHERE cl.TB_CONTATO_ID_CONTATO = c.ID_CONTATO
);

-- Listar endereços órfãos antes de deletar
SELECT 'ENDEREÇOS ÓRFÃOS (serão deletados):' as INFO;
SELECT ID_ENDERECO, CEP, LOGRADOURO, BAIRRO, CIDADE
FROM TB_ENDERECO e 
WHERE NOT EXISTS (
    SELECT 1 FROM TB_CLIENTE cl 
    WHERE cl.TB_ENDERECO_ID_ENDERECO = e.ID_ENDERECO
);

-- ATENÇÃO: Descomente as linhas abaixo para executar a limpeza
-- IMPORTANTE: Faça backup antes de executar!

-- DELETE FROM TB_CONTATO 
-- WHERE ID_CONTATO IN (
--     SELECT c.ID_CONTATO
--     FROM TB_CONTATO c 
--     WHERE NOT EXISTS (
--         SELECT 1 FROM TB_CLIENTE cl 
--         WHERE cl.TB_CONTATO_ID_CONTATO = c.ID_CONTATO
--     )
-- );

-- DELETE FROM TB_ENDERECO 
-- WHERE ID_ENDERECO IN (
--     SELECT e.ID_ENDERECO
--     FROM TB_ENDERECO e 
--     WHERE NOT EXISTS (
--         SELECT 1 FROM TB_CLIENTE cl 
--         WHERE cl.TB_ENDERECO_ID_ENDERECO = e.ID_ENDERECO
--     )
-- );

-- Verificar resultado após limpeza
SELECT 'APÓS LIMPEZA - CONTATOS RESTANTES:' as INFO;
SELECT COUNT(*) as TOTAL_CONTATOS_RESTANTES FROM TB_CONTATO;

SELECT 'APÓS LIMPEZA - ENDEREÇOS RESTANTES:' as INFO;
SELECT COUNT(*) as TOTAL_ENDERECOS_RESTANTES FROM TB_ENDERECO;



