import { Request, Response } from 'express';
import { getDockerContainerStats } from '../service/monitor';
import { executeQuery } from '../service/dbService'; // <-- Importamos tu balanceador de BD

// ------------------------------------------------------------------
// 1. RUTA ACTUAL: Monitor en tiempo real (Guarda el JSON completo)
// ------------------------------------------------------------------
export async function monitorHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        // Obtenemos los datos de Docker
        const contenedores = await getDockerContainerStats();
        
        // NUEVO: En lugar de un resumen corto, convertimos todo el arreglo a texto (JSON)
        const datosEnTexto = JSON.stringify(contenedores);
        
        // Enviamos el dato a executeQuery. Él lo guarda en mysql y mysql_mirror
        await executeQuery("INSERT INTO registros (dato) VALUES (?)", [datosEnTexto]);

        // Devolvemos los datos al Frontend para las gráficas
        return res.json(contenedores);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno al consultar Docker';
        console.error("Error en monitorHandler:", message);
        return res.status(500).json({ error: 'Error interno al consultar Docker' });
    }
}

// ------------------------------------------------------------------
// 2. RUTA NUEVA: Historial (Para verlo en tu navegador)
// ------------------------------------------------------------------
export async function historialHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        // Buscamos los últimos 10 registros en la base de datos
        const [rows]: any = await executeQuery("SELECT id, fecha, dato FROM registros ORDER BY id DESC LIMIT 10");
        
        // Formateamos los datos para que el navegador los muestre bonitos
        const historial = rows.map((fila: any) => {
            let metricas;
            try {
                // Intentamos convertir el texto guardado de vuelta a un formato JSON
                metricas = JSON.parse(fila.dato);
            } catch (e) {
                // Si es un registro antiguo (como tu resumen de texto), lo dejamos tal cual
                metricas = fila.dato;
            }
            
            return {
                id: fila.id,
                fecha: fila.fecha,
                metricas: metricas
            };
        });

        // Enviamos el historial completo al navegador
        return res.json(historial);
    } catch (error) {
        console.error("Error al obtener el historial:", error);
        return res.status(500).json({ error: 'Error al consultar el historial en la base de datos' });
    }
}