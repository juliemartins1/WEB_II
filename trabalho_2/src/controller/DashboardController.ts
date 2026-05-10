import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function sellerDashboard(req: Request, res: Response) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const sellerId = Number(req.session.user.id);

    const products = await prisma.product.findMany({
        where: {
            userId: sellerId
        },
        include: {
            images: true,
            comments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const activeProducts = products.filter(product => product.active).length;
    const inactiveProducts = products.filter(product => !product.active).length;

    return res.render('seller-dashboard', {
        user: req.session.user,
        products,
        activeProducts,
        inactiveProducts,
        success: req.query.success || null,
        error: req.query.error || null
    });
}

export const dashboardVendedor = sellerDashboard;

export function dashboardComprador(req: Request, res: Response) {
    return res.render('buyer-dashboard', {
        user: req.session.user
    });
}