import { Request, Response } from 'express';
import { executeQuery } from '../service/dbService'; // Tu balanceador de escritura dual
import nodemailer from 'nodemailer';

// 1. Configuración del transportador de correo
// Nota: Si usas Gmail, debes generar una "Contraseña de aplicación" en tu cuenta de Google
const transporter = nodemailer.createTransport({
    host: 'mail.condominiovilladelsur.com', // Por lo general es mail. seguido de tu dominio
    port: 465,                   // El puerto seguro estándar de cPanel para SSL
    secure: true,                // true para puerto 465, false para puerto 587
    auth: {
        user: 'pruebadocker@condominiovilladelsur.com', // El correo completo que creaste en cPanel
        pass: '.?Hn8adQ=75v$HBa' // La contraseña normal de ese correo
    },
    tls: {
        // Esto evita errores si tu cPanel tiene un certificado SSL autofirmado
        rejectUnauthorized: false 
    }
});

// 2. Función encargada de enviar la alerta por correo electrónico
async function enviarAlertaCorreo(containerName: string) {
    const mailOptions = {
        from: '"Monitor de Infraestructura 🚀" <pruebadocker@condominiovilladelsur.com>',
        to: 'chezcovalladares@gmail.com',
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
        await transporter.sendMail(mailOptions);
        console.log(`📧 Alerta de correo enviada con éxito a chezcovalladares@gmail.com`);
    } catch (error) {
        console.error("❌ Error al enviar el correo de alerta:", error);
    }
}

// 3. Tu Handler de control de contenedores actualizado
export async function containerActionHandler(req: Request, res: Response) {
    const { name, action } = req.params; // 'start' o 'stop'

    try {
        // --- AQUÍ VA TU LÓGICA ACTUAL PARA APAGAR/PRENDER EL CONTENEDOR EN DOCKER ---
        // (Por ejemplo: usar dockerode o child_process para ejecutar 'docker stop/start')
        // ----------------------------------------------------------------------------

        // A. Convertimos la acción en un valor Booleano para la Base de Datos
        const isTrueStatus = action === 'start'; // true si se enciende, false si se apaga

        // B. Guardamos en la tabla historial_estados (Se clona en Principal y Espejo gracias a executeQuery)
        await executeQuery(
            "INSERT INTO historial_estados (contenedor, activo) VALUES (?, ?)", 
            [name, isTrueStatus]
        );

        // C. Si la acción ejecutada fue apagar ('stop'), disparamos el correo electrónico
        if (action === 'stop') {
            // No usamos 'await' aquí para que la API responda rápido a la web sin esperar el envío del mail
          enviarAlertaCorreo(name as string);
        }

        return res.json({ status: `Contenedor ${name} procesado con acción: ${action}` });
    } catch (error) {
        console.error(`Error al procesar acción ${action} en ${name}:`, error);
        return res.status(500).json({ error: 'Error interno al procesar el contenedor' });
    }
}