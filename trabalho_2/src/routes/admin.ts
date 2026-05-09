import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

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
export default router;