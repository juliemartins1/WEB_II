import { Request, Response, NextFunction } from 'express';
import * as AuditModel from '../models/AuditModel';
import * as UserModel from '../models/UserModel';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const user = UserModel.findById(req.session.user.id);

    if (!user || !user.ativo) {
        req.session.destroy(() => {
            return res.redirect('/login');
        });
        return;
    }

    return next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.session.user?.tipo_usuario === 'admin') return next();

    return res.status(403).render('error', { message: 'Acesso restrito a administrador.' });

}

export function isTipoUsuario(...tipo_usuarios: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.session.user && tipo_usuarios.includes(req.session.user.tipo_usuario)) {
            return next();
        }

        return res.status(403).render('error', { message: 'Acesso não autorizado para seu perfil.' });
    };
}

export function auditLog(resumo: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userId = req.session.user?.id ?? null;
        AuditModel.log(userId, req.method, req.path, resumo);
        next();
    };
}
