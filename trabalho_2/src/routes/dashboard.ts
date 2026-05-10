import { Router } from 'express';
import * as DashboardController from '../controller/DashboardController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.get(
    '/seller/dashboard',
    isAuthenticated,
    DashboardController.sellerDashboard
);

export default router;