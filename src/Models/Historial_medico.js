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
    const query = {
        text: `
            SELECT 
                -- Datos del Paciente (Tabla Patients)
                p.patient_id, p.doc_id, p.cedula_p, p.first_name_p, p.last_name_p, 
                p.email_p, p.age_p, p.gender_p, p.date_p, p.create_p, p.update_p,
                
                -- Datos de la Sección (Tabla Sections)
                s.grade_name, s.sub_section,
                
                -- Datos del Historial (Tabla historial_medico)
                hm.cod_hm, hm.date_hm,
                
                -- Datos de Antropometría (Tabla antropometria)
                a.id AS antro_id, a.peso, a.estatura, a.imc, a.grasa, 
                a.circ_abdominal, a.fecha_medicion,
                
                -- Datos de Antecedentes (Tabla antecedentes)
                ant.id AS ante_id, ant.motivo, ant.cardiovascular, ant.endocrinos, 
                ant.excrecion, ant.gastrointestinales, ant.ginecologicos, 
                ant.hemato_oncologicos, ant.inmunologicos, ant.piel, 
                ant.musculo_esqueleticos, ant.neurologicos, ant.psicologicos, 
                ant.respiratorios, ant.otros

            FROM Patients p
            INNER JOIN Sections s ON p.section_id = s.section_id
            INNER JOIN historial_medico hm ON p.patient_id = hm.patient_id
            LEFT JOIN antropometria a ON hm.cod_hm = a.cod_hm
            LEFT JOIN antecedentes ant ON hm.cod_hm = ant.cod_hm
            
            WHERE p.patient_id = $1
            ORDER BY hm.date_hm DESC
        `,
        values: [patient_id]
    };

    const res = await pool.query(query);

    // Transformamos las filas planas en la estructura de objetos que tu HTML espera
    return res.rows.map(row => ({
        patient_id: row.patient_id,
        doc_id: row.doc_id,
        cedula_p: row.cedula_p,
        first_name_p: row.first_name_p,
        last_name_p: row.last_name_p,
        email_p: row.email_p,
        age_p: row.age_p,
        gender_p: row.gender_p,
        date_p: row.date_p,
        section_id: row.section_id,
        create_p: row.create_p,
        update_p: row.update_p,
        grade_name: row.grade_name,
        sub_section: row.sub_section,
        cod_hm: row.cod_hm,
        
        // Objeto anidado de Antropometría
        antropometria: {
            id: row.antro_id,
            cod_hm: row.cod_hm,
            peso: row.peso,
            estatura: row.estatura,
            imc: row.imc,
            grasa: row.grasa,
            circ_abdominal: row.circ_abdominal,
            fecha_medicion: row.fecha_medicion,
            riesgo_metabolico: row.imc > 25 ? 'Sobrepeso' : (row.imc < 18.5 ? 'Bajo Peso' : 'Normal')
        },

        // Objeto anidado de Antecedentes
        antecedentes: {
            id: row.ante_id,
            cod_hm: row.cod_hm,
            motivo: row.motivo,
            cardiovascular: row.cardiovascular,
            endocrinos: row.endocrinos,
            excrecion: row.excrecion,
            gastrointestinales: row.gastrointestinales,
            ginecologicos: row.ginecologicos,
            hemato_oncologicos: row.hemato_oncologicos,
            inmunologicos: row.inmunologicos,
            piel: row.piel,
            musculo_esqueleticos: row.musculo_esqueleticos,
            neurologicos: row.neurologicos,
            psicologicos: row.psicologicos,
            respiratorios: row.respiratorios,
            otros: row.otros
        }
    }));
};

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
