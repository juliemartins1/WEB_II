import { Request, Response, NextFunction } from 'express';
import * as AuditModel from '../models/AuditModel';

export async function requestLogger(req: Request, res: Response, next: NextFunction) {
    try {
        if (
            req.session.user &&
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
        ) {
            await AuditModel.log(
                req.session.user.id,
                req.method,
                req.originalUrl,
                `Ação realizada em ${req.originalUrl}`
            );
        }
    } catch (error) {
        console.log('Erro ao registrar log automático:', error);
    }

    next();
}