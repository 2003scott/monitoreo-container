import { Request, Response } from 'express';
import { getDatabaseSnapshots } from '../service/dbService';

export async function databaseSnapshotHandler(_req: Request, res: Response): Promise<Response | void> {
    try {
        const snapshots = await getDatabaseSnapshots();
        return res.json(snapshots);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno al consultar bases de datos';
        console.error('Error en databaseSnapshotHandler:', message);
        return res.status(500).json({ error: 'Error interno al consultar bases de datos' });
    }
}
