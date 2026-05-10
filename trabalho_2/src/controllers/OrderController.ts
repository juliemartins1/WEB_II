import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

/* CRIAR PEDIDO / COMPRAR PRODUTO */
router.post('/orders/create', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        if (req.session.user.tipo_usuario !== 'comprador') {
            return res.render('error', {
                message: 'Apenas compradores podem comprar produtos.'
            });
        }

        const productId = Number(req.body.productId);

        if (Number.isNaN(productId)) {
            return res.render('error', {
                message: 'Produto inválido.'
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return res.render('error', {
                message: 'Produto não encontrado.'
            });
        }

        if (product.stock <= 0) {
            return res.render('error', {
                message: 'Produto sem estoque.'
            });
        }

        if (product.userId === req.session.user.id) {
            return res.render('error', {
                message: 'Você não pode comprar seu próprio produto.'
            });
        }

        await prisma.order.create({
            data: {
                buyerId: req.session.user.id,
                sellerId: product.userId,
                productId: product.id,
                quantity: 1,
               total: product.price,
                status: 'pendente'
            }
        });

        await prisma.product.update({
            where: {
                id: product.id
            },
            data: {
                stock: product.stock - 1
            }
        });

        return res.redirect('/orders?success=Compra realizada com sucesso');
    } catch (error) {
        console.error('Erro ao criar pedido:', error);

        return res.render('error', {
            message: 'Erro ao realizar compra.'
        });
    }
});

/* LISTAR PEDIDOS DO COMPRADOR */
router.get('/orders', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        if (req.session.user.tipo_usuario !== 'comprador') {
            return res.render('error', {
                message: 'Apenas compradores podem ver seus pedidos.'
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                buyerId: req.session.user.id
            },
            include: {
                product: true,
                seller: {
                    include: {
                        sellerProfile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.render('orders', {
            user: req.session.user,
            orders,
            success: req.query.success
        });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);

        return res.render('error', {
            message: 'Erro ao carregar pedidos.'
        });
    }
});

/* LISTAR PEDIDOS RECEBIDOS PELO VENDEDOR */
router.get('/seller/orders', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        if (req.session.user.tipo_usuario !== 'vendedor') {
            return res.render('error', {
                message: 'Apenas vendedores podem ver pedidos recebidos.'
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                sellerId: req.session.user.id
            },
            include: {
                product: true,
                buyer: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.render('seller-orders', {
            user: req.session.user,
            orders
        });
    } catch (error) {
        console.error('Erro ao listar pedidos do vendedor:', error);

        return res.render('error', {
            message: 'Erro ao carregar pedidos recebidos.'
        });
    }
});

export default router;