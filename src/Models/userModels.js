import { text } from 'express';
import pool from '../dataBase.js';


// -- Obtener users ------------------------------------------------

export const getUsers = async () => {

    try{
        const {rows} = await pool.query('SELECT * FROM Doctor');
        return (rows);

    }catch(error){
        console.error("Error al obtener los doctores de la Db");
        throw new Error("No se pudo obtener la lista de doctores");
    }

}; 

export const getUserById = async (doc_id) => {

const user_query = {
    text: `
    SELECT * FROM doctor
    WHERE doc_id = $1
    `,
    values: [doc_id]
}

const {rows} = await pool.query(user_query);
return rows[0] || null;

}

// -- Create ----------------------------
export const createUsers = async({
    username_doc, 
    email, 
    password, 
    first_name, 
    last_name, 
    age, 
    gender, 
    date_doc
}) => {

    const query = {
        
        text: `
        INSERT INTO doctor (username_doc, email, password, first_name, last_name, age, gender, date_doc)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,

        values: [username_doc, email, password, first_name, last_name, age, gender, date_doc]

    }

    const {rows} = await pool.query(query);
    return rows;

}

// -- Update ----------------------------

export const UpdateUser = async(doc_id, update) => {

const connect = await pool.connect();

const {
    username_doc, 
    email,  
    first_name, 
    last_name, 
    age, 
    gender, 
    date_doc,
    create_doc,
    update_doc = new Date()
} = update

try{

     await connect.query('BEGIN');

     const update_user_query = {
        text: `
        UPDATE doctor
        SET username_doc =$1,
        email =$2,
        first_name =$3,
        last_name =$4,
        age =$5,
        gender =$6,
        date_doc =$7,
        create_doc =$8,
        update_doc =$9
        WHERE doc_id = $10
        RETURNING *;
        `,
        
        values: [
            username_doc,
            email,
            first_name,
            last_name,
            age,
            gender,
            date_doc,
            create_doc,
            update_doc,
            doc_id
        ]
     }

    const {rows} = await connect.query(update_user_query);

    await connect.query(`COMMIT`);

    return rows[0] || null;

}catch (error) {
    await connect.query('ROLLBACK');
    console.error('Error al actualizar el usuario:', error.message);
    throw error;
} finally {
    connect.release();
}

};

// -- Delete ----------------------------
export const DeleteUser = async({doc_id}) => {

    const query = {
        text: `DELETE FROM doctor
        WHERE doc_id = $1
        RETURNING *`,

        values: [doc_id],
    }

    const {rows} = await pool.query(query);
    return rows[0] || null;

}

// -- Login --------------------------------------------------------
export const findUserEmail = async({email}) => {


    const query = {

        text: `
        SELECT email, password, doc_id FROM doctor
        WHERE email = $1
        `,
        
        values: [email]

    }    

    const {rows} = await pool.query(query);
    return rows;

}

export const ValidationEmail = async(email, doc_id) => {

    const query = {

        text: `
        SELECT email, doc_id FROM doctor
        WHERE email = $1 AND doc_id != $2
        `,
        
        values: [email, doc_id]

    }    

    const {rows} = await pool.query(query);
    return rows;

}

