import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

type MailError = {
    code?: string;
    responseCode?: number;
    response?: string;
    message?: string;
};

let cachedTransporter: Transporter | null = null;

function buildTransporter() {
    if ((!env.SMTP_HOST && !env.SMTP_SERVICE) || !env.SMTP_USER || !env.SMTP_PASS) {
        return null;
    }

    const transportOptions = env.SMTP_SERVICE
        ? {
            service: env.SMTP_SERVICE,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        }
        : {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        };

    return nodemailer.createTransport(transportOptions);
}

export function getSmtpTransporter() {
    if (!cachedTransporter) {
        cachedTransporter = buildTransporter();
    }

    return cachedTransporter;
}

export async function verifySmtpTransporter() {
    const transporter = getSmtpTransporter();

    if (!transporter) {
        throw new Error('Faltan variables SMTP_SERVICE o SMTP_HOST, y también SMTP_USER/SMTP_PASS en backend/.env');
    }

    await transporter.verify();
}

export async function sendContainerAlert(containerName: string) {
    const transporter = getSmtpTransporter();

    if (!transporter) {
        throw new Error('SMTP no configurado: revisa backend/.env o docker-compose env_file');
    }

    const mailOptions = {
        from: env.SMTP_FROM || env.SMTP_USER,
        to: env.ALERT_EMAIL_TO,
        subject: `🚨 ALERTA CRÍTICA: Contenedor [${containerName}] APAGADO`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ecc; border-radius: 5px; background-color: #fff5f5;">
                <h2 style="color: #d9534f; margin-top: 0;">⚠️ Notificación de Caída de Servicio</h2>
                <p>Se ha detectado una acción de apagado en la infraestructura de contenedores.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Contenedor:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; color: #c9302c;">${containerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Estado:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><span style="background-color: #d9534f; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">OFFLINE</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Fecha/Hora:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #777;">Este es un mensaje automático generado por tu sistema de monitoreo en tiempo real.</p>
            </div>
        `,
    };

    try {
        const smtpTarget = env.SMTP_SERVICE ? `service=${env.SMTP_SERVICE}` : `${env.SMTP_HOST}:${env.SMTP_PORT}`;
        console.log(`SMTP: enviando correo usando ${smtpTarget} (secure=${env.SMTP_SECURE})`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Alerta de correo enviada con éxito a ${env.ALERT_EMAIL_TO}`, {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        });
        return info;
    } catch (error) {
        const smtpError = error as MailError;
        console.error('❌ Error al enviar el correo de alerta:', smtpError);

        if (smtpError.code === 'EAUTH' || smtpError.responseCode === 535) {
            console.error(
                `SMTP AUTH falló para ${env.SMTP_USER || '(sin usuario)'} en ${env.SMTP_HOST}:${env.SMTP_PORT}. ` +
                'Revisa que el usuario y la contraseña correspondan a ese servidor SMTP. '
                + 'Si usas Gmail, normalmente necesitas una App Password; si usas un dominio propio, el usuario debe pertenecer a ese buzón.'
            );
        } else if (smtpError.code === 'ECONNECTION' || smtpError.code === 'ESOCKET') {
            console.error(
                `SMTP conexión falló contra ${env.SMTP_HOST}:${env.SMTP_PORT}. ` +
                'Revisa red, puerto y si el servidor permite TLS/SSL en ese puerto.'
            );
        }

        throw error;
    }
}