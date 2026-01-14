import { text } from 'express';
import pool from '../dataBase.js';

//-- Consultas de Alimentos ----------------------------------

export const getAlimentos = async () => {

    const alimentos_query = {
        text: `
        SELECT * FROM alimentos
        `
    }

    const {rows} = await pool.query(alimentos_query);
    return rows;

}

export const deleteAlimento = async (id) => {
    
    const alimentos_query = {
        text: `
            DELETE FROM alimentos
            WHERE id_alimento = $1
            RETURNING *;
        `,
        values: [id]
    };

    const { rows } = await pool.query(alimentos_query);
    return rows[0] || null; // Retorna el alimento eliminado o null
}

export const createAlimento = async (
    name_a, 
    unidad_medida, 
    calorias_base, 
    proteinas_base, 
    carbohidratos_base, 
    grasas_base) => {
    
    const alimentos_query = {
        text: `
            INSERT INTO alimentos (name_a, unidad_medida, calorias_base, proteinas_base, carbohidratos_base, grasas_base)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        values: [name_a, unidad_medida, calorias_base, proteinas_base, carbohidratos_base, grasas_base]
    };

    const { rows } = await pool.query(alimentos_query);
    return rows[0]; // Retorna el alimento insertado
}

export const findAlimentoByname = async (name_a) => {

    const alimentos_query = {
        text: `
        SELECT * FROM alimentos
        WHERE name_a = $1
        `,
        values: [name_a]
    }

    const {rows} = await pool.query(alimentos_query);
    return rows[0] || null;

}

//-- Consultas de recetas ----------------------------------

export const getRecetas = async () => {

    const recetas_query = {
        text: `
        SELECT * FROM recetas
        `
    }

    const {rows} = await pool.query(recetas_query);
    return rows;

}

export const getRecetaById = async (cod_receta) => {

    const receta_query = {
        text: `
        SELECT R.*, A.name_a, DR.cant_gr_alimento FROM recetas R
        INNER JOIN detallereceta DR ON R.cod_receta = DR.cod_receta
        INNER JOIN alimentos A ON DR.id_alimento = A.id_alimento
        WHERE R.cod_receta = $1
        `,
        values: [cod_receta]
    }

    const {rows} = await pool.query(receta_query);  
    
    const receta = {
        cod_receta: rows[0].cod_receta,
        nombre: rows[0].nombre,
        descripcion: rows[0].descripcion,
        observacion: rows[0].observacion,
        calorias_total: rows[0].calorias_total,
        proteinas_total: rows[0].proteinas_total,
        carbohidratos_total: rows[0].carbohidratos_total,
        grasas_total: rows[0].grasas_total,
        fecha_creacion: rows[0].fecha_creacion,
       
        alimentos: rows.map(row => ({
            nombre_alimento: row.name_a,
            cantidad: row.cant_gr_alimento
        }))
    };

    return receta;

}

export const deleteReceta = async (cod_receta) => {

    const recetas_query = {
        text: `
            DELETE FROM recetas
            WHERE cod_receta = $1
            RETURNING *;
        `,
        values: [cod_receta]
    };

    const { rows } = await pool.query(recetas_query);
    return rows[0] || null;

}

export const createReceta = async (recetaData) => {

const conect = await pool.connect();

const {
    nombre,
    descripcion,
    observacion,
    Macros,
    fecha_creacion = new Date(),
    detalle_receta
} = recetaData;

try {

    await conect.query('BEGIN');

    const recetas_query = {
    text: `
    INSERT INTO recetas
    (nombre, descripcion, observacion, calorias_total, proteinas_total, carbohidratos_total, grasas_total, fecha_creacion)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `,
    values: [nombre, descripcion, observacion, Macros.calorias_total, Macros.proteinas_total, Macros.carbohidratos_total, Macros.grasas_total,  fecha_creacion]
    };

    const resReceta = await conect.query(recetas_query);
    const cod_receta = resReceta.rows[0].cod_receta;

    const detalle_result = []
    const detalleReceta_query = 
    `
    INSERT INTO detallereceta
    (cod_receta, id_alimento, cant_gr_alimento)
    VALUES ($1, $2, $3)
    RETURNING *;
    `

    //ciclo que inserta cada alimento del detalle de la receta en un ciclo for
    for (const alimento of detalle_receta) {
        const ResDetalle = await conect.query(detalleReceta_query, [
            cod_receta,
            alimento.id_alimento,
            alimento.cant_gr_alimento
        ]);

        detalle_result.push(ResDetalle.rows[0]);
    }


    await conect.query('COMMIT');

    return {
        ...resReceta.rows[0],
        detalle_receta: detalle_result
    }

} catch (error) {
    await conect.query('ROLLBACK');
    console.error('Error al crear la receta:', error.message);
    throw error;

} finally {
    conect.release();
}

}

export const updateReceta = async (cod_receta, recetaData) => {

    const connect = await pool.connect();

    const {
        nombre,
        descripcion,
        observacion,
        calorias_total,
        proteinas_total,
        carbohidratos_total,
        grasas_total,
        creado_por,
        fecha_creacion,
        detalle_receta
    } = recetaData;

    try {

        await connect.query('BEGIN');

        const updateReceta_query = {
            text: `
            UPDATE recetas
            SET nombre = $1,
                descripcion = $2,
                observacion = $3,
                calorias_total = $4,
                proteinas_total = $5,
                carbohidratos_total = $6,
                grasas_total = $7,
                creado_por = $8,
                fecha_creacion = $9
            WHERE cod_receta = $10
            RETURNING *;
            `,
            values: [
                nombre,
                descripcion,
                observacion,
                calorias_total,
                proteinas_total,
                carbohidratos_total,
                grasas_total,
                creado_por,
                fecha_creacion,
                cod_receta
            ]
        }

        const resUpdateReceta = await connect.query(updateReceta_query);

        await connect.query('DELETE FROM detallereceta WHERE cod_receta = $1', [cod_receta]);

        const detalle_result = []
        const detalleReceta_query = 
        `
        INSERT INTO detallereceta
        (cod_receta, id_alimento, cant_gr_alimento)
        VALUES ($1, $2, $3)
        RETURNING *;
        `

        //ciclo que inserta cada alimento del detalle de la receta en un ciclo for
        for (const alimento of detalle_receta) {
            const ResDetalle = await connect.query(detalleReceta_query, [
                cod_receta,
                alimento.id_alimento,
                alimento.cant_gr_alimento
            ]);

            detalle_result.push(ResDetalle.rows[0]);
        }

        await connect.query(`COMMIT`);

        return {
        ...resUpdateReceta.rows[0],
        detalle_receta: detalle_result
        }

    }catch (error) {
        await connect.query('ROLLBACK');
        console.error('Error al actualizar la receta:', error.message);
        throw error;
    } finally {
        connect.release();
    }

}

export const findRecetaByName = async (nombre) => {

    const receta_query = {
        text: `
        SELECT * FROM recetas
        WHERE nombre = $1
        `,
        values: [nombre]
    }

    const {rows} = await pool.query(receta_query);
    return rows[0] || null;

}