import { Router, Request, Response } from 'express';
import { sellerDashboard } from '../controllers/DashboardController';

const router = Router();

router.get('/dashboard', (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario === 'admin') {
        return res.redirect('/admin');
    }

    if (req.session.user.tipo_usuario === 'vendedor') {
        return res.redirect('/seller');
    }

    if (req.session.user.tipo_usuario === 'comprador') {
        return res.redirect('/buyer');
    }

    return res.redirect('/login');
});

router.get('/seller', sellerDashboard);

router.get('/buyer', (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'comprador') {
        return res.status(403).render('error', {
            message: 'Apenas compradores podem acessar este painel.'
        });
    }

    return res.render('buyer-dashboard', {
        user: req.session.user
    });
});

export default router;
