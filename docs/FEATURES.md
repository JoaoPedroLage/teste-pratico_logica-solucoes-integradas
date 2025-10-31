# Funcionalidades Implementadas

## ✅ Funcionalidades Principais

### 1. Consumo da API Externa
- Endpoint: Random User API (`randomuser.me`)
- Interface: Aba dedicada com cards por usuário (nome, email, nat, foto grande)
- Busca por quantidade (botão esquerdo) e filtros avançados (select com gender/nat à direita)
- Filtros suportados: `gender` (male/female) e `nat` (código ISO de 2 letras)
- Se `nat` não for especificado, a nacionalidade é aleatória

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
- Campos padrão: `name.first`, `name.last`, `email`
- Campos adicionais suportados: `login.username`, `location.city`, `location.state`, `location.country`, `phone`, `cell`, `nat`
- Backend utiliza SQLite para busca eficiente com filtros LIKE
- Parâmetros: `term` ou `q` (termo de busca) e `fields` (campos opcionais)

### 6. Cards unificados
- Mesmo layout para "API Externa" e "Usuários Salvos"

## 🏗️ Arquitetura
- Frontend: Next.js + TailwindCSS
- Backend: Express + TypeScript
- Serviços separados (API, CSV, DB, Sync)
