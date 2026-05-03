import { Router } from 'express';
import productsController from '../controller/ProductsController';

const router = Router();

router.use(productsController);

export default router;