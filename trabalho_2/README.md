# Trabalho II - Evolução do Marketplace

Projeto em Node.js + Express + TypeScript + Prisma + SQLite.

## Funcionalidades implementadas

- Autenticação com perfis: admin, comprador e vendedor.
- Perfil do comprador com telefone, endereço, cidade, estado, CEP e forma de pagamento.
- Perfil do vendedor com nome da loja, descrição, contato comercial, cidade, estado e categorias.
- Cadastro de produto vinculado ao vendedor autenticado.
- Upload de múltiplas fotos por produto.
- Página pública de detalhes do produto com galeria, estoque, preço, categoria e dados do vendedor.
- Comentários em produtos para usuários autenticados.
- Comentário com foto opcional.
- Edição e exclusão de comentário pelo próprio autor.
- Exclusão/moderação de comentário pelo admin.
- Curtidas em comentários.
- Regra no banco para impedir curtida duplicada do mesmo usuário no mesmo comentário.
- Usuários não autenticados podem visualizar produtos, mas não podem comentar nem curtir.


## Perfis do sistema

- Admin
- Comprador
- Vendedor
## Instalação

## Instalação

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```


Acesse:

http://localhost:3333

## Usuário admin de teste

O sistema cria automaticamente este usuário ao iniciar, se ainda não existir:

Email: admin@marketmvp.com
Senha: admin123
Perfil: admin

## Criar compradores e vendedores

Use a tela de cadastro:

Depois de cadastrar, informe o código de verificação. Em ambiente de desenvolvimento, caso o e-mail não seja enviado, o código aparece no terminal.

## Observações técnicas

O projeto foi ajustado para usar o Prisma como banco principal. Antes havia dois bancos separados: um usado pelo login e outro usado por produtos/perfis/comentários. Isso causava problemas porque o usuário logado não existia no banco usado pelos produtos. Agora as tabelas principais estão no `prisma/schema.prisma`.

## Regras de comentário e curtida

- Apenas usuário autenticado comenta.
- Comentário pertence a um usuário e a um produto.
- Comentário registra data e hora automaticamente.
- Comentário pode ter foto opcional.
- Autor pode editar e excluir o próprio comentário.
- Admin pode excluir comentários.
- Usuário autenticado pode curtir e remover curtida.
- A tabela `CommentLike` possui `@@unique([commentId, userId])`, impedindo curtida duplicada.
