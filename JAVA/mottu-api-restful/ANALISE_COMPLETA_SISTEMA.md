# 🔍 ANÁLISE PROFUNDA E COMPLETA DO SISTEMA MOTTU

**Data da Análise:** 2025-01-27  
**Analista:** Sistema de Análise Automatizada  
**Escopo:** Backend (mottu-gradle) + Frontend (mottu-web) + Banco de Dados Oracle

---

## 📋 SUMÁRIO EXECUTIVO

### Visão Geral do Sistema

O **Sistema Radar Mottu** é uma solução completa de gestão inteligente de estacionamento para motocicletas, desenvolvido para o Challenge FIAP 2025. O sistema integra:

- **Backend:** Spring Boot 3.5.4 com Java 21
- **Frontend:** Next.js 15.4 com React 19 e TypeScript 5.9
- **Banco de Dados:** Oracle Database (Schema: RELACAODIRETA)
- **Tecnologias:** OCR (OpenALPR/Tesseract), Mapas (Leaflet), Relatórios (Chart.js/Recharts)

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. Backend (mottu-gradle)

#### Estrutura de Pacotes

```
br.com.fiap.mottu/
├── controller/          # Camada de API REST (28 controllers)
│   ├── PatioController.java
│   ├── BoxController.java
│   ├── VeiculoController.java
│   ├── ClienteController.java
│   ├── EstacionamentoController.java
│   ├── RadarController.java
│   └── [22 outros controllers]
│
├── service/             # Camada de Lógica de Negócio (34 services)
│   ├── PatioService.java
│   ├── BoxService.java
│   ├── VeiculoService.java
│   ├── EstacionamentoService.java
│   ├── VagaOracleService.java (legado)
│   └── [29 outros services]
│
├── repository/           # Camada de Acesso a Dados (23 repositories)
│   ├── PatioRepository.java
│   ├── BoxRepository.java
│   ├── VeiculoRepository.java
│   └── [20 outros repositories]
│
├── model/               # Entidades JPA (17 entidades principais)
│   ├── Patio.java
│   ├── Box.java
│   ├── Zona.java
│   ├── Veiculo.java
│   ├── Cliente.java
│   ├── Estacionamento.java
│   └── relacionamento/ (14 entidades de relacionamento)
│
├── dto/                 # Data Transfer Objects (múltiplos módulos)
│   ├── patio/
│   ├── box/
│   ├── veiculo/
│   ├── cliente/
│   ├── estacionamento/
│   └── [outros módulos]
│
├── mapper/              # MapStruct Mappers (11 mappers)
├── specification/        # JPA Specifications para filtros
├── filter/              # Filtros de busca
├── exception/           # Tratamento de exceções
└── config/              # Configurações (CORS, Cache, Swagger, etc.)
```

#### Tecnologias Principais

- **Spring Boot 3.5.4** - Framework principal
- **Spring Data JPA** - Persistência ORM
- **MapStruct 1.5.5** - Mapeamento DTO ↔ Entity
- **Lombok 1.18.38** - Redução de boilerplate
- **Oracle JDBC 11** - Driver Oracle
- **Spring Cache + Caffeine** - Cache em memória
- **SpringDoc OpenAPI 2.8.8** - Documentação Swagger
- **OpenCV 4.9.0** - Processamento de imagens
- **Tesseract 5.11.0** - OCR

#### Padrões Arquiteturais

✅ **Camadas bem definidas:** Controller → Service → Repository → Entity  
✅ **DTOs separados:** Request/Response DTOs para APIs  
✅ **Specifications:** Filtros dinâmicos usando JPA Specifications  
✅ **Mappers:** Conversão automática Entity ↔ DTO  
✅ **Cache:** Cache de consultas frequentes (Caffeine)  
✅ **Validação:** Bean Validation (@Valid)  
✅ **Tratamento de Exceções:** GlobalExceptionHandler centralizado  

### 2. Frontend (mottu-web)

#### Estrutura de Pastas (Next.js App Router)

