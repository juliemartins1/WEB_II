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
exports.listarUsuarios = listarUsuarios;
exports.alternarStatusUsuario = alternarStatusUsuario;
exports.exibirCriarUsuario = exibirCriarUsuario;
exports.criarUsuario = criarUsuario;
exports.listarLogs = listarLogs;
const UserModel = __importStar(require("../models/UserModel"));
const AuditModel = __importStar(require("../models/AuditModel"));
const mailer_1 = require("../config/mailer");
async function listarUsuarios(req, res) {
    const search = req.query.q || '';
    let users = await UserModel.listAll();
    if (search) {
        const q = search.toLowerCase();
        users = users.filter(u => u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.tipo_usuario.toLowerCase().includes(q));
    }
    res.render('users', { users, search, user: req.session.user });
}
async function alternarStatusUsuario(req, res) {
    const id = Number(req.params.id);
    const target = await UserModel.findById(id);
    if (!target) {
        return res.redirect('/admin/users');
    }
    if (id === req.session.user.id) {
        return res.redirect('/admin/users');
    }
    await UserModel.setAtivo(id, !target.ativo);
    return res.redirect('/admin/users');
}
function exibirCriarUsuario(req, res) {
    res.render('create-user', {
        error: null,
        sucesso: null,
        user: req.session.user
    });
}
async function criarUsuario(req, res) {
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
    if (await UserModel.findByEMail(email)) {
        return res.render('create-user', {
            error: 'Email já cadastrado.',
            sucesso: null,
            user: req.session.user
        });
    }
    const userId = await UserModel.criar(name, email, password, tipo_usuario);
    const code = await UserModel.criarCodigoVerificacao(userId);
    try {
        await (0, mailer_1.enviarVerificacaoEmail)(email, code);
    }
    catch {
        console.log(`[DEV] Código de verificação para ${email}: ${code}`);
    }
    return res.render('create-user', {
        error: null,
        sucesso: `Usuário ${email} criado com sucesso. Um código de verificação foi enviado por e-mail.`,
        user: req.session.user
    });
}
async function listarLogs(req, res) {
    const logs = await AuditModel.listAll();
    res.render('logs', { logs, user: req.session.user });
}
