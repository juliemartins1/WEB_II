import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { commentPhotoUpload, fileUrl } from '../config/upload';

const router = Router();

router.post('/products/:id/comments', commentPhotoUpload.single('commentPhoto'), async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const productId = Number(req.params.id);
    const { text } = req.body;

    if (!text || text.trim().length < 2) {
        return res.redirect(`/products/${productId}`);
    }

    await prisma.comment.create({
        data: {
            text: text.trim(),
            photoUrl: req.file ? fileUrl(req.file) : null,
            productId,
            userId: req.session.user.id
        }
    });

    return res.redirect(`/products/${productId}`);
});

router.post('/comments/:id/edit', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const id = Number(req.params.id);
    const { text } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.render('error', { message: 'Comentário não encontrado.' });

    if (comment.userId !== req.session.user.id) {
        return res.status(403).render('error', { message: 'Você só pode editar seus próprios comentários.' });
    }

    if (!text || text.trim().length < 2) {
        return res.redirect(`/products/${comment.productId}`);
    }

    await prisma.comment.update({ where: { id }, data: { text: text.trim() } });
    return res.redirect(`/products/${comment.productId}`);
});

router.post('/comments/:id/delete', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const id = Number(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) return res.render('error', { message: 'Comentário não encontrado.' });

    const isOwner = comment.userId === req.session.user.id;
    const isAdmin = req.session.user.tipo_usuario === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).render('error', { message: 'Você não tem permissão para excluir este comentário.' });
    }

    await prisma.comment.delete({ where: { id } });
    return res.redirect(`/products/${comment.productId}`);
});

router.post('/comments/:id/like', async (req: Request, res: Response) => {
    if (!req.session.user) return res.redirect('/login');

    const id = Number(req.params.id);

    const existing = await prisma.commentLike.findUnique({
        where: {
            commentId_userId: {
                commentId: id,
                userId: req.session.user.id
            }
        }
    });

    if (existing) {
        await prisma.commentLike.delete({ where: { id: existing.id } });
    } else {
        await prisma.commentLike.create({ data: { commentId: id, userId: req.session.user.id } });
    }

    return res.redirect('back');
});

export default router;