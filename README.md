# Teste Prático - Lógica Soluções Integradas

Aplicativo completo para gerenciamento de usuários desenvolvido em Next.js, TypeScript e TailwindCSS, com backend Node.js usando Docker, seguindo princípios SOLID e Clean Code.

## 📋 Descrição

Aplicativo desenvolvido para atender todas as especificações do teste prático, incluindo consumo de API externa, manipulação de arquivos CSV com preservação de integridade, e interface moderna para gerenciamento de usuários.

## ✅ Requisitos Atendidos

### Funcionalidades Principais
- ✅ Exibição de página com listagem de usuários da API random-data-api
- ✅ Opção para gravar dados em arquivo CSV (separado por vírgula)
- ✅ Opção para editar registros gravados preservando integridade
- ✅ Opção para excluir registros gravados preservando integridade
- ✅ Tela de consumo da API disponível no menu a qualquer momento
- ✅ Funcionalidade de pesquisa baseada em múltiplos campos (nome, sobrenome, email)
- ✅ Interface moderna e responsiva com TailwindCSS
- ✅ Arquitetura modular seguindo SOLID

### Requisitos Técnicos
- ✅ Next.js como framework
- ✅ TypeScript
- ✅ TailwindCSS
- ✅ Backend com Docker
- ✅ SQLite como banco de dados relacional + CSV para persistência dual
- ✅ Node.js no backend
- ✅ Classes POO
- ✅ Princípios SOLID
- ✅ Clean Code
- ✅ Código modularizado
- ✅ Documentação em português

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
│   │   └── SearchBar.tsx         # Barra de pesquisa
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

### GET `/api/users/api?size=10`
Busca usuários da API externa random-data-api.

**Query Parameters:**
- `size` (opcional): Quantidade de usuários (padrão: 10)

**Resposta:**
```json
{
  "success": true,
  "data": [...],
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