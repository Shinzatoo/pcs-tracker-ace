# PCS Maritime - Port Control System

Um sistema moderno de controle portuário integrado ao n8n para monitoramento em tempo real de operações marítimas.

## 🚢 Funcionalidades

### ✨ Dashboard Principal
- **KPIs em tempo real**: Total de embarques, alertas ativos, status OK e fontes integradas
- **Distribuição por status**: Visualização clara dos diferentes status dos navios
- **Alertas recentes**: Intercorrências que requerem atenção imediata
- **Ações rápidas**: Acesso direto às funcionalidades principais

### 📋 Lista de Embarques
- **Filtros avançados**: Por status, origem e busca livre
- **Tabela dinâmica**: Ordenação, paginação e seleção de colunas
- **Exportação CSV**: Dados filtrados para análise externa
- **Status em tempo real**: Badges visuais com indicadores animados

### 🔍 Detalhes do Embarque
- **Visão completa**: Informações de agência, autoridade, praticagem e terminal
- **Timeline interativa**: Cronologia de eventos e atualizações
- **Sistema de alertas**: Notificações específicas por navio
- **Metadados estruturados**: Todos os dados organizados em abas

### ⭐ Sistema de Favoritos
- **Marcação rápida**: Estrela para favoritar navios importantes
- **Lista dedicada**: Página exclusiva para embarques favoritos
- **Status offline**: Mantém dados mesmo quando navio sai do sistema
- **Persistência local**: Favoritos salvos no localStorage

## 🎨 Design System

### Paleta Marítima
- **Primária**: Azul oceano profundo (`#1D4ED8`)
- **Sucesso**: Verde marinho (`#16A34A`)  
- **Atenção**: Laranja navegação (`#F59E0B`)
- **Erro**: Vermelho alerta (`#DC2626`)
- **Neutro**: Cinza portuário (`#64748B`)

### Status Badges
- **OK/Ativo** → Verde (operações normais)
- **Pendente** → Amarelo (aguardando autorização)
- **Bloqueado** → Vermelho (documentação/acesso negado)
- **Conflito** → Laranja (divergência de horários)
- **Aguardando** → Cinza (terminal esperando navio)

## 🔌 API Integration

### Endpoint Principal
```
https://n8n.hackathon.souamigu.org.br/webhook/pcs/status
```

### Estrutura de Dados
O sistema processa dados de 4 fontes integradas:
- **Agência Marítima**: Documentação e manifestos
- **Autoridade Portuária**: Autorizações e acessos  
- **Praticagem**: Manobras e execução
- **Terminal Portuário**: Operações e atracação

### Auto-descoberta
- **Schema flexível**: Detecta automaticamente estrutura dos dados
- **Field mapping**: Mapeamento inteligente de campos similares
- **Tolerância a erros**: Graceful handling de campos ausentes
- **Normalização**: Unifica diferentes formatos de resposta

## 🚀 Como Usar

### 1. Configuração
```bash
# Clone o repositório
git clone [URL_DO_REPO]

# Instale dependências
npm install

# Inicie o desenvolvimento
npm run dev
```

### 2. Variáveis de Ambiente
```env
# Opcional: Proxy para contornar CORS
VITE_API_PROXY=https://seu-proxy.com/api

# Base URL da API (padrão já configurado)
VITE_API_BASE=https://n8n.hackathon.souamigu.org.br/webhook/pcs/status
```

### 3. Navegação
- **Dashboard** (`/`) - Visão geral e KPIs
- **Embarques** (`/pcs`) - Lista completa com filtros
- **Detalhes** (`/pcs/:id`) - Informações específicas do navio
- **Favoritos** (`/favorites`) - Navios marcados para acompanhamento

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** + design system customizado
- **shadcn/ui** para componentes base
- **Lucide React** para ícones

### Gerenciamento de Estado
- **TanStack Query** para cache e sincronização
- **React Hook Form** para formulários
- **Zod** para validação de dados

### Tabelas e Dados
- **TanStack Table** para tabelas complexas
- **Date-fns** para manipulação de datas
- **React Router** para navegação

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Header, navegação
│   └── ui/             # Componentes base (StatusBadge, KpiCard, DataTable)
├── hooks/              # Hooks customizados (usePcsData, useFavorites)
├── lib/                # API client e utilitários
├── pages/              # Páginas principais
│   ├── Dashboard.tsx   # KPIs e visão geral
│   ├── PcsList.tsx     # Lista com filtros
│   ├── PcsDetail.tsx   # Detalhes e timeline
│   └── Favorites.tsx   # Embarques favoritos
└── assets/             # Imagens e recursos
```

## 🔒 Segurança

- **CORS**: Configurado para requests cross-origin
- **Sanitização**: Dados renderizados de forma segura
- **Proxy support**: Variável para contornar limitações de CORS
- **Tokens**: Não há exposição de chaves no cliente

## 📊 Workflow n8n

O arquivo `docs/n8n-workflow.json` contém o workflow completo que:

1. **Coleta dados** de 4 APIs marítimas diferentes
2. **Normaliza e reconcilia** informações por `identificadorNavio`
3. **Gera alertas** baseados em regras de negócio
4. **Consolida status** para cada embarcação
5. **Expõe via webhook** no formato padronizado

### Regras de Alertas
- **Bloqueio documental**: Status documentação ≠ "completo"
- **Acesso negado/pendente**: Status autorização problemático
- **Conflito horários**: Divergência >15min entre autorização e execução
- **Terminal aguardando**: Sem atracação real + status "aguardando"

## 📞 Suporte

Para dúvidas sobre:
- **Frontend**: Verificar console do navegador e logs de rede
- **API**: Testar endpoint diretamente no n8n
- **Dados**: Validar workflow e mapeamento de campos

## 🏆 Créditos

Sistema desenvolvido para o **Hackathon Portuário 2025**, integrando tecnologias modernas de frontend com a robustez do n8n para automação de workflows marítimos.

---

**PCS Maritime** - Monitoramento inteligente para operações portuárias eficientes! ⚓️🚢
