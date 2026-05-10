"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarDashboard = listarDashboard;
exports.dashboardVendedor = dashboardVendedor;
exports.dashboardComprador = dashboardComprador;
const prisma_1 = __importDefault(require("../config/prisma"));
function listarDashboard(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { tipo_usuario } = req.session.user;
    if (tipo_usuario === 'admin') {
        return res.redirect('/admin/users');
    }
    if (tipo_usuario === 'vendedor') {
        return res.redirect('/seller');
    }
    return res.redirect('/buyer');
}
async function dashboardVendedor(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const sellerId = Number(req.session.user.id);
    const products = await prisma_1.default.product.findMany({
        where: {
            userId: sellerId
        },
        include: {
            images: true,
            comments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    const activeProducts = products.filter((product) => product.active).length;
    return res.render('seller-dashboard', {
        user: req.session.user,
        products,
        activeProducts,
        success: req.query.success || null,
        error: req.query.error || null
    });
}
function dashboardComprador(req, res) {
    return res.render('buyer-dashboard', {
        user: req.session.user
    });
}
