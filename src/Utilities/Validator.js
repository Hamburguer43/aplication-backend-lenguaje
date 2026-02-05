import pool from "../dataBase.js";
import { text } from "express";

export const checkIdentityConflict = async (email, cedula_p, excludeId = null) => {
    const query = {
        text: `
            SELECT 'email_doctor' as tipo_conflicto, email as valor FROM doctor 
            WHERE email = $1
            
            UNION ALL
            
            SELECT 'cedula_paciente' as tipo_conflicto, cedula_p as valor FROM patients 
            WHERE cedula_p = $2
            AND ($3::INT IS NULL OR patient_id != $3)
        `,
        values: [email, cedula_p, excludeId]
    };

    const { rows } = await pool.query(query);
    return rows; 
};
export const existsPatient = async (patient_id) => {
    const query = {
        text: 'SELECT 1 FROM patients WHERE patient_id = $1',
        values: [patient_id]
    };
    const { rows } = await pool.query(query);
    return rows.length > 0; 
};