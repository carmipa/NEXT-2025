# 📚 Documentação Swagger/OpenAPI - MOTTU

## 🎯 Visão Geral

O projeto MOTTU possui **documentação completa do Swagger/OpenAPI** para todos os endpoints da API RESTful. A documentação é gerada automaticamente e está acessível via interface web.

## 🌐 Como Acessar o Swagger

### **URLs de Acesso:**
- **Swagger UI:** `http://localhost:PORTA/swagger-ui/index.html`
- **OpenAPI JSON:** `http://localhost:PORTA/v3/api-docs`
- **OpenAPI YAML:** `http://localhost:PORTA/v3/api-docs.yaml`

### **Exemplos de URLs:**
```bash
# Porta padrão 8080
http://localhost:8080/swagger-ui/index.html

# Porta dinâmica (8081, 8082, etc.)
http://localhost:8081/swagger-ui/index.html
http://localhost:8082/swagger-ui/index.html
```

## 📋 Controllers Documentados

### ✅ **1. PatioController** (`/api/patios`)
**Tag:** `Patios` - Gerenciamento de Pátios e Suas Associações

**Endpoints Principais:**
- `GET /api/patios` - Listar todos os pátios (paginado)
- `GET /api/patios/{id}` - Buscar pátio por ID
- `GET /api/patios/search` - Buscar pátios por filtro
- `POST /api/patios` - Criar novo pátio
- `PUT /api/patios/{id}` - Atualizar pátio
- `DELETE /api/patios/{id}` - Deletar pátio

**Endpoints Especiais:**
- `POST /api/patios/completo` - Criar pátio completo (wizard)
- `POST /api/patios/{patioId}/veiculos/{veiculoId}/associar` - Associar veículo
- `DELETE /api/patios/{patioId}/veiculos/{veiculoId}/desassociar` - Desassociar veículo
- `GET /api/patios/{patioId}/veiculos` - Listar veículos do pátio
- `GET /api/patios/{patioId}/zonas` - Listar zonas do pátio
- `GET /api/patios/{patioId}/boxes` - Listar boxes do pátio
- `GET /api/patios/{patioId}/contato` - Obter contato do pátio
- `GET /api/patios/{patioId}/endereco` - Obter endereço do pátio

**Endpoints Hierárquicos:**
- `GET /api/patios/{patioId}/status/{patioStatus}/zonas` - Zonas por pátio
- `POST /api/patios/{patioId}/status/{patioStatus}/zonas` - Criar zona no pátio
- `GET /api/patios/{patioId}/status/{patioStatus}/zonas/{zonaId}` - Buscar zona
- `PUT /api/patios/{patioId}/status/{patioStatus}/zonas/{zonaId}` - Atualizar zona
- `DELETE /api/patios/{patioId}/status/{patioStatus}/zonas/{zonaId}` - Excluir zona

- `GET /api/patios/{patioId}/status/{patioStatus}/boxes` - Boxes por pátio
- `POST /api/patios/{patioId}/status/{patioStatus}/boxes` - Criar box no pátio
- `GET /api/patios/{patioId}/status/{patioStatus}/boxes/{boxId}` - Buscar box
- `PUT /api/patios/{patioId}/status/{patioStatus}/boxes/{boxId}` - Atualizar box
- `DELETE /api/patios/{patioId}/status/{patioStatus}/boxes/{boxId}` - Excluir box
- `POST /api/patios/{patioId}/status/{patioStatus}/boxes/gerar-lote` - Gerar boxes em lote

### ✅ **2. ClienteController** (`/api/clientes`)
**Tag:** `Clientes` - Gerenciamento de Clientes

**Endpoints:**
- `GET /api/clientes` - Listar todos os clientes (paginado)
- `GET /api/clientes/{id}` - Buscar cliente por ID
- `GET /api/clientes/search` - Buscar clientes por filtro
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Deletar cliente

**Endpoints de Associação:**
- `POST /api/clientes/{clienteId}/enderecos/{enderecoId}/contatos/{contatoId}/veiculos/{veiculoId}/associar` - Associar veículo
- `DELETE /api/clientes/{clienteId}/enderecos/{enderecoId}/contatos/{contatoId}/veiculos/{veiculoId}/desassociar` - Desassociar veículo
- `GET /api/clientes/{clienteId}/veiculos` - Listar veículos do cliente

