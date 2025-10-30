# Guia de Gerenciamento de Branches

## Estrutura de Branches

O projeto utiliza branches separadas para cada funcionalidade, seguindo o padrão Git Flow adaptado.

## Convenção de Nomenclatura

### Branches de Features
```
feature/nome-da-feature
```

**Exemplos:**
- `feature/consumir-api-random-data`
- `feature/gravacao-csv`
- `feature/edicao-usuarios`
- `feature/exclusao-usuarios`
- `feature/pesquisa-multicampo`

### Branches de Bugfix
```
bugfix/descricao-do-bug
```

**Exemplos:**
- `bugfix/corrige-integridade-csv`
- `bugfix/ajusta-validacao-email`

### Branches de Refactor
```
refactor/descricao-do-refactor
```

**Exemplos:**
- `refactor/melhorar-csv-service`
- `refactor/extrar-componentes-reutilizaveis`

## Workflow de Branches

### Criando uma Nova Feature Branch

```bash
# Criar e mudar para nova branch
git checkout -b feature/nome-da-feature

# Trabalhar na feature
# ... fazer commits ...

# Quando estiver pronto, fazer merge na main
git checkout main
git merge feature/nome-da-feature

# Deletar branch local (opcional)
git branch -d feature/nome-da-feature
```

### Exemplo: Implementando Feature de Pesquisa

```bash
# 1. Criar branch
git checkout -b feature/pesquisa-multicampo

# 2. Fazer alterações
# ... editar arquivos ...

# 3. Commit
git add .
git commit -m "feature: implementa pesquisa por múltiplos campos"

# 4. Push para remote
git push origin feature/pesquisa-multicampo

# 5. Após revisão, merge na main
git checkout main
git merge feature/pesquisa-multicampo

# 6. Deletar branch (opcional)
git branch -d feature/pesquisa-multicampo
git push origin --delete feature/pesquisa-multicampo
```

## Branches Principais do Projeto

### Features Implementadas (exemplos de branches criadas)

1. **feature/estrutura-inicial**
   - Estrutura base do projeto Next.js
   - Configuração TypeScript e TailwindCSS

2. **feature/backend-api-service**
   - Implementação do ApiService
   - Consumo da API random-data-api

3. **feature/backend-csv-service**
   - Implementação do CsvService
   - Operações CRUD em CSV

4. **feature/backend-controllers-routes**
   - Implementação dos controllers
   - Definição das rotas Express

5. **feature/frontend-components**
   - Componentes React
   - Navigation, UserList, UserForm, SearchBar

6. **feature/frontend-integration**
   - Integração frontend-backend
   - Consumo da API

7. **feature/docker-setup**
   - Configuração Docker
   - Docker Compose

8. **feature/documentation**
   - Documentação completa
   - README e arquivos .md

## Boas Práticas

### 1. Nomes Descritivos
✅ `feature/adiciona-filtro-busqueda`
❌ `feature/fix`
❌ `feature/new`

### 2. Commits Atômicos
- Um commit por funcionalidade/ajuste
- Mensagens descritivas
- Seguir padrão de commits

### 3. Sincronizar Antes de Merge
```bash
git checkout main
git pull origin main
git checkout feature/minha-feature
git merge main  # Resolver conflitos se houver
```

### 4. Deletar Branches Antigas
- Após merge, deletar branch local e remote
- Manter repositório organizado

## Padrão de Commits

```
tipo: descrição curta

Descrição detalhada (opcional)
```

**Tipos:**
- `feature`: Nova funcionalidade
- `bugfix`: Correção de bug
- `refactor`: Refatoração
- `docs`: Documentação
- `test`: Testes
- `style`: Formatação
- `chore`: Tarefas de manutenção

## Exemplos de Workflow Completo

### Exemplo 1: Nova Feature
```bash
# 1. Criar branch
git checkout -b feature/adicionar-paginacao

# 2. Desenvolver
# ... código ...

# 3. Commit
git add .
git commit -m "feature: adiciona paginação na lista de usuários"

# 4. Continuar desenvolvimento
# ... mais código ...
git commit -m "feature: adiciona controles de navegação"

# 5. Push
git push origin feature/adicionar-paginacao

# 6. Após code review e aprovação
git checkout main
git merge feature/adicionar-paginacao
git push origin main

# 7. Limpar
git branch -d feature/adicionar-paginacao
git push origin --delete feature/adicionar-paginacao
```

### Exemplo 2: Correção de Bug
```bash
# 1. Criar branch
git checkout -b bugfix/corrige-validacao-email

# 2. Corrigir bug
# ... correções ...

# 3. Commit
git commit -m "bugfix: corrige validação de email no formulário"

# 4. Merge rápido
git checkout main
git merge bugfix/corrige-validacao-email
git push origin main
```

---

## Guia Rápido — Branches para as Alterações Recentes

Execute cada bloco por alteração realizada, abrindo PR e fazendo merge na `main` ao final de cada uma.

1) Remover campos sensíveis de login (backend CSV/DB)
```bash
git checkout -b refactor/remover-login-sensivel
# edições em backend/src/services/CsvService.ts e DatabaseService.ts
git add .
git commit -m "refactor: remove campos sensíveis do login (csv/db)"
git push origin refactor/remover-login-sensivel
# abrir PR → merge na main
git checkout main && git pull && git merge --no-ff refactor/remover-login-sensivel && git push
```

2) Filtro na API externa e UI de busca
```bash
git checkout -b feature/filtro-api-externa
# edições em backend (ApiService/UserController) e app/dashboard/ApiTab.tsx
git add .
git commit -m "feature: adiciona filtros gender/nat e UI de busca"
git push origin feature/filtro-api-externa
# PR → merge
```

3) Padronizar exclusão (db_id) e idempotência
```bash
git checkout -b bugfix/exclusao-db-id-idempotente
# edições em SavedUsersTab, DashboardContent (delete flow) e UserController
git add .
git commit -m "bugfix: usa db_id no delete e torna exclusão idempotente"
git push origin bugfix/exclusao-db-id-idempotente
# PR → merge
```

4) Download CSV por usuário (owner)
```bash
git checkout -b feature/download-csv-por-owner
# edições em UserController (downloadCsv)
git add .
git commit -m "feature: download de CSV por owner com fallback em memória"
git push origin feature/download-csv-por-owner
# PR → merge
```

5) UX de edição (modal) e campos completos
```bash
git checkout -b refactor/edit-user-modal-ux
# edições em app/components/EditUserModal.tsx
git add .
git commit -m "refactor: melhora UX/UI do modal de edição e campos"
git push origin refactor/edit-user-modal-ux
# PR → merge
```

6) Limpeza de logs/comentários
```bash
git checkout -b chore/limpeza-logs-comentarios
# remoção de console.log e comentários não essenciais
git add .
git commit -m "chore: remove logs de debug e comentários supérfluos"
git push origin chore/limpeza-logs-comentarios
# PR → merge
```

7) Merge final na main (se fez PRs separados)
```bash
git checkout main
git pull
# (se necessário) git merge --no-ff <branch>
git push origin main
```
