import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { productImagesUpload, fileUrl } from '../config/upload';

const router = Router();

const categoriasValidas = [
    'Eletrônicos',
    'Casa e decoração',
    'Moda',
    'Esportes',
    'Beleza',
    'Automotivo',
    'Outros'
];

/* LISTAR PRODUTOS */
router.get(['/', '/marketplace'], async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        include: {
            user: {
                include: {
                    sellerProfile: true
                }
            },
            images: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return res.render('index', {
        products,
        user: req.session.user
    });
});

/* FORMULÁRIO DE NOVO PRODUTO */
router.get('/seller/products/new', async (req: Request, res: Response) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.tipo_usuario !== 'vendedor') {
        return res.render('error', {
            message: 'Apenas vendedores podem cadastrar produtos.'
        });
    }

    return res.render('product-form', {
        user: req.session.user,
        error: req.query.error
    });
});

/* CRIAR PRODUTO */
router.post(
    '/seller/products',
    productImagesUpload.array('images', 5),
    async (req: Request, res: Response) => {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }

            if (req.session.user.tipo_usuario !== 'vendedor') {
                return res.render('error', {
                    message: 'Apenas vendedores podem cadastrar produtos.'
                });
            }

            const { name, description, category, price, stock } = req.body;

            if (!name || !description || !category || price === undefined || price === '' || stock === undefined || stock === '') {
                return res.redirect('/seller/products/new?error=Preencha todos os campos');
            }

            if (!categoriasValidas.includes(category)) {
                return res.redirect('/seller/products/new?error=Categoria inválida');
            }

            const sellerId = Number(req.session.user.id);

            const seller = await prisma.user.findUnique({
                where: {
                    id: sellerId
                }
            });

            if (!seller) {
                req.session.destroy(() => { });
                return res.redirect('/login');
            }

            const priceNumber = Number(String(price).replace(',', '.'));
            const stockNumber = Number(stock);

            if (Number.isNaN(priceNumber) || priceNumber <= 0) {
                return res.redirect('/seller/products/new?error=Preço inválido');
            }

            if (Number.isNaN(stockNumber) || stockNumber < 0) {
                return res.redirect('/seller/products/new?error=Estoque inválido');
            }

            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    category,
                    price: priceNumber,
                    stock: stockNumber,
                    userId: sellerId
                }
            });

            const files = req.files as Express.Multer.File[] | undefined;

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const imageUrl = fileUrl(files[i]);

                    if (!imageUrl) continue;

                    await prisma.productImage.create({
                        data: {
                            productId: product.id,
                            imageUrl,
                            isMain: i === 0
                        }
                    });

                    if (i === 0) {
                        await prisma.product.update({
                            where: {
                                id: product.id
                            },
                            data: {
                                imageUrl
                            }
                        });
                    }
                }
            }

            return res.redirect('/seller?success=Produto criado com sucesso');
        } catch (error) {
            console.error('Erro ao criar produto:', error);

            return res.redirect('/seller/products/new?error=Erro ao cadastrar produto');
        }
    }
);

/* DETALHES DO PRODUTO */
router.get('/products/:id', async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
        return res.render('error', {
            message: 'Produto inválido.'
        });
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        include: {
            user: {
                include: {
                    sellerProfile: true
                }
            },
            images: {
                orderBy: {
                    isMain: 'desc'
                }
            },
            comments: {
                include: {
                    user: true,
                    likes: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!product) {
        return res.render('error', {
            message: 'Produto não encontrado.'
        });
    }

    const totalLikes = product.comments.reduce((total, comment) => {
        return total + comment.likes.length;
    }, 0);

    return res.render('product-details', {
        product,
        totalLikes,
        user: req.session.user
    });
});

export default router;