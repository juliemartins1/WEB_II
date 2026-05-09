import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

const router = Router();

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
        users
    });
});
router.get('/admin/users/new', (req, res) => {
    if (!req.session.user || req.session.user.tipo_usuario !== 'admin') {
        return res.redirect('/login');
    }

    return res.render('create-user', {
        user: req.session.user,
        error: null
    });
});
router.post('/admin/toggle-user/:id', async (req: Request, res: Response) => {
    if (!req.session.user || req.session.user.tipo_usuario !== 'admin') {
        return res.redirect('/login');
    }

    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user || user.tipo_usuario === 'admin') {
        return res.redirect('/admin');
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            ativo: !user.ativo
        }
    });

    return res.redirect('/admin');
});

router.post('/admin/users/create', async (req: Request, res: Response) => {
    if (!req.session.user || req.session.user.tipo_usuario !== 'admin') {
        return res.redirect('/login');
    }

    const { name, email, password, tipo_usuario } = req.body;

    if (!name || !email || !password || !tipo_usuario) {
        return res.render('create-user', {
            user: req.session.user,
            error: 'Preencha todos os campos.'
        });
    }

    const userExists = await prisma.user.findUnique({
        where: { email }
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

    return res.redirect('/admin');
});
export default router;