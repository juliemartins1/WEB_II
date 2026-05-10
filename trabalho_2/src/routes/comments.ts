import { Router } from 'express';
import commentsController from '../controller/CommentsController';

const router = Router();

router.use(commentsController);

export default router;