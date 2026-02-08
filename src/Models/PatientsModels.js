import pool from "../dataBase.js";
import { text } from "express";

// -- Obtener patients ------------------------------------------------ *

export const patiensData = async () => {

    const query = {
        text: `
        SELECT * FROM patients
        `
    }    

    const {rows} = await pool.query(query);
    return rows;

}

export const getPatients = async (doc_id) => {
    const query = {
        text: `
            SELECT 
                p.*, 
                s.grade_name, 
                s.sub_section,
                ultimo_hm.cod_hm,
                antro.peso,
                antro.estatura,
                antro.imc,
                antro.grasa,
                antro.fecha_medicion
            FROM patients as p
            INNER JOIN sections as s ON s.section_id = p.section_id 
            
            -- Buscamos el último historial médico para cada paciente
            LEFT JOIN LATERAL (
                SELECT cod_hm 
                FROM historial_medico 
                WHERE patient_id = p.patient_id 
                ORDER BY date_hm DESC 
                LIMIT 1
            ) AS ultimo_hm ON TRUE

            -- Obtenemos la antropometría vinculada a ese historial específico
            LEFT JOIN antropometria as antro ON antro.cod_hm = ultimo_hm.cod_hm
            
            WHERE p.doc_id = $1
            ORDER BY p.last_name_p ASC
        `,
        values: [doc_id]
    }

    const { rows } = await pool.query(query);
    return rows;
};

// -- obtener patient por id ------------------------------------------ *
export const getPatientsId = async (patient_id) => {

    const id = patient_id;

    //Traer info del usuario
    const patient_query = {
        text:`SELECT p.*, s.grade_name, s.sub_section FROM patients as p
        INNER JOIN sections as s on s.section_id = p.section_id 
        WHERE patient_id = $1`,

        values: [id]
    }

    const resUser = await pool.query(patient_query);

    if (resUser.rows.length === 0) {
        return null; 
    }

    const PatientId = resUser.rows[0].patient_id;

    const Hm_query = {
        text: `
        SELECT cod_hm FROM historial_medico
        WHERE patient_id = $1
        ORDER BY cod_hm DESC
        LIMIT 1
        `,

        values: [PatientId]
    }

    const resHm = await pool.query(Hm_query);
    
    let Hm_id = null;
    let Hm_data = {};

    if (resHm.rows.length > 0) {
        Hm_id = resHm.rows[0].cod_hm;
        Hm_data = resHm.rows[0];
    }
    
    // Antropometría
    const antropometria_query = {
        text: `SELECT * FROM antropometria 
        WHERE cod_hm = $1 
        ORDER BY fecha_medicion DESC`,
        
        values: [Hm_id]
    };
    const resAntropometria = await pool.query(antropometria_query);

    // Antecedentes
    const antecedentes_query = {
        text: `SELECT * FROM antecedentes 
        WHERE cod_hm = $1`,
        
        values: [Hm_id]
    };
    const resAntecedentes = await pool.query(antecedentes_query);

    return {
        ...resUser.rows[0],
        ...resHm.rows[0],
        antropometria: resAntropometria.rows[0],
        antecedentes: resAntecedentes.rows[0]
    }
};

// -- eliminar un paciente por id ------------------------------------- *
export const deletePatient = async (patient_id) => {

    const query = {
        text: `DELETE FROM patients 
        WHERE patient_id = $1
        RETURNING *`,
        values: [patient_id],
    }

    try {
        
        const { rows } = await pool.query(query);
        
        // Verifica si se eliminó alguna fila
        if (rows.length === 0) {
            const error = new Error("Usuario/Paciente no encontrado para eliminar.");
            error.status = 404; 
            throw error;
        }

        return rows[0]; 

    } catch (error) {

        console.error("Error al eliminar el paciente:", error);
        throw error; 
    }

};

