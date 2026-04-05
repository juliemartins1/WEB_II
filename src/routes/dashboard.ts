import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { listarDashboard } from '../controllers/DashboardController';

const router = Router();

router.get('/dashboard', isAuthenticated, listarDashboard);

export default router;
