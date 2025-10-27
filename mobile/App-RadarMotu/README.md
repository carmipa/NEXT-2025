## RadarMotu — Arquitetura, Tecnologias e Guia Completo

Este documento consolida a visão completa do ecossistema RadarMotu (App móvel + API), com diagrama de arquitetura, badges de tecnologia, ícones, índices de navegação e referências cruzadas. Compatível com renderização no GitHub usando Mermaid com `graph LR` e rótulos simples.

### Índice
- [1. Visão Geral 🔭](#visao-geral)
- [2. Arquitetura (Mermaid) 🧩](#arquitetura)
  - [2.1. Diagrama Geral do Sistema](#arq-diagrama-geral)
  - [2.2. Fluxo BLE → Estimativa → WS](#arq-fluxo-ble)
  - [2.3. Camadas Lógicas](#arq-camadas)
- [3. Stacks e Tecnologias (Shields + Ícones) 🧰](#stacks)
  - [3.1. Backend](#stacks)
  - [3.2. Mobile](#stacks)
- [4. Módulos do Projeto 🗂️](#modulos)
- [5. Modelagem de Dados e Persistência 🗃️](#dados)
- [6. Fluxos Principais End-to-End 🔄](#fluxos)
- [7. Segurança 🔐](#seguranca)
- [8. Desempenho e Escalabilidade 🚀](#desempenho)
- [9. Observabilidade e Operação 📈](#observabilidade)
- [10. Ambientes, Build e Deploy 🏗️](#deploy)
- [11. Plano de Testes e Qualidade ✅](#qualidade)
- [12. Roadmap Técnico 🗺️](#roadmap)
- [13. FAQ / Troubleshooting ❓](#faq)
- [14. Glossário 📙](#glossario)
- [15. Links Rápidos 🔗](#links)

---

<a id="visao-geral"></a>
### Visão Geral

O RadarMotu é composto por:
- **App Mobile (Expo React Native)**: OCR de placas, cadastro e listagem de veículos, mapa em tempo real, radar de proximidade via BLE, acionamento de buzzer/LED na TAG.
- **API (FastAPI/Python)**: CRUD de veículos, gestão de estacionamento, ingestão de leituras BLE, cálculo de posição (multilateração), emissão por WebSocket e publicação via MQTT.

---

<a id="arquitetura"></a>
### Arquitetura (Mermaid) 🧩

<a id="arq-diagrama-geral"></a>
#### 2.1. Diagrama Geral do Sistema

```mermaid
graph LR
  A[App Mobile] -->|HTTP| B[API]
  A <--> |WS| C[WebSocket]
  A -->|BLE Scan| D[TAG BLE]
  B --> E[SQLAlchemy]
  E --> F[(SQLite)]
  B --> G[MQTT Client]
  G <--> H[MQTT Broker]
  B --> I[Estimator]
```

Notas:
- Uso apenas de `graph LR` e rótulos simples para evitar tokens não suportados pelo renderizador do GitHub.
- Se houver problema de renderização, podemos simplificar substituindo agrupamentos por caixas simples (sem `subgraph`).

<a id="arq-fluxo-ble"></a>
#### 2.2. Fluxo BLE → Estimativa → WS

```mermaid
graph LR
  R1[Leituras RSSI] --> BUF[Buffer/Janela]
  BUF --> FILT[Suavizacao]
  FILT --> DIST[RSSI->Dist]
  DIST --> MULTI[Multilateracao]
  MULTI --> POS[Posicao XY]
  POS --> PUSH[Broadcast WS]
  PUSH --> APP[App Mobile]
```

<a id="arq-camadas"></a>
#### 2.3. Camadas Lógicas

```mermaid
graph LR
  CL[Cliente]
  API[API]
  SVC[Servicos]
  DAT[Dados]
  EXT[Broker]
  CL --> API
  API --> SVC
  SVC --> DAT
  SVC --> EXT
```

---

<a id="stacks"></a>
### Stacks e Tecnologias (Shields + Ícones) 🧰

Backend:

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.112-009688?logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-0.30-0f4c81)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.x-d71f00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-DB-003B57?logo=sqlite&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-00B2A9)
![MQTT](https://img.shields.io/badge/MQTT-paho--mqtt-660099)
![SciPy](https://img.shields.io/badge/SciPy-Optimize-8CAAE6?logo=scipy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-ef4036)

Mobile:

![Expo](https://img.shields.io/badge/Expo_SDK-51-000000?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.74-20232a?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.3-3178C6?logo=typescript&logoColor=white)
![Navigation](https://img.shields.io/badge/Navigation-React%20Navigation-1f2937?logo=react&logoColor=61DAFB)
![BLE](https://img.shields.io/badge/BLE-react--native--ble--plx-0A66C2?logo=bluetooth&logoColor=white)
![SVG](https://img.shields.io/badge/SVG-react--native--svg-0f766e)

---

<a id="modulos"></a>
### Módulos do Projeto 🗂️

- `radarmotu-api/`: API FastAPI, modelos, estimador, MQTT e WS.
- `radarmotu-app/`: App mobile Expo/React Native com telas e serviços.

Referências:
- App: `radarmotu-app/radarmotu-app/README.md`
- API: `radarmotu-api/radarmotu-api/README.md`

---

<a id="dados"></a>
### Modelagem de Dados e Persistência 🗃️

```mermaid
graph LR
  VEH[Vehicle]
  SPOT[ParkingSpot]
  SESS[ParkingSession]
  USER[User]
  VEH -->|plate| SESS
  SPOT -->|zone+number| SESS
  USER -->|admin| SESS
```

Notas:
- SQLite local na API; migração futura recomendada para Postgres.
- Índices sugeridos: `vehicles.plate`, `parking_spot(zone, number)`, `parking_session(plate, end_ts null)`.

---

<a id="fluxos"></a>
### Fluxos Principais End-to-End 🔄

- **Cadastro/Consulta de Veículo**: App → API (`/api/vehicles` CRUD) → SQLite.
- **Estacionar/Liberação**: App → API (`/api/parking/store|release`) → Atualiza sessão e vaga.
- **Localização**: Âncoras publicam leituras → API agrega e estima posição → push via WebSocket → App renderiza mapa/radar.
- **Alarme TAG**: App → API (`/api/tags/{id}/alarm`) → MQTT Broker → TAG.

---

<a id="seguranca"></a>
### Segurança 🔐

- Autenticação: JWT (password grant) com `python-jose` e `passlib[bcrypt]`.
- Autorização: proteger endpoints sensíveis com `Depends(oauth2_scheme)`.
- Segredos e chaves: mover `SECRET_KEY` e credenciais para variáveis de ambiente.
- CORS: restringir origens em produção; HTTPS atrás de proxy/reverse-proxy.
- Mobile: permissões BLE específicas por plataforma; cuidado com logs sensíveis no app.

---

<a id="desempenho"></a>
### Desempenho e Escalabilidade 🚀

- WS: consolidar broadcast em intervalos estáveis; limitar payload.
- BLE: suavização e amostragem adaptativa para reduzir ruído.
- API: usar pool do SQLAlchemy; considerar cache (Redis) para âncoras e sessões ativas.
- Estimador: limitar tentativas `least_squares`; fallback para centroid se <3 âncoras válidas.
- Escala: separar workers de agregação/estimativa; mover DB para Postgres; pub/sub com Redis.

---

<a id="observabilidade"></a>
### Observabilidade e Operação 📈

- Logs estruturados (JSON) com correlação de request-id.
- Métricas: contagem de mensagens WS, latência de estimativa, taxa de erro API.
- Healthchecks: `GET /health` ampliado com checks de DB, MQTT e fila WS.
- Tracing distribuído sugerido (OpenTelemetry) na API.

---

<a id="deploy"></a>
### Ambientes, Build e Deploy 🏗️

- Desenvolvimento local:
  - Backend: `cd radarmotu-api/radarmotu-api && pip install -r requirements.txt && uvicorn app.main:app --reload`.
  - Mobile: `cd radarmotu-app/radarmotu-app && npm install && npm run android`.
- Variáveis:
  - App: `config/env.ts` define `SERVER_HOST`, `RADAR_API_BASE`, `WS_URL`.
- Deploy sugerido:
  - API: container com Uvicorn/Gunicorn; volume para DB (ou Postgres gerenciado).
  - App: EAS Build para Android/iOS; configuração de `usesCleartextTraffic` apenas em dev.

---

<a id="qualidade"></a>
### Plano de Testes e Qualidade ✅

- API: testes de unidade para `estimator`, routers e segurança; testes de integração com DB.
- Mobile: testes de navegação e componentes; mocks para serviços e BLE.
- Linters e tipagem: Pydantic v2, mypy opcional; TypeScript estrito.

---

<a id="roadmap"></a>
### Roadmap Técnico 🗺️

- Migrar DB para Postgres e adicionar Redis para buffers/pub-sub.
- Implementar reconexão robusta de MQTT e WS backoff exponencial.
- Melhorar calibração BLE e mapeamento de ambiente (âncoras dinâmicas).
- Instrumentar métricas e tracing end-to-end.

---

<a id="faq"></a>
### FAQ / Troubleshooting ❓

- WS não conecta: verifique IP em `config/env.ts` e firewall/porta 8000.
- BLE sem leituras: checar permissões e hardware; Android 12+ exige `BLUETOOTH_SCAN/CONNECT`.
- OCR de placa falha: garantir permissões de câmera/galeria e tamanho da imagem.

---

<a id="glossario"></a>
### Glossário 📙

- Âncora: ponto fixo no pátio com posição conhecida.
- TAG: dispositivo BLE anexado ao veículo.
- Multilateração: técnica para estimar posição a partir de distâncias.

---

<a id="links"></a>
### Links Rápidos 🔗

- Backend: `cd radarmotu-api/radarmotu-api && pip install -r requirements.txt && uvicorn app.main:app --reload`.
- Mobile: `cd radarmotu-app/radarmotu-app && npm install && npm run android`.
- Configure o host da API em `radarmotu-app/radarmotu-app/config/env.ts`.

---

### Estratégias de Qualidade e Observabilidade

- Validação Pydantic v2 e tipagem TS.
- Tratamento de erros e timeouts em `services/api.ts`.
- Sugestões: logs estruturados, métricas e tracing; restrição de CORS e secreto via env.

---

### Links Rápidos

- App (README): `radarmotu-app/radarmotu-app/README.md`
- API (README): `radarmotu-api/radarmotu-api/README.md`