// -- actualizar paciente por id -------------------------------------- 
export const UpdatePatient = async(patient_id, update) => {
    
const connect = await pool.connect();

const {
    doc_id,
    cedula_p,
    email_p,
    first_name_p,
    last_name_p,
    age_p,
    gender_p,
    create_p,
    update_p = new Date(),
    section_id
} = update

try{

    await connect.query('BEGIN');

    const update_patient_query = {
        text: `
        UPDATE patients
        SET doc_id = $1,
            cedula_p = $2,
            first_name_p = $3,
            last_name_p = $4,
            email_p = $5,
            age_p = $6,
            gender_p = $7,
            section_id = $8,
            create_p = $9,
            update_p = $10
        WHERE patient_id = $11
        RETURNING *
        `,

        values: [doc_id, cedula_p, first_name_p, last_name_p, email_p, age_p, gender_p, section_id, create_p, update_p, patient_id]
    }

    const {rows} = await connect.query(update_patient_query);

    await connect.query(`COMMIT`);

    return rows[0] || null;

}catch (error) {
    await connect.query('ROLLBACK');
    console.error('Error al actualizar el usuario:', error.message);
    throw error;
} finally {
    connect.release();
}

}

// -- crear paciente -------------------------------------- *
export const CreatePatient = async(patientData) => {

    const client = await pool.connect();

    //desestructuramos los datos de patientData
    const {
        doc_id,
        cedula_p,
        email_p,
        first_name_p,
        last_name_p, 
        age_p, 
        gender_p, 
        date_p,
        section_id,
        estado,

        //datos de historial
        antropometria,
        antecedentes,

    } = patientData

    try{
        
        //iniciar la transaccion de datos
        await client.query('BEGIN');

        //Verificamos si el doctor existe para seguir con la transaccion
        const docExists = await client.query('SELECT 1 FROM doctor WHERE doc_id = $1', [doc_id]);

        if (docExists.rows.length === 0) {
            return null;
        }

        // Query user -------------------------
        const patient_query = {
            text: `
            INSERT INTO patients (doc_id, cedula_p, first_name_p, last_name_p, email_p, age_p, gender_p, date_p, section_id, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            `,
            
            values: [doc_id, cedula_p, first_name_p, last_name_p, email_p, age_p, gender_p, date_p, section_id, estado]
        }

        const resPatient = await client.query(patient_query);
        const patient_id = resPatient.rows[0].patient_id; //guardamo el id de patient
        const NewUserPatient = resPatient.rows[0];

        // Query historial medico -------------------------
        const HisotialMedico_query = {
            text: `
            INSERT INTO historial_medico (patient_id)
            VALUES ($1)
            RETURNING cod_hm
            `,

            values: [patient_id]
        };

        const resHistorialM = await client.query(HisotialMedico_query);
        const codHm = resHistorialM.rows[0].cod_hm;

        // Query historial medico / antropometria -------------------------
        const Antropometria_query = {
            text: `
            INSERT INTO antropometria (cod_hm, peso, estatura, imc, grasa, circ_abdominal, riesgo_metabolico)
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
            `,
            values: [
                codHm, antropometria.peso, antropometria.estatura, antropometria.imc, antropometria.grasa, 
                antropometria.circ_abdominal, antropometria.riesgo_metabolico
            ],
        };

        const resAntropometria = await client.query(Antropometria_query);
        const NewAntropometria = resAntropometria.rows[0];

        //Query historial medico / antecedentes -----------------------------
        const Antecedentes_query = {
            text: `
            INSERT INTO antecedentes (
                cod_hm, motivo, cardiovascular, endocrinos, excrecion, gastrointestinales, ginecologicos, 
                hemato_oncologicos, inmunologicos, piel, musculo_esqueleticos, neurologicos, psicologicos, 
                respiratorios, otros
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
            RETURNING *
            `,

            values: [
            codHm,                         
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
        };

        const resAntecedentes = await client.query(Antecedentes_query);
        const NewAntecedentes = resAntecedentes.rows[0];

        await client.query('COMMIT');

        return {
            ...NewUserPatient,
            antecedentes: NewAntecedentes,
            antropometria: NewAntropometria,
        };

    }catch(error){
        await client.query('ROLLBACK'); 
        
        console.error("Error al registrar el paciente y su historial:", error.message);
        throw error; 
    
    } finally {
        client.release(); 
    }

}

// -- cambio de estado por id -------------------------------------- *
export const ChangeState = async(patient_id, estado) => {

const query = {
    text: `
    UPDATE patients
    SET estado = $1
    WHERE patient_id = $2
    RETURNING *
    `,
    values: [estado, patient_id]
}

try {
    const { rows } = await pool.query(query);
    return rows[0] || null;
} catch (error) {
    console.error("Error en ChangeState Model:", error);
    throw error; 
}

}