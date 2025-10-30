# 🚀 Guia de Deploy (Frontend na Vercel e Backend no Render)

Este guia descreve como publicar o frontend (Next.js) na Vercel e o backend (Node.js/Express + SQLite/CSV) no Render, usando variáveis de ambiente e arquivos de configuração já presentes no repositório.

---

## 🌐 Frontend (Vercel)

### 1) Arquivos de configuração utilizados
- `.vercelignore` (na raiz): ignora `backend/`, `docs/` e arquivos não necessários ao build do frontend
- `vercel.json` (na raiz): configuração simples para Next.js (build/install padrão)

### 2) Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)
Obrigatória em produção:
```
NEXT_PUBLIC_BACKEND_URL=https://backend-logica-solucoes.onrender.com
```
Opcionais para desenvolvimento local (apenas se necessário):
```
NEXT_PUBLIC_BACKEND_HOST=localhost
NEXT_PUBLIC_BACKEND_PORT=3001
NEXT_PUBLIC_BACKEND_PROTOCOL=http
NEXT_PUBLIC_BACKEND_TIMEOUT=5000
```

O frontend detecta automaticamente:
1. Se `NEXT_PUBLIC_BACKEND_URL` estiver definida → usa diretamente esta URL
2. Caso contrário → descobre a porta local do backend (health check) e usa `http://HOST:PORT`

### 3) Deploy
Opção A – Dashboard
1. Acesse `https://vercel.com`
2. Importar o repositório do GitHub
3. Em Settings → Environment Variables, configure as variáveis acima
4. Deploy automático a cada push na branch principal

Opção B – CLI
```
npm i -g vercel
vercel login
vercel
vercel --prod
```

### 4) Domínio e monitoramento
- Domains: adicione domínio customizado (opcional)
- Analytics/Deployments: acompanhar métricas e histórico

---

## 🛠️ Backend (Render)

### 1) Serviço (Web Service)
- Repositório: este projeto
- Branch: `main`
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Node version: 18 LTS (ou superior compatível)

### 2) Variáveis de ambiente (Render → Service → Environment)
```
NODE_ENV=production
PORT=10000
DB_PATH=./data/user_manager.db
CORS_ORIGIN=*
```

Observações:
- O servidor lê `process.env.PORT` (Render define automaticamente). Não fixe portas.
- Os dados (SQLite/CSV) ficam em `backend/data/`. Para persistência no plano gratuito, considere backups.

### 3) Health check e endpoints
- Health: `GET /health` → `https://backend-logica-solucoes.onrender.com/health`
- API base: `GET /api/users` (lista), `GET /api/users/api?size=10` (consome externa), `POST /api/users/save` (salva CSV/DB)

### 4) Problemas comuns (Render)
- TS/types: já ajustado no repositório (`backend/tsconfig.json` e `src/types/global.d.ts`)
- Build falhando por raiz incorreta: confirme `Root Directory = backend`
- CORS: ajuste `CORS_ORIGIN` ou libere `*` para testes

---

## ✅ Checklist rápido
- Vercel
  - `NEXT_PUBLIC_BACKEND_URL` definido
  - `.vercelignore` ignora `backend/`
  - `vercel.json` presente
- Render
  - Root Directory = `backend`
  - Build/Start Commands corretos
  - `PORT` e `DB_PATH` configurados

---

## 🔧 Troubleshooting
- Frontend não encontra backend em prod
  - Confirme `NEXT_PUBLIC_BACKEND_URL`
  - Teste `GET /health` diretamente no navegador
- 400 ao salvar usuários
  - O backend aceita tanto `{ users: [...] }` quanto `[...]`. Verifique se está enviando um array válido
- Erro de CORS
  - Ajuste `CORS_ORIGIN` no backend para incluir o domínio da Vercel
- Build falhou na Vercel
  - Verifique logs e garanta que `backend/` está ignorado pelo `.vercelignore`

---

## 🔗 Links úteis
- Frontend (Vercel): URL definida no README
- Backend (Render Health): `https://backend-logica-solucoes.onrender.com/health`

---

## 📦 Referências no repositório
- `app/utils/backendApi.ts` → resolução de URL do backend (usa `NEXT_PUBLIC_BACKEND_URL` em prod)
- `app/context/AuthContext.tsx` → autenticação usa a mesma lógica de URL
- `.vercelignore` e `vercel.json` → configuração Vercel
- `backend/tsconfig.json` e `backend/src/types/global.d.ts` → compatibilidade de build no Render

