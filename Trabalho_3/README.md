# Trabalho III - Backend do Sistema de Controle Financeiro Pessoal

Backend desenvolvido em **Node.js + TypeScript** para controle financeiro pessoal. O foco do projeto é demonstrar uma API organizada em camadas, com regras de negócio no backend e testes automatizados.

## Objetivo

Permitir que um usuário consiga:

- criar conta e fazer login;
- cadastrar categorias financeiras;
- registrar receitas e despesas;
- listar lançamentos com filtros;
- consultar saldo mensal;
- consultar relatório por categoria;
- marcar despesas como pagas.

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Vitest
- JSON Web Token
- Repositórios em memória

## Como executar o projeto

Instale as dependências:

```bash
npm install
```

Execute o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Execute todos os testes:

```bash
npm test
```

Executar apenas testes unitários:

```bash
npm run test:unit
```

Executar apenas testes de integração:

```bash
npm run test:integration
```

Gerar build:

```bash
npm run build
```

## Estrutura de pastas

```text
src/
  main/
    app.ts
    container.ts
    routes.ts
    server.ts
  modules/
    auth/
    categories/
    transactions/
    reports/
    users/
  shared/
    errors/
    http/
tests/
  unit/
  integration/
```

## Explicação da arquitetura

O projeto foi separado por módulos para deixar cada parte do sistema mais fácil de entender e testar.

### main

É a camada responsável por montar a aplicação. Nela ficam:

- criação do Express;
- configuração das rotas;
- criação das dependências;
- inicialização do servidor.

### domain

É onde ficam as entidades principais do sistema, como `User`, `Category` e `Transaction`. Essa camada guarda regras básicas, por exemplo:

- usuário deve ter nome e e-mail válido;
- categoria precisa ter nome;
- lançamento financeiro precisa ter valor maior que zero;
- somente despesas podem ser marcadas como pagas.

### application

É onde ficam os casos de uso. Cada caso de uso representa uma ação do sistema, como:

- cadastrar usuário;
- fazer login;
- criar categoria;
- criar lançamento;
- listar lançamentos;
- calcular saldo mensal;
- calcular relatório por categoria;
- marcar despesa como paga.

Essa camada concentra as regras de negócio principais.

### infrastructure

É onde ficam as implementações concretas dos contratos. Neste trabalho foram usados repositórios em memória para facilitar a execução e os testes.

### interfaces/http

É onde ficam os controllers. Eles recebem a requisição HTTP, chamam o caso de uso correto e devolvem a resposta para a API.

## Principais regras implementadas

### Autenticação

- O usuário pode se cadastrar com nome, e-mail e senha.
- O sistema não permite e-mail duplicado.
- A senha é armazenada com hash.
- O login retorna um token JWT.
- Rotas financeiras exigem token de autenticação.

### Categorias

- Cada usuário pode criar suas próprias categorias.
- As categorias pertencem ao usuário autenticado.
- Não é permitido cadastrar categoria duplicada para o mesmo usuário.

### Lançamentos

- O lançamento pode ser `income` ou `expense`.
- O valor precisa ser maior que zero.
- O lançamento sempre pertence ao usuário autenticado.
- Um usuário não consegue visualizar lançamentos de outro usuário.

### Filtros

A listagem de lançamentos permite filtrar por:

- mês;
- ano;
- categoria.

Os filtros são aplicados no backend.

### Relatórios

O backend calcula:

- total de receitas do mês;
- total de despesas do mês;
- saldo mensal;
- total por categoria.

### Despesa paga

- Toda despesa nasce como `pending`.
- Existe rota para marcar despesa como `paid`.
- Apenas o dono da despesa pode alterar esse estado.

## Rotas principais

### Autenticação

```http
POST /auth/register
POST /auth/login
```

### Categorias

```http
POST /categories
GET /categories
```

### Lançamentos

```http
POST /transactions
GET /transactions?month=6&year=2026&categoryId=ID_DA_CATEGORIA
PATCH /transactions/:id/pay
```

### Relatórios

```http
GET /reports/monthly-balance?month=6&year=2026
GET /reports/category-summary?month=6&year=2026
```



## Testes

Durante o desenvolvimento foram criados testes unitários e testes de integração para verificar se as principais funcionalidades do sistema estavam funcionando corretamente.

Os testes unitários foram utilizados para validar as regras de negócio das entidades e dos casos de uso, garantindo que cada parte do sistema se comportasse como esperado de forma isolada.

Já os testes de integração foram feitos para verificar o funcionamento completo da API, desde o recebimento da requisição até a resposta enviada ao cliente. Nesses testes foram verificados fluxos como:

* cadastro de usuário;
* login e autenticação com JWT;
* criação e listagem de categorias;
* cadastro de receitas e despesas;
* filtros de transações;
* geração dos relatórios;
* pagamento de despesas.

Ao final do desenvolvimento, todos os testes estavam sendo executados com sucesso.

**Resultado obtido:**

```text
12 arquivos de teste executados
27 testes aprovados
0 falhas
```

Além dos testes automatizados, também foram realizados testes manuais utilizando o Thunder Client para validar as rotas da API e conferir se as respostas retornadas estavam corretas.

```
