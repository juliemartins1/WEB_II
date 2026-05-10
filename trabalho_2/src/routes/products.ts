import { Router } from 'express';
import ProductController from '../controller/ProductsController';
import { productImagesUpload } from '../config/upload';

const router = Router();

router.get('/seller/products', ProductController.index);

router.get('/seller/products/:id/edit', ProductController.editForm);

router.post(
    '/seller/products/:id/edit',
    productImagesUpload.array('images', 5),
    ProductController.update
);

router.post('/seller/products/:id/delete', ProductController.delete);

export default router;