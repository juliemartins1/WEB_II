"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./config/prisma"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const products_1 = __importDefault(require("./routes/products"));
const comments_1 = __importDefault(require("./routes/comments"));
const profiles_1 = __importDefault(require("./routes/profiles"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3333);
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));
app.use('/', auth_1.default);
app.use('/admin', admin_1.default);
app.use('/', dashboard_1.default);
app.use('/', products_1.default);
app.use('/', comments_1.default);
app.use('/', profiles_1.default);
async function seedAdmin() {
    const adminExists = await prisma_1.default.user.findFirst({ where: { tipo_usuario: 'admin' } });
    if (!adminExists) {
        const hash = bcrypt_1.default.hashSync('admin123', 10);
        await prisma_1.default.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@marketmvp.com',
                password: hash,
                tipo_usuario: 'admin',
                ativo: true,
                email_verificado: true
            }
        });
        console.log('[SEED] Admin criado: admin@marketmvp.com / admin123');
    }
}
seedAdmin().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
