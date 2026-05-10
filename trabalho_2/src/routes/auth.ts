import { Router } from 'express';
import * as AuthController from '../controllers/AuthController';
import { auditLog, isAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/signup', AuthController.exibirSignup);
router.post('/signup', auditLog('Tentativa de cadastro'), AuthController.signup);

router.get('/verify-email', AuthController.exibirVerificarEmail);
router.post('/verify-email', auditLog('Verificação de e-mail'), AuthController.verificarEmail);
router.post('/resend-code', auditLog('Reenvio de código de verificação'), AuthController.reenviarCodigo);

router.get('/login', AuthController.exibirLogin);
router.post('/login', auditLog('Tentativa de login'), AuthController.login);

router.post(
    '/logout',
    isAuthenticated,
    auditLog('Logout'),
    AuthController.logout
);

export default router;