### ✅ **3. VeiculoController** (`/api/veiculos`)
**Tag:** `Veiculos` - Gerenciamento de Veículos, incluindo Rastreamento e Localização

**Endpoints CRUD:**
- `GET /api/veiculos` - Listar todos os veículos (paginado)
- `GET /api/veiculos/{id}` - Buscar veículo por ID
- `GET /api/veiculos/search` - Buscar veículos por filtro
- `POST /api/veiculos` - Criar novo veículo
- `PUT /api/veiculos/{id}` - Atualizar veículo
- `DELETE /api/veiculos/{id}` - Deletar veículo

**Endpoints de Localização:**
- `GET /api/veiculos/{id}/localizacao` - Obter localização por ID
- `GET /api/veiculos/localizacao-por-placa` - Obter localização por placa
- `GET /api/veiculos/estacionados` - Listar veículos estacionados

**Endpoints de Debug:**
- `GET /api/veiculos/debug-patio` - Debug dados de pátio
- `GET /api/veiculos/debug-patio-db` - Debug dados no banco
- `POST /api/veiculos/debug-associar-patio` - Associar pátio padrão
- `GET /api/veiculos/teste-patio` - Teste simples de pátio

**Endpoints Especiais:**
- `GET /api/veiculos/proxima-tag-ble` - Gerar próxima Tag BLE

### ✅ **4. ZonaController** (`/api/zonas`)
**Tag:** `Zonas` - Gerenciamento de Zonas

**Endpoints:**
- `GET /api/zonas` - Listar todas as zonas (paginado)
- `GET /api/zonas/{id}` - Buscar zona por ID
- `GET /api/zonas/search` - Buscar zonas por filtro
- `POST /api/zonas` - Criar nova zona
- `PUT /api/zonas/{id}` - Atualizar zona
- `DELETE /api/zonas/{id}` - Deletar zona

### ✅ **5. BoxController** (`/api/boxes`)
**Tag:** `Boxes` - Gerenciamento de Boxes

**Endpoints:**
- `GET /api/boxes` - Listar todos os boxes (paginado)
- `GET /api/boxes/{id}` - Buscar box por ID
- `GET /api/boxes/search` - Buscar boxes por filtro
- `POST /api/boxes` - Criar novo box
- `PUT /api/boxes/{id}` - Atualizar box
- `DELETE /api/boxes/{id}` - Deletar box
- `POST /api/boxes/gerar-lote` - Gerar boxes em lote

### ✅ **6. ContatoController** (`/api/contatos`)
**Tag:** `Contatos` - Gerenciamento de Contatos

**Endpoints:**
- `GET /api/contatos` - Listar todos os contatos
- `GET /api/contatos/{id}` - Buscar contato por ID
- `GET /api/contatos/search` - Buscar contatos por filtro
- `POST /api/contatos` - Criar novo contato
- `PUT /api/contatos/{id}` - Atualizar contato
- `DELETE /api/contatos/{id}` - Deletar contato

### ✅ **7. EnderecoController** (`/api/enderecos`)
**Tag:** `Enderecos` - Gerenciamento de Endereços

**Endpoints:**
- `GET /api/enderecos` - Listar todos os endereços (paginado)
- `GET /api/enderecos/{id}` - Buscar endereço por ID
- `GET /api/enderecos/search` - Buscar endereços por filtro
- `POST /api/enderecos` - Criar novo endereço
- `PUT /api/enderecos/{id}` - Atualizar endereço
- `DELETE /api/enderecos/{id}` - Deletar endereço

### ✅ **8. RadarController** (`/api/radar`)
**Tag:** `Radar` - Operações de OCR com Celular

**Endpoints:**
- `POST /api/radar/iniciar-sessao` - Iniciar sessão de OCR
- `GET /api/radar/status-sessao/{sessionId}` - Verificar status da sessão
- `POST /api/radar/upload-imagem/{sessionId}` - Upload de imagem da placa

### ✅ **9. DashboardController** (`/api/dashboard`)
**Tag:** `Dashboard` - Dashboard e Relatórios do Sistema MOTTU

**Endpoints:**
- `GET /api/dashboard/resumo` - Obter resumo de ocupação atual
- `GET /api/dashboard/ocupacao-por-dia` - Obter ocupação por período
- `GET /api/dashboard/total-veiculos` - Obter total de veículos cadastrados
- `GET /api/dashboard/total-clientes` - Obter total de clientes cadastrados

