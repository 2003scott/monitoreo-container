import { Request, Response } from 'express';
import { executeQuery } from '../service/dbService';
import { toggleContainer } from '../service/dockerControl';
import { sendContainerAlert } from '../service/emailService';

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
            'INSERT INTO historial_estados (contenedor, activo) VALUES (?, ?)',
            [containerName, isTrueStatus]
        );

        if (containerAction === 'stop') {
            await sendContainerAlert(containerName);
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