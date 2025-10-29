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

**2. Services (ApiService, CsvService)**
- Responsabilidade: Contém a lógica de negócio
- Princípio: Single Responsibility Principle (SRP)
- `ApiService`: Comunicação com API externa
- `CsvService`: Manipulação de arquivos CSV

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
- `CsvService`: Apenas manipulação de CSV
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

### Salvar Usuários no CSV

```
Frontend (page.tsx)
  ↓
POST /api/users/save
  ↓
UserController.saveUsers()
  ↓
CsvService.addUsers()
  ↓
Arquivo CSV
```

### Editar/Excluir Usuário

```
Frontend (UserForm/UserList)
  ↓
PUT/DELETE /api/users/:id
  ↓
UserController.updateUser()/deleteUser()
  ↓
CsvService.updateUser()/deleteUser()
  ↓
Arquivo CSV (reescrito preservando ordem)
```

## Manipulação de CSV

### Preservação de Integridade

Quando um registro é editado ou excluído:
1. Arquivo CSV completo é lido em memória
2. Operação é realizada no array em memória
3. Arquivo é reescrito completamente
4. Ordem original é preservada

Isso garante que mesmo com 1.000 linhas, se a linha 50 for editada/excluída, as demais linhas permanecem intactas e na ordem correta.

## Pesquisa

A pesquisa é realizada em múltiplos campos simultaneamente:
- Por padrão: `first_name`, `last_name`, `email`
- Configurável via query parameter `fields`
- Busca case-insensitive
- Suporta busca parcial (contains)

## Segurança

- Validação de entrada nos controllers
- Tratamento de erros adequado
- Sanitização de dados antes de gravar no CSV
- CORS configurado no backend
