import { Router } from 'express';
import { isAuthenticated, isTipoUsuario } from '../middleware/auth';
import {
    listarDashboard,
    dashboardComprador,
    dashboardVendedor
} from '../controllers/DashboardController';

const router = Router();

router.get('/dashboard', isAuthenticated, listarDashboard);
router.get('/buyer', isAuthenticated, isTipoUsuario('comprador'), dashboardComprador);
router.get('/seller', isAuthenticated, isTipoUsuario('vendedor'), dashboardVendedor);

export default router;