```
src/
├── app/                 # Rotas Next.js (App Router)
│   ├── dashboard/       # Dashboard principal
│   ├── radar/           # Sistema Radar (OCR)
│   ├── patio/           # CRUD Pátios
│   ├── zona/             # CRUD Zonas
│   ├── box/              # CRUD Boxes/Vagas
│   ├── veiculo/          # CRUD Veículos
│   ├── clientes/         # CRUD Clientes
│   ├── mapa-box/         # Mapa dinâmico de vagas
│   ├── mapas/            # Mapas 2D tradicionais
│   ├── relatorios/       # Relatórios avançados
│   └── api/              # API Routes Next.js
│
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Componentes shadcn/ui
│   ├── mapa-box/         # Componentes de mapas
│   ├── notifications/    # Sistema de notificações
│   ├── wizard-steps/     # Wizard de cadastro
│   └── [outros componentes]
│
├── utils/                # Utilitários
│   ├── api.ts            # Serviços de API (Axios)
│   └── api/               # Módulos específicos de API
│
├── types/                # Definições TypeScript
│   ├── patio.d.ts
│   ├── box.d.ts
│   ├── veiculo.d.ts
│   └── [outros tipos]
│
└── config/               # Configurações
    └── api.ts            # Configuração de endpoints
```

#### Tecnologias Principais

- **Next.js 15.4** - Framework React com SSR/SSG
- **React 19.1** - Biblioteca UI
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS 4.1** - Framework CSS utility-first
- **Axios 1.11** - Cliente HTTP
- **Leaflet 1.9.4** - Mapas interativos
- **Chart.js 4.4** + **Recharts 3.1** - Gráficos
- **Tesseract.js 6.0** - OCR no navegador
- **jsPDF 3.0** - Geração de PDFs

### 3. Banco de Dados Oracle

#### Schema: RELACAODIRETA

#### Tabelas Principais

1. **TB_PATIO** - Pátios de estacionamento
   - Chave primária: ID_PATIO
   - Campos: NOME_PATIO, STATUS, OBSERVACAO, DATA_CADASTRO
   - Relacionamentos: Contato, Endereço, Zonas, Boxes

2. **TB_ZONA** - Zonas dentro dos pátios
   - Chave primária: ID_ZONA
   - FK: TB_PATIO_ID_PATIO → TB_PATIO
   - Campos: NOME, STATUS, OBSERVACAO

3. **TB_BOX** - Boxes/Vagas de estacionamento
   - Chave primária: ID_BOX
   - FK: TB_PATIO_ID_PATIO → TB_PATIO (NOTA: Não tem FK para TB_ZONA diretamente)
   - Campos: NOME, STATUS ('L'/'O'/'M'), DATA_ENTRADA, DATA_SAIDA

4. **TB_CLIENTE** - Clientes do sistema
   - Chave primária: ID_CLIENTE
   - FKs: TB_ENDERECO_ID_ENDERECO, TB_CONTATO_ID_CONTATO
   - Campos: NOME, SOBRENOME, CPF, DATA_NASCIMENTO, SEXO, PROFISSAO, ESTADO_CIVIL

5. **TB_VEICULO** - Veículos (motocicletas)
   - Chave primária: ID_VEICULO
   - FK: TB_CLIENTE_ID_CLIENTE (opcional)
   - Campos: PLACA, MODELO, FABRICANTE, ANO, TAG_BLE_ID, STATUS

6. **TB_ESTACIONAMENTO** - Estacionamentos ativos e históricos ⚠️ **CRÍTICO**
   - Chave primária: ID_ESTACIONAMENTO
   - FKs: TB_VEICULO_ID_VEICULO, TB_BOX_ID_BOX, TB_PATIO_ID_PATIO
   - Campos: ESTA_ESTACIONADO (0/1), DATA_ENTRADA, DATA_SAIDA, DATA_ULTIMA_ATUALIZACAO

7. **TB_VEICULOBOX** - Relacionamento Veículo-Box (LEGADO) ⚠️
   - Tabela de relacionamento N:N legada
   - Ainda usada em alguns pontos do código

