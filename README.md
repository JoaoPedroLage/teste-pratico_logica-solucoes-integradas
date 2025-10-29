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
- ✅ SQLite preparado (usando CSV conforme requisito)
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
│   │   │   └── CsvService.ts     # Serviço CSV
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

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

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

### Pesquisa Multi-campo

- Busca em tempo real com debounce
- Suporte a múltiplos campos simultaneamente
- Busca case-insensitive
- Busca parcial (contains)

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