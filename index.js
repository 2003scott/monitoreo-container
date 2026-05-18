const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Habilitar CORS para que el frontend pueda hacer peticiones sin bloqueos de seguridad
app.use(cors());

// Ruta de nuestra API
app.get('/api/monitor', (req, res) => {
    const comando = 'sudo docker stats --no-stream --format "{{json .}}"';

    // Ejecutamos el comando de Docker en la terminal del sistema
    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando comando: ${error.message}`);
            return res.status(500).json({ error: 'Error interno al consultar Docker' });
        }
        
        if (stderr) {
            console.error(`Advertencia de Docker: ${stderr}`);
        }

        try {
            // Docker devuelve un string con un JSON por línea. 
            // Cortamos por saltos de línea, filtramos los vacíos y convertimos a objetos JS.
            const lineas = stdout.trim().split('\n');
            const contenedores = lineas
                .filter(linea => linea.length > 0)
                .map(linea => JSON.parse(linea));

            // Enviamos el array final al frontend
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