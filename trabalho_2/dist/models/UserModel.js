"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEMail = findByEMail;
exports.findById = findById;
exports.listAll = listAll;
exports.criar = criar;
exports.verificarPassword = verificarPassword;
exports.setAtivo = setAtivo;
exports.setEmailVerificado = setEmailVerificado;
exports.criarCodigoVerificacao = criarCodigoVerificacao;
exports.validarCodigo = validarCodigo;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
async function findByEMail(email) {
    return prisma_1.default.user.findUnique({ where: { email } });
}
async function findById(id) {
    return prisma_1.default.user.findUnique({ where: { id } });
}
async function listAll() {
    return prisma_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            tipo_usuario: true,
            ativo: true,
            email_verificado: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
}
async function criar(name, email, password, tipo_usuario) {
    const hash = bcrypt_1.default.hashSync(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hash,
            tipo_usuario,
            email_verificado: false,
            ativo: true
        }
    });
    return user.id;
}
function verificarPassword(plain, hash) {
    return bcrypt_1.default.compareSync(plain, hash);
}
async function setAtivo(id, ativo) {
    await prisma_1.default.user.update({ where: { id }, data: { ativo } });
}
async function setEmailVerificado(id) {
    await prisma_1.default.user.update({ where: { id }, data: { email_verificado: true } });
}
async function criarCodigoVerificacao(userId) {
    const code = crypto_1.default.randomInt(100000, 999999).toString();
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000);
    await prisma_1.default.verificationCode.create({
        data: { userId, code, expiraEm }
    });
    return code;
}
async function validarCodigo(userId, code) {
    const row = await prisma_1.default.verificationCode.findFirst({
        where: { userId, code, usado: false },
        orderBy: { id: 'desc' }
    });
    if (!row)
        return 'invalido';
    if (row.expiraEm < new Date())
        return 'expirado';
    await prisma_1.default.verificationCode.update({ where: { id: row.id }, data: { usado: true } });
    return 'ok';
}
