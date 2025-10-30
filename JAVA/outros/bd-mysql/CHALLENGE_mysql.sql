
-- ======================================================================
-- MySQL 8.0 DDL converted from Oracle DDL (core objects + journaling tables)
-- Engine: InnoDB, Charset: utf8mb4
-- ======================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- You can optionally create a dedicated database/schema:
-- CREATE DATABASE IF NOT EXISTS mottu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- USE mottu;

-- ======================================================================
-- TABLES PRINCIPAIS
-- ======================================================================

CREATE TABLE IF NOT EXISTS tb_box (
  id_box        BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome          VARCHAR(50) NOT NULL,
  status        CHAR(1) NOT NULL CHECK (status IN ('A','I')),
  data_entrada  DATETIME NOT NULL,
  data_saida    DATETIME NULL,
  observacao    VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_end_c (
  id_endc     BIGINT PRIMARY KEY AUTO_INCREMENT,
  cep         CHAR(9) NOT NULL,
  numero      INT NOT NULL,
  logradouro  VARCHAR(50) NOT NULL,
  bairro      VARCHAR(50) NOT NULL,
  cidade      VARCHAR(50) NOT NULL,
  estado      CHAR(2) NOT NULL,
  pais        VARCHAR(20) NOT NULL,
  complemento VARCHAR(60) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_cont_c (
  id_contc  BIGINT PRIMARY KEY AUTO_INCREMENT,
  email     VARCHAR(100) NOT NULL UNIQUE,
  telefone  VARCHAR(20) NULL,
  celular   VARCHAR(20) NOT NULL,
  outro     VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_cli (
  id_cli               BIGINT NOT NULL,
  data_cadastro        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sexo                 CHAR(1) NULL CHECK (sexo IN ('M','F','O')),
  nome                 VARCHAR(50) NOT NULL,
  sobrenome            VARCHAR(50) NOT NULL,
  data_nascimento      DATETIME NOT NULL,
  cpf                  CHAR(11) NOT NULL UNIQUE,
  profisao             VARCHAR(50) NULL,
  estado_civil         VARCHAR(50) NULL,
  tb_end_c_id_endc     BIGINT NOT NULL,
  tb_cont_c_id_contc   BIGINT NOT NULL,
  status               CHAR(1) NOT NULL CHECK (status IN ('A','I','P','B')),
  PRIMARY KEY (id_cli, tb_end_c_id_endc, tb_cont_c_id_contc),
  CONSTRAINT fk_cli_endc FOREIGN KEY (tb_end_c_id_endc) REFERENCES tb_end_c(id_endc),
  CONSTRAINT fk_cli_contc FOREIGN KEY (tb_cont_c_id_contc) REFERENCES tb_cont_c(id_contc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_end_f (
  id_endf     BIGINT PRIMARY KEY AUTO_INCREMENT,
  cep         CHAR(9) NOT NULL,
  numero      INT NOT NULL,
  logradouro  VARCHAR(50) NOT NULL,
  bairro      VARCHAR(50) NOT NULL,
  cidade      VARCHAR(50) NOT NULL,
  estado      CHAR(2) NOT NULL,
  pais        VARCHAR(20) NOT NULL,
  complemento VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_cont_f (
  id_contf  BIGINT PRIMARY KEY AUTO_INCREMENT,
  email     VARCHAR(100) NOT NULL UNIQUE,
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20) NULL,
  outro     VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_filial (
  id_fil                 BIGINT NOT NULL,
  nome                   VARCHAR(50) NOT NULL UNIQUE,
  status                 CHAR(1) NOT NULL CHECK (status IN ('A','I')),
  data_entrada           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_saida             DATETIME NULL,
  observacao             VARCHAR(100) NULL,
  tb_end_f_id_endf       BIGINT NOT NULL,
  tb_cont_f_id_contf     BIGINT NOT NULL,
  PRIMARY KEY (id_fil, tb_end_f_id_endf),
  CONSTRAINT fk_filial_endf FOREIGN KEY (tb_end_f_id_endf) REFERENCES tb_end_f(id_endf),
  CONSTRAINT fk_filial_contf FOREIGN KEY (tb_cont_f_id_contf) REFERENCES tb_cont_f(id_contf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_end_p (
  id_endp     BIGINT PRIMARY KEY AUTO_INCREMENT,
  cep         CHAR(9) NOT NULL,
  numero      INT NOT NULL,
  logradouro  VARCHAR(50) NOT NULL,
  bairro      VARCHAR(50) NOT NULL,
  cidade      VARCHAR(50) NULL,
  estado      CHAR(2) NOT NULL,
  pais        VARCHAR(30) NOT NULL,
  complemento VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_cont_p (
  id_contp  BIGINT PRIMARY KEY AUTO_INCREMENT,
  email     VARCHAR(100) NOT NULL UNIQUE,
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20) NULL,
  outro     VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_patio (
  id_patio           BIGINT NOT NULL,
  nome_patio         VARCHAR(50) NOT NULL UNIQUE,
  tb_cont_p_id_contp BIGINT NOT NULL,
  status             CHAR(1) NOT NULL CHECK (status IN ('A','I')),
  data_entrada       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_saida         DATETIME NULL,
  observacao         VARCHAR(100) NULL,
  tb_end_p_id_endp   BIGINT NOT NULL,
  PRIMARY KEY (id_patio, tb_cont_p_id_contp, status, tb_end_p_id_endp),
  CONSTRAINT fk_patio_contp FOREIGN KEY (tb_cont_p_id_contp) REFERENCES tb_cont_p(id_contp),
  CONSTRAINT fk_patio_endp FOREIGN KEY (tb_end_p_id_endp) REFERENCES tb_end_p(id_endp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_rastreamento (
  id_rast        BIGINT PRIMARY KEY AUTO_INCREMENT,
  status         CHAR(1) NOT NULL CHECK (status IN ('A','I','E')),
  ips_x          DECIMAL(7,3) NULL,
  ips_y          DECIMAL(7,3) NULL,
  ipcs_z         DECIMAL(7,3) NULL,
  ips_data_hora  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gprs_latitude  DECIMAL(9,6) NOT NULL,
  gprs_longitude DECIMAL(9,6) NOT NULL,
  gprs_altitude  DECIMAL(7,2) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_veiculo (
  id_veiculo  BIGINT PRIMARY KEY AUTO_INCREMENT,
  placa       VARCHAR(10) NOT NULL UNIQUE,
  renavam     CHAR(11) NOT NULL UNIQUE,
  chassi      CHAR(17) NOT NULL UNIQUE,
  fabricante  VARCHAR(50) NOT NULL,
  moldelo     VARCHAR(60) NOT NULL,
  motor       VARCHAR(30) NULL,
  ano         INT NOT NULL,
  combustivel VARCHAR(20) NOT NULL,
  status      VARCHAR(20) NOT NULL CHECK (status IN ('Disponível','Alugada','Manutenção','Vendida','Inativa'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_zona (
  id_zona      BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome         VARCHAR(50) NOT NULL UNIQUE,
  status       CHAR(1) NOT NULL CHECK (status IN ('A','I')),
  data_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_saida   DATETIME NULL,
  observacao   VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================
-- TABELAS DE LIGAÇÃO
-- ======================================================================

CREATE TABLE IF NOT EXISTS tb_cv (
  id_cv                       BIGINT NOT NULL,
  tb_cli_id_cli               BIGINT NOT NULL,
  tb_cli_tb_end_c_id_endc     BIGINT NOT NULL,
  tb_cli_tb_cont_c_id_contc   BIGINT NOT NULL,
  tb_veiculo_id_veiculo       BIGINT NOT NULL,
  PRIMARY KEY (id_cv, tb_cli_id_cli, tb_cli_tb_end_c_id_endc, tb_cli_tb_cont_c_id_contc, tb_veiculo_id_veiculo),
  CONSTRAINT fk_cv_cli FOREIGN KEY (tb_cli_id_cli, tb_cli_tb_end_c_id_endc, tb_cli_tb_cont_c_id_contc)
    REFERENCES tb_cli (id_cli, tb_end_c_id_endc, tb_cont_c_id_contc),
  CONSTRAINT fk_cv_veic FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_fp (
  id_fp                        BIGINT NOT NULL,
  tb_filial_id_fil             BIGINT NOT NULL,
  tb_patio_id_patio            BIGINT NOT NULL,
  tb_patio_id_contp            BIGINT NOT NULL,
  tb_patio_status              CHAR(1) NOT NULL,
  tb_filial_tb_end_f_id_endf   BIGINT NOT NULL,
  tb_patio_id_endp             BIGINT NOT NULL,
  PRIMARY KEY (id_fp, tb_filial_id_fil, tb_filial_tb_end_f_id_endf, tb_patio_id_patio, tb_patio_id_contp, tb_patio_status, tb_patio_id_endp),
  CONSTRAINT fk_fp_filial FOREIGN KEY (tb_filial_id_fil, tb_filial_tb_end_f_id_endf)
    REFERENCES tb_filial (id_fil, tb_end_f_id_endf),
  CONSTRAINT fk_fp_patio FOREIGN KEY (tb_patio_id_patio, tb_patio_id_contp, tb_patio_status, tb_patio_id_endp)
    REFERENCES tb_patio (id_patio, tb_cont_p_id_contp, status, tb_end_p_id_endp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_fv (
  id_fv                        BIGINT NOT NULL,
  tb_veiculo_id_veiculo        BIGINT NOT NULL,
  tb_filial_id_fil             BIGINT NOT NULL,
  tb_filial_tb_end_f_id_endf   BIGINT NOT NULL,
  PRIMARY KEY (id_fv, tb_filial_id_fil, tb_filial_tb_end_f_id_endf, tb_veiculo_id_veiculo),
  CONSTRAINT fk_fv_filial FOREIGN KEY (tb_filial_id_fil, tb_filial_tb_end_f_id_endf)
    REFERENCES tb_filial (id_fil, tb_end_f_id_endf),
  CONSTRAINT fk_fv_veiculo FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_vb (
  id_vb                 BIGINT NOT NULL,
  tb_veiculo_id_veiculo BIGINT NOT NULL,
  tb_box_id_box         BIGINT NOT NULL,
  PRIMARY KEY (id_vb, tb_veiculo_id_veiculo, tb_box_id_box),
  CONSTRAINT fk_vb_veic FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo),
  CONSTRAINT fk_vb_box FOREIGN KEY (tb_box_id_box) REFERENCES tb_box(id_box)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_vp (
  id_vp                        BIGINT NOT NULL,
  tb_veiculo_id_veiculo        BIGINT NOT NULL,
  tb_patio_id_patio            BIGINT NOT NULL,
  tb_patio_tb_cont_p_id_contp  BIGINT NOT NULL,
  tb_patio_status              CHAR(1) NOT NULL,
  tb_patio_tb_end_p_id_endp    BIGINT NOT NULL,
  PRIMARY KEY (id_vp, tb_veiculo_id_veiculo, tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp),
  CONSTRAINT fk_vp_patio FOREIGN KEY (tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp)
    REFERENCES tb_patio (id_patio, tb_cont_p_id_contp, status, tb_end_p_id_endp),
  CONSTRAINT fk_vp_veic FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_vr (
  id_vr                    BIGINT NOT NULL,
  tb_veiculo_id_veiculo    BIGINT NOT NULL,
  tb_rastreamento_id_rast  BIGINT NOT NULL,
  PRIMARY KEY (id_vr, tb_veiculo_id_veiculo, tb_rastreamento_id_rast),
  CONSTRAINT fk_vr_rast FOREIGN KEY (tb_rastreamento_id_rast) REFERENCES tb_rastreamento(id_rast),
  CONSTRAINT fk_vr_veic FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_vz (
  id_vz                 BIGINT NOT NULL,
  tb_veiculo_id_veiculo BIGINT NOT NULL,
  tb_zona_id_zona       BIGINT NOT NULL,
  PRIMARY KEY (id_vz, tb_veiculo_id_veiculo, tb_zona_id_zona),
  CONSTRAINT fk_vz_veic FOREIGN KEY (tb_veiculo_id_veiculo) REFERENCES tb_veiculo(id_veiculo),
  CONSTRAINT fk_vz_zona FOREIGN KEY (tb_zona_id_zona) REFERENCES tb_zona(id_zona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_zb (
  id_zb           BIGINT NOT NULL,
  tb_zona_id_zona BIGINT NOT NULL,
  tb_box_id_box   BIGINT NOT NULL,
  PRIMARY KEY (id_zb, tb_zona_id_zona, tb_box_id_box),
  CONSTRAINT fk_zb_zona FOREIGN KEY (tb_zona_id_zona) REFERENCES tb_zona(id_zona),
  CONSTRAINT fk_zb_box FOREIGN KEY (tb_box_id_box) REFERENCES tb_box(id_box)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tb_zp (
  id_zp                        BIGINT NOT NULL,
  tb_patio_id_patio            BIGINT NOT NULL,
  tb_patio_tb_cont_p_id_contp  BIGINT NOT NULL,
  tb_zona_id_zona              BIGINT NOT NULL,
  tb_patio_status              CHAR(1) NOT NULL,
  tb_patio_tb_end_p_id_endp    BIGINT NOT NULL,
  PRIMARY KEY (id_zp, tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp, tb_zona_id_zona),
  CONSTRAINT fk_zp_patio FOREIGN KEY (tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp)
    REFERENCES tb_patio (id_patio, tb_cont_p_id_contp, status, tb_end_p_id_endp),
  CONSTRAINT fk_zp_zona FOREIGN KEY (tb_zona_id_zona) REFERENCES tb_zona(id_zona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================
-- INDEXES (extras para performance / FKs)
-- ======================================================================

CREATE INDEX IF NOT EXISTS idx_cli_cont_c_fk ON tb_cli (tb_cont_c_id_contc);
CREATE INDEX IF NOT EXISTS idx_cli_end_c_fk  ON tb_cli (tb_end_c_id_endc);
CREATE INDEX IF NOT EXISTS idx_cv_cli_fk     ON tb_cv (tb_cli_id_cli, tb_cli_tb_end_c_id_endc, tb_cli_tb_cont_c_id_contc);
CREATE INDEX IF NOT EXISTS idx_cv_veic_fk    ON tb_cv (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_filial_cont_f_fk ON tb_filial (tb_cont_f_id_contf);
CREATE INDEX IF NOT EXISTS idx_filial_end_f_fk  ON tb_filial (tb_end_f_id_endf);
CREATE INDEX IF NOT EXISTS idx_fp_filial_fk  ON tb_fp (tb_filial_id_fil, tb_filial_tb_end_f_id_endf);
CREATE INDEX IF NOT EXISTS idx_fp_patio_fk   ON tb_fp (tb_patio_id_patio, tb_patio_id_contp, tb_patio_status, tb_patio_id_endp);
CREATE INDEX IF NOT EXISTS idx_fv_filial_fk  ON tb_fv (tb_filial_id_fil, tb_filial_tb_end_f_id_endf);
CREATE INDEX IF NOT EXISTS idx_fv_veic_fk    ON tb_fv (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_patio_cont_p_fk ON tb_patio (tb_cont_p_id_contp);
CREATE INDEX IF NOT EXISTS idx_patio_end_p_fk  ON tb_patio (tb_end_p_id_endp);
CREATE INDEX IF NOT EXISTS idx_vb_box_fk     ON tb_vb (tb_box_id_box);
CREATE INDEX IF NOT EXISTS idx_vb_veic_fk    ON tb_vb (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_vp_patio_fk   ON tb_vp (tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp);
CREATE INDEX IF NOT EXISTS idx_vp_veic_fk    ON tb_vp (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_vr_rast_fk    ON tb_vr (tb_rastreamento_id_rast);
CREATE INDEX IF NOT EXISTS idx_vr_veic_fk    ON tb_vr (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_vz_veic_fk    ON tb_vz (tb_veiculo_id_veiculo);
CREATE INDEX IF NOT EXISTS idx_vz_zona_fk    ON tb_vz (tb_zona_id_zona);
CREATE INDEX IF NOT EXISTS idx_zb_box_fk     ON tb_zb (tb_box_id_box);
CREATE INDEX IF NOT EXISTS idx_zb_zona_fk    ON tb_zb (tb_zona_id_zona);
CREATE INDEX IF NOT EXISTS idx_zp_patio_fk   ON tb_zp (tb_patio_id_patio, tb_patio_tb_cont_p_id_contp, tb_patio_status, tb_patio_tb_end_p_id_endp);
CREATE INDEX IF NOT EXISTS idx_zp_zona_fk    ON tb_zp (tb_zona_id_zona);

-- Common filter indexes
CREATE INDEX IF NOT EXISTS idx_cli_cpf      ON tb_cli (cpf);
CREATE INDEX IF NOT EXISTS idx_cli_status   ON tb_cli (status);
CREATE INDEX IF NOT EXISTS idx_veic_placa   ON tb_veiculo (placa);
CREATE INDEX IF NOT EXISTS idx_veic_renavam ON tb_veiculo (renavam);
CREATE INDEX IF NOT EXISTS idx_veic_chassi  ON tb_veiculo (chassi);
CREATE INDEX IF NOT EXISTS idx_veic_status  ON tb_veiculo (status);
CREATE INDEX IF NOT EXISTS idx_rast_data    ON tb_rastreamento (ips_data_hora);
CREATE INDEX IF NOT EXISTS idx_box_status   ON tb_box (status);
CREATE INDEX IF NOT EXISTS idx_filial_status ON tb_filial (status);
CREATE INDEX IF NOT EXISTS idx_zona_status  ON tb_zona (status);

-- ======================================================================
-- TABELAS DE AUDITORIA (_JN) - como tabelas simples (sem triggers)
-- (Se quiser replicar auditoria via triggers, criar manualmente depois)
-- ======================================================================

CREATE TABLE IF NOT EXISTS TB_BOX_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_box BIGINT NOT NULL,
  nome VARCHAR(50) NOT NULL,
  status CHAR(1) NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME NULL,
  observacao VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_END_C_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_endc BIGINT NOT NULL,
  cep CHAR(9) NOT NULL,
  numero INT NOT NULL,
  logradouro VARCHAR(50) NOT NULL,
  bairro VARCHAR(50) NOT NULL,
  cidade VARCHAR(50) NOT NULL,
  estado CHAR(2) NOT NULL,
  pais VARCHAR(20) NOT NULL,
  complemento VARCHAR(60) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_CONT_C_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_contc BIGINT NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NULL,
  celular VARCHAR(20) NOT NULL,
  outro VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_CLI_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_cli BIGINT NOT NULL,
  data_cadastro DATETIME NOT NULL,
  sexo CHAR(1) NULL,
  nome VARCHAR(50) NOT NULL,
  sobrenome VARCHAR(50) NOT NULL,
  data_nascimento DATETIME NOT NULL,
  cpf CHAR(11) NOT NULL,
  profisao VARCHAR(50) NULL,
  estado_civil VARCHAR(50) NULL,
  TB_END_C_id_endc BIGINT NOT NULL,
  TB_CONT_C_id_contc BIGINT NOT NULL,
  status CHAR(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_END_F_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_endf BIGINT NOT NULL,
  cep CHAR(9) NOT NULL,
  numero INT NOT NULL,
  logradouro VARCHAR(50) NOT NULL,
  bairro VARCHAR(50) NOT NULL,
  cidade VARCHAR(50) NOT NULL,
  estado CHAR(2) NOT NULL,
  pais VARCHAR(20) NOT NULL,
  complemento VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_CONT_F_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_contf BIGINT NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20) NULL,
  outro VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_FILIAL_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_fil BIGINT NOT NULL,
  nome VARCHAR(50) NOT NULL,
  status CHAR(1) NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME NULL,
  observacao VARCHAR(100) NULL,
  TB_END_F_id_endf BIGINT NOT NULL,
  TB_CONT_F_ID_CONTF BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_END_P_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_endp BIGINT NOT NULL,
  cep CHAR(9) NOT NULL,
  numero INT NOT NULL,
  logradouro VARCHAR(50) NOT NULL,
  bairro VARCHAR(50) NOT NULL,
  cidade VARCHAR(50) NULL,
  estado CHAR(2) NOT NULL,
  pais VARCHAR(30) NOT NULL,
  complemento VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_CONT_P_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_contp BIGINT NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20) NULL,
  outro VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_PATIO_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_patio BIGINT NOT NULL,
  nome_patio VARCHAR(50) NOT NULL,
  TB_CONT_P_id_contp BIGINT NOT NULL,
  status CHAR(1) NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME NULL,
  observacao VARCHAR(100) NULL,
  TB_END_P_id_endp BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_RASTREAMENTO_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_rast BIGINT NOT NULL,
  status CHAR(1) NOT NULL,
  ips_x DECIMAL(7,3) NULL,
  ips_y DECIMAL(7,3) NULL,
  ipcs_z DECIMAL(7,3) NULL,
  ips_data_hora TIMESTAMP NOT NULL,
  gprs_latitude DECIMAL(9,6) NOT NULL,
  gprs_longitude DECIMAL(9,6) NOT NULL,
  gprs_altitude DECIMAL(7,2) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_VEICULO_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_veiculo BIGINT NOT NULL,
  placa VARCHAR(10) NOT NULL,
  renavam CHAR(11) NOT NULL,
  chassi CHAR(17) NOT NULL,
  fabricante VARCHAR(50) NOT NULL,
  moldelo VARCHAR(60) NOT NULL,
  motor VARCHAR(30) NULL,
  ano INT NOT NULL,
  combustivel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_ZONA_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_zona BIGINT NOT NULL,
  nome VARCHAR(50) NOT NULL,
  status CHAR(1) NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME NULL,
  observacao VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_CV_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_cv BIGINT NOT NULL,
  TB_CLI_id_cli BIGINT NOT NULL,
  TB_CLI_TB_END_C_id_endc BIGINT NOT NULL,
  TB_CLI_TB_CONT_C_id_contc BIGINT NOT NULL,
  TB_VEICULO_id_veiculo BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_FP_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_FP BIGINT NOT NULL,
  TB_FILIAL_id_fil BIGINT NOT NULL,
  TB_PATIO_id_patio BIGINT NOT NULL,
  TB_PATIO_id_contp BIGINT NOT NULL,
  TB_PATIO_status CHAR(1) NOT NULL,
  TB_FILIAL_TB_END_F_id_endf BIGINT NOT NULL,
  TB_PATIO_id_endp BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_FV_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_fv BIGINT NOT NULL,
  TB_VEICULO_id_veiculo BIGINT NOT NULL,
  TB_FILIAL_id_fil BIGINT NOT NULL,
  TB_FILIAL_TB_END_F_id_endf BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_VB_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_vb BIGINT NOT NULL,
  TB_VEICULO_id_veiculo BIGINT NOT NULL,
  TB_BOX_id_box BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TB_VP_JN (
  JN_OPERATION CHAR(3) NOT NULL,
  JN_ORACLE_USER VARCHAR(30) NOT NULL,
  JN_DATETIME DATETIME NOT NULL,
  JN_NOTES VARCHAR(240) NULL,
  JN_APPLN VARCHAR(35) NULL,
  JN_SESSION BIGINT NULL,
  id_vp BIGINT NOT NULL,
  TB_VEICULO_id_veiculo BIGINT NOT NULL,
  TB_PATIO_id_patio BIGINT NOT NULL,
  TB_PATIO_TB_CONT_P_id_contp BIGINT NOT NULL,
  TB_PATIO_status CHAR(1) NOT NULL,
  TB_PATIO_TB_END_P_id_endp BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (If there are more *_JN tables in the original script, add similarly)

SET FOREIGN_KEY_CHECKS = 1;
-- ======================================================================
-- END
-- ======================================================================
