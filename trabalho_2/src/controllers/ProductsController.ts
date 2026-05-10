import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { fileUrl } from '../config/upload';

const categoriasValidas = [
    'Eletrônicos',
    'Casa e decoração',
    'Moda',
    'Esportes',
    'Beleza',
    'Automotivo',
    'Outros'
];

class ProductController {

    /* LISTAR PRODUTOS DO VENDEDOR */
    static async index(req: Request, res: Response) {

        try {

            if (!req.session.user) {
                return res.redirect('/login');
            }

            const sellerId = Number(req.session.user.id);

            const products = await prisma.product.findMany({
                where: {
                    userId: sellerId
                },
                include: {
                    images: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.render('manage-products', {
                products,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {

            console.error(error);

            return res.render('error', {
                message: 'Erro ao carregar produtos.'
            });

        }

    }

    /* FORMULÁRIO DE EDIÇÃO */
    static async editForm(req: Request, res: Response) {

        try {

            if (!req.session.user) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);

            const product = await prisma.product.findUnique({
                where: {
                    id: productId
                },
                include: {
                    images: true
                }
            });

            if (!product) {
                return res.render('error', {
                    message: 'Produto não encontrado.'
                });
            }

            return res.render('edit-product', {
                product,
                categoriasValidas,
                user: req.session.user
            });

        } catch (error) {

            console.error(error);

            return res.render('error', {
                message: 'Erro ao carregar produto.'
            });

        }

    }

    /* ATUALIZAR PRODUTO */
    static async update(req: Request, res: Response) {

        try {

            if (!req.session.user) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user.id);

            const {
                name,
                description,
                category,
                price,
                stock
            } = req.body;

            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId: sellerId
                }
            });

            if (!product) {
                return res.render('error', {
                    message: 'Produto não encontrado ou não pertence a este vendedor.'
                });
            }

            await prisma.product.update({
                where: {
                    id: productId
                },
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

                await prisma.productImage.deleteMany({
                    where: {
                        productId
                    }
                });

                for (let i = 0; i < files.length; i++) {

                    const imageUrl = fileUrl(files[i]);

                    if (!imageUrl) continue;

                    await prisma.productImage.create({
                        data: {
                            productId,
                            imageUrl,
                            isMain: i === 0
                        }
                    });

                    if (i === 0) {

                        await prisma.product.update({
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

            return res.redirect('/seller/products?success=Produto atualizado com sucesso');

        } catch (error) {

            console.error('Erro ao atualizar produto:', error);

            return res.redirect('/seller/products?error=Erro ao atualizar produto');

        }

    }

    /* EXCLUIR PRODUTO */
    static async delete(req: Request, res: Response) {

        try {

            if (!req.session.user) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user.id);

            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId: sellerId
                }
            });

            if (!product) {
                return res.render('error', {
                    message: 'Produto não encontrado ou não pertence a este vendedor.'
                });
            }

            const comments = await prisma.comment.findMany({
                where: {
                    productId
                }
            });

            for (const comment of comments) {

                await prisma.commentLike.deleteMany({
                    where: {
                        commentId: comment.id
                    }
                });

            }

            await prisma.comment.deleteMany({
                where: {
                    productId
                }
            });

            await prisma.productImage.deleteMany({
                where: {
                    productId
                }
            });

            await prisma.product.delete({
                where: {
                    id: productId
                }
            });

            return res.redirect('/seller/products?success=Produto excluído com sucesso');

        } catch (error) {

            console.error('Erro ao excluir produto:', error);

            return res.redirect('/seller/products?error=Erro ao excluir produto');

        }

    }

}

export default ProductController;