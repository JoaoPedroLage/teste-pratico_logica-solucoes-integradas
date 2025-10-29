# Frontend - Gerenciador de Usuários

Frontend desenvolvido em Next.js 14 com TypeScript e TailwindCSS.

## Estrutura

```
app/
├── components/    # Componentes React
├── layout.tsx     # Layout principal
├── page.tsx       # Página principal
└── globals.css    # Estilos globais
```

## Execução

```bash
npm install
npm run dev
```

A aplicação estará disponível em http://localhost:3000

## Componentes

### Navigation
Componente de navegação entre as diferentes views da aplicação.

### UserList
Lista de usuários com suporte a:
- Seleção múltipla
- Edição
- Exclusão

### UserForm
Formulário modal para edição de usuários.

### SearchBar
Barra de pesquisa com busca em tempo real.

## Funcionalidades

- Consumir API externa e listar usuários
- Salvar usuários em CSV
- Visualizar usuários salvos
- Editar usuários
- Excluir usuários
- Pesquisar usuários
