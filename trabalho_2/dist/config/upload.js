"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentPhotoUpload = exports.productImagesUpload = void 0;
exports.fileUrl = fileUrl;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* garante que a pasta existe */
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
/* pasta base */
const uploadRoot = path_1.default.resolve(__dirname, '..', 'uploads');
/* storage */
const storage = multer_1.default.diskStorage({
    destination: function (_req, file, cb) {
        let folder = 'products';
        if (file.fieldname === 'commentPhoto') {
            folder = 'comments';
        }
        const dir = path_1.default.join(uploadRoot, folder);
        ensureDir(dir);
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
});
/* filtro de imagem */
function fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Arquivo inválido (use JPG, PNG ou WEBP)'));
    }
    cb(null, true);
}
/* upload de produtos (múltiplas fotos) */
exports.productImagesUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});
/* upload de comentários */
exports.commentPhotoUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});
/* gerar URL do arquivo */
function fileUrl(file) {
    if (!file)
        return null;
    if (file.fieldname === 'commentPhoto') {
        return `/uploads/comments/${file.filename}`;
    }
    return `/uploads/products/${file.filename}`;
}
