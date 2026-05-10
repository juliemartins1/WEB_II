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
exports.isAuthenticated = isAuthenticated;
exports.isAdmin = isAdmin;
exports.isTipoUsuario = isTipoUsuario;
exports.auditLog = auditLog;
const AuditModel = __importStar(require("../models/AuditModel"));
const UserModel = __importStar(require("../models/UserModel"));
async function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const user = await UserModel.findById(req.session.user.id);
    if (!user || !user.ativo) {
        req.session.destroy(() => {
            return res.redirect('/login');
        });
        return;
    }
    return next();
}
function isAdmin(req, res, next) {
    if (req.session.user?.tipo_usuario === 'admin')
        return next();
    return res.status(403).render('error', { message: 'Acesso restrito a administrador.' });
}
function isTipoUsuario(...tipo_usuarios) {
    return (req, res, next) => {
        if (req.session.user && tipo_usuarios.includes(req.session.user.tipo_usuario)) {
            return next();
        }
        return res.status(403).render('error', { message: 'Acesso não autorizado para seu perfil.' });
    };
}
function auditLog(resumo) {
    return (req, res, next) => {
        const userId = req.session.user?.id ?? null;
        AuditModel.log(userId, req.method, req.path, resumo).catch(console.error);
        next();
    };
}
