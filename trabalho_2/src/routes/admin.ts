import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

const router = Router();

/* PAINEL ADMIN */
router.get('/admin', async (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acesso restrito.'
        });
    }

    const users = await prisma.user.findMany({
        orderBy: {
            id: 'desc'
        }
    });

    return res.render('admin-dashboard', {
        user: req.session.user,
        users,
        error: req.query.error,
        success: req.query.success
    });
});

/* TELA CADASTRAR USUÁRIO */
router.get('/admin/users/new', (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acesso restrito.'
        });
    }

    return res.render('create-user', {
        user: req.session.user,
        error: null
    });
});

/* CRIAR USUÁRIO PELO ADMIN */
router.post('/admin/users/create', async (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acesso restrito.'
        });
    }

    const { name, email, password, tipo_usuario } = req.body;

    if (!name || !email || !password || !tipo_usuario) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Preencha todos os campos.'
        });
    }

    const tiposValidos = ['admin', 'comprador', 'vendedor'];

    if (!tiposValidos.includes(tipo_usuario)) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Tipo de usuário inválido.'
        });
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (userExists) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Este e-mail já está cadastrado.'
        });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            password: hash,
            tipo_usuario,
            ativo: true,
            email_verificado: true
        }
    });

    return res.redirect('/admin?success=Usuário criado com sucesso');
});

/* ATIVAR OU DESATIVAR USUÁRIO */
router.post('/admin/toggle-user/:id', async (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acesso restrito.'
        });
    }

    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
        return res.redirect('/admin?error=Usuário inválido');
    }

    /*
      Regra:
      - Admin pode desativar comprador.
      - Admin pode desativar vendedor.
      - Admin pode desativar outro admin.
      - Admin NÃO pode desativar a própria conta.
    */
    if (userId === req.session.user.id) {
        return res.redirect('/admin?error=Você não pode desativar sua própria conta');
    }

    const account = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!account) {
        return res.redirect('/admin?error=Usuário não encontrado');
    }

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            ativo: !account.ativo
        }
    });

    return res.redirect('/admin?success=Status da conta atualizado com sucesso');
});

export default router;