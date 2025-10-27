-- Script de dados de teste para o sistema MOTTU
-- 10 registros para cada tabela principal

-- 1. TB_ENDERECO (10 registros)
INSERT INTO TB_ENDERECO (ID_ENDERECO, CEP, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO, PAIS, DATA_CADASTRO) VALUES
(1, '01310-100', 'Av. Paulista', '1000', 'Sala 101', 'Bela Vista', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(2, '04038-001', 'Av. Paulista', '2000', 'Sala 201', 'Bela Vista', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(3, '01234-567', 'Rua Augusta', '500', 'Apto 302', 'Consolação', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(4, '04567-890', 'Rua Oscar Freire', '800', 'Loja 15', 'Jardins', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(5, '01234-567', 'Av. Faria Lima', '1500', 'Torre A', 'Itaim Bibi', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(6, '04567-890', 'Rua Haddock Lobo', '1200', 'Sala 501', 'Cerqueira César', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(7, '01234-567', 'Av. Rebouças', '3000', 'Conjunto 100', 'Pinheiros', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(8, '04567-890', 'Rua da Consolação', '2000', 'Sala 200', 'Consolação', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(9, '01234-567', 'Av. Brigadeiro Luiz Antonio', '4000', 'Sala 300', 'Bela Vista', 'São Paulo', 'SP', 'Brasil', SYSDATE),
(10, '04567-890', 'Rua Bela Cintra', '1000', 'Apto 401', 'Jardins', 'São Paulo', 'SP', 'Brasil', SYSDATE);

-- 2. TB_CONTATO (10 registros)
INSERT INTO TB_CONTATO (ID_CONTATO, TELEFONE, CELULAR, EMAIL, DATA_CADASTRO) VALUES
(1, '(11) 3333-4444', '(11) 99999-1111', 'contato1@mottu.com', SYSDATE),
(2, '(11) 3333-4445', '(11) 99999-1112', 'contato2@mottu.com', SYSDATE),
(3, '(11) 3333-4446', '(11) 99999-1113', 'contato3@mottu.com', SYSDATE),
(4, '(11) 3333-4447', '(11) 99999-1114', 'contato4@mottu.com', SYSDATE),
(5, '(11) 3333-4448', '(11) 99999-1115', 'contato5@mottu.com', SYSDATE),
(6, '(11) 3333-4449', '(11) 99999-1116', 'contato6@mottu.com', SYSDATE),
(7, '(11) 3333-4450', '(11) 99999-1117', 'contato7@mottu.com', SYSDATE),
(8, '(11) 3333-4451', '(11) 99999-1118', 'contato8@mottu.com', SYSDATE),
(9, '(11) 3333-4452', '(11) 99999-1119', 'contato9@mottu.com', SYSDATE),
(10, '(11) 3333-4453', '(11) 99999-1120', 'contato10@mottu.com', SYSDATE);

-- 3. TB_CLIENTE (10 registros)
INSERT INTO TB_CLIENTE (ID_CLIENTE, DATA_CADASTRO, SEXO, NOME, SOBRENOME, CPF, PROFISSAO, ESTADO_CIVIL, TB_ENDERECO_ID_ENDERECO, TB_CONTATO_ID_CONTATO) VALUES
(1, SYSDATE, 'M', 'João', 'Silva', '12345678901', 'Engenheiro', 'Solteiro', 1, 1),
(2, SYSDATE, 'F', 'Maria', 'Santos', '12345678902', 'Advogada', 'Casada', 2, 2),
(3, SYSDATE, 'M', 'Pedro', 'Oliveira', '12345678903', 'Médico', 'Solteiro', 3, 3),
(4, SYSDATE, 'F', 'Ana', 'Costa', '12345678904', 'Professora', 'Casada', 4, 4),
(5, SYSDATE, 'M', 'Carlos', 'Ferreira', '12345678905', 'Empresário', 'Divorciado', 5, 5),
(6, SYSDATE, 'F', 'Lucia', 'Rodrigues', '12345678906', 'Arquiteta', 'Solteira', 6, 6),
(7, SYSDATE, 'M', 'Roberto', 'Alves', '12345678907', 'Contador', 'Casado', 7, 7),
(8, SYSDATE, 'F', 'Fernanda', 'Lima', '12345678908', 'Psicóloga', 'Solteira', 8, 8),
(9, SYSDATE, 'M', 'Marcos', 'Pereira', '12345678909', 'Desenvolvedor', 'Casado', 9, 9),
(10, SYSDATE, 'F', 'Juliana', 'Martins', '12345678910', 'Designer', 'Solteira', 10, 10);

-- 4. TB_PATIO (10 registros)
INSERT INTO TB_PATIO (ID_PATIO, NOME_PATIO, STATUS, OBSERVACAO, DATA_CADASTRO, TB_CONTATO_ID_CONTATO, TB_ENDERECO_ID_ENDERECO) VALUES
(1, 'Pátio Mottu Centro', 'A', 'Pátio principal no centro da cidade', SYSDATE, 1, 1),
(2, 'Pátio Mottu Vila Madalena', 'A', 'Pátio na região boêmia', SYSDATE, 2, 2),
(3, 'Pátio Mottu Itaim Bibi', 'A', 'Pátio na região empresarial', SYSDATE, 3, 3),
(4, 'Pátio Mottu Jardins', 'A', 'Pátio na região nobre', SYSDATE, 4, 4),
(5, 'Pátio Mottu Pinheiros', 'A', 'Pátio na região residencial', SYSDATE, 5, 5),
(6, 'Pátio Mottu Consolação', 'A', 'Pátio na região central', SYSDATE, 6, 6),
(7, 'Pátio Mottu Bela Vista', 'A', 'Pátio na região histórica', SYSDATE, 7, 7),
(8, 'Pátio Mottu Cerqueira César', 'A', 'Pátio na região comercial', SYSDATE, 8, 8),
(9, 'Pátio Mottu Rebouças', 'A', 'Pátio na região universitária', SYSDATE, 9, 9),
(10, 'Pátio Mottu Brigadeiro', 'A', 'Pátio na região central', SYSDATE, 10, 10);

-- 5. TB_ZONA (10 registros)
INSERT INTO TB_ZONA (ID_ZONA, NOME_ZONA, STATUS, OBSERVACAO, DATA_CADASTRO, TB_PATIO_ID_PATIO) VALUES
(1, 'Zona A - Entrada', 'A', 'Zona de entrada principal', SYSDATE, 1),
(2, 'Zona B - Centro', 'A', 'Zona central do pátio', SYSDATE, 1),
(3, 'Zona C - Saída', 'A', 'Zona de saída', SYSDATE, 1),
(4, 'Zona A - Norte', 'A', 'Zona norte do pátio', SYSDATE, 2),
(5, 'Zona B - Sul', 'A', 'Zona sul do pátio', SYSDATE, 2),
(6, 'Zona A - Leste', 'A', 'Zona leste do pátio', SYSDATE, 3),
(7, 'Zona B - Oeste', 'A', 'Zona oeste do pátio', SYSDATE, 3),
(8, 'Zona A - Superior', 'A', 'Zona superior do pátio', SYSDATE, 4),
(9, 'Zona B - Inferior', 'A', 'Zona inferior do pátio', SYSDATE, 4),
(10, 'Zona A - Principal', 'A', 'Zona principal do pátio', SYSDATE, 5);

-- 6. TB_BOX (10 registros)
INSERT INTO TB_BOX (ID_BOX, NOME, STATUS, OBSERVACAO, DATA_ENTRADA, DATA_SAIDA, TB_PATIO_ID_PATIO) VALUES
(1, 'GRU001', 'L', 'Box livre', NULL, NULL, 1),
(2, 'GRU002', 'O', 'Box ocupado', SYSDATE, NULL, 1),
(3, 'GRU003', 'L', 'Box livre', NULL, NULL, 1),
(4, 'GRU004', 'O', 'Box ocupado', SYSDATE, NULL, 1),
(5, 'GRU005', 'L', 'Box livre', NULL, NULL, 1),
(6, 'SP001', 'O', 'Box ocupado', SYSDATE, NULL, 2),
(7, 'SP002', 'L', 'Box livre', NULL, NULL, 2),
(8, 'SP003', 'O', 'Box ocupado', SYSDATE, NULL, 2),
(9, 'SP004', 'L', 'Box livre', NULL, NULL, 2),
(10, 'SP005', 'O', 'Box ocupado', SYSDATE, NULL, 2);

-- 7. TB_VEICULO (10 registros)
INSERT INTO TB_VEICULO (ID_VEICULO, PLACA, RENAVAM, CHASSI, FABRICANTE, MODELO, MOTOR, ANO, COMBUSTIVEL, STATUS, STATUS_OPERACIONAL, TAG_BLE_ID) VALUES
(1, 'ABC1D20', '12345678901', 'CHASSI001', 'Honda', 'CG 160 Start', '160cc', 2023, 'GASOLINA', 'A', 'A', 'BLE001'),
(2, 'DEF2E30', '12345678902', 'CHASSI002', 'Yamaha', 'Fazer 250', '250cc', 2023, 'GASOLINA', 'A', 'A', 'BLE002'),
(3, 'GHI3F40', '12345678903', 'CHASSI003', 'Honda', 'CB 300F', '300cc', 2023, 'GASOLINA', 'A', 'A', 'BLE003'),
(4, 'JKL4G50', '12345678904', 'CHASSI004', 'Kawasaki', 'Ninja 300', '300cc', 2023, 'GASOLINA', 'A', 'A', 'BLE004'),
(5, 'MNO5H60', '12345678905', 'CHASSI005', 'Suzuki', 'GSX-R 150', '150cc', 2023, 'GASOLINA', 'A', 'A', 'BLE005'),
(6, 'PQR6I70', '12345678906', 'CHASSI006', 'Honda', 'PCX 160', '160cc', 2023, 'GASOLINA', 'A', 'A', 'BLE006'),
(7, 'STU7J80', '12345678907', 'CHASSI007', 'Yamaha', 'MT-07', '700cc', 2023, 'GASOLINA', 'A', 'A', 'BLE007'),
(8, 'VWX8K90', '12345678908', 'CHASSI008', 'Honda', 'CBR 600RR', '600cc', 2023, 'GASOLINA', 'A', 'A', 'BLE008'),
(9, 'YZA9L00', '12345678909', 'CHASSI009', 'Kawasaki', 'Z900', '900cc', 2023, 'GASOLINA', 'A', 'A', 'BLE009'),
(10, 'BCD0M10', '12345678910', 'CHASSI010', 'Suzuki', 'Hayabusa', '1300cc', 2023, 'GASOLINA', 'A', 'A', 'BLE010');

-- 8. TB_CNH (10 registros)
INSERT INTO TB_CNH (ID_CNH, NUMERO, CATEGORIA, DATA_EMISSAO, DATA_VENCIMENTO, STATUS, TB_CLIENTE_ID_CLIENTE) VALUES
(1, '12345678901', 'A', SYSDATE - 365, SYSDATE + 1825, 'A', 1),
(2, '12345678902', 'A', SYSDATE - 300, SYSDATE + 1825, 'A', 2),
(3, '12345678903', 'A', SYSDATE - 200, SYSDATE + 1825, 'A', 3),
(4, '12345678904', 'A', SYSDATE - 150, SYSDATE + 1825, 'A', 4),
(5, '12345678905', 'A', SYSDATE - 100, SYSDATE + 1825, 'A', 5),
(6, '12345678906', 'A', SYSDATE - 50, SYSDATE + 1825, 'A', 6),
(7, '12345678907', 'A', SYSDATE - 30, SYSDATE + 1825, 'A', 7),
(8, '12345678908', 'A', SYSDATE - 20, SYSDATE + 1825, 'A', 8),
(9, '12345678909', 'A', SYSDATE - 10, SYSDATE + 1825, 'A', 9),
(10, '12345678910', 'A', SYSDATE - 5, SYSDATE + 1825, 'A', 10);

-- 9. TB_CLIENTE_VEICULO (10 registros)
INSERT INTO TB_CLIENTE_VEICULO (ID_CLIENTE_VEICULO, DATA_ASSOCIACAO, STATUS, TB_CLIENTE_ID_CLIENTE, TB_VEICULO_ID_VEICULO) VALUES
(1, SYSDATE, 'A', 1, 1),
(2, SYSDATE, 'A', 2, 2),
(3, SYSDATE, 'A', 3, 3),
(4, SYSDATE, 'A', 4, 4),
(5, SYSDATE, 'A', 5, 5),
(6, SYSDATE, 'A', 6, 6),
(7, SYSDATE, 'A', 7, 7),
(8, SYSDATE, 'A', 8, 8),
(9, SYSDATE, 'A', 9, 9),
(10, SYSDATE, 'A', 10, 10);

-- 10. TB_VEICULO_BOX (10 registros)
INSERT INTO TB_VEICULO_BOX (ID_VEICULO_BOX, DATA_ENTRADA, DATA_SAIDA, STATUS, TB_VEICULO_ID_VEICULO, TB_BOX_ID_BOX) VALUES
(1, SYSDATE - 2, NULL, 'A', 1, 2),
(2, SYSDATE - 1, NULL, 'A', 2, 4),
(3, SYSDATE - 3, NULL, 'A', 3, 6),
(4, SYSDATE - 1, NULL, 'A', 4, 8),
(5, SYSDATE - 2, NULL, 'A', 5, 10),
(6, SYSDATE - 1, NULL, 'A', 6, 1),
(7, SYSDATE - 3, NULL, 'A', 7, 3),
(8, SYSDATE - 2, NULL, 'A', 8, 5),
(9, SYSDATE - 1, NULL, 'A', 9, 7),
(10, SYSDATE - 2, NULL, 'A', 10, 9);

-- 11. TB_VEICULO_PATIO (10 registros)
INSERT INTO TB_VEICULO_PATIO (ID_VEICULO_PATIO, DATA_ENTRADA, DATA_SAIDA, STATUS, TB_VEICULO_ID_VEICULO, TB_PATIO_ID_PATIO) VALUES
(1, SYSDATE - 2, NULL, 'A', 1, 1),
(2, SYSDATE - 1, NULL, 'A', 2, 1),
(3, SYSDATE - 3, NULL, 'A', 3, 2),
(4, SYSDATE - 1, NULL, 'A', 4, 2),
(5, SYSDATE - 2, NULL, 'A', 5, 3),
(6, SYSDATE - 1, NULL, 'A', 6, 3),
(7, SYSDATE - 3, NULL, 'A', 7, 4),
(8, SYSDATE - 2, NULL, 'A', 8, 4),
(9, SYSDATE - 1, NULL, 'A', 9, 5),
(10, SYSDATE - 2, NULL, 'A', 10, 5);

-- 12. TB_LOGMOVIMENTACAO (10 registros)
INSERT INTO TB_LOGMOVIMENTACAO (ID_LOGMOVIMENTACAO, TIPO_MOVIMENTACAO, DATA_HORA_MOVIMENTACAO, OBSERVACOES, TEMPO_ESTACIONAMENTO_MINUTOS, TB_VEICULO_ID_VEICULO, TB_PATIO_ID_PATIO, TB_BOX_ID_BOX) VALUES
(1, 'ENTRADA', SYSDATE - 2, 'Entrada normal', NULL, 1, 1, 2),
(2, 'ENTRADA', SYSDATE - 1, 'Entrada normal', NULL, 2, 1, 4),
(3, 'ENTRADA', SYSDATE - 3, 'Entrada normal', NULL, 3, 2, 6),
(4, 'ENTRADA', SYSDATE - 1, 'Entrada normal', NULL, 4, 2, 8),
(5, 'ENTRADA', SYSDATE - 2, 'Entrada normal', NULL, 5, 3, 10),
(6, 'ENTRADA', SYSDATE - 1, 'Entrada normal', NULL, 6, 3, 1),
(7, 'ENTRADA', SYSDATE - 3, 'Entrada normal', NULL, 7, 4, 3),
(8, 'ENTRADA', SYSDATE - 2, 'Entrada normal', NULL, 8, 4, 5),
(9, 'ENTRADA', SYSDATE - 1, 'Entrada normal', NULL, 9, 5, 7),
(10, 'ENTRADA', SYSDATE - 2, 'Entrada normal', NULL, 10, 5, 9);

-- 13. TB_VEICULO_RASTREAMENTO (10 registros)
INSERT INTO TB_VEICULO_RASTREAMENTO (ID_VEICULO_RASTREAMENTO, LATITUDE, LONGITUDE, DATA_HORA_RASTREAMENTO, STATUS, TB_VEICULO_ID_VEICULO) VALUES
(1, -23.5505, -46.6333, SYSDATE - 1, 'A', 1),
(2, -23.5506, -46.6334, SYSDATE - 1, 'A', 2),
(3, -23.5507, -46.6335, SYSDATE - 1, 'A', 3),
(4, -23.5508, -46.6336, SYSDATE - 1, 'A', 4),
(5, -23.5509, -46.6337, SYSDATE - 1, 'A', 5),
(6, -23.5510, -46.6338, SYSDATE - 1, 'A', 6),
(7, -23.5511, -46.6339, SYSDATE - 1, 'A', 7),
(8, -23.5512, -46.6340, SYSDATE - 1, 'A', 8),
(9, -23.5513, -46.6341, SYSDATE - 1, 'A', 9),
(10, -23.5514, -46.6342, SYSDATE - 1, 'A', 10);

-- 14. TB_VEICULO_ZONA (10 registros)
INSERT INTO TB_VEICULO_ZONA (ID_VEICULO_ZONA, DATA_ENTRADA, DATA_SAIDA, STATUS, TB_VEICULO_ID_VEICULO, TB_ZONA_ID_ZONA) VALUES
(1, SYSDATE - 2, NULL, 'A', 1, 1),
(2, SYSDATE - 1, NULL, 'A', 2, 2),
(3, SYSDATE - 3, NULL, 'A', 3, 3),
(4, SYSDATE - 1, NULL, 'A', 4, 4),
(5, SYSDATE - 2, NULL, 'A', 5, 5),
(6, SYSDATE - 1, NULL, 'A', 6, 6),
(7, SYSDATE - 3, NULL, 'A', 7, 7),
(8, SYSDATE - 2, NULL, 'A', 8, 8),
(9, SYSDATE - 1, NULL, 'A', 9, 9),
(10, SYSDATE - 2, NULL, 'A', 10, 10);

-- 15. TB_CONTATO_PATIO (10 registros)
INSERT INTO TB_CONTATO_PATIO (ID_CONTATO_PATIO, DATA_ASSOCIACAO, STATUS, TB_CONTATO_ID_CONTATO, TB_PATIO_ID_PATIO) VALUES
(1, SYSDATE, 'A', 1, 1),
(2, SYSDATE, 'A', 2, 2),
(3, SYSDATE, 'A', 3, 3),
(4, SYSDATE, 'A', 4, 4),
(5, SYSDATE, 'A', 5, 5),
(6, SYSDATE, 'A', 6, 6),
(7, SYSDATE, 'A', 7, 7),
(8, SYSDATE, 'A', 8, 8),
(9, SYSDATE, 'A', 9, 9),
(10, SYSDATE, 'A', 10, 10);

-- 16. TB_ENDERECO_PATIO (10 registros)
INSERT INTO TB_ENDERECO_PATIO (ID_ENDERECO_PATIO, DATA_ASSOCIACAO, STATUS, TB_ENDERECO_ID_ENDERECO, TB_PATIO_ID_PATIO) VALUES
(1, SYSDATE, 'A', 1, 1),
(2, SYSDATE, 'A', 2, 2),
(3, SYSDATE, 'A', 3, 3),
(4, SYSDATE, 'A', 4, 4),
(5, SYSDATE, 'A', 5, 5),
(6, SYSDATE, 'A', 6, 6),
(7, SYSDATE, 'A', 7, 7),
(8, SYSDATE, 'A', 8, 8),
(9, SYSDATE, 'A', 9, 9),
(10, SYSDATE, 'A', 10, 10);

-- Commit das transações
COMMIT;

-- Verificar os dados inseridos
SELECT 'TB_ENDERECO' as TABELA, COUNT(*) as TOTAL FROM TB_ENDERECO
UNION ALL
SELECT 'TB_CONTATO', COUNT(*) FROM TB_CONTATO
UNION ALL
SELECT 'TB_CLIENTE', COUNT(*) FROM TB_CLIENTE
UNION ALL
SELECT 'TB_PATIO', COUNT(*) FROM TB_PATIO
UNION ALL
SELECT 'TB_ZONA', COUNT(*) FROM TB_ZONA
UNION ALL
SELECT 'TB_BOX', COUNT(*) FROM TB_BOX
UNION ALL
SELECT 'TB_VEICULO', COUNT(*) FROM TB_VEICULO
UNION ALL
SELECT 'TB_CNH', COUNT(*) FROM TB_CNH
UNION ALL
SELECT 'TB_CLIENTE_VEICULO', COUNT(*) FROM TB_CLIENTE_VEICULO
UNION ALL
SELECT 'TB_VEICULO_BOX', COUNT(*) FROM TB_VEICULO_BOX
UNION ALL
SELECT 'TB_VEICULO_PATIO', COUNT(*) FROM TB_VEICULO_PATIO
UNION ALL
SELECT 'TB_LOGMOVIMENTACAO', COUNT(*) FROM TB_LOGMOVIMENTACAO
UNION ALL
SELECT 'TB_VEICULO_RASTREAMENTO', COUNT(*) FROM TB_VEICULO_RASTREAMENTO
UNION ALL
SELECT 'TB_VEICULO_ZONA', COUNT(*) FROM TB_VEICULO_ZONA
UNION ALL
SELECT 'TB_CONTATO_PATIO', COUNT(*) FROM TB_CONTATO_PATIO
UNION ALL
SELECT 'TB_ENDERECO_PATIO', COUNT(*) FROM TB_ENDERECO_PATIO;
