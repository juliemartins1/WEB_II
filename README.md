 Trabalho I - Sistema de Usuários

Aplicação web desenvolvida em **Node.js + Express + TypeScript + EJS + SQLite**, com autenticação, controle de acesso por perfil, validação de e-mail e auditoria de ações.

---

 Funcionalidades

* Cadastro de usuários (comprador e vendedor)
* Login com autenticação por sessão
* Controle de acesso por perfil:

  * Admin
  * Comprador
  * Vendedor
* Área administrativa (apenas admin):

  * Listagem de usuários
  * Desativação/ativação de contas
  * Visualização de logs
* Validação de e-mail com código único:

  * Código de 6 dígitos
  * Expiração em 30 minutos
  * Reenvio de código
* Auditoria de ações:

  * Registro de todas as requisições não-GET
  * Armazena usuário, método, rota e resumo

---

 Tecnologias utilizadas

* Node.js
* Express
* TypeScript
* EJS
* SQLite (better-sqlite3)
* bcrypt
* express-session
* nodemailer

---

 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd Trabalho_01
```

2. Instale as dependências:

```bash
npm install
```

---

 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3333
SESSION_SECRET=uma_chave_secreta_segura

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seuemail@gmail.com
MAIL_PASS=sua_senha_de_app
MAIL_FROM="MarketMVP <seuemail@gmail.com>"
```

 Para Gmail, utilize senha de aplicativo.

---

 Execução

### Modo desenvolvimento:

```bash
npm run dev
```

### Build e execução:

```bash
npm run build
npm start
```

A aplicação estará disponível em:

```
http://localhost:3333
```

---

 Usuários de teste

 Admin (criado automaticamente)

* Email: `admin@marketmvp.com`
* Senha: `admin123`

---

 Regras do sistema

* Usuários desativados **não podem fazer login**
* Usuários devem validar o e-mail antes de acessar o sistema
* Apenas administradores podem:

  * Gerenciar usuários
  * Visualizar logs
* Todas as ações não-GET são registradas na auditoria

---

 Estrutura do projeto

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

 Observações

* O sistema utiliza sessões para autenticação
* Senhas são armazenadas com hash (bcrypt)
* Código de verificação é gerado dinamicamente e possui validade
* Logs são registrados mesmo em caso de erro

---

 Objetivo do trabalho

Implementar um sistema completo de autenticação com controle de acesso por perfil, validação de e-mail e auditoria de ações, utilizando o Template base fornecido na disciplina.

---
