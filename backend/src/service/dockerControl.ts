import Docker from 'dockerode';

// Se conecta al socket que mapearemos en el docker-compose
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function toggleContainer(containerName: string, action: 'start' | 'stop') {
    const container = docker.getContainer(containerName);
    
    if (action === 'start') {
        await container.start();
    } else {
        await container.stop();
    }
    
    return { status: `Contenedor ${containerName} ${action}ed` };
}