8. **TB_CONTATO** - Informações de contato
   - Campos: EMAIL, TELEFONE1, TELEFONE2, TELEFONE3, CELULAR, DDD, DDI

9. **TB_ENDERECO** - Endereços
   - Campos: CEP, LOGRADOURO, BAIRRO, CIDADE, ESTADO, PAIS, NUMERO, COMPLEMENTO

10. **TB_NOTIFICACAO** - Sistema de notificações
    - Campos: TITULO, MENSAGEM, CATEGORIA, PRIORIDADE, TIPO, LIDA, DATA_HORA_CRIACAO

11. **TB_LOG_MOVIMENTACAO** - Log de movimentações
    - Campos: TIPO_MOVIMENTACAO, DATA_HORA_MOVIMENTACAO, TEMPO_ESTACIONAMENTO_MINUTOS

12. **TB_RASTREAMENTO** - Rastreamento GPS
    - Campos: GPRS_LATITUDE, GPRS_LONGITUDE, GPRS_ALTITUDE, IPS_X, IPS_Y, IPS_Z

#### Sequências (Sequences)

- SEQ_TB_PATIO (inicia em 57)
- SEQ_TB_BOX (inicia em 3640)
- SEQ_TB_VEICULO (inicia em 78)
- SEQ_TB_CLIENTE (inicia em 19)
- SEQ_TB_ESTACIONAMENTO (inicia em 81)
- SEQ_TB_ZONA (inicia em 37)
- [outras sequências]

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS (Prioridade ALTA)

#### 1. Inconsistência entre TB_BOX e TB_ESTACIONAMENTO

**Problema:**
- Quando uma vaga é liberada, o `TB_BOX.STATUS` é atualizado para 'L' (livre)
- Mas `TB_ESTACIONAMENTO.ESTA_ESTACIONADO` pode permanecer como 1 (ativo)
- Isso causa dados inconsistentes no sistema

**Localização:**
- `VagaOracleService.liberarBox()` - Método legado não atualizava TB_ESTACIONAMENTO
- `EstacionamentoService.liberarVeiculo()` - Já corrigido parcialmente

**Documentação:**
- `CORRECAO_LIBERACAO_INCONSISTENCIA.md`
- `CORRIGIR_INCONSISTENCIA.sql`
- `INSTRUCOES_CORRECAO.md`

**Status:** ⚠️ **Correção parcial implementada, mas ainda pode ocorrer**

**Solução Recomendada:**
```sql
-- Verificar inconsistências
SELECT 
    b.ID_BOX,
    b.STATUS as BOX_STATUS,
    e.ID_ESTACIONAMENTO,
    e.ESTA_ESTACIONADO
FROM TB_BOX b
LEFT JOIN TB_ESTACIONAMENTO e ON e.TB_BOX_ID_BOX = b.ID_BOX AND e.ESTA_ESTACIONADO = 1
WHERE b.STATUS = 'L' AND e.ID_ESTACIONAMENTO IS NOT NULL;

-- Corrigir manualmente se necessário
UPDATE TB_ESTACIONAMENTO e
SET 
    e.ESTA_ESTACIONADO = 0,
    e.DATA_SAIDA = CURRENT_TIMESTAMP,
    e.DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
WHERE e.ESTA_ESTACIONADO = 1
AND EXISTS (
    SELECT 1 FROM TB_BOX b 
    WHERE b.ID_BOX = e.TB_BOX_ID_BOX 
    AND b.STATUS = 'L'
);
COMMIT;
```

#### 2. Duplicação de Estacionamentos Ativos

**Problema:**
- Um mesmo veículo pode ter múltiplos estacionamentos ativos (`ESTA_ESTACIONADO = 1`)
- Isso causa inconsistências no sistema de vagas

**Documentação:**
- `VERIFICAR_MULTIPLOS_ESTACIONAMENTOS.sql`
- `VERIFICAR_E_CORRIGIR_DUPLICATAS.sql`

