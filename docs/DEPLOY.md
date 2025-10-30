# 🚀 Guia de Deploy - Vercel

## Configuração para Deploy no Vercel

### 1. Arquivos de Configuração

#### `.vercelignore`
- Ignora pastas desnecessárias no deploy
- Exclui `backend/`, `docs/`, arquivos de desenvolvimento
- Otimiza o tamanho do deploy

#### `vercel.json`
- Configuração específica do Vercel
- Define runtime Node.js 18.x
- Configura rotas e builds

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# URL do Backend (substitua pela URL do seu serviço)
NEXT_PUBLIC_BACKEND_URL=https://seu-backend.railway.app

# Porta do Backend (opcional)
NEXT_PUBLIC_BACKEND_PORT=3001
```

### 3. Deploy no Vercel

#### Opção 1: Via Dashboard Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

#### Opção 2: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 4. Configuração de Variáveis de Ambiente

No dashboard do Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `NEXT_PUBLIC_BACKEND_URL`: URL do seu backend
   - `NEXT_PUBLIC_BACKEND_PORT`: Porta do backend (opcional)

### 5. Domínio Personalizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 6. Monitoramento

- **Analytics**: Dados de uso e performance
- **Functions**: Logs das funções serverless
- **Deployments**: Histórico de deploys

## 🔧 Troubleshooting

### Erro de CORS
- Verifique se o backend está configurado para aceitar requisições do domínio do Vercel
- Adicione o domínio do Vercel nas configurações CORS do backend

### Erro de Variáveis de Ambiente
- Verifique se as variáveis estão configuradas no dashboard do Vercel
- Certifique-se de que começam com `NEXT_PUBLIC_`

### Erro de Build
- Verifique os logs no dashboard do Vercel
- Teste localmente com `npm run build`

## 📊 Otimizações Aplicadas

- ✅ `.vercelignore` configurado
- ✅ `vercel.json` otimizado
- ✅ Build otimizado (sem warnings)
- ✅ Variáveis de ambiente documentadas
- ✅ Estrutura de pastas otimizada

## 🎯 Próximos Passos

1. **Configure o backend** em Railway/Render
2. **Atualize as variáveis** de ambiente
3. **Faça o deploy** no Vercel
4. **Teste** todas as funcionalidades
5. **Configure domínio** personalizado (opcional)
