import { Router } from 'express';
import commentsController from '../controllers/CommentsController';

const router = Router();

router.use(commentsController);

export default router;