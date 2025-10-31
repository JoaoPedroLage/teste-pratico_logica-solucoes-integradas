# Documentação da API

## Base URL
```
http://localhost:3001/api/users
```

## Endpoints

### GET `/api/users/api`
Busca usuários da Random User API (`randomuser.me`).

**Query Parameters:**
- `size` (number, opcional): Quantidade de usuários a buscar (padrão: 10, máximo: 5000)
- `gender` (string, opcional): Filtro por gênero - `male` ou `female`
- `nat` (string, opcional): Filtro por nacionalidade - código ISO de 2 letras (ex: `BR`, `US`, `GB`)

**Exemplo:**
```
GET /api/users/api?size=30&gender=male&nat=BR
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "gender": "male",
      "name": {
        "title": "Mr",
        "first": "Fernando",
        "last": "Pena"
      },
      "location": {
        "street": {
          "number": 9359,
          "name": "The Grove"
        },
        "city": "Glasgow",
        "state": "East Sussex",
        "country": "United Kingdom",
        "postcode": "PN5M 9DT",
        "coordinates": {
          "latitude": "-10.4606",
          "longitude": "-51.6426"
        },
        "timezone": {
          "offset": "-3:30",
          "description": "Newfoundland"
        }
      },
      "email": "fernando.pena@example.com",
      "login": {
        "uuid": "5b5ee55f-256d-4a08-8513-ffde11675492",
        "username": "beautifulelephant958"
      },
      "dob": {
        "date": "1998-11-09T00:36:46.061Z",
        "age": 26
      },
      "registered": {
        "date": "2019-11-13T09:45:04.394Z",
        "age": 5
      },
      "phone": "017687 85114",
      "cell": "07161 003251",
      "id": {
        "name": "NINO",
        "value": "KG 38 32 23 G"
      },
      "picture": {
        "large": "https://randomuser.me/api/portraits/men/91.jpg",
        "medium": "https://randomuser.me/api/portraits/med/men/91.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/men/91.jpg"
      },
      "nat": "GB"
    }
  ],
  "count": 30
}
```

**Notas importantes:**
- O campo `login` **não inclui** campos sensíveis (`password`, `salt`, `md5`, `sha1`, `sha256`) na resposta - removidos por segurança
- O campo `id` pode ter `name` e `value` como `null` ou vazios dependendo do usuário
- O campo `postcode` pode ser string ou número dependendo do país
- Campos `coordinates` e `timezone` são opcionais e podem não estar presentes
- Se `nat` não for especificado, a nacionalidade será aleatória

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

**Query Parameters:**
- `term` ou `q` (string, obrigatório): Termo de busca
- `fields` (string, opcional): Lista de campos separados por vírgula. Padrão: `name.first,name.last,email`
  - Campos suportados: `name.first`, `name.last`, `email`, `login.username`, `location.city`, `location.state`, `location.country`, `phone`, `cell`, `nat`

**Exemplo:**
```
GET /api/users/search?term=jennie&fields=name.first,name.last,email
GET /api/users/search?q=brasil&fields=location.country,location.city
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "db_id": 44,
      "gender": "female",
      "name": {
        "title": "Ms",
        "first": "Jennie",
        "last": "Nichols"
      },
      "email": "jennie.nichols@example.com",
      ...
    }
  ],
  "count": 1,
  "searchTerm": "jennie",
  "fields": ["name.first", "name.last", "email"]
}
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

**Parâmetros:**
- `id` (number): ID do usuário (`db_id`)

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso"
}
```

---

### GET `/api/users/download/csv`
Download do arquivo CSV do usuário (específico por `owner_id`).

**Resposta:**
- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="users_<ownerId>.csv"`
- **Validação automática**: 
  - Se o arquivo não existir, gera CSV em memória a partir do banco de dados
  - Se o arquivo estiver corrompido (ex: linhas vazias ou inválidas), regenera o CSV
  - Filtra linhas vazias ou inválidas (apenas `csv_id` sem dados)

**Erros possíveis:**
- `404 Not Found`: Nenhum usuário encontrado para exportar
- `500 Internal Server Error`: Erro ao gerar ou validar o CSV

---

## Modelo de Usuário (Random User API)

```ts
interface User {
  gender: string;                    // "male" ou "female"
  name: {
    title: string;                   // Ex: "Mr", "Ms", "Miss", "Mrs"
    first: string;
    last: string;
  };
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string | number;      // Pode ser string ou número
    coordinates?: {                 // Opcional
      latitude: string;
      longitude: string;
    };
    timezone?: {                    // Opcional
      offset: string;
      description: string;
    };
  };
  email: string;
  login: {
    uuid: string;
    username: string;
    // Campos sensíveis (password, salt, md5, sha1, sha256) 
    // são removidos antes de enviar ao frontend
  };
  dob: {
    date: string;                   // ISO 8601 format
    age: number;
  };
  registered: {
    date: string;                   // ISO 8601 format
    age: number;
  };
  phone: string;
  cell: string;
  id?: {                            // Opcional - pode ser null
    name: string | null;            // Ex: "SSN", "NINO", "CPF", "TFN"
    value: string | null;           // Valor do documento ou null
  };
  picture: {
    large: string;                  // URL da imagem grande
    medium: string;                 // URL da imagem média
    thumbnail: string;              // URL da miniatura
  };
  nat: string;                      // Código ISO de 2 letras (ex: "BR", "US", "GB")
}
```

## Modelo de Usuário Salvo no Backend

```ts
interface SavedUser extends User {
  db_id: number;                    // ID numérico do registro no banco de dados
  // Todos os campos do User acima estão presentes
  // O campo `id` (documento) é mapeado para `id_info` no banco
}
```

**Diferenças importantes:**
- `db_id`: Identificador único do registro no banco de dados (SQLite)
- `id`: Campo opcional da Random User API que contém informações do documento (SSN, CPF, etc.)
  - Pode ser `null` ou ter `name` e `value` vazios
  - Não deve ser confundido com `db_id`
- `login`: Contém apenas `uuid` e `username` (campos sensíveis removidos)
