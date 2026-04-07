import nodemailer from 'nodemailer';

export async function enviarVerificacaoEmail(destinatario: string, codigo: string) {
  try {
    console.log('MAIL_HOST =', process.env.MAIL_HOST);
    console.log('MAIL_PORT =', process.env.MAIL_PORT);
    console.log('MAIL_SECURE =', process.env.MAIL_SECURE);
    console.log('MAIL_USER =', process.env.MAIL_USER);
    console.log('MAIL_PASS existe =', !!process.env.MAIL_PASS);

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: destinatario,
      subject: 'Código de verificação',
      text: `Seu código de verificação é: ${codigo}`,
    });

    console.log('Email enviado com sucesso:', info.response);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}