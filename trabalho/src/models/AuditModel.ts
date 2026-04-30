import db from '../config/db';

export interface AuditLog {
    id: number;
    user_id: number | null;
    method: string;
    route: string;
    resumo: string;
    created_at: string;
}

export interface AuditLogComUsuario extends AuditLog {
    user_name: string | null;
    user_email: string | null;
}

export function log(userId: number | null, method: string, route: string, resumo: string) {
    db.prepare(
        'INSERT INTO audit_logs (user_id, method, route, resumo) VALUES (?, ?, ?, ?)'
    ).run(userId, method, route, resumo);
}

export function listAll() {
    return db.prepare(`
        SELECT audit_logs.id, audit_logs.user_id, audit_logs.method, audit_logs.route, audit_logs.resumo,
               audit_logs.created_at, users.name as user_name, users.email as user_email
        FROM audit_logs
        LEFT JOIN users ON users.id = audit_logs.user_id
        ORDER BY audit_logs.created_at DESC
        LIMIT 200
    `).all() as AuditLogComUsuario[];
}