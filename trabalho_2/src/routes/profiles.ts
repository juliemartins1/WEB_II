import { Router } from 'express';
import profilesController from '../controller/ProfileController';

const router = Router();

router.use(profilesController);

export default router;