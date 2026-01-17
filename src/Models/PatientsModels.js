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
        text:`SELECT * FROM patients
        WHERE doc_id = $1`,

        values: [doc_id]
    }

    const {rows} = await pool.query(query);
    return rows;

};

// -- obtener patient por id ------------------------------------------ *
export const getPatientsId = async (patient_id) => {

    const id = patient_id;

    //Traer info del usuario
    const patient_query = {
        text:`SELECT * FROM patients
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
    
    // a) Antropometría
    const antropometria_query = {
        text: `SELECT * FROM antropometria 
        WHERE cod_hm = $1 
        ORDER BY fecha_medicion DESC`,
        
        values: [Hm_id]
    };
    const resAntropometria = await pool.query(antropometria_query);

    // b) Tratamientos
    const tratamientos_query = {
        text: `SELECT * FROM tratamientos 
        WHERE cod_hm = $1`,
        
        values: [Hm_id]
    };
    const resTratamientos = await pool.query(tratamientos_query);

    // c) Antecedentes
    const antecedentes_query = {
        text: `SELECT * FROM antecedentes 
        WHERE cod_hm = $1`,
        
        values: [Hm_id]
    };
    const resAntecedentes = await pool.query(antecedentes_query);

    return {
        ...resUser.rows[0],
        ...resHm.rows[0],
        historial_medico: {
        antropometria: resAntropometria.rows[0],
        tratamientos: resTratamientos.rows[0],
        antecedentes: resAntecedentes.rows[0]
        }
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
    name_p,
    email_p,
    first_name_p,
    last_name_p,
    age_p,
    gender_p,
    create_p,
    update_p = new Date()
} = update

try{

    await connect.query('BEGIN');

    const update_patient_query = {
        text: `
        UPDATE patients
        SET doc_id = $1,
            name_p =$2,
            email_p =$3,
            first_name_p =$4,
            last_name_p =$5,
            age_p =$6,
            gender_p =$7,
            create_p =$8,
            update_p =$9
        WHERE patient_id = $10
        RETURNING *
        `,

        values: [doc_id, name_p, email_p, first_name_p, last_name_p, age_p, gender_p, create_p, update_p, patient_id]
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
        name_p,
        email_p,
        first_name_p,
        last_name_p, 
        age_p, 
        gender_p, 
        date_p,

        //datos de historial
        antropometria,
        antecedentes,
        tratamientos

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
            INSERT INTO patients (doc_id, name_p, email_p, first_name_p, last_name_p, age_p, gender_p, date_p)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            
            values: [doc_id, name_p, email_p, first_name_p, last_name_p, age_p, gender_p, date_p]
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
            INSERT INTO antropometria (cod_hm, peso, estatura, imc, grasa, circ_abdominal, masa_muscular)
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
            `,
            values: [
                codHm, antropometria.peso, antropometria.estatura, antropometria.imc, antropometria.grasa, 
                antropometria.circ_abdominal, antropometria.masa_muscular
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

        //Query historial medico / antecedentes -----------------------------
        const tratamientos_query = {
            text: `
                INSERT INTO tratamientos (cod_hm, medico, quirurgico, paliativos)
                VALUES ($1, $2, $3, $4) 
                RETURNING *
            `,
            
            values: [
                codHm,                     
                tratamientos.medico,       
                tratamientos.quirurgico,   
                tratamientos.paliativos    
            ]
        };

        const resTratamientos = await client.query(tratamientos_query);
        const NewTratamientos = resTratamientos.rows[0];

        await client.query('COMMIT');

        return {
            ...NewUserPatient,
            antecedentes: NewAntecedentes,
            antropometria: NewAntropometria,
            tratamientos: NewTratamientos
        };

    }catch(error){
        await client.query('ROLLBACK'); 
        
        console.error("Error al registrar el paciente y su historial:", error.message);
        throw error; 
    
    } finally {
        client.release(); 
    }

}

// -- buscar email paciente por id -------------------------------------- *
export const findPatientEmailP = async({email_p, name_p}) => {

   const resDoc = await pool.query({
        text: `SELECT email, username_doc FROM doctor WHERE email = $1 OR username_doc = $2`,
        values: [email_p, name_p]
    });

    const resPat = await pool.query({
        text: `SELECT email_p, name_p FROM patients WHERE email_p = $1 OR name_p = $2`,
        values: [email_p, name_p]
    });

    if (resDoc.rows.length > 0) {
        return {
            email: resDoc.rows[0].email,
            name: resDoc.rows[0].username_doc,
            origin: 'doctor' 
        };
    }

    if (resPat.rows.length > 0) {
        return {
            email: resPat.rows[0].email_p,
            name: resPat.rows[0].name_p,
            origin: 'paciente'
        };
    }

    return null;
}