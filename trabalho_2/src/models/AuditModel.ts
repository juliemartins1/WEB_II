import prisma from '../config/prisma';

export async function log(userId: number | null, method: string, route: string, resumo: string) {
    await prisma.auditLog.create({ data: { userId, method, route, resumo } });
}

export async function listAll() {
    return prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
}