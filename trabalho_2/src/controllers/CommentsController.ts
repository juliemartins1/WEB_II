import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { commentImageUpload, fileUrl } from '../config/upload';

const router = Router();

/* CRIAR COMENTÁRIO */
router.post(
    '/products/:id/comments',
    commentImageUpload.single('photo'),
    async (req: Request, res: Response) => {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }

            const productId = Number(req.params.id);
            const { text } = req.body;

            if (Number.isNaN(productId)) {
                return res.render('error', {
                    message: 'Produto inválido.'
                });
            }

            if (!text || text.trim() === '') {
                return res.redirect(`/products/${productId}`);
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

            const file = req.file as Express.Multer.File | undefined;

            await prisma.comment.create({
                data: {
                    text: text.trim(),
                    photoUrl: file ? fileUrl(file) : null,
                    productId,
                    userId: req.session.user.id
                }
            });

            return res.redirect(`/products/${productId}`);
        } catch (error) {
            console.error('Erro ao criar comentário:', error);

            return res.render('error', {
                message: 'Erro ao salvar comentário.'
            });
        }
    }
);

/* CURTIR OU REMOVER CURTIDA */
router.post('/comments/:id/like', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const commentId = Number(req.params.id);

        if (Number.isNaN(commentId)) {
            return res.render('error', {
                message: 'Comentário inválido.'
            });
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            },
            include: {
                product: true
            }
        });

        if (!comment) {
            return res.render('error', {
                message: 'Comentário não encontrado.'
            });
        }

        const existingLike = await prisma.commentLike.findUnique({
            where: {
                commentId_userId: {
                    commentId,
                    userId: req.session.user.id
                }
            }
        });

        if (existingLike) {
            await prisma.commentLike.delete({
                where: {
                    id: existingLike.id
                }
            });
        } else {
            await prisma.commentLike.create({
                data: {
                    commentId,
                    userId: req.session.user.id
                }
            });
        }

        return res.redirect(`/products/${comment.productId}`);
    } catch (error) {
        console.error('Erro ao curtir comentário:', error);

        return res.render('error', {
            message: 'Erro ao curtir comentário.'
        });
    }
});

/* EXCLUIR COMENTÁRIO */
router.post('/comments/:id/delete', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const commentId = Number(req.params.id);

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        });

        if (!comment) {
            return res.render('error', {
                message: 'Comentário não encontrado.'
            });
        }

        const isAuthor = comment.userId === req.session.user.id;
        const isAdmin = req.session.user.tipo_usuario === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.render('error', {
                message: 'Você não tem permissão para remover este comentário.'
            });
        }

        const productId = comment.productId;

        await prisma.comment.delete({
            where: {
                id: commentId
            }
        });

        return res.redirect(`/products/${productId}`);
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);

        return res.render('error', {
            message: 'Erro ao excluir comentário.'
        });
    }
});
router.post('/comments/:id/edit', async (req: Request, res: Response) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const commentId = Number(req.params.id);
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.render('error', {
                message: 'O comentário não pode ficar vazio.'
            });
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        });

        if (!comment) {
            return res.render('error', {
                message: 'Comentário não encontrado.'
            });
        }

        if (comment.userId !== req.session.user.id) {
            return res.render('error', {
                message: 'Você só pode editar seus próprios comentários.'
            });
        }

        await prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                text: text.trim()
            }
        });

        return res.redirect(`/products/${comment.productId}`);
    } catch (error) {
        console.error('Erro ao editar comentário:', error);

        return res.render('error', {
            message: 'Erro ao editar comentário.'
        });
    }
});

export default router;