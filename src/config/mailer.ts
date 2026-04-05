import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function enviarVerificacaoEmail(to: string, code: string) {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log(`[DEV] Para: ${to} | Código: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Código de verificação',
    html: `
      <h2>Verificação de e-mail</h2>
      <p>Seu código é:</p>
      <h1>${code}</h1>
      <p>Esse código expira em 30 minutos.</p>
    `
  });
}