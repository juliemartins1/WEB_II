import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

declare module 'express-session' {
    interface SessionData {
        user?: { id: number; name: string; tipo_usuario: string };
        verificacaoPendente?: { userId: number; email: string };
    }
}

import db from './config/db';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';
import bcrypt from 'bcrypt';

const app = express();
const port = Number(process.env.PORT || 3333);

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', dashboardRoutes);

app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.redirect('/login');
});


const adminExists = db.prepare("SELECT id FROM users WHERE tipo_usuario = 'admin' LIMIT 1").get();
if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(
        "INSERT INTO users (name, email, password, tipo_usuario, ativo, email_verificado) VALUES (?, ?, ?, 'admin', 1, 1)"
    ).run('Administrador', 'admin@marketmvp.com', hash);
    console.log('[SEED] Admin criado: admin@marketmvp.com / admin123');
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
