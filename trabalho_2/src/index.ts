import express from 'express';
import session from 'express-session';
import { requestLogger } from './middleware/requestLogger';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';
import productsRoutes from './routes/products';
import commentsRoutes from './routes/comments';
import profilesRoutes from './routes/profiles';

dotenv.config();

declare module 'express-session' {
    interface SessionData {
        user?: { id: number; name: string; tipo_usuario: string };
        verificacaoPendente?: { userId: number; email: string };
    }
}

const app = express();
const port = Number(process.env.PORT || 3333);

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));

app.use(requestLogger);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', dashboardRoutes);
app.use('/', productsRoutes);
app.use('/', commentsRoutes);
app.use('/', profilesRoutes);

async function seedAdmin() {
    const adminExists = await prisma.user.findFirst({ where: { tipo_usuario: 'admin' } });

    if (!adminExists) {
        const hash = bcrypt.hashSync('admin123', 10);
        await prisma.user.create({
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