## 🔧 Configurações do Swagger

### **OpenAPI Configuration:**
- **Título:** Challenge-2025-FIAP-TEMMU-METAMIND SOLUTIONS
- **Versão:** 1.0
- **Descrição:** API RESTful para o Challenge Mottu - Rastreamento e organização dos veículos
- **Contato:** Metamind Solution (RM557568@fiap.com.br)

### **Servidores Configurados:**
- Servidor relativo (porta dinâmica)
- http://localhost:8080 (porta padrão)
- http://localhost:8081 (porta alternativa 1)
- http://localhost:8082 (porta alternativa 2)

### **Grupos de API:**
- **Grupo:** `mottu`
- **Pacotes:** `br.com.fiap.mottu`

## 📊 Recursos de Documentação

### ✅ **Documentação Completa:**
- **Operações:** Todas as operações CRUD documentadas
- **Parâmetros:** Parâmetros de query, path e body documentados
- **Respostas:** Códigos de status e schemas de resposta
- **Validações:** Campos obrigatórios e validações
- **Exemplos:** Exemplos de request/response

### ✅ **Recursos Avançados:**
- **Paginação:** Documentação completa de parâmetros de paginação
- **Filtros:** Filtros de busca documentados
- **Associações:** Endpoints de associação entre entidades
- **Hierarquias:** Endpoints hierárquicos (pátio → zona → box)
- **Upload de Arquivos:** Suporte a multipart/form-data
- **Datas:** Formato ISO de datas documentado

### ✅ **Logs e Monitoramento:**
- Logs informativos em todos os endpoints
- Rastreamento de operações
- Debug de associações e relacionamentos

## 🚀 Como Testar no Swagger

### **1. Acesse o Swagger UI:**
```
http://localhost:8080/swagger-ui/index.html
```

### **2. Selecione um Endpoint:**
- Clique em qualquer endpoint para expandir
- Veja a documentação completa
- Clique em "Try it out"

### **3. Preencha os Parâmetros:**
- Parâmetros obrigatórios são marcados com *
- Use os exemplos fornecidos
- Valide os formatos (datas, emails, etc.)

### **4. Execute a Requisição:**
- Clique em "Execute"
- Veja a resposta com código de status
- Analise o corpo da resposta

### **5. Teste Cenários:**
- **Criação:** Teste POST endpoints
- **Busca:** Teste GET endpoints
- **Atualização:** Teste PUT endpoints
- **Exclusão:** Teste DELETE endpoints
- **Filtros:** Teste parâmetros de busca
- **Paginação:** Teste parâmetros page/size/sort

## 🔍 Endpoints Especiais para Teste

### **Endpoints de Debug:**
```bash
# Verificar veículos estacionados
GET /api/veiculos/estacionados

# Debug de dados de pátio
GET /api/veiculos/debug-patio

# Teste simples
GET /api/veiculos/teste-patio
```

### **Endpoints de Dashboard:**
```bash
# Resumo geral
GET /api/dashboard/resumo

# Totais
GET /api/dashboard/total-veiculos
GET /api/dashboard/total-clientes

# Ocupação por período
GET /api/dashboard/ocupacao-por-dia?ini=2025-01-01&fim=2025-01-31
```

### **Endpoints de OCR:**
```bash
# Iniciar sessão
POST /api/radar/iniciar-sessao

# Upload de imagem
POST /api/radar/upload-imagem/{sessionId}
```

## 📝 Notas Importantes

### **Portas Dinâmicas:**
- O Swagger funciona com qualquer porta (8080, 8081, 8082, etc.)
- URLs são configuradas automaticamente
- CORS está configurado para aceitar todas as portas

### **Autenticação:**
- Atualmente não há autenticação configurada
- Todos os endpoints são públicos para desenvolvimento

### **Validação:**
- Validação Bean Validation ativa
- Campos obrigatórios são validados
- Formatos de dados são verificados

### **Logs:**
- Todos os endpoints geram logs informativos
- Logs incluem parâmetros e resultados
- Nível de log: INFO para operações normais

---

**🎉 Todos os endpoints estão completamente documentados e prontos para uso via Swagger UI!**

