# Guia de Contribuição

## Branches

O projeto utiliza branches separadas para cada feature, seguindo o padrão:

- `feature/nome-da-feature` - Para novas funcionalidades
- `bugfix/nome-do-bug` - Para correções de bugs
- `refactor/nome-do-refactor` - Para refatorações

## Padrões de Código

### TypeScript

- Sempre usar tipos explícitos
- Evitar `any` sempre que possível
- Usar interfaces para tipos complexos
- Seguir convenções de nomenclatura:
  - Classes: PascalCase
  - Funções/Variáveis: camelCase
  - Constantes: UPPER_SNAKE_CASE

### Clean Code

- Funções pequenas e com responsabilidade única
- Nomes descritivos e expressivos
- Comentários apenas quando necessário
- Código auto-explicativo

### SOLID

- Seguir os princípios SOLID
- Cada classe com uma única responsabilidade
- Dependências injetadas via construtor
- Interfaces bem definidas

## Documentação

- Todo código deve ser documentado em português
- Comentários JSDoc para funções públicas
- README atualizado para mudanças significativas

## Testes

- Testes unitários para services
- Testes de integração para controllers
- Cobertura mínima de 80%

## Commits

Seguir o padrão:

```
tipo: descrição curta

Descrição detalhada (opcional)

[tipo]: feature, bugfix, refactor, docs, test
```

Exemplos:
```
feature: adiciona pesquisa avançada de usuários

docs: atualiza documentação da API

bugfix: corrige atualização de CSV preservando ordem
```

## Pull Requests

1. Branch atualizada com `main`
2. Todos os testes passando
3. Código revisado
4. Documentação atualizada
5. Sem conflitos
