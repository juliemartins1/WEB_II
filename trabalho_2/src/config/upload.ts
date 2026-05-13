import multer from 'multer';
import path from 'path';
import fs from 'fs';


function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}


const uploadRoot = path.resolve(__dirname, '..', 'uploads');


const storage = multer.diskStorage({
    destination: function (_req, file, cb) {
        let folder = 'products';

        if (file.fieldname === 'commentPhoto') {
            folder = 'comments';
        }

        const dir = path.join(uploadRoot, folder);
        ensureDir(dir);

        cb(null, dir);
    },

    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
});


function fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Arquivo inválido (use JPG, PNG ou WEBP)'));
    }

    cb(null, true);
}


export const productImagesUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});


export const commentPhotoUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});


export function fileUrl(file?: Express.Multer.File) {
    if (!file) return null;

    if (file.fieldname === 'commentPhoto') {
        return `/uploads/comments/${file.filename}`;
    }

    return `/uploads/products/${file.filename}`;
}