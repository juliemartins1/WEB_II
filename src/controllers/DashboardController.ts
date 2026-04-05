import { Request, Response } from 'express';

export function listarDashboard(req: Request, res: Response) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { tipo_usuario } = req.session.user;

    if (tipo_usuario === 'admin') {
        return res.redirect('/admin/users');
    }

    if (tipo_usuario === 'vendedor') {
        return res.render('seller-dashboard', {
            user: req.session.user
        });
    }

    return res.render('buyer-dashboard', {
        user: req.session.user
    });
}