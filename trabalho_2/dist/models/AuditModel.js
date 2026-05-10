"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
exports.listAll = listAll;
const prisma_1 = __importDefault(require("../config/prisma"));
async function log(userId, method, route, resumo) {
    await prisma_1.default.auditLog.create({ data: { userId, method, route, resumo } });
}
async function listAll() {
    return prisma_1.default.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
}
