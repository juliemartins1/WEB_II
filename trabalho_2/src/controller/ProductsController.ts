import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { productImagesUpload, fileUrl } from '../config/upload'



const router = Router();

/* LISTAR PRODUTOS (marketplace) */
router.get('/marketplace', async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        include: {
            user: {
                include: {
                    sellerProfile: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.render('home', { products });
});

/* FORM CRIAR PRODUTO */
router.get('/seller/products/new', (req: Request, res: Response) => {
    if (!req.session.user || req.session.user.tipo_usuario !== 'vendedor') {
        return res.redirect('/login');
    }

    return res.render('product-form');
});

/* CRIAR PRODUTO + MULTIPLAS FOTOS */
router.post(
    '/seller/products',
    productImagesUpload.array('images', 5),
    async (req: Request, res: Response) => {

        if (!req.session.user) return res.redirect('/login');

        const { name, description, category, price, stock } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                category,
                price: Number(price),
                stock: Number(stock),
                userId: req.session.user.id
            }
        });

        const files = req.files as Express.Multer.File[];

        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                await prisma.productImage.create({
                    data: {
                        productId: product.id,
                        imageUrl: fileUrl(file),
                        isMain: i === 0
                    }
                });
            }

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    imageUrl: fileUrl(files[0])
                }
            });
        }

        return res.redirect('/seller?success=Produto criado');
    }
);

/* DETALHES DO PRODUTO */
router.get('/products/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            user: {
                include: {
                    sellerProfile: true
                }
            },
            images: true,
            comments: {
                include: {
                    user: true,
                    likes: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!product) return res.redirect('/marketplace');

    const totalLikes = product.comments.reduce((acc, c) => acc + c.likes.length, 0);

    return res.render('product-details', {
        product,
        totalLikes,
        user: req.session.user
    });
});

export default router;