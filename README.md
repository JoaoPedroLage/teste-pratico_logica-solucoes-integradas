# Teste Prático - Lógica Soluções Integradas

Aplicativo para gerenciamento de usuários desenvolvido em Next.js, TypeScript e TailwindCSS, com backend Node.js usando Docker e SQLite, seguindo princípios SOLID e Clean Code.

## 📋 Funcionalidades

- ✅ Listagem de usuários obtidos da API random-data-api
- ✅ Gravação de dados em arquivo CSV
- ✅ Edição de registros CSV preservando integridade do arquivo
- ✅ Exclusão de registros CSV preservando integridade do arquivo
- ✅ Pesquisa por múltiplos campos (nome, sobrenome, email)
- ✅ Interface moderna e responsiva com TailwindCSS
- ✅ Arquitetura modular seguindo SOLID
- ✅ Backend com Docker

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **SQLite** - Banco de dados (preparado, mas usando CSV conforme requisito)
- **CSV Parser/Writer** - Manipulação de arquivos CSV
- **Docker** - Containerização

## 📁 Estrutura do Projeto

```
teste-pratico_logica-solucoes-integradas/
├── app/                    # Frontend Next.js
│   ├── components/         # Componentes React
│   │   ├── Navigation.tsx
│   │   ├── UserList.tsx
│   │   ├── UserForm.tsx
│   │   └── SearchBar.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── backend/                # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Controllers (SOLID)
│   │   │   └── UserController.ts
│   │   ├── services/       # Services (SOLID)
│   │   │   ├── ApiService.ts
│   │   │   └── CsvService.ts
│   │   ├── models/         # Models
│   │   │   └── User.ts
│   │   ├── routes/         # Rotas Express
│   │   │   └── UserRoutes.ts
│   │   └── server.ts       # Servidor principal
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados
- npm ou yarn

### Passo 1: Instalar Dependências do Frontend

```bash
npm install
```

### Passo 2: Instalar Dependências do Backend

```bash
cd backend
npm install
cd ..
```

### Passo 3: Executar com Docker

```bash
# Iniciar o backend em Docker
docker-compose up --build

# Em outro terminal, iniciar o frontend
npm run dev
```

### Passo 4: Executar sem Docker (Desenvolvimento)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

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

## 🏗️ Arquitetura

O projeto segue os princípios SOLID:

### Single Responsibility Principle (SRP)
- `ApiService`: Responsável apenas por comunicação com API externa
- `CsvService`: Responsável apenas por manipulação de CSV
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

## 📝 Documentação Adicional

- [Arquitetura do Sistema](./docs/ARQUITETURA.md)
- [Documentação da API](./docs/API.md)
- [Guia de Contribuição](./docs/CONTRIBUTING.md)

## 🤝 Como Contribuir

1. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
2. Faça commit das alterações: `git commit -m 'Adiciona nova feature'`
3. Faça push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido como teste prático para Lógica Soluções Integradas.

## 👨‍💻 Autor

Desenvolvido seguindo as melhores práticas de desenvolvimento de software.
