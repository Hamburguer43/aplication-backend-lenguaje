import { text } from 'express';
import pool from '../dataBase.js';

export const getAlimentos = async () => {

    const alimentos_query = {
        text: `
        SELECT * FROM alimentos
        `
    }

    const {rows} = await pool.query(alimentos_query);
    return rows;

}

export const deleteAlimento = async (id_alimento) => {
    
    const alimentos_query = {
        text: `
            DELETE FROM alimentos
            WHERE id_alimento = $1
            RETURNING *;
        `,
        values: [id_alimento]
    };

    const { rows } = await pool.query(alimentos_query);
    return rows[0] || null; // Retorna el alimento eliminado o null
}

export const createAlimento = async (name_a, 
    unidad_base, 
    calorias_base, 
    proteinas_base, 
    carbohidratos_base, 
    grasas_base) => {
    
    const alimentos_query = {
        text: `
            INSERT INTO Alimentos (name_a, unidad_base, calorias_base, proteinas_base, carbohidratos_base, grasas_base)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        values: [name_a, unidad_base, calorias_base, proteinas_base, carbohidratos_base, grasas_base]
    };

    const { rows } = await pool.query(alimentos_query);
    return rows[0]; // Retorna el alimento insertado
}