import { Router } from 'express';
import * as AdminController from '../controllers/AdminController';
import { isAuthenticated, isAdmin, auditLog } from '../middleware/auth';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/users', AdminController.listarUsuarios);
router.get('/users/create', AdminController.exibirCriarUsuario);
router.post(
    '/users/create',
    auditLog('Criação de usuário pelo admin'),
    AdminController.criarUsuario
);
router.post(
    '/users/:id/toggle',
    auditLog('Alteração de status de usuário'),
    AdminController.alternarStatusUsuario
);
router.get('/logs', AdminController.listarLogs);

export default router;