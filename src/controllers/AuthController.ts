import { Request, Response } from 'express';
import * as UserModel from '../models/UserModel';
import { enviarVerificacaoEmail } from '../config/mailer';

export function exibirCadastro(req: Request, res: Response) {
    res.render('signup', { error: null });

}
export async function cadastrar(req: Request, res: Response) {
    const { name, email, password, confirm_password, tipo_usuario } = req.body;

    if (!name || !email || !password || !confirm_password || !tipo_usuario) {
        return res.render('signup', { error: 'Preencha todos os campos.' });
    }

    if (password !== confirm_password) {
        return res.render('signup', { error: 'As senhas não coincidem.' });
    }

    if (!['vendedor', 'comprador'].includes(tipo_usuario)) {
        return res.render('signup', { error: 'Tipo de conta inválido.' });
    }

    if (UserModel.findByEMail(email)) {
        return res.render('signup', { error: 'E-mail já cadastrado.' });
    }
    const userId = UserModel.criar(name, email, password, tipo_usuario);

    const code = UserModel.criarCodigoVerificacao(userId);

    console.log('GEROU CÓDIGO:', code);

    await enviarVerificacaoEmail(email, code);

    req.session.verificacaoPendente = { userId, email };
    return res.redirect('verify-email');
}

export function exibirVerificarEmail(req: Request, res: Response) {
    if (!req.session.verificacaoPendente) {
        return res.redirect('signup');
    }

    return res.render('verify-email', {
        error: null,
        email: req.session.verificacaoPendente.email
    });
}

export function verificarEmail(req: Request, res: Response) {
    const pendente = req.session.verificacaoPendente;

    if (!pendente) {
        return res.redirect('signup');
    }

    const { code } = req.body;
    const result = UserModel.validarCodigo(pendente.userId, code);

    if (result === 'invalido') {
        return res.render('verify-email', {
            error: 'Código inválido.',
            email: pendente.email
        });
    }

    if (result === 'expirado') {
        return res.render('verify-email', {
            error: 'Código expirado. Reenvie um novo código.',
            email: pendente.email
        });
    }

    UserModel.setEmailVerificado(pendente.userId);
    delete req.session.verificacaoPendente;

    return res.redirect('login?verified=1');
}

export async function reenviarCodigo(req: Request, res: Response) {
    const pendente = req.session.verificacaoPendente;

    if (!pendente) {
        return res.redirect('signup');
    }

    const code = UserModel.criarCodigoVerificacao(pendente.userId);
    await enviarVerificacaoEmail(pendente.email, code);

    return res.render('verify-email', {
        error: null,
        email: pendente.email,
        resent: true
    });
}

export function exibirLogin(req: Request, res: Response) {
    if (req.session.user) {
        return res.redirect('dashboard');
    }

    return res.render('login', {
        error: null,
        verified: req.query.verified === '1'
    });
}

export function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = UserModel.findByEMail(email);

    if (!user || !UserModel.verificarPassword(password, user.password)) {
        return res.render('login', {
            error: 'Email ou senha inválidos.',
            verified: false
        });
    }

    if (!user.ativo) {
        return res.render('login', {
            error: 'Sua conta está desativada.',
            verified: false
        });
    }

    if (!user.email_verificado) {
        req.session.verificacaoPendente = {
            userId: user.id,
            email: user.email
        };
        return res.redirect('verify-email');
    }

    req.session.user = {
        id: user.id,
        name: user.name,
        tipo_usuario: user.tipo_usuario
    };

    return res.redirect('dashboard');
}

export function logout(req: Request, res: Response) {
    req.session.destroy(() => res.redirect('login'));
}
