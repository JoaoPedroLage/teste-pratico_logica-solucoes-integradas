# Documentação da API

## Base URL
```
http://localhost:3001/api/users
```

## Endpoints

### GET `/api/users/api`
Busca usuários da Random User API (`randomuser.me`).

Parâmetros:
- size (number, opcional): quantidade a buscar (padrão 10)

Exemplo:
```
GET /api/users/api?size=10
```

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "gender": "female",
      "name": { "title": "Ms", "first": "Jennie", "last": "Nichols" },
      "location": { "street": { "number": 1, "name": "Main" }, "city": "Billings", "state": "MI", "country": "US", "postcode": "63104" },
      "email": "jennie.nichols@example.com",
      "login": { "uuid": "...", "username": "yellowpeacock117" },
      "dob": { "date": "1992-03-08", "age": 30 },
      "registered": { "date": "2007-07-09", "age": 14 },
      "phone": "(272) 790-0888",
      "cell": "(489) 330-2385",
      "picture": { "large": "...", "medium": "...", "thumbnail": "..." },
      "nat": "US"
    }
  ],
  "count": 10
}
```

---

### POST `/api/users/save`
Salva usuários no SQLite e CSV.

Body:
```json
{ "users": [ { "...randomUserSchema" } ] }
```

---

### GET `/api/users`
Lista todos os usuários salvos (fonte primária SQLite, CSV como backup).

---

### GET `/api/users/search`
Busca usuários por critérios de pesquisa usando notação de ponto.

Parâmetros:
- q (string, obrigatório): termo
- fields (string, opcional): lista separada por vírgula. Padrão: `name.first,name.last,email`

Exemplo:
```
GET /api/users/search?q=jennie&fields=name.first,name.last,email
```

---

### GET `/api/users/:id`
Busca um usuário salvo por ID numérico.

---

### PUT `/api/users/:id`
Atualiza um usuário salvo.

---

### DELETE `/api/users/:id`
Remove um usuário salvo.

---

## Modelo de Usuário (salvo no backend)

```ts
interface SavedUser {
  id: number;              // ID numérico do backend
  id_info: {               // Documento informativo da Random User (ex.: SSN)
    name: string;
    value: string;
  };
  gender: string;
  name: { title: string; first: string; last: string };
  location: {
    street: { number: number; name: string };
    city: string; state: string; country: string; postcode: string | number;
    coordinates?: { latitude: string; longitude: string };
    timezone?: { offset: string; description: string };
  };
  email: string;
  login: { uuid: string; username: string };
  dob: { date: string; age: number };
  registered: { date: string; age: number };
  phone: string;
  cell: string;
  picture: { large: string; medium: string; thumbnail: string };
  nat: string;
}
```
