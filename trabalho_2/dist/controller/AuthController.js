"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exibirSignup = exibirSignup;
exports.signup = signup;
exports.exibirVerificarEmail = exibirVerificarEmail;
exports.verificarEmail = verificarEmail;
exports.reenviarCodigo = reenviarCodigo;
exports.exibirLogin = exibirLogin;
exports.login = login;
exports.logout = logout;
const UserModel = __importStar(require("../models/UserModel"));
const mailer_1 = require("../config/mailer");
function exibirSignup(req, res) {
    return res.render('signup', {
        error: null
    });
}
async function signup(req, res) {
    const { name, email, password, tipo_usuario } = req.body;
    if (!name || !email || !password || !tipo_usuario) {
        return res.render('signup', {
            error: 'Preencha todos os campos.'
        });
    }
    if (!['comprador', 'vendedor'].includes(tipo_usuario)) {
        return res.render('signup', {
            error: 'Tipo de usuário inválido.'
        });
    }
    if (await UserModel.findByEMail(email)) {
        return res.render('signup', {
            error: 'Email já cadastrado.'
        });
    }
    const userId = await UserModel.criar(name, email, password, tipo_usuario);
    const code = await UserModel.criarCodigoVerificacao(userId);
    console.log('GEROU CÓDIGO:', code);
    try {
        await (0, mailer_1.enviarVerificacaoEmail)(email, code);
    }
    catch {
        console.log(`[DEV] Código de verificação para ${email}: ${code}`);
    }
    req.session.verificacaoPendente = { userId, email };
    return res.redirect('/verify-email');
}
function exibirVerificarEmail(req, res) {
    if (!req.session.verificacaoPendente) {
        return res.redirect('/signup');
    }
    return res.render('verify-email', {
        error: null,
        email: req.session.verificacaoPendente.email,
        resent: false
    });
}
async function verificarEmail(req, res) {
    const pendente = req.session.verificacaoPendente;
    if (!pendente) {
        return res.redirect('/signup');
    }
    const { code } = req.body;
    const result = await UserModel.validarCodigo(pendente.userId, code);
    if (result === 'invalido') {
        return res.render('verify-email', {
            error: 'Código inválido.',
            email: pendente.email,
            resent: false
        });
    }
    if (result === 'expirado') {
        return res.render('verify-email', {
            error: 'Código expirado. Reenvie um novo código.',
            email: pendente.email,
            resent: false
        });
    }
    await UserModel.setEmailVerificado(pendente.userId);
    delete req.session.verificacaoPendente;
    return res.redirect('/login?verified=1');
}
async function reenviarCodigo(req, res) {
    const pendente = req.session.verificacaoPendente;
    if (!pendente) {
        return res.redirect('/signup');
    }
    const code = await UserModel.criarCodigoVerificacao(pendente.userId);
    try {
        await (0, mailer_1.enviarVerificacaoEmail)(pendente.email, code);
    }
    catch {
        console.log(`[DEV] Código reenviado para ${pendente.email}: ${code}`);
    }
    return res.render('verify-email', {
        error: null,
        email: pendente.email,
        resent: true
    });
}
function exibirLogin(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    return res.render('login', {
        error: null,
        verified: req.query.verified === '1'
    });
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('login', {
            error: 'Informe email e senha.',
            verified: false
        });
    }
    const user = await UserModel.findByEMail(email);
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
        return res.redirect('/verify-email');
    }
    req.session.user = {
        id: user.id,
        name: user.name,
        tipo_usuario: user.tipo_usuario
    };
    return res.redirect('/dashboard');
}
function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}
