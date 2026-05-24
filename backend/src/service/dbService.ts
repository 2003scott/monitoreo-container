import mysql from 'mysql2';

const masterConfig = { host: 'mysql', user: 'cmk', password: 'cmkpass', database: 'appdb' };
const mirrorConfig = { host: 'mysql_mirror', user: 'cmk', password: 'cmkpass', database: 'appdb' };

const poolMaster = mysql.createPool(masterConfig).promise();
const poolMirror = mysql.createPool(mirrorConfig).promise();

export async function executeQuery(sql: string, params?: any[]) {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    // ---------------------------------------------------------
    // CASO 1: LECTURAS (Solo leemos de uno)
    // ---------------------------------------------------------
    if (isSelect) {
        try {
            return await poolMaster.execute(sql, params);
        } catch (error) {
            console.error("⚠️ Leyendo desde ESPEJO (Principal caído)...");
            return await poolMirror.execute(sql, params);
        }
    }

    // ---------------------------------------------------------
    // CASO 2: ESCRITURAS (Guardamos en AMBAS)
    // ---------------------------------------------------------
    let resultadoFinal = null;
    let guardadoExitoso = 0;

    // 1. Escribir en la Base de Datos Principal
    try {
        resultadoFinal = await poolMaster.execute(sql, params);
        guardadoExitoso++;
    } catch (error) {
        console.error("⚠️ No se pudo guardar en Principal.");
    }

    // 2. Escribir en la Base de Datos Espejo (Siempre intentará esto)
    try {
        const resultadoEspejo = await poolMirror.execute(sql, params);
        // Si el principal falló, usamos el resultado del espejo para devolverlo al Frontend
        if (guardadoExitoso === 0) {
            resultadoFinal = resultadoEspejo;
        }
        guardadoExitoso++;
    } catch (error) {
        console.error("⚠️ No se pudo guardar en Espejo.");
    }

    // 3. Verificación de seguridad
    if (guardadoExitoso === 0) {
        throw new Error("❌ CRÍTICO: Ambas bases de datos están caídas. No se guardó la información.");
    }

    // Si llegó hasta aquí, se guardó en al menos una (idealmente en las dos)
    return resultadoFinal;
}