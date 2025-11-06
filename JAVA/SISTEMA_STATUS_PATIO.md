# 🏢 Sistema de Status de Pátios

## 📊 Visão Geral

O sistema permite **ativar** ou **desativar** pátios sem precisar deletá-los do banco de dados. Isso é essencial para gestão de pátios temporariamente inativos ou em manutenção.

---

## 🎯 Valores do Campo `status`

### Banco de Dados (Oracle)
```sql
STATUS CHAR(1) NOT NULL
```

### Valores Válidos
| Valor | Significado | Descrição |
|-------|-------------|-----------|
| **'A'** | **Ativo** | Pátio está operacional e disponível |
| **'I'** | **Inativo** | Pátio está desativado (não deletado) |

---

## ✨ Funcionalidades Implementadas

### 1. **Visualização de Status** 

#### 📱 Cards (Grid View)
- ✅ **Badge destacado** no canto superior direito
  - **ATIVO**: Badge verde (`✓ ATIVO`)
  - **INATIVO**: Badge vermelho piscante (`✕ INATIVO`)
- ✅ **Indicador visual diferenciado**
  - Pátios inativos: Opacidade reduzida (75%) + borda vermelha
  - Pátios ativos: Aparência normal

#### 📊 Tabela (Table View)
- ✅ **Badge de status** na coluna "Status"
  - **ATIVO**: Badge verde (`✓ ATIVO`)
  - **INATIVO**: Badge vermelho (`✕ INATIVO`)
- ✅ **Linha destacada**
  - Pátios inativos: Fundo vermelho claro (`bg-red-50`)
  - Pátios ativos: Fundo branco normal

---

### 2. **Filtro de Exibição** 🔍

#### Toggle "Exibir pátios inativos"
```tsx
<input type="checkbox" checked={mostrarInativos} onChange={...} />
```

**Comportamento:**
- ✅ **Ativado (padrão)**: Mostra pátios ativos E inativos
- ✅ **Desativado**: Mostra APENAS pátios ativos

**Localização:**
- Abaixo da barra de busca
- Ícone de olho (`ion-ios-eye`)
- Toggle azul moderno

---

### 3. **Contador de Pátios** 📈

Exibe estatísticas em tempo real:

```
🟢 X Ativos | 🔴 Y Inativos | 🔵 Z Exibidos
```

**Lógica:**
- **Ativos**: `patios.filter(p => p.status === 'A').length`
- **Inativos**: `patios.filter(p => p.status === 'I').length`
- **Exibidos**: Resultado após aplicar busca + filtro de status

---

## 🔧 Implementação Técnica

### Frontend (TypeScript/React)

#### Estado do Filtro
```typescript
const [mostrarInativos, setMostrarInativos] = useState(true);
```

#### Lógica de Filtro
```typescript
const getFilteredData = () => {
  return patios.filter((patio: PatioResponseDto) => {
    const passesSearch = [patio.nomePatio, patio.endereco?.cidade]
      .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const passesStatus = mostrarInativos || patio.status === 'A';
    
    return passesSearch && passesStatus;
  });
};
```

#### Badge de Status (Cards)
```tsx
<span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
  patio.status === 'A' 
    ? 'bg-green-500 text-white' 
    : 'bg-red-500 text-white animate-pulse'
}`}>
  {patio.status === 'A' ? '✓ ATIVO' : '✕ INATIVO'}
</span>
```

#### Card com Indicador Visual
```tsx
<div className={`neumorphic-card-gradient ... ${
  patio.status === 'I' ? 'opacity-75 border-2 border-red-300' : ''
}`}>
```

#### Linha da Tabela com Destaque
```tsx
<tr className={`hover:bg-slate-50 ${patio.status === 'I' ? 'bg-red-50' : ''}`}>
```

---

### Backend (Java/Spring Boot)

#### Modelo de Dados
```java
@Entity
@Table(name = "TB_PATIO")
public class Patio {
    @Column(name = "STATUS", nullable = false, length = 1)
    private String status; // 'A' ou 'I'
    
