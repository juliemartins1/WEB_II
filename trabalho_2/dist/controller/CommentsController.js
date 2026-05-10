"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../config/prisma"));
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
router.post('/products/:id/comments', upload_1.commentPhotoUpload.single('commentPhoto'), async (req, res) => {
    if (!req.session.user)
        return res.redirect('/login');
    const productId = Number(req.params.id);
    const { text } = req.body;
    if (!text || text.trim().length < 2) {
        return res.redirect(`/products/${productId}`);
    }
    await prisma_1.default.comment.create({
        data: {
            text: text.trim(),
            photoUrl: req.file ? (0, upload_1.fileUrl)(req.file) : null,
            productId,
            userId: req.session.user.id
        }
    });
    return res.redirect(`/products/${productId}`);
});
router.post('/comments/:id/edit', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/login');
    const id = Number(req.params.id);
    const { text } = req.body;
    const comment = await prisma_1.default.comment.findUnique({ where: { id } });
    if (!comment)
        return res.render('error', { message: 'Comentário não encontrado.' });
    if (comment.userId !== req.session.user.id) {
        return res.status(403).render('error', { message: 'Você só pode editar seus próprios comentários.' });
    }
    if (!text || text.trim().length < 2) {
        return res.redirect(`/products/${comment.productId}`);
    }
    await prisma_1.default.comment.update({ where: { id }, data: { text: text.trim() } });
    return res.redirect(`/products/${comment.productId}`);
});
router.post('/comments/:id/delete', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/login');
    const id = Number(req.params.id);
    const comment = await prisma_1.default.comment.findUnique({ where: { id } });
    if (!comment)
        return res.render('error', { message: 'Comentário não encontrado.' });
    const isOwner = comment.userId === req.session.user.id;
    const isAdmin = req.session.user.tipo_usuario === 'admin';
    if (!isOwner && !isAdmin) {
        return res.status(403).render('error', { message: 'Você não tem permissão para excluir este comentário.' });
    }
    await prisma_1.default.comment.delete({ where: { id } });
    return res.redirect(`/products/${comment.productId}`);
});
router.post('/comments/:id/like', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/login');
    const id = Number(req.params.id);
    const existing = await prisma_1.default.commentLike.findUnique({
        where: {
            commentId_userId: {
                commentId: id,
                userId: req.session.user.id
            }
        }
    });
    if (existing) {
        await prisma_1.default.commentLike.delete({ where: { id: existing.id } });
    }
    else {
        await prisma_1.default.commentLike.create({ data: { commentId: id, userId: req.session.user.id } });
    }
    return res.redirect('back');
});
exports.default = router;
