import pool from "../dataBase.js";
import { text } from "express";

export const getAntropometria = async (patient_id) => {

    const antropometria_query = {
        text: `SELECT a.* FROM antropometria a
            INNER JOIN historial_medico h ON a.cod_hm = h.cod_hm
            WHERE h.patient_id = $1
            ORDER BY a.fecha_medicion ASC`,

        values: [patient_id]
    }

    const resAntropometria = await pool.query(antropometria_query);

    return resAntropometria.rows;

} 

export const CreateNewAntropometria = async (antropometriaCalculada, cod_hm) => {

    const {
        peso,
        estatura,
        imc,
        grasa,
        circ_abdominal,
        masa_muscular
    } = antropometriaCalculada

    const CreateAntropometria_query = {
        text: `
        INSERT INTO antropometria (cod_hm, peso, estatura, imc, grasa, circ_abdominal, masa_muscular)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
        `,

        values: [ cod_hm, peso, estatura, imc, grasa, circ_abdominal, masa_muscular],

    };

    const resNewAntropometria = await pool.query(CreateAntropometria_query);

    return resNewAntropometria.rows[0];
 
}

//HISTORIALES CLÍNICOS -------------------------------------------------------

export const getHistorialMedicos = async() => {

const historial_query = {

    text: `
    select hm.*, 
    p.email_p, p.first_name_p, p.last_name_p 
    from historial_medico hm
    INNER JOIN patients p
    ON hm.patient_id = p.patient_id
    `
}

const {rows} = await pool.query(historial_query);
return rows

}

export const getHistorialById = async (patient_id) => {

const historial_query = {
    text: `
    select hm.*, 
    p.email_p, p.first_name_p, p.last_name_p 
    from historial_medico hm
    INNER JOIN patients p
    ON hm.patient_id = p.patient_id
    WHERE p.patient_id = $1
    `,

    values: [patient_id]
};

const {rows} = await pool.query(historial_query);
return rows

}

export const createHC = async (antecedentes, antropometria, patient_id) => {
    
    const client = await pool.connect();

    try {
        
        await client.query('BEGIN');

        const queryHM = {
        text: `
            INSERT INTO historial_medico (
                patient_id
            ) VALUES ($1)
            RETURNING cod_hm;
        `,

        values: [patient_id]
        }

        const resHM = await client.query(queryHM);
        const cod_hm = resHM.rows[0].cod_hm;

        const queryAntecedentes = {
            text: `
            INSERT INTO antecedentes (
            cod_hm, motivo, cardiovascular, endocrinos, excrecion, 
            gastrointestinales, ginecologicos, hemato_oncologicos, 
            inmunologicos, piel, musculo_esqueleticos, neurologicos, 
            psicologicos, respiratorios, otros
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `,

            values: [
            cod_hm,
            antecedentes.motivo,
            antecedentes.cardiovascular,
            antecedentes.endocrinos,
            antecedentes.excrecion,
            antecedentes.gastrointestinales,
            antecedentes.ginecologicos,
            antecedentes.hemato_oncologicos,
            antecedentes.inmunologicos,
            antecedentes.piel,
            antecedentes.musculo_esqueleticos,
            antecedentes.neurologicos,
            antecedentes.psicologicos,
            antecedentes.respiratorios,
            antecedentes.otros
            ]
        }

        await client.query(queryAntecedentes);

        const queryAntro = {
            text: `
            INSERT INTO antropometria (
                cod_hm, peso, estatura, imc, grasa, circ_abdominal, riesgo_metabolico
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        values:[
            cod_hm,
            antropometria.peso,
            antropometria.estatura,
            antropometria.imc,
            antropometria.grasa,
            antropometria.circ_abdominal,
            antropometria.riesgo
        ]
        }

        await client.query(queryAntro);
        await client.query('COMMIT');
        
        return { success: true, id: cod_hm };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en el modelo createHC:", error);
        throw error;

    } finally {
        client.release();
    }
};
