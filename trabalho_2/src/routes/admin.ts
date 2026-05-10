import { Router } from 'express';
import * as AdminController from '../controller/AdminController';
import { isAuthenticated, isAdmin, auditLog } from '../middleware/auth';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/users/new', isAuthenticated, isAdmin, AdminController.exibirCriarUsuario);
router.post('/users/new', isAuthenticated, isAdmin, AdminController.criarUsuario);
router.get('/admin/users/new', AdminController.exibirCriarUsuario);
router.post('/admin/users/new', AdminController.criarUsuario);
router.get('/users', AdminController.listarUsuarios);
router.get('/users/create', AdminController.exibirCriarUsuario);
router.post(
    '/users/create',
    auditLog('Criação de usuário pelo admin'),
    AdminController.criarUsuario
);
router.get(
    '/logs',
    isAuthenticated,
    isAdmin,
    AdminController.logs
);
router.post(
    '/users/:id/toggle',
    auditLog('Alteração de status de usuário'),
    AdminController.alternarStatusUsuario
);
//router.get('/admin/logs', isAuthenticated, isAdmin, AdminController.listarLogs);

export default router;