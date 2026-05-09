# Trabalho II - Evolução do Marketplace

Projeto desenvolvido para a disciplina de Web II, com o objetivo de evoluir a aplicação criada no Trabalho I e nas Aulas 07 e 08.

A aplicação representa um marketplace com autenticação, controle de acesso por perfil, cadastro de produtos com múltiplas imagens, perfis completos para compradores e vendedores, comentários com foto opcional e sistema de curtidas.

---

## Tecnologias utilizadas

- Node.js
- Express
- TypeScript
- EJS
- Prisma ORM
- SQLite
- Multer
- Bcrypt
- Express Session
- Tailwind CSS

---

## Perfis do sistema

O sistema possui três tipos de usuário:

- Admin
- Comprador
- Vendedor

Cada perfil possui permissões diferentes dentro da aplicação.

---

## Funcionalidades implementadas

### Autenticação

O sistema possui login, logout e controle de sessão.

Usuários autenticados são redirecionados para o painel correspondente ao seu perfil:

- Admin: painel administrativo
- Comprador: painel do comprador
- Vendedor: painel do vendedor

---

### Perfil do comprador

Cada comprador possui uma área própria para visualizar e editar seus dados.

Campos implementados:

- Telefone
- Endereço completo
- Cidade
- Estado
- CEP
- Forma de pagamento preferencial

Regras:

- Apenas compradores podem acessar o perfil de comprador.
- O comprador só consegue editar o próprio perfil.
- Os dados são validados no backend.
- O perfil fica disponível em página específica do sistema.

---

### Perfil do vendedor

Cada vendedor possui uma área para editar as informações da loja.

Campos implementados:

- Nome da loja ou nome de exibição
- Descrição da loja/vendedor
- Telefone comercial
- Cidade
- Estado
- Categorias ou tipos de produtos vendidos

Regras:

- Apenas vendedores podem editar o perfil da loja.
- O vendedor só edita o próprio perfil.
- O perfil público do vendedor pode ser visualizado por outros usuários.
- Os produtos cadastrados ficam associados ao vendedor responsável.
- Na página de detalhes do produto aparece quem está vendendo.

---

### Produtos

O vendedor pode cadastrar produtos no marketplace.

Campos do produto:

- Nome
- Descrição
- Categoria
- Preço
- Estoque
- Imagens

Regras:

- Apenas vendedores podem cadastrar produtos.
- Cada produto fica associado ao vendedor logado.
- O sistema permite múltiplas fotos por produto.
- A primeira imagem cadastrada é usada como imagem principal.
- As demais imagens aparecem na galeria.
- O backend valida os arquivos enviados.

---

### Página de detalhes do produto

Cada produto possui uma página de detalhes mais completa.

A página exibe:

- Nome do produto
- Descrição
- Categoria
- Preço
- Estoque
- Imagem principal
- Galeria com múltiplas imagens
- Informações do vendedor
- Comentários do produto
- Total de curtidas recebidas nos comentários
- Botão de compra para usuários compradores

---

### Sistema de comentários

Usuários autenticados podem comentar nos produtos.

Regras implementadas:

- Somente usuários logados podem comentar.
- Cada comentário fica associado ao produto.
- Cada comentário fica associado ao autor.
- Cada comentário registra data e hora.
- O comentário pode ter uma foto opcional.
- O autor pode editar o próprio comentário.
- O autor pode excluir o próprio comentário.
- O admin pode excluir comentários inadequados.
- Os comentários aparecem ordenados por data.

---

### Sistema de curtidas nos comentários

Cada comentário pode receber curtidas de usuários autenticados.

Regras implementadas:

- Usuário logado pode curtir comentário.
- O mesmo usuário só pode curtir um comentário uma vez.
- O usuário pode remover sua curtida.
- A quantidade de curtidas aparece em cada comentário.
- A regra de não duplicar curtida é garantida no banco com `@@unique([commentId, userId])`.

---

### Compra simples de produto

Foi implementado um fluxo simples de compra direta.

Regras:

- Apenas compradores podem comprar produtos.
- O comprador não pode comprar se o produto estiver sem estoque.
- O vendedor não pode comprar o próprio produto.
- Ao comprar, o sistema cria um pedido.
- O estoque do produto diminui em 1 unidade.
- O vendedor consegue visualizar receita e pedidos pendentes no painel.

---

### Painel administrativo

O administrador possui acesso a uma área administrativa.

Funcionalidades:

- Visualizar usuários cadastrados.
- Ver contas ativas e desativadas.
- Criar novos usuários.
- Ativar ou desativar contas.
- Moderar comentários inadequados.

---

## Controle de acesso

O sistema respeita as permissões dos perfis.

Exemplos:

- Comprador edita apenas o próprio perfil.
- Vendedor edita apenas o próprio perfil da loja.
- Vendedor cadastra produtos próprios.
- Usuário autenticado pode comentar e curtir.
- Admin pode moderar comentários.
- Usuário não autenticado pode visualizar produtos, mas não pode comentar, curtir ou comprar.

---

## Como instalar e executar o projeto

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO