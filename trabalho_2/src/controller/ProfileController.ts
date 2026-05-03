import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

function isLogged(req: Request) {
    return !!req.session.user;
}

/* TELA PERFIL COMPRADOR */
router.get('/profiles/buyer', async (req: Request, res: Response) => {
    if (!isLogged(req)) return res.redirect('/login');

    if (req.session.user?.tipo_usuario !== 'comprador') {
        return res.render('error', {
            message: 'Apenas compradores podem acessar este perfil.'
        });
    }

    const profile = await prisma.buyerProfile.findUnique({
        where: {
            userId: req.session.user.id
        }
    });

    return res.render('buyer-profile', {
        user: req.session.user,
        profile,
        success: req.query.success,
        error: req.query.error
    });
});

/* SALVAR PERFIL COMPRADOR */
router.post('/profiles/buyer', async (req: Request, res: Response) => {
    if (!isLogged(req)) return res.redirect('/login');

    if (req.session.user?.tipo_usuario !== 'comprador') {
        return res.render('error', {
            message: 'Apenas compradores podem editar este perfil.'
        });
    }

    const {
        phone,
        address,
        city,
        state,
        zipCode,
        paymentMethod
    } = req.body;

    if (!phone || !address || !city || !state || !zipCode || !paymentMethod) {
        return res.redirect('/profiles/buyer?error=Preencha todos os campos');
    }

    await prisma.buyerProfile.upsert({
        where: {
            userId: req.session.user.id
        },
        update: {
            phone,
            address,
            city,
            state,
            zipCode,
            paymentMethod
        },
        create: {
            userId: req.session.user.id,
            phone,
            address,
            city,
            state,
            zipCode,
            paymentMethod
        }
    });

    return res.redirect('/profiles/buyer?success=Perfil atualizado com sucesso');
});

/* TELA PERFIL VENDEDOR */
router.get('/profiles/seller', async (req: Request, res: Response) => {
    if (!isLogged(req)) return res.redirect('/login');

    if (req.session.user?.tipo_usuario !== 'vendedor') {
        return res.render('error', {
            message: 'Apenas vendedores podem acessar este perfil.'
        });
    }

    const profile = await prisma.sellerProfile.findUnique({
        where: {
            userId: req.session.user.id
        }
    });

    return res.render('seller-profile', {
        user: req.session.user,
        profile,
        success: req.query.success,
        error: req.query.error
    });
});

/* SALVAR PERFIL VENDEDOR */
router.post('/profiles/seller', async (req: Request, res: Response) => {
    if (!isLogged(req)) return res.redirect('/login');

    if (req.session.user?.tipo_usuario !== 'vendedor') {
        return res.render('error', {
            message: 'Apenas vendedores podem editar este perfil.'
        });
    }

    const {
        storeName,
        description,
        commercialPhone,
        city,
        state,
        categories
    } = req.body;

    if (!storeName || !description || !commercialPhone || !city || !state || !categories) {
        return res.redirect('/profiles/seller?error=Preencha todos os campos');
    }

    await prisma.sellerProfile.upsert({
        where: {
            userId: req.session.user.id
        },
        update: {
            storeName,
            description,
            commercialPhone,
            city,
            state,
            categories
        },
        create: {
            userId: req.session.user.id,
            storeName,
            description,
            commercialPhone,
            city,
            state,
            categories
        }
    });

    return res.redirect('/profiles/seller?success=Perfil atualizado com sucesso');
});

/* PERFIL PÚBLICO DO VENDEDOR */
router.get('/sellers/:id', async (req: Request, res: Response) => {
    const sellerId = Number(req.params.id);

    const seller = await prisma.user.findUnique({
        where: {
            id: sellerId
        },
        include: {
            sellerProfile: true,
            products: {
                include: {
                    images: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!seller) {
        return res.render('error', {
            message: 'Vendedor não encontrado.'
        });
    }

    if (seller.role !== 'vendedor') {
        return res.render('error', {
            message: 'Este usuário não é vendedor.'
        });
    }

    return res.render('public-seller-profile', {
        seller,
        user: req.session.user
    });
});

export default router;