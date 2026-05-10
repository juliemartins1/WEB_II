import { Router } from 'express';
import profilesController from '../controllers/ProfileController';

const router = Router();

router.use(profilesController);

export default router;