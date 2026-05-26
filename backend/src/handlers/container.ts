import { Request, Response } from 'express';
import { executeQuery } from '../service/dbService';
import { toggleContainer } from '../service/dockerControl';
import { env } from '../config/env';
import nodemailer from 'nodemailer';

function getTransporter() {
    if (!env.SMTP_HOST) {
        console.warn('SMTP: No SMTP_HOST configurado; se omitirán los envíos de correo.');
        return null as unknown as nodemailer.Transporter;
    }

    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

async function enviarAlertaCorreo(containerName: string) {
    const mailOptions = {
        from: env.SMTP_FROM,
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
        `
    };

    try {
        const transporterInstance = getTransporter();
        if (!transporterInstance) {
            console.warn('SMTP: transporter no configurado, correo no enviado. Verifica backend/.env o docker-compose env_file.');
            return;
        }

        console.log(`SMTP: enviando correo usando ${env.SMTP_HOST}:${env.SMTP_PORT} (secure=${env.SMTP_SECURE})`);
        await transporterInstance.sendMail(mailOptions);
        console.log(`📧 Alerta de correo enviada con éxito a ${env.ALERT_EMAIL_TO}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de alerta:", error);
    }
}

export async function containerActionHandler(req: Request, res: Response) {
    const { name, action } = req.params;
    const containerName = Array.isArray(name) ? name[0] : name;
    const containerAction = Array.isArray(action) ? action[0] : action;

    try {
        if (!containerName || !containerAction || (containerAction !== 'start' && containerAction !== 'stop')) {
            return res.status(400).json({ error: 'Acción inválida. Usa start o stop.' });
        }

        const dockerResult = await toggleContainer(containerName, containerAction);
        const isTrueStatus = containerAction === 'start';

        await executeQuery(
            "INSERT INTO historial_estados (contenedor, activo) VALUES (?, ?)", 
            [containerName, isTrueStatus]
        );

        if (containerAction === 'stop') {
            enviarAlertaCorreo(containerName);
        }

        return res.json({
            status: `Contenedor ${containerName} procesado con acción: ${containerAction}`,
            docker: dockerResult,
        });
    } catch (error) {
        console.error(`Error al procesar acción ${containerAction} en ${containerName}:`, error);
        return res.status(500).json({ error: 'Error interno al procesar el contenedor' });
    }
}