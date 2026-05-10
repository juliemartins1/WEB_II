import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function sellerDashboard(req: Request, res: Response) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'vendedor') {
        return res.render('error', {
            message: 'Apenas vendedores podem acessar este painel.'
        });
    }

    const userId = req.session.user.id;

    const produtosAtivos = await prisma.product.count({
        where: {
            userId: userId,
            isActive: true
        }
    });

    const pedidosPendentes = await prisma.order.count({
        where: {
            sellerId: userId,
            status: 'pendente'
        }
    });

    const receitaResult = await prisma.order.aggregate({
        where: {
            sellerId: userId
        },
        _sum: {
            total: true
        }
    });

    const receita = receitaResult._sum.total || 0;

    return res.render('seller-dashboard', {
        user: req.session.user,
        produtosAtivos,
        receita,
        pedidosPendentes
    });
}