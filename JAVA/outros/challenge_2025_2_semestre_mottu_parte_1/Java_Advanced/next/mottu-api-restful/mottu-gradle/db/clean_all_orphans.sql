-- Script para limpar TODOS os contatos e endereços órfãos
-- Como temos 0 clientes, todos os contatos e endereços estão órfãos

-- Verificar antes da limpeza
SELECT 'ANTES DA LIMPEZA:' as INFO FROM DUAL;
SELECT COUNT(*) as TOTAL_CONTATOS FROM TB_CONTATO;
SELECT COUNT(*) as TOTAL_ENDERECOS FROM TB_ENDERECO;
SELECT COUNT(*) as TOTAL_CLIENTES FROM TB_CLIENTE;

-- Limpar todos os contatos órfãos
DELETE FROM TB_CONTATO 
WHERE ID_CONTATO IN (
    SELECT c.ID_CONTATO
    FROM TB_CONTATO c 
    WHERE NOT EXISTS (
        SELECT 1 FROM TB_CLIENTE cl 
        WHERE cl.TB_CONTATO_ID_CONTATO = c.ID_CONTATO
    )
);

-- Limpar todos os endereços órfãos
DELETE FROM TB_ENDERECO 
WHERE ID_ENDERECO IN (
    SELECT e.ID_ENDERECO
    FROM TB_ENDERECO e 
    WHERE NOT EXISTS (
        SELECT 1 FROM TB_CLIENTE cl 
        WHERE cl.TB_ENDERECO_ID_ENDERECO = e.ID_ENDERECO
    )
);

-- Confirmar as alterações
COMMIT;

-- Verificar após a limpeza
SELECT 'APÓS A LIMPEZA:' as INFO FROM DUAL;
SELECT COUNT(*) as TOTAL_CONTATOS FROM TB_CONTATO;
SELECT COUNT(*) as TOTAL_ENDERECOS FROM TB_ENDERECO;
SELECT COUNT(*) as TOTAL_CLIENTES FROM TB_CLIENTE;

SELECT 'Limpeza concluída com sucesso!' as RESULTADO FROM DUAL;



