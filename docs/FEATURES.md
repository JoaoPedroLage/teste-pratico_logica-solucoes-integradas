# Funcionalidades Implementadas

## ✅ Funcionalidades Principais

### 1. Consumo da API Externa
- Endpoint: Random User API (`randomuser.me`)
- Interface: Aba dedicada com cards por usuário (nome, email, nat, cidade)
- Busca por quantidade e filtros oficiais (gender/nat)

### 2. Persistência Dual (SQLite + CSV)
- Salva usuários em SQLite e CSV
- Sincronização garantida

### 3. Edição de Registros
- Modal de edição com a mesma ordem/seções do modal de visualização (apenas inputs)
- Campos conforme schema: `name.first`, `name.last`, `email`, `location.*`, `login.username`, `phone`, `cell`, `nat`, `id_info.*`

### 4. Exclusão de Registros
- Botão de excluir por card
- Preserva integridade do CSV reescrevendo arquivo completo

### 5. Pesquisa Multi-campo (dot-notation)
- Campos: `name.first`, `name.last`, `email`
- Backend filtra em memória para compatibilidade entre fontes de dados

### 6. Cards unificados
- Mesmo layout para "API Externa" e "Usuários Salvos"

## 🏗️ Arquitetura
- Frontend: Next.js + TailwindCSS
- Backend: Express + TypeScript
- Serviços separados (API, CSV, DB, Sync)
