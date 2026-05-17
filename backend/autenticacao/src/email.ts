import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: process.env.SMTP_SECURE === 'true',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

// TODO: adicionar coluna token_expiry em usuarios e rejeitar tokens expirados no controller
// TODO: criar sendPasswordResetEmail() quando implementar "esqueci minha senha"
export async function sendConfirmationEmail(
	to: string,
	token: string,
): Promise<void> {
	const baseUrl =
		process.env.AUTH_BASE_URL ||
		`http://localhost:${process.env.AUTH_PORT || 8002}`;
	const link = `${baseUrl}/api/auth/confirmar/${token}`;

	await transporter.sendMail({
		from: process.env.SMTP_FROM || process.env.SMTP_USER,
		to,
		subject: 'Confirme sua conta — Vivae',
		html: `
			<p>Olá! Obrigado por se cadastrar na Vivae.</p>
			<p>Clique no link abaixo para ativar sua conta:</p>
			<a href="${link}">${link}</a>
			<p>O link expira em 24 horas.</p>
		`,
	});
}