**Solução Recomendada:**
```sql
-- Verificar múltiplos estacionamentos ativos para o mesmo veículo
SELECT 
    v.PLACA,
    COUNT(*) as ESTACIONAMENTOS_ATIVOS
FROM TB_ESTACIONAMENTO e
JOIN TB_VEICULO v ON e.TB_VEICULO_ID_VEICULO = v.ID_VEICULO
WHERE e.ESTA_ESTACIONADO = 1
GROUP BY v.PLACA
HAVING COUNT(*) > 1;
```

#### 3. TB_BOX não tem FK direta para TB_ZONA

**Problema:**
- `TB_BOX` tem apenas `TB_PATIO_ID_PATIO`, não tem `TB_ZONA_ID_ZONA`
- A relação Box → Zona precisa ser inferida via JOINs complexos
- Isso dificulta consultas e pode causar inconsistências

**Análise:** Documentado em `RESUMO_ANALISE_TB_ESTACIONAMENTO.md`

**Solução Recomendada:**
- Adicionar `TB_ZONA_ID_ZONA` em `TB_BOX` (requer migração)
- OU manter estrutura atual mas garantir que lógica de negócio sempre valide

### 🟡 IMPORTANTES (Prioridade MÉDIA)

#### 4. Sistema Legado TB_VEICULOBOX ainda em uso

**Problema:**
- Tabela `TB_VEICULOBOX` ainda é usada em alguns pontos do código
- Sistema novo usa `TB_ESTACIONAMENTO`
- Pode causar inconsistências se ambos são atualizados

**Solução Recomendada:**
- Migrar completamente para `TB_ESTACIONAMENTO`
- Remover referências a `TB_VEICULOBOX` no código
- Criar script de migração de dados se necessário

#### 5. Falta de Constraints de Integridade Referencial

**Problema:**
- Algumas tabelas podem não ter todas as constraints necessárias
- Risco de dados órfãos ou inconsistentes

**Solução Recomendada:**
- Revisar todas as FKs e adicionar constraints ON DELETE/ON UPDATE
- Adicionar CHECK constraints onde necessário

#### 6. Cache pode ficar desatualizado

**Problema:**
- Sistema usa Caffeine Cache para melhorar performance
- Cache pode não ser invalidado corretamente em todas as operações
- Dados podem ficar desatualizados no frontend

**Solução Recomendada:**
- Garantir `@CacheEvict` em todas as operações de escrita
- Implementar invalidação distribuída se necessário

### 🟢 MENORES (Prioridade BAIXA)

#### 7. Documentação de API pode estar desatualizada

**Problema:**
- Swagger pode não refletir todas as mudanças recentes
- Alguns endpoints podem não estar documentados

**Solução Recomendada:**
- Revisar documentação Swagger
- Atualizar anotações `@Operation` e `@ApiResponse`

#### 8. Logs podem ser insuficientes

**Problema:**
- Algumas operações críticas podem não ter logs detalhados
- Dificulta debugging e monitoramento

**Solução Recomendada:**
- Adicionar logs estruturados em operações críticas
- Usar `LoggingConfig` já existente

---

## 🔧 CORREÇÕES PONTUAIS RECOMENDADAS

### 1. Garantir Consistência em EstacionamentoService

**Arquivo:** `EstacionamentoService.java`

**Ação:** Adicionar validação e correção automática de inconsistências:

