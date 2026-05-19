import { Request, Response } from 'express';
import { getDockerContainerStats } from '../service/monitor';

export async function monitorHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        const contenedores = await getDockerContainerStats();
        return res.json(contenedores);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno al consultar Docker';
        console.error(message);
        return res.status(500).json({ error: 'Error interno al consultar Docker' });
    }
}