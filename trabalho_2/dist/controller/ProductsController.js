"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../config/prisma"));
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
const categoriasValidas = [
    'Eletrônicos',
    'Casa e decoração',
    'Moda',
    'Esportes',
    'Beleza',
    'Automotivo',
    'Outros'
];
function usuarioEhVendedor(req) {
    return req.session.user && req.session.user.tipo_usuario === 'vendedor';
}
function validarProduto(body) {
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
/* LISTAR PRODUTOS ATIVOS NA PÁGINA INICIAL / MARKETPLACE */
router.get(['/', '/marketplace'], async (req, res) => {
    const products = await prisma_1.default.product.findMany({
        where: {
            active: true
        },
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
router.get('/seller/products/new', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
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
/* CRIAR PRODUTO */
router.post('/seller/products', upload_1.productImagesUpload.array('images', 5), async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
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
        const sellerId = Number(req.session.user.id);
        const priceNumber = Number(String(price).replace(',', '.'));
        const stockNumber = Number(stock);
        const product = await prisma_1.default.product.create({
            data: {
                name,
                description,
                category,
                price: priceNumber,
                stock: stockNumber,
                active: true,
                userId: sellerId
            }
        });
        const files = req.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const imageUrl = (0, upload_1.fileUrl)(files[i]);
                if (!imageUrl)
                    continue;
                await prisma_1.default.productImage.create({
                    data: {
                        productId: product.id,
                        imageUrl,
                        isMain: i === 0
                    }
                });
                if (i === 0) {
                    await prisma_1.default.product.update({
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
    }
    catch (error) {
        console.error('Erro ao criar produto:', error);
        return res.redirect('/seller/products/new?error=Erro ao cadastrar produto');
    }
});
/* FORMULÁRIO DE EDITAR PRODUTO */
router.get('/seller/products/:id/edit', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!usuarioEhVendedor(req)) {
        return res.render('error', {
            message: 'Apenas vendedores podem editar produtos.'
        });
    }
    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);
    if (Number.isNaN(productId)) {
        return res.redirect('/seller?error=Produto inválido');
    }
    const product = await prisma_1.default.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        },
        include: {
            images: true
        }
    });
    if (!product) {
        return res.redirect('/seller?error=Produto não encontrado ou sem permissão');
    }
    return res.render('product-form', {
        user: req.session.user,
        product,
        error: req.query.error || null
    });
});
/* ATUALIZAR PRODUTO */
router.post('/seller/products/:id/edit', upload_1.productImagesUpload.array('images', 5), async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        if (!usuarioEhVendedor(req)) {
            return res.render('error', {
                message: 'Apenas vendedores podem editar produtos.'
            });
        }
        const productId = Number(req.params.id);
        const sellerId = Number(req.session.user.id);
        if (Number.isNaN(productId)) {
            return res.redirect('/seller?error=Produto inválido');
        }
        const product = await prisma_1.default.product.findFirst({
            where: {
                id: productId,
                userId: sellerId
            },
            include: {
                images: true
            }
        });
        if (!product) {
            return res.redirect('/seller?error=Produto não encontrado ou sem permissão');
        }
        const erroValidacao = validarProduto(req.body);
        if (erroValidacao) {
            return res.redirect(`/seller/products/${productId}/edit?error=${encodeURIComponent(erroValidacao)}`);
        }
        const { name, description, category, price, stock } = req.body;
        const priceNumber = Number(String(price).replace(',', '.'));
        const stockNumber = Number(stock);
        await prisma_1.default.product.update({
            where: {
                id: productId
            },
            data: {
                name,
                description,
                category,
                price: priceNumber,
                stock: stockNumber
            }
        });
        const files = req.files;
        if (files && files.length > 0) {
            const alreadyHasMainImage = product.images.some((image) => image.isMain);
            for (let i = 0; i < files.length; i++) {
                const imageUrl = (0, upload_1.fileUrl)(files[i]);
                if (!imageUrl)
                    continue;
                const isMain = !alreadyHasMainImage && i === 0;
                await prisma_1.default.productImage.create({
                    data: {
                        productId,
                        imageUrl,
                        isMain
                    }
                });
                if (isMain || !product.imageUrl) {
                    await prisma_1.default.product.update({
                        where: {
                            id: productId
                        },
                        data: {
                            imageUrl
                        }
                    });
                }
            }
        }
        return res.redirect('/seller?success=Produto atualizado com sucesso');
    }
    catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return res.redirect(`/seller/products/${req.params.id}/edit?error=Erro ao atualizar produto`);
    }
});
/* ATIVAR OU DESATIVAR PRODUTO */
router.post('/seller/products/:id/toggle', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!usuarioEhVendedor(req)) {
        return res.render('error', {
            message: 'Apenas vendedores podem ativar ou desativar produtos.'
        });
    }
    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);
    if (Number.isNaN(productId)) {
        return res.redirect('/seller?error=Produto inválido');
    }
    const product = await prisma_1.default.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        }
    });
    if (!product) {
        return res.redirect('/seller?error=Produto não encontrado ou sem permissão');
    }
    await prisma_1.default.product.update({
        where: {
            id: productId
        },
        data: {
            active: !product.active
        }
    });
    const mensagem = product.active ? 'Produto desativado com sucesso' : 'Produto ativado com sucesso';
    return res.redirect(`/seller?success=${encodeURIComponent(mensagem)}`);
});
/* EXCLUIR PRODUTO */
router.post('/seller/products/:id/delete', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!usuarioEhVendedor(req)) {
        return res.render('error', {
            message: 'Apenas vendedores podem excluir produtos.'
        });
    }
    const productId = Number(req.params.id);
    const sellerId = Number(req.session.user.id);
    if (Number.isNaN(productId)) {
        return res.redirect('/seller?error=Produto inválido');
    }
    const product = await prisma_1.default.product.findFirst({
        where: {
            id: productId,
            userId: sellerId
        }
    });
    if (!product) {
        return res.redirect('/seller?error=Produto não encontrado ou sem permissão');
    }
    await prisma_1.default.product.delete({
        where: {
            id: productId
        }
    });
    return res.redirect('/seller?success=Produto excluído com sucesso');
});
/* DETALHES DO PRODUTO */
router.get('/products/:id', async (req, res) => {
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
        return res.render('error', {
            message: 'Produto inválido.'
        });
    }
    const product = await prisma_1.default.product.findUnique({
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
    const user = req.session.user;
    const isOwner = user?.tipo_usuario === 'vendedor' && user.id === product.userId;
    const isAdmin = user?.tipo_usuario === 'admin';
    if (!product.active && !isOwner && !isAdmin) {
        return res.render('error', {
            message: 'Este produto está desativado no momento.'
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
exports.default = router;
