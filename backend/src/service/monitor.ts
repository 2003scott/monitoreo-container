import { exec } from 'child_process';

export type DockerContainerStats = Record<string, unknown>;

function parseDockerStats(stdout: string): DockerContainerStats[] {
    const lineas = stdout.trim().split('\n');

    return lineas
        .filter((linea) => linea.length > 0)
        .map((linea) => JSON.parse(linea) as DockerContainerStats);
}

export function getDockerContainerStats(): Promise<DockerContainerStats[]> {
    const comando = 'sudo docker stats --no-stream --format "{{json .}}"';

    return new Promise((resolve, reject) => {
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error ejecutando comando: ${error.message}`));
                return;
            }

            if (stderr) {
                console.error(`Advertencia de Docker: ${stderr}`);
            }

            try {
                resolve(parseDockerStats(stdout));
            } catch (parseError) {
                reject(new Error(`Error al formatear los datos: ${parseError}`));
            }
        });
    });
}