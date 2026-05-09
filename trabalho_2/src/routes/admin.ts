import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

const router = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acesso restrito ao administrador.'
        });
    }

    return next();
}

router.get('/admin', requireAdmin, async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        orderBy: { id: 'desc' }
    });

    return res.render('admin-dashboard', {
        user: req.session.user,
        users
    });
});

router.get('/admin/users', requireAdmin, async (req: Request, res: Response) => {
    const search = String(req.query.q || '').trim().toLowerCase();

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const filteredUsers = search
        ? users.filter((user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.tipo_usuario.toLowerCase().includes(search)
        )
        : users;

    return res.render('users', {
        user: req.session.user,
        users: filteredUsers,
        search: req.query.q || ''
    });
});

router.get(['/admin/users/new', '/admin/users/create'], requireAdmin, (req: Request, res: Response) => {
    return res.render('create-user', {
        user: req.session.user,
        error: null,
        sucesso: null
    });
});

router.post('/admin/users/create', requireAdmin, async (req: Request, res: Response) => {
    const { name, email, password, tipo_usuario } = req.body;

    if (!name || !email || !password || !tipo_usuario) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Preencha todos os campos.',
            sucesso: null
        });
    }

    if (!['admin', 'comprador', 'vendedor'].includes(tipo_usuario)) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Perfil inválido.',
            sucesso: null
        });
    }

    const userExists = await prisma.user.findUnique({
        where: { email }
    });

    if (userExists) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Este e-mail já está cadastrado.',
            sucesso: null
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

    return res.redirect('/admin');
});

async function toggleUser(req: Request, res: Response) {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
        return res.redirect('/admin');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.tipo_usuario === 'admin' || user.id === req.session.user?.id) {
        return res.redirect('/admin');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { ativo: !user.ativo }
    });

    return res.redirect(req.get('referer') || '/admin');
}

router.post('/admin/toggle-user/:id', requireAdmin, toggleUser);
router.post('/admin/users/:id/toggle', requireAdmin, toggleUser);

router.get('/admin/logs', requireAdmin, async (req: Request, res: Response) => {
    const logs = await prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return res.render('logs', {
        user: req.session.user,
        logs
    });
});

export default router;
