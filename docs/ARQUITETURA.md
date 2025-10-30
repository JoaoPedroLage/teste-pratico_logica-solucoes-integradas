# Arquitetura do Sistema

## Visão Geral

O sistema foi desenvolvido seguindo uma arquitetura em camadas, aplicando os princípios SOLID e Clean Code. A separação entre frontend e backend permite escalabilidade e manutenibilidade.

## Estrutura de Camadas

### Frontend (Next.js)

- App Router, componentes, modais de visualização e edição
- Tipos alinhados ao schema Random User (`name.first`, `name.last`, `email`, etc.)

### Backend (Node.js/Express)

- Controllers: coordenam requisições HTTP
- Services: lógica de negócio (API externa, CSV, SQLite, sincronização)
- Models: estruturas de dados compatíveis com Random User
- Routes: mapeamento dos endpoints

## Pesquisa (dot-notation)

- A busca utiliza notação de ponto (`name.first`, `name.last`, `email`), compatível com o objeto do usuário
- Implementação no backend filtra em memória os usuários retornados do serviço, garantindo compatibilidade entre SQLite/CSV e objetos in-memory

## Fluxo de Dados

- GET `/api/users/api` → Random User API
- POST `/api/users/save` → Salva em SQLite e CSV
- GET `/api/users` → Lista salvos
- GET `/api/users/search?q=...&fields=name.first,name.last,email` → Busca em memória por campos dot-notation
- PUT/DELETE `/api/users/:id` → Atualiza/Remove registro salvo
