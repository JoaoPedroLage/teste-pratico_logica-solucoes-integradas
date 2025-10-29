# Documentação da API

## Base URL

```
http://localhost:3001/api/users
```

## Endpoints

### GET `/api/users/api`

Busca usuários da API externa random-data-api.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|--------|-----------|
| size | number | Não | 10 | Quantidade de usuários a buscar |

**Exemplo de Requisição:**
```bash
GET /api/users/api?size=10
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "avatar": "https://...",
      "gender": "Male",
      "phone_number": "+1234567890",
      "social_insurance_number": "123-45-6789",
      "date_of_birth": "1990-01-01",
      "employment": {
        "title": "Software Engineer",
        "key_skill": "Problem Solving"
      },
      "address": {
        "city": "New York",
        "street_name": "Main Street",
        "street_address": "123 Main St",
        "zip_code": "10001",
        "state": "NY",
        "country": "US",
        "lng": -74.006,
        "lat": 40.7128
      },
      "credit_card": {
        "cc_number": "1234-5678-9012-3456"
      },
      "subscription": {
        "plan": "Premium",
        "status": "Active",
        "payment_method": "Credit Card",
        "term": "Monthly"
      }
    }
  ],
  "count": 10
}
```

**Resposta de Erro (500):**
```json
{
  "success": false,
  "message": "Erro ao buscar usuários da API",
  "error": "Mensagem de erro detalhada"
}
```

---

### POST `/api/users/save`

Salva usuários no SQLite e CSV simultaneamente.

**Body:**
```json
{
  "users": [
    {
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Doe",
      ...
    }
  ]
}
```

**Exemplo de Requisição:**
```bash
POST /api/users/save
Content-Type: application/json

{
  "users": [...]
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "10 usuário(s) salvo(s) com sucesso em SQLite e CSV"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "É necessário fornecer um array de usuários"
}
```

---

### GET `/api/users`

Lista todos os usuários salvos (prioriza busca no SQLite, com fallback para CSV).

**Exemplo de Requisição:**
```bash
GET /api/users
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 150
}
```

---

### GET `/api/users/search`

Busca usuários por critérios de pesquisa (prioriza SQLite, com fallback para CSV).

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| q | string | Sim | Termo de busca |
| fields | string | Não | Campos para busca (separados por vírgula) |

**Exemplo de Requisição:**
```bash
GET /api/users/search?q=john&fields=first_name,last_name,email
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "searchTerm": "john",
  "fields": ["first_name", "last_name", "email"]
}
```

---

### GET `/api/users/:id`

Busca um usuário específico por ID.

**Exemplo de Requisição:**
```bash
GET /api/users/1
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    ...
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

### PUT `/api/users/:id`

Atualiza um usuário existente.

**Body (campos opcionais):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+9876543210",
  "address": {
    "city": "Los Angeles"
  },
  ...
}
```

**Exemplo de Requisição:**
```bash
PUT /api/users/1
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "id": 1,
    "first_name": "Jane",
    ...
  }
}
```

---

### DELETE `/api/users/:id`

Remove um usuário do SQLite e CSV.

**Exemplo de Requisição:**
```bash
DELETE /api/users/1
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso"
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |
| 503 | Serviço externo indisponível (API externa) |

## Modelo de Usuário

```typescript
interface User {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  avatar: string;
  gender: string;
  phone_number: string;
  social_insurance_number: string;
  date_of_birth: string;
  employment: {
    title: string;
    key_skill: string;
  };
  address: {
    city: string;
    street_name: string;
    street_address: string;
    zip_code: string;
    state: string;
    country: string;
    lng: number;
    lat: number;
  };
  credit_card: {
    cc_number: string;
  };
  subscription: {
    plan: string;
    status: string;
    payment_method: string;
    term: string;
  };
}
```
