# Backend - Gerenciador de Usuários

Backend desenvolvido em Node.js com Express, TypeScript e seguindo princípios SOLID.

## Estrutura

```
backend/
├── src/
│   ├── controllers/    # Controllers (camada HTTP)
│   ├── services/       # Services (lógica de negócio)
│   ├── models/         # Modelos de dados
│   ├── routes/         # Rotas Express
│   └── server.ts       # Servidor principal
├── data/               # Arquivos CSV (criados em runtime)
├── Dockerfile
└── package.json
```

## Execução

### Desenvolvimento (sem Docker)

```bash
npm install
npm run dev
```

### Produção (com Docker)

```bash
docker build -t backend-logica-solucoes .
docker run -p 3001:3001 backend-logica-solucoes
```

## Variáveis de Ambiente

Criar arquivo `.env` baseado em `.env.example`:

```
PORT=3001
NODE_ENV=development
DB_PATH=./data/users.db
CSV_PATH=./data/users.csv
```

## Endpoints

Ver documentação completa em [docs/API.md](../docs/API.md).
