import mysql from 'mysql2';

const masterConfig = { host: 'mysql', user: 'cmk', password: 'cmkpass', database: 'appdb' };
const mirrorConfig = { host: 'mysql_mirror', user: 'cmk', password: 'cmkpass', database: 'appdb' };

export type DatabaseSnapshot = {
    name: 'principal' | 'mirror';
    status: 'online' | 'offline';
    registrosCount: number;
    historialCount: number;
    lastRegistro?: {
        id: number;
        fecha: string;
    } | null;
    lastHistorial?: {
        id: number;
        fecha: string;
        contenedor: string;
        activo: number;
    } | null;
    error?: string;
}

const poolMaster = mysql.createPool(masterConfig).promise();
const poolMirror = mysql.createPool(mirrorConfig).promise();

async function fetchDatabaseSnapshot(
    pool: typeof poolMaster,
    name: 'principal' | 'mirror'
): Promise<DatabaseSnapshot> {
    try {
        const [registrosRows]: any = await pool.execute(
            'SELECT COUNT(*) AS total FROM registros'
        );
        const [historialRows]: any = await pool.execute(
            'SELECT COUNT(*) AS total FROM historial_estados'
        );
        const [lastRegistroRows]: any = await pool.execute(
            'SELECT id, fecha FROM registros ORDER BY id DESC LIMIT 1'
        );
        const [lastHistorialRows]: any = await pool.execute(
            'SELECT id, fecha, contenedor, activo FROM historial_estados ORDER BY id DESC LIMIT 1'
        );

        return {
            name,
            status: 'online',
            registrosCount: Number(registrosRows?.[0]?.total ?? 0),
            historialCount: Number(historialRows?.[0]?.total ?? 0),
            lastRegistro: lastRegistroRows?.[0]
                ? {
                    id: Number(lastRegistroRows[0].id),
                    fecha: lastRegistroRows[0].fecha,
                }
                : null,
            lastHistorial: lastHistorialRows?.[0]
                ? {
                    id: Number(lastHistorialRows[0].id),
                    fecha: lastHistorialRows[0].fecha,
                    contenedor: String(lastHistorialRows[0].contenedor),
                    activo: Number(lastHistorialRows[0].activo),
                }
                : null,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        return {
            name,
            status: 'offline',
            registrosCount: 0,
            historialCount: 0,
            lastRegistro: null,
            lastHistorial: null,
            error: message,
        };
    }
}

export async function getDatabaseSnapshots(): Promise<DatabaseSnapshot[]> {
    const [principal, mirror] = await Promise.all([
        fetchDatabaseSnapshot(poolMaster, 'principal'),
        fetchDatabaseSnapshot(poolMirror, 'mirror'),
    ]);

    return [principal, mirror];
}

export async function executeQuery(sql: string, params?: any[]) {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
        try {
            return await poolMaster.execute(sql, params);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("⚠️ Leyendo desde ESPEJO (falló Principal):", message);
            return await poolMirror.execute(sql, params);
        }
    }

    let resultadoFinal = null;
    let guardadoExitoso = 0;

    try {
        resultadoFinal = await poolMaster.execute(sql, params);
        guardadoExitoso++;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("⚠️ No se pudo guardar en Principal:", message);
    }

    try {
        const resultadoEspejo = await poolMirror.execute(sql, params);
        if (guardadoExitoso === 0) {
            resultadoFinal = resultadoEspejo;
        }
        guardadoExitoso++;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("⚠️ No se pudo guardar en Espejo:", message);
    }

    if (guardadoExitoso === 0) {
        throw new Error("❌ CRÍTICO: Ambas bases de datos están caídas. No se guardó la información.");
    }

    return resultadoFinal;
}