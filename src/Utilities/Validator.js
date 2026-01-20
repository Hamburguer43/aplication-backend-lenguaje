import pool from "../dataBase.js";
import { text } from "express";

export const checkIdentityConflict = async (email, username, excludeId = null) => {
    const query = {
        text: `
            SELECT 'doctor' as type, email, username_doc as username FROM doctor 
            WHERE email = $1 OR username_doc = $2
            
            UNION ALL
            
            SELECT 'patient' as type, email_p as email, name_p as username FROM patients 
            WHERE (email_p = $1 OR name_p = $2)
            AND ($3::INT IS NULL OR patient_id != $3)
        `,
        values: [email, username, excludeId]
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