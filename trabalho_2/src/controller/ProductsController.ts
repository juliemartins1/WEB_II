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

function usuarioEhVendedor(req: Request) {
    return req.session.user && req.session.user.tipo_usuario === 'vendedor';
}

function validarProduto(body: any) {
    const { name, description, category, price, stock } = body;

    if (!name || !description || !category || price === undefined || price === '' || stock === undefined || stock === '') {
        return 'Preencha todos os campos obrigatórios.';
    }

    if (!categoriasValidas.includes(category)) {
        return 'Categoria inválida.';
    }

    const priceNumber = Number(String(price).replace(',', '.'));
    const stockNumber = Number(stock);

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
        return 'Preço inválido.';
    }

    if (Number.isNaN(stockNumber) || stockNumber < 0) {
        return 'Estoque inválido.';
    }

    return null;
}


router.get(['/', '/marketplace'], async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        where: { active: true },
        include: {
            user: { include: { sellerProfile: true } },
            images: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.render('index', {
        products,
        user: req.session.user
    });
});


router.get('/categories', async (req: Request, res: Response) => {
    const categoriaSelecionada = req.query.category as string | undefined;

    const products = await prisma.product.findMany({
        where: {
            active: true,
            ...(categoriaSelecionada ? { category: categoriaSelecionada } : {})
        },
        include: {
            user: { include: { sellerProfile: true } },
            images: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.render('categories', {
        user: req.session.user,
        products,
        categorias: categoriasValidas,
        categoriaSelecionada
    });
});

router.get('/seller/products/new', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    if (!usuarioEhVendedor(req)) {
        return res.render('error', {
            message: 'Apenas vendedores podem cadastrar produtos.'
        });
    }

    return res.render('product-form', {
        user: req.session.user,
        product: null,
        error: req.query.error || null
    });
});


router.post(
    '/seller/products',
    productImagesUpload.array('images', 5),
    async (req: Request, res: Response) => {
        try {
            if (!req.session.user) return res.redirect('/login');

            if (!usuarioEhVendedor(req)) {
                return res.render('error', {
                    message: 'Apenas vendedores podem cadastrar produtos.'
                });
            }

            const erroValidacao = validarProduto(req.body);

            if (erroValidacao) {
                return res.redirect(`/seller/products/new?error=${encodeURIComponent(erroValidacao)}`);
            }

            const { name, description, category, price, stock } = req.body;

            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    category,
                    price: Number(String(price).replace(',', '.')),
                    stock: Number(stock),
                    active: true,
                    userId: Number(req.session.user.id)
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
                            where: { id: product.id },
                            data: { imageUrl }
                        });
                    }
                }
            }

            return res.redirect('/seller/dashboard?success=Produto criado com sucesso');
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            return res.redirect('/seller/dashboard?error=Erro ao criar produto');
        }
    }
);


router.get('/seller/products/:id/edit', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    if (!usuarioEhVendedor(req)) {
        return res.render('error', {
            message: 'Apenas vendedores podem editar produtos.'
        });
    }

    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        },
        include: { images: true }
    });

    if (!product) {
        return res.redirect('/seller/dashboard?error=Produto não encontrado');
    }

    return res.render('product-form', {
        user: req.session.user,
        product,
        error: req.query.error || null
    });
});


router.post(
    '/seller/products/:id/edit',
    productImagesUpload.array('images', 5),
    async (req: Request, res: Response) => {
        try {
            if (!req.session.user) return res.redirect('/login');

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user.id);

            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId: sellerId
                },
                include: { images: true }
            });

            if (!product) {
                return res.redirect('/seller/dashboard?error=Produto não encontrado');
            }

            const erroValidacao = validarProduto(req.body);

            if (erroValidacao) {
                return res.redirect(`/seller/products/${productId}/edit?error=${encodeURIComponent(erroValidacao)}`);
            }

            const { name, description, category, price, stock } = req.body;

            await prisma.product.update({
                where: { id: productId },
                data: {
                    name,
                    description,
                    category,
                    price: Number(String(price).replace(',', '.')),
                    stock: Number(stock)
                }
            });

            const files = req.files as Express.Multer.File[] | undefined;

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const imageUrl = fileUrl(files[i]);
                    if (!imageUrl) continue;

                    await prisma.productImage.create({
                        data: {
                            productId,
                            imageUrl,
                            isMain: product.images.length === 0 && i === 0
                        }
                    });

                    if (product.images.length === 0 && i === 0) {
                        await prisma.product.update({
                            where: { id: productId },
                            data: { imageUrl }
                        });
                    }
                }
            }

            return res.redirect('/seller/dashboard?success=Produto atualizado com sucesso');
        } catch (error) {
            console.error(error);
            return res.redirect('/seller/dashboard?error=Erro ao atualizar produto');
        }
    }
);

/* ATIVAR / DESATIVAR */
router.post('/seller/products/:id/toggle', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        }
    });

    if (!product) {
        return res.redirect('/seller/dashboard?error=Produto não encontrado');
    }

    await prisma.product.update({
        where: { id: productId },
        data: { active: !product.active }
    });

    return res.redirect('/seller/dashboard?success=Status atualizado');
});

/* EXCLUIR PRODUTO */
router.post('/seller/products/:id/delete', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        }
    });

    if (!product) {
        return res.redirect('/seller/dashboard?error=Produto não encontrado');
    }

    await prisma.product.delete({
        where: { id: productId }
    });

    return res.redirect('/seller/dashboard?success=Produto excluído com sucesso');
});

/* DETALHES DO PRODUTO */
router.get('/products/:id', async (req: Request, res: Response) => {
    const productId = Number(req.params.id);

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            user: { include: { sellerProfile: true } },
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