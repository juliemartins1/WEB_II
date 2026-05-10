"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const db = new better_sqlite3_1.default(path_1.default.join(__dirname, '../../banco.db'));
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL CHECK(tipo_usuario IN('admin','vendedor','comprador')),
        ativo INTEGER NOT NULL DEFAULT 1,
        email_verificado INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS codigos_verificacao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        expira_em TEXT NOT NULL,
        usado INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        method TEXT NOT NULL,
        route TEXT NOT NULL,
        resumo TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
`);
exports.default = db;
