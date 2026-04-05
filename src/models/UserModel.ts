import db from '../config/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    tipo_usuario: 'admin' | 'comprador' | 'vendedor';
    ativo: number;
    email_verificado: number;
    created_at: string;
}

export function findByEMail(email: string) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}


export function findById(id: number) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function listAll() {
    return db.prepare(
        'SELECT id, name, email, tipo_usuario, ativo, email_verificado, created_at FROM users ORDER BY created_at DESC'
    ).all() as Omit<User, 'password'>[];
}

export function criar(
    name: string,
    email: string,
    password: string,
    tipo_usuario: 'admin' | 'comprador' | 'vendedor'
) {
    const hash = bcrypt.hashSync(password, 10);

    const result = db.prepare(
        'INSERT INTO users(name,email,password,tipo_usuario) VALUES(?, ?, ?, ?)'
    ).run(name, email, hash, tipo_usuario);

    return result.lastInsertRowid as number;
}

export function verificarPassword(plain: string, hash: string) {
    return bcrypt.compareSync(plain, hash);
}

export function setAtivo(id: number, ativo: boolean) {
    db.prepare('UPDATE users SET ativo = ? WHERE id = ?').run(ativo ? 1 : 0, id);
}

export function setEmailVerificado(id: number) {
    db.prepare('UPDATE users SET email_verificado = 1 WHERE id = ?').run(id);
}

export function criarCodigoVerificacao(userId: number) {
    const code = crypto.randomInt(100000, 999999).toString();
    const expira_em = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    db.prepare(
        'INSERT INTO codigos_verificacao(user_id, code, expira_em) VALUES (?, ?, ?)'
    ).run(userId, code, expira_em);

    return code;
}

export function validarCodigo(userId: number, code: string): 'ok' | 'expirado' | 'invalido' {
    const row = db.prepare(
        'SELECT * FROM codigos_verificacao WHERE user_id = ? AND code = ? AND usado = 0 ORDER BY id DESC LIMIT 1'
    ).get(userId, code) as { expira_em: string; id: number } | undefined;

    if (!row) return 'invalido';
    if (new Date(row.expira_em) < new Date()) return 'expirado';

    db.prepare('UPDATE codigos_verificacao SET usado = 1 WHERE id = ?').run(row.id);
    return 'ok';
}
