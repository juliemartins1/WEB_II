import { Request, Response } from 'express';
import * as UserModel from '../models/UserModel';
import * as AuditModel from '../models/AuditModel';
import { enviarVerificacaoEmail } from '../config/mailer';

export function listarUsuarios(req: Request, res: Response) {
    const search = (req.query.q as string) || '';
    let users = UserModel.listAll();

    if (search) {
        const q = search.toLowerCase();
        users = users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.tipo_usuario.toLowerCase().includes(q)
        );
    }

    res.render('users', { users, search, user: req.session.user });
}

export function alternarStatusUsuario(req: Request, res: Response) {
    const id = Number(req.params.id);
    const target = UserModel.findById(id);

    if (!target) {
        return res.redirect('/admin/users');
    }

    // Não permite desativar o próprio usuário logado
    if (id === req.session.user!.id) {
        return res.redirect('/admin/users');
    }

    UserModel.setAtivo(id, !target.ativo);
    return res.redirect('/admin/users');
}

export function exibirCriarUsuario(req: Request, res: Response) {
    res.render('create-user', {
        error: null,
        sucesso: null,
        user: req.session.user
    });
}

export async function criarUsuario(req: Request, res: Response) {
    const { name, email, password, tipo_usuario } = req.body;

    if (!name || !email || !password || !tipo_usuario) {
        return res.render('create-user', {
            error: 'Preencha todos os campos.',
            sucesso: null,
            user: req.session.user
        });
    }

    if (!['admin', 'vendedor', 'comprador'].includes(tipo_usuario)) {
        return res.render('create-user', {
            error: 'Perfil inválido.',
            sucesso: null,
            user: req.session.user
        });
    }

    if (UserModel.findByEMail(email)) {
        return res.render('create-user', {
            error: 'Email já cadastrado.',
            sucesso: null,
            user: req.session.user
        });
    }

    const userId = UserModel.criar(name, email, password, tipo_usuario);
    const code = UserModel.criarCodigoVerificacao(userId);

    try {
        await enviarVerificacaoEmail(email, code);
    } catch {
        console.log(`[DEV] Código de verificação para ${email}: ${code}`);
    }

    return res.render('create-user', {
        error: null,
        sucesso: `Usuário ${email} criado com sucesso. Um código de verificação foi enviado por e-mail.`,
        user: req.session.user
    });
}

export function listarLogs(req: Request, res: Response) {
    const logs = AuditModel.listAll();
    res.render('logs', { logs, user: req.session.user });
}