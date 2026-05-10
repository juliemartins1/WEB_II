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

function isSeller(req: Request) {
    return req.session.user && req.session.user.tipo_usuario === 'vendedor';
}

class ProductController {
    static async index(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const sellerId = Number(req.session.user!.id);

            const products = await prisma.product.findMany({
                where: { userId: sellerId },
                include: { images: true },
                orderBy: { createdAt: 'desc' }
            });

            return res.render('manage-products', {
                products,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return res.render('error', { message: 'Erro ao carregar produtos.' });
        }
    }

    static async createForm(req: Request, res: Response) {
        if (!isSeller(req)) {
            return res.redirect('/login');
        }

        return res.render('product-form', {
            user: req.session.user,
            categoriasValidas
        });
    }

    static async store(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const sellerId = Number(req.session.user!.id);
            const { name, description, category, price, stock } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            const mainImage = files && files.length > 0 ? fileUrl(files[0]) : null;

            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    category,
                    price: Number(String(price).replace(',', '.')),
                    stock: Number(stock),
                    imageUrl: mainImage,
                    isActive: true,
                    userId: sellerId
                }
            });

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    await prisma.productImage.create({
                        data: {
                            productId: product.id,
                            imageUrl: fileUrl(files[i]),
                            isMain: i === 0
                        }
                    });
                }
            }

            return res.redirect('/seller/products?success=Produto cadastrado com sucesso');
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            return res.redirect('/seller/products?error=Erro ao cadastrar produto');
        }
    }

    static async editForm(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user!.id);

            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId: sellerId
                },
                include: { images: true }
            });

            if (!product) {
                return res.render('error', {
                    message: 'Produto não encontrado ou não pertence a este vendedor.'
                });
            }

            return res.render('edit', {
                product,
                categoriasValidas,
                user: req.session.user
            });
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            return res.render('error', { message: 'Erro ao carregar produto.' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user!.id);
            const { name, description, category, price, stock, isActive } = req.body;

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
                where: { id: productId },
                data: {
                    name,
                    description,
                    category,
                    price: Number(String(price).replace(',', '.')),
                    stock: Number(stock),
                    isActive: isActive === 'true'
                }
            });

            const files = req.files as Express.Multer.File[] | undefined;

            if (files && files.length > 0) {
                await prisma.productImage.deleteMany({
                    where: { productId }
                });

                for (let i = 0; i < files.length; i++) {
                    const imageUrl = fileUrl(files[i]);

                    await prisma.productImage.create({
                        data: {
                            productId,
                            imageUrl,
                            isMain: i === 0
                        }
                    });

                    if (i === 0) {
                        await prisma.product.update({
                            where: { id: productId },
                            data: { imageUrl }
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

    static async toggleStatus(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user!.id);

            const product = await prisma.product.findFirst({
                where: {
                    id: productId,
                    userId: sellerId
                }
            });

            if (!product) {
                return res.redirect('/seller/products?error=Produto não encontrado');
            }

            await prisma.product.update({
                where: { id: productId },
                data: { isActive: !product.isActive }
            });

            const message = product.isActive
                ? 'Produto desativado com sucesso'
                : 'Produto ativado com sucesso';

            return res.redirect(`/seller/products?success=${encodeURIComponent(message)}`);
        } catch (error) {
            console.error('Erro ao alterar status do produto:', error);
            return res.redirect('/seller/products?error=Erro ao alterar status do produto');
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            if (!isSeller(req)) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const sellerId = Number(req.session.user!.id);

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

            const ordersCount = await prisma.order.count({
                where: { productId }
            });

            if (ordersCount > 0) {
                await prisma.product.update({
                    where: { id: productId },
                    data: { isActive: false }
                });

                return res.redirect('/seller/products?error=Este produto possui pedidos. Por segurança, ele foi apenas desativado.');
            }

            await prisma.commentLike.deleteMany({
                where: {
                    comment: {
                        productId
                    }
                }
            });

            await prisma.comment.deleteMany({
                where: { productId }
            });

            await prisma.productImage.deleteMany({
                where: { productId }
            });

            await prisma.product.delete({
                where: { id: productId }
            });

            return res.redirect('/seller/products?success=Produto excluído com sucesso');
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            return res.redirect('/seller/products?error=Erro ao excluir produto');
        }
    }
}

export default ProductController;