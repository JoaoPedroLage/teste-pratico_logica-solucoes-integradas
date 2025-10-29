# Funcionalidades Implementadas

## ✅ Funcionalidades Principais

### 1. Consumo da API Externa
- **Endpoint**: Consumo da API random-data-api.com
- **Funcionalidade**: Busca de usuários da API externa
- **Interface**: Tela dedicada para consumo da API
- **Detalhes**:
  - Permite buscar 10 ou 20 usuários por vez
  - Exibe lista de usuários com informações completas
  - Permite seleção múltipla de usuários para salvar

### 2. Persistência Dual (SQLite + CSV)
- **Funcionalidade**: Salvar usuários em SQLite e CSV simultaneamente
- **SQLite**: Banco de dados relacional com tabelas normalizadas
  - Tabela principal `users` com dados básicos
  - Tabelas relacionadas: `employment`, `address`, `credit_card`, `subscription`
  - Transações ACID para garantir integridade
  - Índices para otimização de buscas
- **CSV**: Arquivo de texto para backup e portabilidade
  - Formato: CSV com separação por vírgula
  - Preserva integridade do arquivo
  - Compatível com Excel, Google Sheets, etc.
- **Sincronização**: `SyncService` garante que ambos os sistemas estejam sempre atualizados

### 3. Edição de Registros
- **Funcionalidade**: Editar usuários salvos em SQLite e CSV
- **Interface**: Modal com formulário de edição
- **Características**:
  - Permite editar: nome, sobrenome, email, telefone, cidade, estado, cargo, plano
  - Atualiza simultaneamente no SQLite e CSV
  - No SQLite: atualiza tabelas relacionadas
  - No CSV: preserva integridade do arquivo
  - Mantém a ordem original dos registros no CSV

### 4. Exclusão de Registros
- **Funcionalidade**: Remover usuários do SQLite e CSV
- **Interface**: Botão de exclusão na lista de usuários
- **Características**:
  - Confirmação antes de excluir
  - Remove do SQLite com DELETE CASCADE (remove registros relacionados)
  - No CSV: preserva integridade do arquivo
  - Mantém ordem dos registros restantes no CSV
  - Reescreve arquivo CSV completo após exclusão

### 5. Pesquisa Multi-campo
- **Funcionalidade**: Buscar usuários por múltiplos campos
- **Fonte de dados**: Prioriza SQLite, com fallback para CSV
- **Campos de busca padrão**:
  - Nome (first_name)
  - Sobrenome (last_name)
  - Email (email)
- **Características**:
  - Busca case-insensitive
  - Busca parcial (LIKE %termo%)
  - Busca em tempo real (debounce)
  - Interface dedicada na navegação
  - Índices no SQLite para performance

### 6. Menu de Navegação
- **Funcionalidade**: Alternar entre diferentes views
- **Views disponíveis**:
  - Consumir API
  - Usuários Salvos
  - Pesquisar
- **Disponível em**: Todas as telas da aplicação

## 🏗️ Arquitetura

### Frontend (Next.js)
- **Framework**: Next.js 14 com App Router
- **Estilização**: TailwindCSS
- **Linguagem**: TypeScript
- **Componentes**:
  - Navigation: Navegação principal
  - UserList: Lista de usuários
  - UserForm: Formulário de edição
  - SearchBar: Barra de pesquisa

### Backend (Node.js)
- **Framework**: Express
- **Linguagem**: TypeScript
- **Arquitetura**: SOLID
- **Banco de Dados**: SQLite3
- **Camadas**:
  - Controllers: Recebem requisições HTTP
  - Services: Lógica de negócio
    - ApiService: Comunicação com API externa
    - DatabaseService: Operações com SQLite
    - CsvService: Manipulação de CSV
    - SyncService: Sincronização DB + CSV
  - Models: Estrutura de dados
  - Routes: Definição de endpoints

### Princípios SOLID Aplicados
- ✅ Single Responsibility Principle (SRP)
- ✅ Open/Closed Principle (OCP)
- ✅ Liskov Substitution Principle (LSP)
- ✅ Interface Segregation Principle (ISP)
- ✅ Dependency Inversion Principle (DIP)

## 📊 Persistência e Sincronização

### SQLite (Banco de Dados Relacional)
- Tabelas normalizadas com relacionamentos
- Transações ACID
- Índices para otimização
- DELETE CASCADE para integridade referencial

### CSV (Backup e Portabilidade)
- Formato legível e compatível
- Preservação de integridade

### Preservação de Integridade do CSV
1. **Leitura**: Arquivo completo é lido em memória
2. **Operação**: Modificação é realizada no array em memória
3. **Escrita**: Arquivo é reescrito completamente
4. **Preservação**: Ordem original é mantida

### Sincronização Automática
- Todas as operações CRUD são executadas em SQLite e CSV
- SQLite é a fonte primária de dados
- Na inicialização, sincroniza dados se houver discrepâncias
- Se SQLite estiver vazio e CSV tiver dados: importa CSV → SQLite
- Se CSV estiver vazio e SQLite tiver dados: exporta SQLite → CSV

## 🔍 Pesquisa

### Campos de Busca
- **Padrão**: first_name, last_name, email
- **Configurável**: Via query parameter `fields`

### Exemplo de Uso:
```
GET /api/users/search?q=john&fields=first_name,last_name,email
```

### Interface
- Campo de busca com placeholder descritivo
- Resultados em tempo real
- Contador de resultados
- Exibição completa dos resultados

## 🎨 Interface do Usuário

### Design
- Interface moderna e responsiva
- Cores consistentes usando TailwindCSS
- Feedback visual para ações
- Loading states
- Mensagens de erro/sucesso

### Componentes Visuais
- Tabelas responsivas
- Modais para edição
- Botões com estados (hover, disabled)
- Avatares com fallback
- Ícones visuais

## 🔐 Segurança e Validação

- Validação de entrada nos controllers
- Tratamento de erros adequado
- Sanitização de dados
- CORS configurado
- Validação de tipos TypeScript

## 📦 Containerização

- Docker Compose para orquestração
- Dockerfile para backend
- Volumes para persistência de dados
- Ambiente isolado

## 📚 Documentação

- README.md principal
- Documentação de API (docs/API.md)
- Documentação de arquitetura (docs/ARQUITETURA.md)
- Guia de contribuição (docs/CONTRIBUTING.md)
- Guia de instalação (INSTALACAO.md)
- READMEs específicos em cada diretório
