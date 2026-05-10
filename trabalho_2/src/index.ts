import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

import prisma from './config/prisma';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';
import productsController from './controllers/ProductsController';
import commentsController from './controllers/CommentsController';
import profilesRoutes from './routes/profiles';
import ordersController from './controllers/OrderController';
import productsRoutes from './routes/products';



dotenv.config();

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: number;
            name: string;
            tipo_usuario: string;
        };
        verificacaoPendente?: {
            userId: number;
            email: string;
        };
    }
}

const app = express();
const port = Number(process.env.PORT || 3333);

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

// Arquivos enviados. Mantive as duas pastas para carregar imagens antigas e novas.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'src/uploads')));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 8
        }
    })
);

app.get('/', (req, res) => {
    res.redirect('/marketplace');
});

app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', dashboardRoutes);
app.use('/', commentsController);
app.use('/', productsRoutes);
app.use('/', profilesRoutes);
app.use('/', ordersController);

async function createAdmin() {
    const adminExists = await prisma.user.findFirst({
        where: { tipo_usuario: 'admin' }
    });

    if (!adminExists) {
        const hash = await bcrypt.hash('admin123', 10);

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

        console.log('[ADMIN] admin@marketmvp.com / admin123');
    }
}

createAdmin().catch((error) => {
    console.error('Erro ao criar admin:', error);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
