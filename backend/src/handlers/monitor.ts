import { Request, Response } from 'express';
import { getDockerContainerStats } from '../service/monitor';
import { executeQuery } from '../service/dbService';

export async function monitorHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        const contenedores = await getDockerContainerStats();
        
        const datosEnTexto = JSON.stringify(contenedores);

        try {
            await executeQuery("INSERT INTO registros (dato) VALUES (?)", [datosEnTexto]);
        } catch (dbError) {
            const message = dbError instanceof Error ? dbError.message : 'Error al guardar métricas en BD';
            console.error("⚠️ No se pudieron guardar las métricas, pero se devolverán igual:", message);
        }

        return res.json(contenedores);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno al consultar Docker';
        console.error("Error en monitorHandler:", message);
        return res.status(500).json({ error: 'Error interno al consultar Docker' });
    }
}

export async function historialHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        const [rows]: any = await executeQuery("SELECT id, fecha, dato FROM registros ORDER BY id DESC LIMIT 10");
        
        const historial = rows.map((fila: any) => {
            let metricas;
            try {
                metricas = JSON.parse(fila.dato);
            } catch (e) {
                metricas = fila.dato;
            }
            
            return {
                id: fila.id,
                fecha: fila.fecha,
                metricas: metricas
            };
        });

        return res.json(historial);
    } catch (error) {
        console.error("Error al obtener el historial:", error);
        return res.status(500).json({ error: 'Error al consultar el historial en la base de datos' });
    }
}