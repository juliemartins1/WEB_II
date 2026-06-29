# Trabalho III - Backend de Controle Financeiro Pessoal

## Como instalar

Clone o repositório e instale as dependências:

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

O servidor vai rodar em `http://localhost:3000`.

## Como testar

Para rodar todos os testes:

```bash
npm test
```

Só os testes unitários:

```bash
npm run test:unit
```

Só os testes de integração:

```bash
npm run test:integration
```

## Testando as rotas

### Usando o Thunder Client (VS Code)

Instala a extensão **Thunder Client** no VS Code, clica no ícone de raio na barra lateral e segue o fluxo abaixo.

> As rotas protegidas precisam do header `Authorization: Bearer <token>`. O token é retornado no cadastro ou no login, basta copiar e colar.

---

#### 1. Cadastrar usuário

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/register`
- **Body → JSON:**

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "123456"
}
```

---

#### 2. Fazer login

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/login`
- **Body → JSON:**

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

> Copia o `token` que vem na resposta, vai precisar dele nas próximas requisições.

---

#### 3. Criar categoria

- **Method:** `POST`
- **URL:** `http://localhost:3000/categories`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Body → JSON:**

```json
{
  "name": "Alimentação",
  "kind": "expense"
}
```

> O campo `kind` pode ser `"income"` ou `"expense"`.

---

#### 4. Listar categorias

- **Method:** `GET`
- **URL:** `http://localhost:3000/categories`
- **Headers:**
  - `Authorization: Bearer <token>`

---

#### 5. Criar lançamento

- **Method:** `POST`
- **URL:** `http://localhost:3000/transactions`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Body → JSON:**

```json
{
  "categoryId": "<id-da-categoria>",
  "type": "expense",
  "description": "Almoço",
  "amount": 35.90,
  "occurredAt": "2026-06-29T12:00:00.000Z"
}
```

> O campo `type` pode ser `"income"` ou `"expense"`. O `categoryId` vem da resposta da rota de criar categoria.

---

#### 6. Listar lançamentos

- **Method:** `GET`
- **URL:** `http://localhost:3000/transactions?month=6&year=2026`
- **Headers:**
  - `Authorization: Bearer <token>`

> Também dá pra filtrar por `categoryId` e `type` na query string.

---

#### 7. Marcar despesa como paga

- **Method:** `PATCH`
- **URL:** `http://localhost:3000/transactions/<id-da-transacao>/pay`
- **Headers:**
  - `Authorization: Bearer <token>`

> O `id` da transação vem na resposta de criar lançamento.

---

#### 8. Saldo mensal

- **Method:** `GET`
- **URL:** `http://localhost:3000/reports/monthly-balance?month=6&year=2026`
- **Headers:**
  - `Authorization: Bearer <token>`

---

#### 9. Relatório por categoria

- **Method:** `GET`
- **URL:** `http://localhost:3000/reports/category-summary?month=6&year=2026`
- **Headers:**
  - `Authorization: Bearer <token>`

---

### Usando curl no terminal

Também dá pra testar direto no terminal se preferir.

#### Cadastrar usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@email.com", "password": "123456"}'
```

#### Fazer login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@email.com", "password": "123456"}'
```

#### Criar categoria

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Alimentação", "kind": "expense"}'
```

#### Listar categorias

```bash
curl http://localhost:3000/categories \
  -H "Authorization: Bearer <token>"
```

#### Criar lançamento

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "categoryId": "<id-da-categoria>",
    "type": "expense",
    "description": "Almoço",
    "amount": 35.90,
    "occurredAt": "2026-06-29T12:00:00.000Z"
  }'
```

#### Listar lançamentos

```bash
curl "http://localhost:3000/transactions?month=6&year=2026" \
  -H "Authorization: Bearer <token>"
```

#### Marcar despesa como paga

```bash
curl -X PATCH http://localhost:3000/transactions/<id-da-transacao>/pay \
  -H "Authorization: Bearer <token>"
```

#### Saldo mensal

```bash
curl "http://localhost:3000/reports/monthly-balance?month=6&year=2026" \
  -H "Authorization: Bearer <token>"
```

#### Relatório por categoria

```bash
curl "http://localhost:3000/reports/category-summary?month=6&year=2026" \
  -H "Authorization: Bearer <token>"
```