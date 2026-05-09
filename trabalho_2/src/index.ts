import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

import prisma from './config/prisma';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';

import productsController from './controller/ProductsController';
import commentsController from './controller/CommentsController';

import profilesRoutes from './routes/profiles';

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

/* VIEW ENGINE */
app.set('view engine', 'ejs');
app.set('views', './src/views');

/* MIDDLEWARES */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ARQUIVOS PÚBLICOS */
app.use(express.static('public'));

app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'))
);

/* SESSION */
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 8,
        },
    })
);

/* ROTAS */
app.use('/', authRoutes);

app.use('/', adminRoutes);

app.use('/', dashboardRoutes);

app.use('/', commentsController);

app.use('/', productsController);

app.use('/', profilesRoutes);

/* HOME */
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    return res.redirect('/login');
});

/* CRIAR ADMIN */
async function createAdmin() {
    const adminExists = await prisma.user.findFirst({
        where: {
            tipo_usuario: 'admin',
        },
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
                email_verificado: true,
            },
        });

        console.log(
            '[ADMIN] admin@marketmvp.com / admin123'
        );
    }
}

createAdmin();

/* START */
app.listen(port, () => {
    console.log(
        `Servidor rodando em http://localhost:${port}`
    );
});