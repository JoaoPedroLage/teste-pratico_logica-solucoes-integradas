# Guia de Instalação e Execução

## Instalação Rápida

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd teste-pratico_logica-solucoes-integradas
```

### 2. Instale as dependências

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Configure variáveis de ambiente (opcional)

Crie os arquivos `.env` (opcional, valores padrão já configurados):
```bash
# Frontend
cp .env.example .env

# Backend
cd backend
cp .env.example .env
cd ..
```

> **Nota**: A aplicação usa apenas arquivos `.env` (não `.env.local`). Os valores padrão funcionam sem configuração.

### 4. Execute a aplicação

**Opção 1: Com Docker (Recomendado)**

```bash
# Inicia o backend em Docker
docker-compose up --build

# Em outro terminal, inicia o frontend
npm run dev
```

**Opção 2: Sem Docker**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Estrutura de Diretórios

```
teste-pratico_logica-solucoes-integradas/
├── app/                    # Frontend Next.js
├── backend/                # Backend Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   └── data/               # Arquivos SQLite e CSV são criados aqui
├── docs/                   # Documentação
├── docker-compose.yml
└── README.md
```

## Solução de Problemas

### Backend não inicia

1. Verifique se a porta 3001 está livre
2. Certifique-se de que as dependências foram instaladas: `cd backend && npm install`
3. Verifique os logs: `docker-compose logs backend`

### Frontend não conecta ao backend

1. Certifique-se de que o backend está rodando na porta 3001
2. Verifique o arquivo `next.config.js` para configuração de proxy
3. Teste a API diretamente: `curl http://localhost:3001/health`

### Erro ao salvar CSV

1. Verifique permissões de escrita no diretório `backend/data`
2. Certifique-se de que o diretório existe: `mkdir -p backend/data`

## Próximos Passos

1. Acesse http://localhost:3000
2. Clique em "Consumir API" para buscar usuários
3. Selecione usuários e clique em "Salvar no CSV"
4. Visualize usuários salvos na aba "Usuários Salvos"
5. Use a aba "Pesquisar" para buscar usuários
