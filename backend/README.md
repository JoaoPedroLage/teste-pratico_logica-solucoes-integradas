# Backend - Gerenciador de Usuários

Backend desenvolvido em Node.js com Express, TypeScript, SQLite e seguindo princípios SOLID.

## Estrutura

```
backend/
├── src/
│   ├── controllers/    # Controllers (camada HTTP)
│   ├── services/       # Services (lógica de negócio)
│   │   ├── ApiService.ts       # Comunicação com API externa
│   │   ├── DatabaseService.ts  # Operações com SQLite
│   │   ├── CsvService.ts       # Manipulação de CSV
│   │   └── SyncService.ts      # Sincronização DB + CSV
│   ├── models/         # Modelos de dados
│   ├── routes/         # Rotas Express
│   └── server.ts       # Servidor principal
├── data/               # Arquivos SQLite e CSV (criados em runtime)
│   ├── user_manager.db        # Banco de dados SQLite
│   └── users.csv       # Arquivo CSV
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
DB_PATH=./data/user_manager.db
CSV_PATH=./data/users.csv
```

## Endpoints

Ver documentação completa em [docs/API.md](../docs/API.md).
