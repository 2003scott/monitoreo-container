import mysql from 'mysql2';

const masterConfig = { host: 'mysql', user: 'cmk', password: 'cmkpass', database: 'appdb' };
const mirrorConfig = { host: 'mysql_mirror', user: 'cmk', password: 'cmkpass', database: 'appdb' };

const poolMaster = mysql.createPool(masterConfig).promise();
const poolMirror = mysql.createPool(mirrorConfig).promise();

export async function executeQuery(sql: string, params?: any[]) {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
        try {
            return await poolMaster.execute(sql, params);
        } catch (error) {
            console.error("⚠️ Leyendo desde ESPEJO (Principal caído)...");
            return await poolMirror.execute(sql, params);
        }
    }

    let resultadoFinal = null;
    let guardadoExitoso = 0;

    try {
        resultadoFinal = await poolMaster.execute(sql, params);
        guardadoExitoso++;
    } catch (error) {
        console.error("⚠️ No se pudo guardar en Principal.");
    }

    try {
        const resultadoEspejo = await poolMirror.execute(sql, params);
        if (guardadoExitoso === 0) {
            resultadoFinal = resultadoEspejo;
        }
        guardadoExitoso++;
    } catch (error) {
        console.error("⚠️ No se pudo guardar en Espejo.");
    }

    if (guardadoExitoso === 0) {
        throw new Error("❌ CRÍTICO: Ambas bases de datos están caídas. No se guardó la información.");
    }

    return resultadoFinal;
}