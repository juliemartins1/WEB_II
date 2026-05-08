import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export type TipoUsuario = 'admin' | 'comprador' | 'vendedor';

export async function findByEMail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
}

export async function listAll() {
    return prisma.user.findMany({
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

export async function criar(name: string, email: string, password: string, tipo_usuario: TipoUsuario) {
    const hash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
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

export function verificarPassword(plain: string, hash: string) {
    return bcrypt.compareSync(plain, hash);
}

export async function setAtivo(id: number, ativo: boolean) {
    await prisma.user.update({ where: { id }, data: { ativo } });
}

export async function setEmailVerificado(id: number) {
    await prisma.user.update({ where: { id }, data: { email_verificado: true } });
}

export async function criarCodigoVerificacao(userId: number) {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.verificationCode.create({
        data: { userId, code, expiraEm }
    });

    return code;
}

export async function validarCodigo(userId: number, code: string): Promise<'ok' | 'expirado' | 'invalido'> {
    const row = await prisma.verificationCode.findFirst({
        where: { userId, code, usado: false },
        orderBy: { id: 'desc' }
    });

    if (!row) return 'invalido';
    if (row.expiraEm < new Date()) return 'expirado';

    await prisma.verificationCode.update({ where: { id: row.id }, data: { usado: true } });
    return 'ok';
}