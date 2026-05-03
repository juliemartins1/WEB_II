import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { commentPhotoUpload, fileUrl } from '../config/upload';

const router = Router();

/* CRIAR COMENTÁRIO */
router.post(
    '/products/:id/comments',
    commentPhotoUpload.single('commentPhoto'),
    async (req: Request, res: Response) => {

        if (!req.session.user) return res.redirect('/login');

        const productId = Number(req.params.id);
        const { text } = req.body;

        let photoUrl: string | null = null;

        if (req.file) {
            photoUrl = fileUrl(req.file);
        }

        await prisma.comment.create({
            data: {
                text,
                photoUrl,
                productId,
                userId: req.session.user.id
            }
        });

        return res.redirect(`/products/${productId}`);
    }
);

/* CURTIR / DESCURTIR */
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
        await prisma.commentLike.delete({
            where: { id: existing.id }
        });
    } else {
        await prisma.commentLike.create({
            data: {
                commentId: id,
                userId: req.session.user.id
            }
        });
    }

    return res.redirect('back');
});

export default router;