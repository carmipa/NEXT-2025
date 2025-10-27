--------------------------------------------------------
--  Arquivo criado - terça-feira-setembro-30-2025   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_BOX
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_BOX" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 773 nocache

noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_CLIENTE
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_CLIENTE" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 6

nocache noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_CONTATO
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_CONTATO" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 31

nocache noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_ENDERECO
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_ENDERECO" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 20

nocache noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_PATIO
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_PATIO" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 14 nocache

noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_RASTREAMENTO
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_RASTREAMENTO" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with

1 nocache noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_VEICULO
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_VEICULO" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 12

nocache noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Sequence SEQ_TB_ZONA
--------------------------------------------------------

create sequence "RELACAODIRETA"."SEQ_TB_ZONA" minvalue 1 maxvalue 9999999999999999999999999999 increment by 1 start with 16 nocache

noorder nocycle nokeep noscale global;
--------------------------------------------------------
--  DDL for Table TB_BOX
--------------------------------------------------------

create table "RELACAODIRETA"."TB_BOX" (
   "ID_BOX"            number,
   "NOME"              varchar2(50 byte),
   "STATUS"            varchar2(1 char),
   "DATA_ENTRADA"      date,
   "DATA_SAIDA"        date,
   "OBSERVACAO"        varchar2(100 byte),
   "TB_PATIO_ID_PATIO" number
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_CLIENTE
--------------------------------------------------------

create table "RELACAODIRETA"."TB_CLIENTE" (
   "ID_CLIENTE"              number,
   "DATA_CADASTRO"           date,
   "SEXO"                    varchar2(2 char),
   "NOME"                    varchar2(100 char),
   "SOBRENOME"               varchar2(100 char),
   "DATA_NASCIMENTO"         date,
   "CPF"                     varchar2(11 char),
   "PROFISSAO"               varchar2(50 byte),
   "ESTADO_CIVIL"            varchar2(50 byte),
   "TB_ENDERECO_ID_ENDERECO" number,
   "TB_CONTATO_ID_CONTATO"   number
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_CLIENTEVEICULO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_CLIENTEVEICULO" (
   "TB_CLIENTE_TB_CONTATO_ID_CONTATO"   number(19,0),
   "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO" number(19,0),
   "TB_CLIENTE_ID_CLIENTE"              number(19,0),
   "TB_VEICULO_ID_VEICULO"              number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_CONTATO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_CONTATO" (
   "ID_CONTATO" number,
   "EMAIL"      varchar2(100 byte),
   "TELEFONE1"  varchar2(20 byte),
   "TELEFONE2"  varchar2(20 byte),
   "TELEFONE3"  varchar2(20 byte),
   "CELULAR"    varchar2(20 byte),
   "OUTRO"      varchar2(100 byte),
   "OBSERVACAO" varchar2(200 byte),
   "DDD"        number(10,0),
   "DDI"        number(10,0)
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_CONTATOPATIO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_CONTATOPATIO" (
   "TB_PATIO_ID_PATIO"     number(19,0),
   "TB_PATIO_STATUS"       varchar2(255 char),
   "TB_CONTATO_ID_CONTATO" number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_CV
--------------------------------------------------------

create table "RELACAODIRETA"."TB_CV" (
   "TB_CLIENTE_ID_CLIENTE"              number,
   "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO" number,
   "TB_CLIENTE_TB_CONTATO_ID_CONTATO"   number,
   "TB_VEICULO_ID_VEICULO"              number
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_ENDERECIOPATIO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_ENDERECIOPATIO" (
   "TB_PATIO_ID_PATIO"       number(19,0),
   "TB_PATIO_STATUS"         varchar2(255 char),
   "TB_ENDERECO_ID_ENDERECO" number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_ENDERECO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_ENDERECO" (
   "ID_ENDERECO" number,
   "CEP"         varchar2(9 char),
   "NUMERO"      number(10,0),
   "LOGRADOURO"  varchar2(50 byte),
   "BAIRRO"      varchar2(50 byte),
   "CIDADE"      varchar2(50 byte),
   "ESTADO"      varchar2(2 char),
   "PAIS"        varchar2(50 char),
   "COMPLEMENTO" varchar2(60 byte),
   "OBSERVACAO"  varchar2(200 byte)
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_PATIO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_PATIO" (
   "ID_PATIO"                number,
   "NOME_PATIO"              varchar2(50 byte),
   "STATUS"                  varchar2(1 char),
   "OBSERVACAO"              varchar2(100 byte),
   "TB_CONTATO_ID_CONTATO"   number,
   "TB_ENDERECO_ID_ENDERECO" number,
   "DATA_CADASTRO"           date
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_RASTREAMENTO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_RASTREAMENTO" (
   "ID_RASTREAMENTO"    number,
   "DATA_RASTREIO"      timestamp(6) with local time zone,
   "METODO_LOCALIZACAO" varchar2(20 byte),
   "NUM_ANCORAS_USADAS" number(2,0),
   "PRECISAO_M"         number(8,3),
   "RMSE_M"             number(8,3),
   "FONTE_DADOS"        varchar2(20 byte),
   "LAT_E7"             number(19,0),
   "LON_E7"             number(19,0),
   "LAT_GRAUS"          number(10,7),
   "LON_GRAUS"          number(10,7),
   "DATA_HORA_REGISTRO" timestamp(6),
   "GPRS_ALTITUDE"      number(7,2),
   "GPRS_LATITUDE"      number(11,6),
   "GPRS_LONGITUDE"     number(11,6),
   "IPS_X"              number(7,3),
   "IPS_Y"              number(7,3),
   "IPS_Z"              number(7,3)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_RP
--------------------------------------------------------

create table "RELACAODIRETA"."TB_RP" (
   "TB_RASTREAMENTO_ID_RASTREAMENTO" number,
   "TB_PATIO_ID_PATIO"               number,
   "TB_PATIO_STATUS"                 char(1 byte)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VB
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VB" (
   "TB_VEICULO_ID_VEICULO" number,
   "TB_BOX_ID_BOX"         number
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VEICULO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VEICULO" (
   "ID_VEICULO"         number,
   "PLACA"              varchar2(10 byte),
   "RENAVAM"            varchar2(11 char),
   "CHASSI"             varchar2(17 char),
   "FABRICANTE"         varchar2(50 byte),
   "MOLDELO"            varchar2(60 byte),
   "MOTOR"              varchar2(30 byte),
   "ANO"                number,
   "COMBUSTIVEL"        varchar2(20 byte),
   "STATUS"             varchar2(20 byte),
   "MODELO"             varchar2(60 char),
   "STATUS_OPERACIONAL" varchar2(20 char),
   "TAG_BLE_ID"         varchar2(50 char)
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VEICULOBOX
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VEICULOBOX" (
   "TB_BOX_ID_BOX"         number(19,0),
   "TB_VEICULO_ID_VEICULO" number(19,0)
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VEICULOPATIO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VEICULOPATIO" (
   "TB_PATIO_ID_PATIO"     number(19,0),
   "TB_PATIO_STATUS"       varchar2(255 char),
   "TB_VEICULO_ID_VEICULO" number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VEICULORASTREAMENTO
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VEICULORASTREAMENTO" (
   "TB_RASTREAMENTO_ID_RASTREAMENTO" number(19,0),
   "TB_VEICULO_ID_VEICULO"           number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VEICULOZONA
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VEICULOZONA" (
   "TB_VEICULO_ID_VEICULO" number(19,0),
   "TB_ZONA_ID_ZONA"       number(19,0)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VP
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VP" (
   "TB_VEICULO_ID_VEICULO" number,
   "TB_PATIO_ID_PATIO"     number,
   "TB_PATIO_STATUS"       char(1 byte)
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_VR
--------------------------------------------------------

create table "RELACAODIRETA"."TB_VR" (
   "TB_VEICULO_ID_VEICULO"           number,
   "TB_RASTREAMENTO_ID_RASTREAMENTO" number
)
segment creation deferred
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
tablespace "USERS";
--------------------------------------------------------
--  DDL for Table TB_ZONA
--------------------------------------------------------

create table "RELACAODIRETA"."TB_ZONA" (
   "ID_ZONA"           number,
   "NOME"              varchar2(50 byte),
   "STATUS"            varchar2(1 char),
   "OBSERVACAO"        varchar2(100 byte),
   "TB_PATIO_ID_PATIO" number,
   "TB_PATIO_STATUS"   varchar2(1 char)
)
segment creation immediate
pctfree 10
pctused 40
initrans 1
maxtrans 255 nocompress
logging
   storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool
   default flash_cache default cell_flash_cache default )
tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_VP_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_VP_PK" on
   "RELACAODIRETA"."TB_VP" (
      "TB_VEICULO_ID_VEICULO",
      "TB_PATIO_ID_PATIO",
      "TB_PATIO_STATUS"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_VB_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_VB_PK" on
   "RELACAODIRETA"."TB_VB" (
      "TB_VEICULO_ID_VEICULO",
      "TB_BOX_ID_BOX"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_CLIENTE_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_CLIENTE_PK" on
   "RELACAODIRETA"."TB_CLIENTE" (
      "ID_CLIENTE"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_RASTREAMENTO_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_RASTREAMENTO_PK" on
   "RELACAODIRETA"."TB_RASTREAMENTO" (
      "ID_RASTREAMENTO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_RP_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_RP_PK" on
   "RELACAODIRETA"."TB_RP" (
      "TB_RASTREAMENTO_ID_RASTREAMENTO",
      "TB_PATIO_ID_PATIO",
      "TB_PATIO_STATUS"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_ZONA_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_ZONA_PK" on
   "RELACAODIRETA"."TB_ZONA" (
      "ID_ZONA"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index UK9INAY2DRQUEX0NS5QGABIMW14
--------------------------------------------------------

create unique index "RELACAODIRETA"."UK9INAY2DRQUEX0NS5QGABIMW14" on
   "RELACAODIRETA"."TB_VEICULO" (
      "TAG_BLE_ID"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_CONTATO_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_CONTATO_PK" on
   "RELACAODIRETA"."TB_CONTATO" (
      "ID_CONTATO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_CV_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_CV_PK" on
   "RELACAODIRETA"."TB_CV" (
      "TB_CLIENTE_ID_CLIENTE",
      "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO",
      "TB_CLIENTE_TB_CONTATO_ID_CONTATO",
      "TB_VEICULO_ID_VEICULO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_VEICULO_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_VEICULO_PK" on
   "RELACAODIRETA"."TB_VEICULO" (
      "ID_VEICULO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index UKAWTCQGSL5SNH5TG3OEN3Y2SUX
--------------------------------------------------------

create unique index "RELACAODIRETA"."UKAWTCQGSL5SNH5TG3OEN3Y2SUX" on
   "RELACAODIRETA"."TB_PATIO" (
      "ID_PATIO",
      "STATUS"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_BOX_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_BOX_PK" on
   "RELACAODIRETA"."TB_BOX" (
      "ID_BOX"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_ENDERECO_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_ENDERECO_PK" on
   "RELACAODIRETA"."TB_ENDERECO" (
      "ID_ENDERECO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_VR_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_VR_PK" on
   "RELACAODIRETA"."TB_VR" (
      "TB_VEICULO_ID_VEICULO",
      "TB_RASTREAMENTO_ID_RASTREAMENTO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS";
--------------------------------------------------------
--  DDL for Index TB_PATIO_PK
--------------------------------------------------------

create unique index "RELACAODIRETA"."TB_PATIO_PK" on
   "RELACAODIRETA"."TB_PATIO" (
      "ID_PATIO"
   )
      pctfree 10 initrans 2 maxtrans 255 compute statistics
         storage (
            initial
         65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups 1 buffer_pool default
         flash_cache default cell_flash_cache default )
      tablespace "USERS";
--------------------------------------------------------
--  Constraints for Table TB_VEICULOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOPATIO" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOPATIO" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOPATIO" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOPATIO"
   add
      primary key ( "TB_PATIO_ID_PATIO",
                    "TB_PATIO_STATUS",
                    "TB_VEICULO_ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_RASTREAMENTO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "ID_RASTREAMENTO" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "DATA_RASTREIO" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO"
   add constraint "TB_RASTREAMENTO_PK"
      primary key ( "ID_RASTREAMENTO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "DATA_HORA_REGISTRO" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "GPRS_ALTITUDE" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "GPRS_LATITUDE" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "GPRS_LONGITUDE" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "IPS_X" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "IPS_Y" not null enable
);
alter table "RELACAODIRETA"."TB_RASTREAMENTO" modify (
   "IPS_Z" not null enable
);
--------------------------------------------------------
--  Constraints for Table TB_CLIENTE
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "ID_CLIENTE" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "DATA_CADASTRO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "SEXO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "NOME" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "SOBRENOME" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "DATA_NASCIMENTO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "CPF" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "PROFISSAO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "ESTADO_CIVIL" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "TB_ENDERECO_ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE" modify (
   "TB_CONTATO_ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTE"
   add constraint "TB_CLIENTE_PK"
      primary key ( "ID_CLIENTE" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_CONTATOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CONTATOPATIO" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATOPATIO" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATOPATIO" modify (
   "TB_CONTATO_ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATOPATIO"
   add
      primary key ( "TB_CONTATO_ID_CONTATO",
                    "TB_PATIO_ID_PATIO",
                    "TB_PATIO_STATUS" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_PATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_PATIO" modify (
   "ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_PATIO" modify (
   "NOME_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_PATIO" modify (
   "STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_PATIO" modify (
   "TB_CONTATO_ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_PATIO" modify (
   "TB_ENDERECO_ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_PATIO"
   add constraint "TB_PATIO_PK"
      primary key ( "ID_PATIO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_PATIO"
   add constraint "UKAWTCQGSL5SNH5TG3OEN3Y2SUX"
      unique ( "ID_PATIO",
               "STATUS" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VB
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VB" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VB" modify (
   "TB_BOX_ID_BOX" not null enable
);
alter table "RELACAODIRETA"."TB_VB"
   add constraint "TB_VB_PK"
      primary key ( "TB_VEICULO_ID_VEICULO",
                    "TB_BOX_ID_BOX" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_ZONA
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_ZONA" modify (
   "ID_ZONA" not null enable
);
alter table "RELACAODIRETA"."TB_ZONA" modify (
   "NOME" not null enable
);
alter table "RELACAODIRETA"."TB_ZONA" modify (
   "STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_ZONA" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_ZONA" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_ZONA"
   add constraint "TB_ZONA_PK"
      primary key ( "ID_ZONA" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_ENDERECIOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_ENDERECIOPATIO" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECIOPATIO" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECIOPATIO" modify (
   "TB_ENDERECO_ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECIOPATIO"
   add
      primary key ( "TB_ENDERECO_ID_ENDERECO",
                    "TB_PATIO_ID_PATIO",
                    "TB_PATIO_STATUS" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_BOX
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_BOX" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_BOX"
   add constraint "TB_BOX_PK"
      primary key ( "ID_BOX" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_BOX" modify (
   "ID_BOX" not null enable
);
alter table "RELACAODIRETA"."TB_BOX" modify (
   "NOME" not null enable
);
alter table "RELACAODIRETA"."TB_BOX" modify (
   "STATUS" not null enable
);
--------------------------------------------------------
--  Constraints for Table TB_CONTATO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "EMAIL" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "TELEFONE1" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "CELULAR" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATO"
   add constraint "TB_CONTATO_PK"
      primary key ( "ID_CONTATO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "DDD" not null enable
);
alter table "RELACAODIRETA"."TB_CONTATO" modify (
   "DDI" not null enable
);
--------------------------------------------------------
--  Constraints for Table TB_VP
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VP" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VP" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_VP" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_VP"
   add constraint "TB_VP_PK"
      primary key ( "TB_VEICULO_ID_VEICULO",
                    "TB_PATIO_ID_PATIO",
                    "TB_PATIO_STATUS" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VEICULOBOX
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOBOX" modify (
   "TB_BOX_ID_BOX" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOBOX" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOBOX"
   add
      primary key ( "TB_BOX_ID_BOX",
                    "TB_VEICULO_ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_ENDERECO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "CEP" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "NUMERO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "LOGRADOURO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "BAIRRO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "CIDADE" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "ESTADO" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO" modify (
   "PAIS" not null enable
);
alter table "RELACAODIRETA"."TB_ENDERECO"
   add constraint "TB_ENDERECO_PK"
      primary key ( "ID_ENDERECO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VEICULORASTREAMENTO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULORASTREAMENTO" modify (
   "TB_RASTREAMENTO_ID_RASTREAMENTO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULORASTREAMENTO" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULORASTREAMENTO"
   add
      primary key ( "TB_RASTREAMENTO_ID_RASTREAMENTO",
                    "TB_VEICULO_ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VR
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VR" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VR" modify (
   "TB_RASTREAMENTO_ID_RASTREAMENTO" not null enable
);
alter table "RELACAODIRETA"."TB_VR"
   add constraint "TB_VR_PK"
      primary key ( "TB_VEICULO_ID_VEICULO",
                    "TB_RASTREAMENTO_ID_RASTREAMENTO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_CV
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CV" modify (
   "TB_CLIENTE_ID_CLIENTE" not null enable
);
alter table "RELACAODIRETA"."TB_CV" modify (
   "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_CV" modify (
   "TB_CLIENTE_TB_CONTATO_ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_CV" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_CV"
   add constraint "TB_CV_PK"
      primary key ( "TB_CLIENTE_ID_CLIENTE",
                    "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO",
                    "TB_CLIENTE_TB_CONTATO_ID_CONTATO",
                    "TB_VEICULO_ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VEICULOZONA
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOZONA" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOZONA" modify (
   "TB_ZONA_ID_ZONA" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULOZONA"
   add
      primary key ( "TB_VEICULO_ID_VEICULO",
                    "TB_ZONA_ID_ZONA" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_RP
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_RP" modify (
   "TB_RASTREAMENTO_ID_RASTREAMENTO" not null enable
);
alter table "RELACAODIRETA"."TB_RP" modify (
   "TB_PATIO_ID_PATIO" not null enable
);
alter table "RELACAODIRETA"."TB_RP" modify (
   "TB_PATIO_STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_RP"
   add constraint "TB_RP_PK"
      primary key ( "TB_RASTREAMENTO_ID_RASTREAMENTO",
                    "TB_PATIO_ID_PATIO",
                    "TB_PATIO_STATUS" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Constraints for Table TB_VEICULO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULO"
   add constraint "UK9INAY2DRQUEX0NS5QGABIMW14"
      unique ( "TAG_BLE_ID" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "PLACA" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "RENAVAM" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "CHASSI" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "FABRICANTE" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "MOLDELO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "ANO" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "COMBUSTIVEL" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "STATUS" not null enable
);
alter table "RELACAODIRETA"."TB_VEICULO"
   add constraint "TB_VEICULO_PK"
      primary key ( "ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics
            storage ( initial 65536 next 1048576 minextents 1 maxextents 2147483645 pctincrease 0 freelists 1 freelist groups
            1 buffer_pool default flash_cache default cell_flash_cache default )
         tablespace "USERS" enable;
alter table "RELACAODIRETA"."TB_VEICULO" modify (
   "MODELO" not null enable
);
--------------------------------------------------------
--  Constraints for Table TB_CLIENTEVEICULO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CLIENTEVEICULO" modify (
   "TB_CLIENTE_TB_CONTATO_ID_CONTATO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTEVEICULO" modify (
   "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTEVEICULO" modify (
   "TB_CLIENTE_ID_CLIENTE" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTEVEICULO" modify (
   "TB_VEICULO_ID_VEICULO" not null enable
);
alter table "RELACAODIRETA"."TB_CLIENTEVEICULO"
   add
      primary key ( "TB_CLIENTE_TB_CONTATO_ID_CONTATO",
                    "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO",
                    "TB_CLIENTE_ID_CLIENTE",
                    "TB_VEICULO_ID_VEICULO" )
         using index pctfree 10 initrans 2 maxtrans 255 compute statistics tablespace "USERS" enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_BOX
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_BOX"
   add constraint "FK_BOX_PATIO"
      foreign key ( "TB_PATIO_ID_PATIO" )
         references "RELACAODIRETA"."TB_PATIO" ( "ID_PATIO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_CLIENTE
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CLIENTE"
   add constraint "TB_CLIENTE_TB_CONTATO_FK"
      foreign key ( "TB_CONTATO_ID_CONTATO" )
         references "RELACAODIRETA"."TB_CONTATO" ( "ID_CONTATO" )
      enable;
alter table "RELACAODIRETA"."TB_CLIENTE"
   add constraint "TB_CLIENTE_TB_ENDERECO_FK"
      foreign key ( "TB_ENDERECO_ID_ENDERECO" )
         references "RELACAODIRETA"."TB_ENDERECO" ( "ID_ENDERECO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_CLIENTEVEICULO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CLIENTEVEICULO"
   add constraint "FK76XMCYW0D97Y3UF7F0LT83GQ5"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
alter table "RELACAODIRETA"."TB_CLIENTEVEICULO"
   add constraint "FK5TRBTB9C963DJV4ENHBU2F7B1"
      foreign key ( "TB_CLIENTE_ID_CLIENTE" )
         references "RELACAODIRETA"."TB_CLIENTE" ( "ID_CLIENTE" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_CONTATOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CONTATOPATIO"
   add constraint "FK4DGH758BNL5SMQWSNOM21BE18"
      foreign key ( "TB_CONTATO_ID_CONTATO" )
         references "RELACAODIRETA"."TB_CONTATO" ( "ID_CONTATO" )
      enable;
alter table "RELACAODIRETA"."TB_CONTATOPATIO"
   add constraint "FK_CONTATOPATIO_PATIO"
      foreign key ( "TB_PATIO_ID_PATIO" )
         references "RELACAODIRETA"."TB_PATIO" ( "ID_PATIO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_CV
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_CV"
   add constraint "TB_CV_TB_CLIENTE_FK"
      foreign key ( "TB_CLIENTE_ID_CLIENTE" )
         references "RELACAODIRETA"."TB_CLIENTE" ( "ID_CLIENTE" )
      enable;
alter table "RELACAODIRETA"."TB_CV"
   add constraint "TB_CV_TB_VEICULO_FK"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_ENDERECIOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_ENDERECIOPATIO"
   add constraint "FKI4C842BTMSTOFB9OL5016CRVL"
      foreign key ( "TB_ENDERECO_ID_ENDERECO" )
         references "RELACAODIRETA"."TB_ENDERECO" ( "ID_ENDERECO" )
      enable;
alter table "RELACAODIRETA"."TB_ENDERECIOPATIO"
   add constraint "FK_ENDERECIOPATIO_PATIO"
      foreign key ( "TB_PATIO_ID_PATIO" )
         references "RELACAODIRETA"."TB_PATIO" ( "ID_PATIO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_PATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_PATIO"
   add constraint "TB_PATIO_TB_CONTATO_FK"
      foreign key ( "TB_CONTATO_ID_CONTATO" )
         references "RELACAODIRETA"."TB_CONTATO" ( "ID_CONTATO" )
      enable;
alter table "RELACAODIRETA"."TB_PATIO"
   add constraint "TB_PATIO_TB_ENDERECO_FK"
      foreign key ( "TB_ENDERECO_ID_ENDERECO" )
         references "RELACAODIRETA"."TB_ENDERECO" ( "ID_ENDERECO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_RP
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_RP"
   add constraint "TB_RP_TB_RASTREAMENTO_FK"
      foreign key ( "TB_RASTREAMENTO_ID_RASTREAMENTO" )
         references "RELACAODIRETA"."TB_RASTREAMENTO" ( "ID_RASTREAMENTO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VB
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VB"
   add constraint "TB_VB_TB_BOX_FK"
      foreign key ( "TB_BOX_ID_BOX" )
         references "RELACAODIRETA"."TB_BOX" ( "ID_BOX" )
      enable;
alter table "RELACAODIRETA"."TB_VB"
   add constraint "TB_VB_TB_VEICULO_FK"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VEICULOBOX
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOBOX"
   add constraint "FK5YOWO94RQX413PF50BOSQUOM"
      foreign key ( "TB_BOX_ID_BOX" )
         references "RELACAODIRETA"."TB_BOX" ( "ID_BOX" )
      enable;
alter table "RELACAODIRETA"."TB_VEICULOBOX"
   add constraint "FKSRK3YSSEW1MEKV7K3NOYOTVGO"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VEICULOPATIO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOPATIO"
   add constraint "FKVFVJJ3VD9AKLO6PG6V318IVW"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
alter table "RELACAODIRETA"."TB_VEICULOPATIO"
   add constraint "FK_VEICULOPATIO_PATIO"
      foreign key ( "TB_PATIO_ID_PATIO" )
         references "RELACAODIRETA"."TB_PATIO" ( "ID_PATIO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VEICULORASTREAMENTO
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULORASTREAMENTO"
   add constraint "FKCYU9PJ9TDQBY7M2TNSJU9G9C3"
      foreign key ( "TB_RASTREAMENTO_ID_RASTREAMENTO" )
         references "RELACAODIRETA"."TB_RASTREAMENTO" ( "ID_RASTREAMENTO" )
      enable;
alter table "RELACAODIRETA"."TB_VEICULORASTREAMENTO"
   add constraint "FK2KGUHLY2F2JKH3EG1X7IIHVD5"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VEICULOZONA
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VEICULOZONA"
   add constraint "FKJ7TV5PEDDAK948YITGY1IAH9U"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
alter table "RELACAODIRETA"."TB_VEICULOZONA"
   add constraint "FK7OVBYPI4GRC88VTFJH6L1VHEH"
      foreign key ( "TB_ZONA_ID_ZONA" )
         references "RELACAODIRETA"."TB_ZONA" ( "ID_ZONA" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VP
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VP"
   add constraint "TB_VP_TB_VEICULO_FK"
      foreign key ( "TB_VEICULO_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_VR
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_VR"
   add constraint "TB_VR_TB_RASTREAMENTO_FK"
      foreign key ( "TB_RASTREAMENTO_ID_RASTREAMENTO" )
         references "RELACAODIRETA"."TB_RASTREAMENTO" ( "ID_RASTREAMENTO" )
      enable;
alter table "RELACAODIRETA"."TB_VR"
   add constraint "TB_VR_TB_VEICULO_FK"
      foreign key ( "TB_VEICulo_ID_VEICULO" )
         references "RELACAODIRETA"."TB_VEICULO" ( "ID_VEICULO" )
      enable;
--------------------------------------------------------
--  Ref Constraints for Table TB_ZONA
--------------------------------------------------------

alter table "RELACAODIRETA"."TB_ZONA"
   add constraint "TB_ZONA_TB_PATIO_FK"
      foreign key ( "TB_PATIO_ID_PATIO" )
         references "RELACAODIRETA"."TB_PATIO" ( "ID_PATIO" )
      enable;