# Trabalho I - Sistema de Usuários

Aplicação web desenvolvida com **Node.js + Express + TypeScript + EJS + SQLite**, implementando autenticação, controle de acesso por perfil, validação de e-mail e auditoria de ações.

---

##  Funcionalidades

* Cadastro de usuários (comprador e vendedor)
* Login com autenticação por sessão
* Controle de acesso por perfil:

  * Admin
  * Comprador
  * Vendedor
* Área administrativa (acesso exclusivo do admin):

  * Listagem de usuários
  * Ativação/desativação de contas
  * Visualização de logs
* Validação de e-mail com código único:

  * Código de 6 dígitos
  * Expiração em 30 minutos
  * Reenvio de código
* Auditoria de ações:

  * Registro de todas as requisições não-GET
  * Armazena usuário, método, rota e resumo da ação

---

##  Tecnologias utilizadas

* Node.js
* Express
* TypeScript
* EJS
* SQLite (better-sqlite3)
* bcrypt
* express-session
* nodemailer

---

## Instalação

Clone o repositório:

```bash
git clone https://github.com/juliemartins1/WEB_II.git
cd WEB_II
```

Instale as dependências:

```bash
npm install
```

---

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
```
PORT=3333
SESSION_SECRET=uma_chave_secreta_segura

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seuemail@gmail.com
MAIL_PASS=sua_senha_de_app
MAIL_FROM="MarketMVP <seuemail@gmail.com>"

> ⚠️ Para contas Gmail, utilize **senha de aplicativo**.

---

## Execução

### Modo desenvolvimento

```bash
npm run dev
```

### Build e execução

```bash
npm run build
npm start
```

A aplicação estará disponível em:

```
http://localhost:3333
```

---

## Usuários de teste

**Administrador (criado automaticamente)**

* Email: `admin@marketmvp.com`
* Senha: `admin123`

---


## Fluxo de validação de e-mail

1. O usuário cria a conta.
2. O sistema gera um código de verificação de 6 dígitos.
3. O código enviado aparece no terminal.
4. O usuário informa o código na tela de verificação.
5. Após validação, o acesso ao sistema é liberado.

---

## Regras do sistema

* Usuários desativados **não podem realizar login**
* O e-mail deve ser validado antes do acesso
* Apenas administradores podem:

  * Gerenciar usuários
  * Visualizar logs
* Todas as ações não-GET são registradas na auditoria

---

## Estrutura do projeto

```
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
├── views/
```

---

## Observações

* O sistema utiliza **sessões** para autenticação
* Senhas são armazenadas com **hash (bcrypt)**
* O código de verificação possui **tempo de expiração**
* Logs são registrados mesmo em caso de erro

---

##  Objetivo do trabalho

Desenvolver uma aplicação web completa com autenticação, controle de acesso por perfil, validação de e-mail e auditoria de ações, utilizando o template base fornecido pelo professor.