```java
@Transactional
public void liberarVeiculo(String placa) {
    // 1. Buscar veículo
    Veiculo veiculo = veiculoRepository.findByPlaca(placa)
        .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado"));
    
    // 2. Buscar estacionamentos ativos
    List<Estacionamento> estacionamentos = estacionamentoRepository
        .findByVeiculoAndEstaEstacionado(veiculo, true);
    
    // 3. Validar consistência com TB_BOX
    for (Estacionamento est : estacionamentos) {
        Box box = est.getBox();
        if (box.getStatus().equals("L")) {
            // Box já está livre, corrigir estacionamento
            log.warn("Inconsistência detectada: Box {} está livre mas estacionamento {} está ativo", 
                box.getIdBox(), est.getIdEstacionamento());
            est.setEstaEstacionado(false);
            est.setDataSaida(LocalDateTime.now());
        } else {
            // Liberar normalmente
            est.setEstaEstacionado(false);
            est.setDataSaida(LocalDateTime.now());
            box.setStatus("L");
        }
        est.setDataUltimaAtualizacao(LocalDateTime.now());
    }
    
    // 4. Salvar
    estacionamentoRepository.saveAll(estacionamentos);
    
    // 5. Verificar se ainda há inconsistências
    long inconsistencias = estacionamentoRepository.countInconsistencias();
    if (inconsistencias > 0) {
        log.warn("Ainda existem {} inconsistências após liberação", inconsistencias);
    }
}
```

### 2. Adicionar Constraint de Unicidade em TB_ESTACIONAMENTO

**SQL:**
```sql
-- Garantir que um veículo não tenha múltiplos estacionamentos ativos
ALTER TABLE TB_ESTACIONAMENTO
ADD CONSTRAINT CHK_UM_ESTACIONAMENTO_ATIVO 
CHECK (
    (ESTA_ESTACIONADO = 1 AND (
        SELECT COUNT(*) 
        FROM TB_ESTACIONAMENTO e2 
        WHERE e2.TB_VEICULO_ID_VEICULO = TB_ESTACIONAMENTO.TB_VEICULO_ID_VEICULO 
        AND e2.ESTA_ESTACIONADO = 1
    ) <= 1
    ) OR ESTA_ESTACIONADO = 0
);
```

### 3. Criar Trigger para Manter Consistência Automática

**SQL:**
```sql
CREATE OR REPLACE TRIGGER TRG_SYNC_BOX_ESTACIONAMENTO
AFTER UPDATE ON TB_BOX
FOR EACH ROW
WHEN (NEW.STATUS = 'L' AND OLD.STATUS != 'L')
BEGIN
    -- Quando box é liberado, atualizar estacionamentos
    UPDATE TB_ESTACIONAMENTO
    SET ESTA_ESTACIONADO = 0,
        DATA_SAIDA = CURRENT_TIMESTAMP,
        DATA_ULTIMA_ATUALIZACAO = CURRENT_TIMESTAMP
    WHERE TB_BOX_ID_BOX = :NEW.ID_BOX
    AND ESTA_ESTACIONADO = 1;
END;
/
```

### 4. Adicionar Método de Validação no Backend

**Arquivo:** `EstacionamentoService.java`

```java
@Scheduled(fixedRate = 300000) // A cada 5 minutos
public void validarConsistencias() {
    log.info("Iniciando validação de consistências...");
    
    // 1. Boxes livres com estacionamentos ativos
    long inconsistencias1 = estacionamentoRepository.countInconsistenciasBoxLivre();
    
    // 2. Múltiplos estacionamentos ativos para o mesmo veículo
    long inconsistencias2 = estacionamentoRepository.countVeiculosComMultiplosEstacionamentos();
    
    // 3. Estacionamentos ativos sem box válido
    long inconsistencias3 = estacionamentoRepository.countEstacionamentosSemBox();
    
    if (inconsistencias1 + inconsistencias2 + inconsistencias3 > 0) {
        log.warn("Inconsistências detectadas: Box livre={}, Múltiplos={}, Sem box={}", 
            inconsistencias1, inconsistencias2, inconsistencias3);
        
        // Opcional: corrigir automaticamente
        // corrigirInconsistencias();
    } else {
        log.info("Sistema consistente!");
    }
}
```

---

## 📊 MÉTRICAS E MONITORAMENTO

### Queries SQL para Monitoramento