    // ... outros campos
}
```

#### Validação em Endpoints Hierárquicos
```java
private Patio findAndValidatePatio(Long patioId, String patioStatus) {
    Patio patio = buscarPatioPorId(patioId);
    if (!patio.getStatus().equals(patioStatus)) {
        throw new ResourceNotFoundException(
            "Pátio com ID " + patioId + " não foi encontrado com o status " + patioStatus
        );
    }
    return patio;
}
```

---

## 🎨 Design System

### Cores do Status

| Status | Cor Primária | Classe Tailwind | Uso |
|--------|--------------|-----------------|-----|
| **Ativo** | Verde | `bg-green-500` | Badge, ícones |
| **Inativo** | Vermelho | `bg-red-500` | Badge, ícones, bordas |

### Animações

| Elemento | Animação | Quando |
|----------|----------|--------|
| Badge Inativo | `animate-pulse` | Sempre que pátio está inativo |
| Card Inativo | `opacity-75` | Visual diferenciado |
| Linha Tabela Inativa | `bg-red-50` | Destaque sutil |

---

## 📍 Arquivos Modificados

### Frontend
- `mottu-web/src/app/box/alterar/page.tsx`
  - Adicionado estado `mostrarInativos`
  - Implementado filtro de status
  - Badges de status nos cards e tabela
  - Contador de pátios
  - Toggle de visualização

### Backend (Análise)
- `mottu-gradle/src/main/java/br/com/fiap/mottu/model/Patio.java`
  - Campo `status CHAR(1) NOT NULL`
- `mottu-gradle/src/main/java/br/com/fiap/mottu/service/PatioService.java`
  - Método `findAndValidatePatio` valida status

---

## 🚀 Casos de Uso

### 1. **Pátio em Manutenção**
**Cenário:** Pátio "Mottu São Paulo" precisa de reforma.

**Ação:**
1. Administrador altera `status` de `'A'` para `'I'`
2. Pátio não é deletado, mas fica visualmente identificado como inativo
3. Pode ser reativado quando a manutenção terminar

### 2. **Pátio Temporariamente Fechado**
**Cenário:** Pátio "Mottu Rio" fechado por questões contratuais.

**Ação:**
1. `status = 'I'` mantém histórico e dados
2. Usuários veem claramente que está inativo
3. Quando contrato renovar, basta alterar para `'A'`

### 3. **Gestão de Pátios Sazonais**
**Cenário:** Pátios que operam apenas em alta temporada.

**Ação:**
1. Baixa temporada: `status = 'I'`
2. Alta temporada: `status = 'A'`
3. Dados preservados entre temporadas

---

## 🔮 Melhorias Futuras (Sugestões)

### 1. **Regras de Negócio Baseadas em Status** 
```java
// Impedir criação de boxes em pátios inativos
if (!"A".equals(patio.getStatus())) {
    throw new OperationNotAllowedException(
        "Não é possível criar boxes em um pátio inativo."
    );
}
```

### 2. **Alertas Visuais**
- Modal de aviso ao tentar editar pátio inativo
- Toast notification quando pátio é desativado

### 3. **Histórico de Mudanças de Status**
```sql
CREATE TABLE TB_HISTORICO_STATUS_PATIO (
    ID_HISTORICO NUMBER PRIMARY KEY,
    ID_PATIO NUMBER NOT NULL,
    STATUS_ANTERIOR CHAR(1),
    STATUS_NOVO CHAR(1),
    DATA_MUDANCA TIMESTAMP,
    USUARIO VARCHAR2(100),
    MOTIVO VARCHAR2(500)
);
```

### 4. **Filtros Avançados**
- Filtrar por data de inativação
- Mostrar apenas pátios recém-desativados
- Agrupar por status

### 5. **Dashboard de Status**
```
📊 Painel de Status dos Pátios
┌─────────────────────────────┐
│ 🟢 Ativos: 15 (75%)         │
│ 🔴 Inativos: 5 (25%)        │
│ 📈 Tendência: +2 esta semana │
└─────────────────────────────┘
```

---

## ✅ Checklist de Implementação

- [x] Campo `status` no modelo `Patio`
- [x] Validação de status nos endpoints
- [x] Visualização de status nos cards
- [x] Visualização de status na tabela
- [x] Filtro para mostrar/ocultar inativos
- [x] Contador de pátios por status
- [x] Badges visuais diferenciados
- [x] Animações para pátios inativos
- [x] Documentação completa
- [ ] Regras de negócio (criação de boxes, estacionamento)
- [ ] Testes unitários para filtros
- [ ] Testes de integração para validação de status
- [ ] Histórico de mudanças de status
- [ ] Dashboard de métricas

---

## 📚 Referências

- **Modelo de Dados**: `mottu-gradle/src/main/java/br/com/fiap/mottu/model/Patio.java`
- **Serviço de Pátios**: `mottu-gradle/src/main/java/br/com/fiap/mottu/service/PatioService.java`
- **Página de Seleção**: `mottu-web/src/app/box/alterar/page.tsx`
- **Análise Completa**: `ANALISE_STATUS_PATIO.md`

---

**Data de Implementação:** 06/11/2025  
**Versão:** 1.0  
**Status:** ✅ Implementado e Documentado






