# Teste Prático - Lógica Soluções Integradas

Aplicativo completo para gerenciamento de usuários desenvolvido em Next.js, TypeScript e TailwindCSS, com backend Node.js usando Docker, seguindo princípios SOLID e Clean Code.

## 🧭 Sumário

- [Descrição](#-descrição)
- [Verificação de Requisitos - Todos Implementados](#-verificação-de-requisitos---todos-implementados)
- [Requisitos Extras Implementados](#-requisitos-extras-implementados-além-do-solicitado)
- [Conclusão](#-conclusão)
- [Tecnologias](#️-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Execução](#execução)
  - [Acessar a aplicação](#acessar-a-aplicação)
- [API Endpoints](#-api-endpoints)
- [Arquitetura](#️-arquitetura)
- [Esquema do Banco de Dados (SQLite)](#️-esquema-do-banco-de-dados-sqlite)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
  - [Preservação de Integridade do CSV](#preservação-de-integridade-do-csv)
  - [Persistência Dual (SQLite + CSV)](#persistência-dual-sqlite--csv)
  - [Pesquisa Multi-campo](#pesquisa-multi-campo)
  - [Design Responsivo e Mobile-First](#design-responsivo-e-mobile-first)
  - [Resiliência e Fallback da API Externa](#resiliência-e-fallback-da-api-externa)
- [Documentação Adicional](#-documentação-adicional)
- [Como Contribuir](#-como-contribuir)
- [Próximos Passos (Roadmap)](#-próximos-passos-roadmap)
- [Tecnologias e Dependências](#-tecnologias-e-dependências)
- [Licença](#-licença)
- [Deploy e Hospedagem](#-deploy-e-hospedagem)
- [Desenvolvimento](#-desenvolvimento)

## 📋 Descrição

Aplicativo desenvolvido para atender todas as especificações do teste prático, incluindo consumo da Random User API (`randomuser.me`), manipulação de arquivos CSV com preservação de integridade, e interface moderna para gerenciamento de usuários.

## ✅ Verificação de Requisitos - Todos Implementados

### 1. ✅ Exibição de Página com Listagem de Usuários da API

- Frontend: Aba "API Externa" com cards por usuário
- Backend: Endpoint `GET /api/users/api?size=10` consome `https://randomuser.me/api/?results=<size>`
- Dados no schema Random User: `name.first`, `name.last`, `email`, `location`, `picture`, `login.username`, etc.

### 2. ✅ Gravação de Dados em Arquivo CSV

- Botão "Salvar Selecionados" na UI
- Backend: `POST /api/users/save` recebe array de usuários e grava no CSV/SQLite

### 3. ✅ Edição e Exclusão de Registros

- Aba "Usuários Salvos" com cards idênticos aos da aba "API Externa"
- Modal de edição com a mesma ordem e seções do modal de visualização (apenas inputs)
- Endpoints: `PUT /api/users/:id`, `DELETE /api/users/:id`

### 4. ✅ Tela de Consumo da API Disponível no Menu

- Abas: "API Externa", "Usuários Salvos", "Pesquisar"
- Buscar por quantidade simples e filtros suportados pela Random User API (gender/nat)

### 5. ✅ Preservação de Integridade do CSV

- Arquivo inteiro é reescrito após edição/exclusão

### 6. ✅ Pesquisa com Base em Múltiplos Campos

- Busca em `name.first`, `name.last`, `email` (dot-notation)
- Implementada no backend filtrando em memória para compatibilidade entre fontes

## 📚 API Endpoints

- `GET /api/users/api?size=10` → Busca na Random User API
- `POST /api/users/save` → Salva em SQLite e CSV
- `GET /api/users` → Lista todos usuários salvos
- `GET /api/users/search?q=termo&fields=name.first,name.last,email` → Busca (dot-notation)
- `GET /api/users/:id` → Busca por ID
- `PUT /api/users/:id` → Atualiza
- `DELETE /api/users/:id` → Remove

Campos sensíveis de `login` (password/salt/hashes) não são enviados ao frontend.

## 🔍 Pesquisa Multi-campo

- Suportada em `name.first`, `name.last`, `email`
- Backend aplica filtro em memória usando notação de ponto (compatível com dados CSV/SQLite e objetos)

## 🗄️ Observações de Dados

- `id` (número) é o identificador do registro salvo no backend
- `id_info` contém o documento informativo (ex.: SSN) vindo da Random User API

As demais seções permanecem válidas. Consulte `docs/API.md` e `docs/ARQUITETURA.md` para detalhes alinhados ao novo schema.

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **CSV Parser/Writer** - Manipulação de arquivos CSV
- **Docker** - Containerização

### Ferramentas
- **ESLint** - Linter de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Adição de prefixos CSS
- **Docker Compose** - Orquestração de containers

## 📁 Estrutura do Projeto

```
teste-pratico_logica-solucoes-integradas/
├── app/                          # Frontend Next.js
│   ├── components/               # Componentes React
│   │   ├── Navigation.tsx        # Menu de navegação
│   │   ├── UserList.tsx          # Lista de usuários
│   │   ├── UserForm.tsx          # Formulário de edição
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globais
├── backend/                      # Backend Node.js
│   ├── src/
│   │   ├── controllers/          # Controllers (SOLID)
│   │   │   └── UserController.ts
│   │   ├── services/             # Services (SOLID)
│   │   │   ├── ApiService.ts     # Serviço API externa
│   │   │   ├── DatabaseService.ts # Serviço SQLite
│   │   │   ├── CsvService.ts     # Serviço CSV
│   │   │   └── SyncService.ts    # Sincronização DB + CSV
│   │   ├── models/               # Models
│   │   │   └── User.ts           # Modelo de usuário
│   │   ├── routes/               # Rotas Express
│   │   │   └── UserRoutes.ts
│   │   └── server.ts             # Servidor principal
│   ├── Dockerfile                # Configuração Docker
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Documentação
│   ├── API.md                    # Documentação da API
│   ├── ARQUITETURA.md            # Arquitetura do sistema
│   ├── BRANCHES.md               # Guia de branches
│   ├── CONTRIBUTING.md           # Guia de contribuição
│   └── FEATURES.md               # Detalhamento de funcionalidades
├── docker-compose.yml            # Orquestração Docker
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md                     # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados (opcional)
- npm ou yarn

### Instalação

1. **Instalar dependências do frontend:**
   ```bash
   npm install
   ```

2. **Instalar dependências do backend:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configurar variáveis de ambiente (opcional):**
   ```bash
   # Frontend - copiar e editar se necessário
   cp .env.example .env
   
   # Backend - copiar e editar se necessário
   cp backend/.env.example backend/.env
   ```
   
   > **Nota**: A detecção automática de porta funciona sem necessidade de configuração. Os arquivos `.env` são opcionais. A aplicação usa apenas arquivos `.env` (não `.env.local`).

### Execução

#### Opção 1: Com Docker (Recomendado)

```bash
# Iniciar o backend em Docker
docker-compose up --build

# Em outro terminal, iniciar o frontend
npm run dev
```

#### Opção 2: Sem Docker (Desenvolvimento)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Acessar a aplicação

- **Frontend**: http://localhost:3000 (ou próxima porta disponível)
- **Backend API**: http://localhost:3001 (ou próxima porta disponível se 3001 estiver ocupada)
- **Health Check**: http://localhost:3001/health (ou porta alternativa)

   > **Nota**: Se a porta padrão do backend (3001) estiver ocupada, o servidor tentará automaticamente portas subsequentes (3002, 3003, etc.). O frontend detecta automaticamente a porta correta do backend. Se precisar configurar manualmente, edite o arquivo `.env` (frontend ou backend).

## 📚 API Endpoints

> **Nota**: Todos os endpoints (exceto `/api/users/api`) são protegidos e requerem um token de autenticação (`Authorization: Bearer <token>`) e o ID do usuário (`x-owner-id: <id>`) nos cabeçalhos.

### GET `/api/users/api?size=10`
Busca usuários da API externa `randomuser.me`.

**Query Parameters:**
- `size` (opcional): Quantidade de usuários (padrão: 10)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "name": { "first": "Jennie", "last": "Nichols" },
      "email": "jennie.nichols@example.com",
      "..."
    }
  ],
  "count": 10
}
```

### POST `/api/users/save`
Salva usuários no arquivo CSV.

**Body:**
```json
{
  "users": [...]
}
```

### GET `/api/users`
Lista todos os usuários salvos no CSV.

### GET `/api/users/search?q=termo&fields=first_name,last_name,email`
Busca usuários por critérios.

**Query Parameters:**
- `q` (obrigatório): Termo de busca
- `fields` (opcional): Campos para busca (padrão: first_name,last_name,email)

### GET `/api/users/:id`
Busca um usuário específico por ID.

### PUT `/api/users/:id`
Atualiza um usuário.

**Body:**
```json
{
  "first_name": "Nome",
  "last_name": "Sobrenome",
  ...
}
```

### DELETE `/api/users/:id`
Remove um usuário.

> 📖 **Documentação completa da API**: Consulte [docs/API.md](./docs/API.md) para mais detalhes e exemplos.

## 🏗️ Arquitetura

O projeto segue os princípios SOLID e Clean Code:

### Single Responsibility Principle (SRP)
- `ApiService`: Responsável apenas por comunicação com API externa
- `DatabaseService`: Responsável apenas por operações com SQLite
- `CsvService`: Responsável apenas por manipulação de CSV
- `SyncService`: Responsável apenas por sincronização entre DB e CSV
- `UserController`: Responsável apenas por lidar com requisições HTTP

### Open/Closed Principle (OCP)
- Classes podem ser estendidas sem modificação
- Uso de interfaces e abstrações

### Liskov Substitution Principle (LSP)
- Interfaces bem definidas permitem substituição de implementações

### Interface Segregation Principle (ISP)
- Interfaces específicas e focadas

### Dependency Inversion Principle (DIP)
- Dependências injetadas via construtor
- Dependência de abstrações, não de implementações concretas

> 📖 **Detalhes da arquitetura**: Consulte [docs/ARQUITETURA.md](./docs/ARQUITETURA.md)

## 🗄️ Esquema do Banco de Dados (SQLite)

O backend utiliza SQLite como fonte primária de dados para usuários salvos, com um modelo relacional normalizado e chaves estrangeiras. Abaixo está um resumo das tabelas, colunas e relacionamentos.

### Visão Geral e Relacionamentos

- **users** (tabela principal)
  - Relacionamentos 1:1 com: `employment`, `address`, `credit_card`, `subscription`
  - Exclusão em cascata: ao remover um registro em `users`, os registros relacionados são removidos automaticamente

### Tabelas e Colunas

- **users**
  - `id` INTEGER PK AUTOINCREMENT
  - `uid` TEXT NOT NULL
  - `first_name` TEXT NOT NULL
  - `last_name` TEXT NOT NULL
  - `username` TEXT NOT NULL
  - `email` TEXT NOT NULL
  - `avatar` TEXT
  - `gender` TEXT
  - `phone_number` TEXT
  - `social_insurance_number` TEXT
  - `date_of_birth` TEXT
  - `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
  - `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
  - Índices: `idx_users_email`, `idx_users_first_name`, `idx_users_last_name`

- **employment** (1:1 com `users`)
  - `id` INTEGER PK AUTOINCREMENT
  - `user_id` INTEGER NOT NULL FK → `users(id)` ON DELETE CASCADE
  - `title` TEXT
  - `key_skill` TEXT

- **address** (1:1 com `users`)
  - `id` INTEGER PK AUTOINCREMENT
  - `user_id` INTEGER NOT NULL FK → `users(id)` ON DELETE CASCADE
  - `city` TEXT
  - `street_name` TEXT
  - `street_address` TEXT
  - `zip_code` TEXT
  - `state` TEXT
  - `country` TEXT
  - `lng` REAL
  - `lat` REAL

- **credit_card** (1:1 com `users`)
  - `id` INTEGER PK AUTOINCREMENT
  - `user_id` INTEGER NOT NULL UNIQUE FK → `users(id)` ON DELETE CASCADE
  - `cc_number` TEXT

- **subscription** (1:1 com `users`)
  - `id` INTEGER PK AUTOINCREMENT
  - `user_id` INTEGER NOT NULL UNIQUE FK → `users(id)` ON DELETE CASCADE
  - `plan` TEXT
  - `status` TEXT
  - `payment_method` TEXT
  - `term` TEXT

### Tabela de Autenticação

A autenticação utiliza uma tabela separada, independente das tabelas de domínio de usuários salvos:

- **auth_users**
  - `id` INTEGER PK AUTOINCREMENT
  - `email` TEXT NOT NULL UNIQUE
  - `password` TEXT NOT NULL (hash Bcrypt)
  - `name` TEXT NOT NULL
  - `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
  - `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
  - Índice: `idx_auth_users_email`

Notas:
- A tabela `auth_users` é usada por recursos de login/registro e não se relaciona com a tabela `users` de dados externos/CSV.
- As operações CRUD de usuários (salvos a partir da API/CSV) atuam sobre `users` e suas tabelas 1:1 relacionadas.

## 🔍 Funcionalidades Detalhadas

### Preservação de Integridade do CSV

O arquivo CSV é sempre reescrito completamente após edições/exclusões:
- Lê arquivo completo em memória
- Realiza operação no array
- Reescreve arquivo mantendo ordem original
- Garante integridade mesmo com 1.000+ linhas

**Exemplo:** Se houver 1.000 linhas e o usuário editar a linha 50, o processo:
1. Lê todas as 1.000 linhas
2. Atualiza linha 50 no array
3. Reescreve arquivo completo
4. Linhas 1-49 e 51-1000 permanecem intactas

### Persistência Dual (SQLite + CSV)

A aplicação utiliza uma estratégia de persistência dual para garantir redundância e flexibilidade:

- **SQLite (Banco de Dados Relacional)**: 
  - Banco de dados principal para operações rápidas e consultas complexas
  - Armazena dados relacionados em tabelas normalizadas (users, employment, address, credit_card, subscription)
  - Suporta transações ACID para garantir integridade
  - Priorizado para leitura e busca de dados

- **CSV (Arquivo de Texto)**:
  - Backup e portabilidade de dados
  - Compatibilidade com ferramentas externas (Excel, Google Sheets, etc.)
  - Facilita exportação e importação de dados
  - Mantém formato legível e auditável

- **Sincronização Automática**:
  - O `SyncService` garante que todas as operações CRUD sejam executadas em ambos os sistemas
  - Na inicialização, sincroniza dados entre SQLite e CSV se houver discrepâncias
  - SQLite é a fonte primária de dados (source of truth)
  - CSV é sincronizado automaticamente após cada operação

**Vantagens Operacionais:**
- ✅ Redundância de dados
- ✅ Migração e backup simplificados via CSV
- ✅ Performance otimizada com SQLite para consultas
- ✅ Compatibilidade com sistemas externos via CSV
- ✅ Integridade garantida através de sincronização automática

### Pesquisa Multi-campo

- Busca em tempo real com debounce
- Suporte a múltiplos campos simultaneamente
- Busca case-insensitive
- Busca parcial (contains)
- Prioriza busca no SQLite com fallback para CSV

### Design Responsivo e Mobile-First

A aplicação foi desenvolvida com foco em responsividade e experiência otimizada para dispositivos móveis, seguindo as melhores práticas de UI/UX mobile:

- **Layout Adaptativo**: Interface que se adapta automaticamente a diferentes tamanhos de tela (mobile, tablet, desktop)
- **Touch-Friendly**: Todos os botões e elementos interativos seguem o padrão de 44x44px mínimo para facilitar o toque
- **Navegação Mobile**: Tabs horizontais com scroll suave e labels otimizadas para telas pequenas
- **Cards Responsivos**: Grid que se adapta automaticamente (1 coluna em mobile, 2-3 em tablets/desktop)
- **Modais Mobile**: Modais que ocupam quase toda a tela em dispositivos móveis para melhor visualização
- **Inputs Otimizados**: Campos de formulário com tamanho adequado para mobile e prevenção de zoom indesejado
- **Header Compacto**: Navegação superior otimizada com título abreviado e botões de ação adaptados para mobile
- **Feedback Tátil**: Uso de `touch-manipulation` CSS e estados `active` para melhor feedback visual em interações touch

**Breakpoints principais:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md/lg)
- Desktop: > 1024px (lg+)

A aplicação oferece uma experiência consistente e fluida em qualquer dispositivo, priorizando usabilidade e acessibilidade em telas pequenas.

### Resiliência e Fallback da API Externa

A aplicação implementa uma estratégia robusta de fallback para garantir que continue funcionando mesmo quando a API externa (`random-data-api.com`) está indisponível:

**Problema comum:** Falhas de conexão, problemas de DNS (`EAI_AGAIN`, `ENOTFOUND`), ou indisponibilidade temporária da API externa podem impedir o funcionamento da aplicação.

**Solução implementada:**

1. **Retry Logic com Backoff Exponencial:**
   - O sistema tenta conectar à API externa 3 vezes automaticamente
   - Intervalos crescentes entre tentativas (1s, 2s, 4s)
   - Evita sobrecarga e aumenta chances de sucesso em falhas temporárias

2. **Fallback Automático com Dados Mock:**
   - Quando todas as tentativas falham, o sistema gera automaticamente dados mock de usuários
   - Os dados mock seguem a mesma estrutura da API real
   - A aplicação continua funcionando normalmente, permitindo que o usuário:
     - Visualize usuários gerados localmente
     - Salve, edite e delete esses usuários no CSV
     - Utilize todas as funcionalidades da aplicação

3. **Configuração de DNS Alternativo:**
   - Suporte para servidores DNS alternativos via variável de ambiente `DNS_SERVERS`
   - Útil quando o DNS local tem problemas
   - Exemplo: `DNS_SERVERS=8.8.8.8,8.8.4.4` (Google DNS)

**Vantagens:**
- ✅ Aplicação nunca fica completamente indisponível
- ✅ Experiência do usuário preservada mesmo com problemas externos
- ✅ Permite desenvolvimento e testes mesmo sem conexão com a API externa
- ✅ Logs detalhados para diagnóstico quando ocorrem falhas

**Observação:** Quando o fallback é ativado, você verá no console do backend uma mensagem: `⚠️ API externa indisponível. Usando dados mock como fallback.`

## 📝 Documentação Adicional

- [**Arquitetura do Sistema**](./docs/ARQUITETURA.md) - Detalhes da arquitetura SOLID
- [**Documentação da API**](./docs/API.md) - Endpoints completos com exemplos
- [**Guia de Contribuição**](./docs/CONTRIBUTING.md) - Como contribuir para o projeto
- [**Detalhamento de Funcionalidades**](./docs/FEATURES.md) - Todas as funcionalidades explicadas
- [**Guia de Branches**](./docs/BRANCHES.md) - Workflow de desenvolvimento
- [**Guia de Instalação**](./INSTALACAO.md) - Instalação passo a passo

## 🤝 Como Contribuir

1. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
2. Faça commit das alterações seguindo o padrão: `git commit -m 'feature: descrição'`
3. Faça push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

> 📖 **Guia completo**: Consulte [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 🎯 Próximos Passos (Roadmap)

- [ ] Adicionar testes unitários e de integração
- [ ] Implementar autenticação/autorização
- [ ] Adicionar validação mais rigorosa
- [ ] Implementar logging estruturado
- [ ] Adicionar monitoramento e métricas
- [ ] Configurar CI/CD
- [ ] Otimizar performance para grandes volumes

## 📦 Tecnologias e Dependências

### Frontend
- Next.js 14.0.4
- React 18.2.0
- TypeScript 5.3.3
- TailwindCSS 3.3.6
- Axios 1.6.2

### Backend
- Node.js 20+
- Express 4.18.2
- TypeScript 5.3.3
- CSV Parser 3.0.0
- CSV Writer 1.6.0
- Axios 1.6.2

## 📄 Licença

Este projeto foi desenvolvido como teste prático para Lógica Soluções Integradas.

## 🚀 Deploy e Hospedagem

### **Frontend - Vercel**
- **URL**: [https://teste-pratico-logica-solucoes-integ.vercel.app/](https://teste-pratico-logica-solucoes-integ.vercel.app/)
- **Plataforma**: Vercel (gratuito)
- **Deploy**: Automático via GitHub
- **Configuração**: Otimizada com `.vercelignore` e `vercel.json`
- **Build**: Next.js 14 com TypeScript
- **Status**: ✅ Deploy funcionando

### **Backend - Render**
- **URL**: [https://backend-logica-solucoes.onrender.com/health](https://backend-logica-solucoes.onrender.com/health)
- **Plataforma**: Render (gratuito)
- **Deploy**: Automático via GitHub
- **Configuração**: `render.yaml` e `tsconfig.json` otimizados
- **Runtime**: Node.js 18+ com TypeScript
- **Banco**: SQLite + CSV para persistência
- **Status**: ✅ Deploy funcionando

### **Configurações de Deploy**

#### **Frontend (Vercel)**
```bash
# Build Command
npm run build

# Output Directory
.next

# Environment Variables (OBRIGATÓRIAS)
NEXT_PUBLIC_BACKEND_URL=https://backend-logica-solucoes.onrender.com

# Environment Variables (OPCIONAIS para desenvolvimento)
NEXT_PUBLIC_BACKEND_HOST=localhost
NEXT_PUBLIC_BACKEND_PORT=3001
NEXT_PUBLIC_BACKEND_PROTOCOL=http
NEXT_PUBLIC_BACKEND_TIMEOUT=5000
```

#### **Backend (Render)**
```bash
# Build Command
npm install && npm run build

# Start Command
npm start

# Root Directory
backend/

# Environment Variables
NODE_ENV=production
PORT=10000
DB_PATH=./data/user_manager.db
CORS_ORIGIN=*
```

### **Arquivos de Configuração**

- **`.vercelignore`** - Exclui backend/ e arquivos desnecessários do deploy frontend
- **`vercel.json`** - Configurações específicas do Vercel
- **`backend/render.yaml`** - Configurações específicas do Render
- **`backend/tsconfig.json`** - Configurações TypeScript otimizadas para deploy

### **Variáveis de Ambiente**

#### **Produção (Obrigatória)**
- **`NEXT_PUBLIC_BACKEND_URL`** - URL completa do backend em produção
  - Exemplo: `https://backend-logica-solucoes.onrender.com`
  - **Importante**: Deve incluir o protocolo (https://) e não terminar com barra

#### **Desenvolvimento (Opcionais)**
- **`NEXT_PUBLIC_BACKEND_HOST`** - Host do backend local (padrão: localhost)
- **`NEXT_PUBLIC_BACKEND_PORT`** - Porta do backend local (padrão: 3001)
- **`NEXT_PUBLIC_BACKEND_PROTOCOL`** - Protocolo (padrão: http)
- **`NEXT_PUBLIC_BACKEND_TIMEOUT`** - Timeout para requisições (padrão: 5000ms)

#### **Como Funciona**
1. **Se `NEXT_PUBLIC_BACKEND_URL` estiver definida** → Usa a URL de produção diretamente
2. **Se não estiver definida** → Usa descoberta automática de porta para desenvolvimento local
3. **Fallback** → Usa localhost:3001 se não conseguir descobrir automaticamente

### **Teste da Aplicação**

1. **Acesse o frontend**: [Vercel](https://teste-pratico-logica-solucoes.vercel.app)
2. **Teste o backend**: [Render Health Check](https://backend-logica-solucoes.onrender.com/health)
3. **API Endpoints**: [Render API](https://backend-logica-solucoes.onrender.com/api/users)

### **Limitações do Plano Gratuito**

#### **Vercel (Frontend)**
- ✅ Sem limitações significativas
- ✅ Deploy automático
- ✅ CDN global
- ✅ SSL automático

#### **Render (Backend)**
- ⚠️ Aplicação "dorme" após 15 minutos de inatividade
- ⚠️ Cold start de ~30 segundos quando acorda
- ⚠️ Limite de 750 horas/mês
- ⚠️ Sem persistência garantida (banco pode ser resetado)

### **Alternativas de Deploy**

Se precisar de mais recursos, considere:

- **Railway** ($5/mês) - Sem cold start, mais confiável
- **Fly.io** (gratuito) - Sem cold start, deploy global
- **DigitalOcean** ($5/mês) - Mais controle, VPS dedicado
- **AWS** (pay-as-you-go) - Escalável, mais complexo

## 👨‍💻 Desenvolvimento

Projeto desenvolvido seguindo as melhores práticas de desenvolvimento de software:
- ✅ Clean Code
- ✅ Princípios SOLID
- ✅ Programação Orientada a Objetos
- ✅ Código documentado em português
- ✅ Modularização máxima
- ✅ Versionamento com Git e branches separadas

---

**Repositório**: [GitHub](https://github.com/JoaoPedroLage/teste-pratico_logica-solucoes-integradas)
