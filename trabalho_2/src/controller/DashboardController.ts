import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function sellerDashboard(req: Request, res: Response) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id;

    const produtosAtivos = await prisma.product.count({
        where: {
            userId: userId
        }
    });

    return res.render('seller-dashboard', {
        user: req.session.user,
        produtosAtivos,
        receita: 0,
        pedidosPendentes: 0
    });
}