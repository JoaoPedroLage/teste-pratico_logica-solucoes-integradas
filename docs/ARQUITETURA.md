# Arquitetura do Sistema

## Visão Geral

O sistema foi desenvolvido seguindo uma arquitetura em camadas, aplicando os princípios SOLID e Clean Code. A separação entre frontend e backend permite escalabilidade e manutenibilidade.

## Estrutura de Camadas

### Frontend (Next.js)

```
app/
├── components/      # Componentes React reutilizáveis
├── layout.tsx       # Layout principal da aplicação
├── page.tsx         # Página principal
└── globals.css      # Estilos globais
```

#### Componentes

- **Navigation**: Componente de navegação entre views
- **UserList**: Lista de usuários com suporte a seleção, edição e exclusão
- **UserForm**: Formulário para edição de usuários
- **SearchBar**: Barra de pesquisa de usuários

### Backend (Node.js/Express)

```
backend/src/
├── controllers/     # Camada de controle (HTTP)
├── services/        # Camada de serviços (lógica de negócio)
├── models/          # Modelos de dados
├── routes/          # Definição de rotas
└── server.ts        # Configuração do servidor
```

#### Camadas

**1. Controllers (UserController)**
- Responsabilidade: Receber requisições HTTP e retornar respostas
- Princípio: Single Responsibility Principle (SRP)
- Não contém lógica de negócio, apenas coordena chamadas aos services

**2. Services (ApiService, DatabaseService, CsvService, SyncService)**
- Responsabilidade: Contém a lógica de negócio
- Princípio: Single Responsibility Principle (SRP)
- `ApiService`: Comunicação com API externa
- `DatabaseService`: Operações com banco de dados SQLite
- `CsvService`: Manipulação de arquivos CSV
- `SyncService`: Sincronização entre SQLite e CSV

**3. Models (User)**
- Responsabilidade: Definir estrutura de dados
- TypeScript interfaces para tipagem

**4. Routes (UserRoutes)**
- Responsabilidade: Mapear endpoints HTTP para controllers
- Organização modular de rotas

## Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)

Cada classe tem uma única responsabilidade:
- `ApiService`: Apenas comunicação com API externa
- `DatabaseService`: Apenas operações com SQLite
- `CsvService`: Apenas manipulação de CSV
- `SyncService`: Apenas sincronização entre SQLite e CSV
- `UserController`: Apenas coordenação de requisições HTTP
- `UserRoutes`: Apenas definição de rotas

### Open/Closed Principle (OCP)

As classes são abertas para extensão, fechadas para modificação:
- Services podem ser estendidos sem modificar código existente
- Uso de interfaces permite novas implementações

### Liskov Substitution Principle (LSP)

Interfaces bem definidas permitem substituição de implementações:
- `User` model pode ser usado em diferentes contextos
- Services podem ser substituídos por implementações alternativas

### Interface Segregation Principle (ISP)

Interfaces específicas e focadas:
- Cada interface/model define apenas o necessário
- Sem dependências desnecessárias

### Dependency Inversion Principle (DIP)

Dependências injetadas via construtor:
- `UserController` recebe dependências no construtor
- Facilita testes e manutenção

## Fluxo de Dados

### Buscar Usuários da API

```
Frontend (page.tsx)
  ↓
UserController.fetchFromApi()
  ↓
ApiService.fetchUsers()
  ↓
API Externa (random-data-api.com)
  ↓
Resposta → Frontend
```

### Salvar Usuários

```
Frontend (page.tsx)
  ↓
POST /api/users/save
  ↓
UserController.saveUsers()
  ↓
SyncService.addUsers()
  ↓
├─→ DatabaseService.addUsers() → SQLite
└─→ CsvService.addUsers() → CSV
```

### Editar/Excluir Usuário

```
Frontend (UserForm/UserList)
  ↓
PUT/DELETE /api/users/:id
  ↓
UserController.updateUser()/deleteUser()
  ↓
SyncService.updateUser()/deleteUser()
  ↓
├─→ DatabaseService.updateUser()/deleteUser() → SQLite
└─→ CsvService.updateUser()/deleteUser() → CSV
```

### Listar/Buscar Usuários

```
Frontend (page.tsx)
  ↓
GET /api/users ou /api/users/search
  ↓
UserController.listUsers()/searchUsers()
  ↓
SyncService.getAllUsers()/searchUsers()
  ↓
DatabaseService.getAllUsers()/searchUsers() (priorizado)
  ↓ (fallback se falhar)
CsvService.getAllUsers()/searchUsers() → CSV
```

## Persistência Dual: SQLite + CSV

### Estratégia de Armazenamento

A aplicação utiliza duas formas de persistência simultaneamente:

**SQLite (Banco de Dados Relacional)**
- Banco de dados principal
- Dados normalizados em tabelas relacionadas:
  - `users`: Dados principais do usuário
  - `employment`: Informações de emprego
  - `address`: Endereços
  - `credit_card`: Cartões de crédito
  - `subscription`: Assinaturas
- Transações ACID para garantir integridade
- Performance otimizada para consultas

**CSV (Arquivo de Texto)**
- Backup e portabilidade
- Compatibilidade com ferramentas externas
- Formato legível e auditável

**Sincronização Automática**
- `SyncService` garante que todas as operações CRUD sejam executadas em ambos os sistemas
- SQLite é a fonte primária de dados (source of truth)
- CSV é sincronizado automaticamente após cada operação
- Na inicialização, sincroniza dados entre SQLite e CSV se houver discrepâncias

### Preservação de Integridade

**No CSV:**
Quando um registro é editado ou excluído:
1. Arquivo CSV completo é lido em memória
2. Operação é realizada no array em memória
3. Arquivo é reescrito completamente
4. Ordem original é preservada

**No SQLite:**
- Transações garantem atomicidade
- Foreign keys garantem integridade referencial
- DELETE CASCADE mantém consistência entre tabelas relacionadas

## Pesquisa

A pesquisa é realizada em múltiplos campos simultaneamente:
- Por padrão: `first_name`, `last_name`, `email`
- Configurável via query parameter `fields`
- Busca case-insensitive
- Suporta busca parcial (LIKE %termo%)
- Prioriza SQLite com fallback para CSV
- Índices no SQLite para otimização de performance

## Segurança

- Validação de entrada nos controllers
- Tratamento de erros adequado
- Sanitização de dados antes de gravar
- CORS configurado no backend
- Transações SQLite garantem integridade dos dados
