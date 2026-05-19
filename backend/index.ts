import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/monitor', (_req: Request, res: Response) => {
    const comando = 'sudo docker stats --no-stream --format "{{json .}}"';

    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando comando: ${error.message}`);
            return res.status(500).json({ error: 'Error interno al consultar Docker' });
        }

        if (stderr) {
            console.error(`Advertencia de Docker: ${stderr}`);
        }

        try {
            const lineas = stdout.trim().split('\n');
            const contenedores = lineas
                .filter((linea) => linea.length > 0)
                .map((linea) => JSON.parse(linea) as Record<string, unknown>);

            res.json(contenedores);
        } catch (parseError) {
            console.error(`Error parseando JSON: ${parseError}`);
            res.status(500).json({ error: 'Error al formatear los datos' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API de monitoreo corriendo en http://localhost:${PORT}/api/monitor`);
});