```sql
-- 1. Status geral do sistema
SELECT 
    (SELECT COUNT(*) FROM TB_BOX WHERE STATUS = 'L') as BOXES_LIVRES,
    (SELECT COUNT(*) FROM TB_BOX WHERE STATUS = 'O') as BOXES_OCUPADOS,
    (SELECT COUNT(*) FROM TB_BOX WHERE STATUS = 'M') as BOXES_MANUTENCAO,
    (SELECT COUNT(*) FROM TB_ESTACIONAMENTO WHERE ESTA_ESTACIONADO = 1) as ESTACIONAMENTOS_ATIVOS,
    (SELECT COUNT(*) FROM TB_VEICULO WHERE STATUS = 'ATIVO') as VEICULOS_ATIVOS;

-- 2. Inconsistências atuais
SELECT 
    'Boxes livres com estacionamentos ativos' as TIPO,
    COUNT(*) as QUANTIDADE
FROM TB_BOX b
JOIN TB_ESTACIONAMENTO e ON e.TB_BOX_ID_BOX = b.ID_BOX
WHERE b.STATUS = 'L' AND e.ESTA_ESTACIONADO = 1
UNION ALL
SELECT 
    'Veículos com múltiplos estacionamentos ativos' as TIPO,
    COUNT(*) as QUANTIDADE
FROM (
    SELECT TB_VEICULO_ID_VEICULO
    FROM TB_ESTACIONAMENTO
    WHERE ESTA_ESTACIONADO = 1
    GROUP BY TB_VEICULO_ID_VEICULO
    HAVING COUNT(*) > 1
);

-- 3. Estatísticas de ocupação por pátio
SELECT 
    p.NOME_PATIO,
    COUNT(b.ID_BOX) as TOTAL_BOXES,
    SUM(CASE WHEN b.STATUS = 'L' THEN 1 ELSE 0 END) as LIVRES,
    SUM(CASE WHEN b.STATUS = 'O' THEN 1 ELSE 0 END) as OCUPADOS,
    ROUND(SUM(CASE WHEN b.STATUS = 'O' THEN 1 ELSE 0 END) * 100.0 / COUNT(b.ID_BOX), 2) as PERCENTUAL_OCUPACAO
FROM TB_PATIO p
LEFT JOIN TB_BOX b ON b.TB_PATIO_ID_PATIO = p.ID_PATIO
GROUP BY p.ID_PATIO, p.NOME_PATIO
ORDER BY PERCENTUAL_OCUPACAO DESC;
```

---

## ✅ CONCLUSÕES E RECOMENDAÇÕES

### Resumo Executivo

1. **Sistema bem estruturado** com arquitetura em camadas clara
2. **Problemas críticos identificados** na consistência de dados entre TB_BOX e TB_ESTACIONAMENTO
3. **Correções já implementadas parcialmente**, mas precisam ser completadas
4. **Monitoramento necessário** para prevenir futuras inconsistências

### Prioridades de Ação

#### 🔴 URGENTE (Esta semana)
1. Executar script de correção de inconsistências no banco
2. Implementar validação automática de consistências
3. Adicionar trigger para manter sincronização automática
4. Testar liberação de vagas em ambiente de desenvolvimento

#### 🟡 IMPORTANTE (Próximas 2 semanas)
1. Migrar completamente de TB_VEICULOBOX para TB_ESTACIONAMENTO
2. Adicionar constraints de integridade referencial
3. Melhorar logs em operações críticas
4. Atualizar documentação Swagger

#### 🟢 DESEJÁVEL (Próximo mês)
1. Adicionar FK TB_ZONA_ID_ZONA em TB_BOX (requer migração)
2. Implementar sistema de auditoria completo
3. Adicionar testes automatizados de consistência
4. Criar dashboard de monitoramento de saúde do sistema

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `CORRECAO_LIBERACAO_INCONSISTENCIA.md` - Detalhes da correção
- `CORRIGIR_INCONSISTENCIA.sql` - Script SQL de correção
- `INSTRUCOES_CORRECAO.md` - Instruções passo a passo
- `VERIFICAR_MULTIPLOS_ESTACIONAMENTOS.sql` - Query de verificação
- `RESUMO_ANALISE_TB_ESTACIONAMENTO.md` - Análise da tabela

---

**Fim da Análise**












