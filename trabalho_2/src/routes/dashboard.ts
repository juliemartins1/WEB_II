import { Router, Request, Response } from 'express';
import { sellerDashboard } from '../controller/DashboardController';

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

export default router;