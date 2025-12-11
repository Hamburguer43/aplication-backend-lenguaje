import { text } from 'express';
import pool from '../dataBase.js';

//ya hicimos el cambio a la tabla doctor, me falta modificar el de update (cambiar la función a una mejor)

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

// -- CRUD ------------------------------------------------------------

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

export const UpdateUser = async(userData) => {

// desestructuramos los campos
const {doc_id, ...update} = userData;

// filtra solo los campos que no esten undefined
const fields = Object.keys(update).filter(key => update[key] !== undefined);

if(fields.length === 0) {
    return{message: "No hay campos para actualizar"};
}

let Datauser = []; // array para almacenar los datos a actualizar
let values = [user_id];
let index = 2; // contador

//creamos un ciclo for que va desde 2 hasta n elementos que contenga fields

//con DateUser.push empujamos dentor del field el valor del index para que guarde los valores ej: $2, $3

for (const field of fields){
    Datauser.push(`${field} = $${index}`);
    values.push(update[field]);
    index++;
}

Datauser.push(`update_user = NOW()`);

    const query = {
        // toma los elementos del array y los une en una cadena de texto separandolos con (,)
        text: `UPDATE users
        SET ${Datauser.join(', ')} 
        WHERE user_id = $1
        RETURNING user_id, ${fields.join(', ')}, update_user`,

        values: values,
    };

    try {
        const { rows } = await pool.query(query);
        return rows[0];

    } catch (error) {
        throw new Error(`Error al actualizar el usuario: ${error.message}`);
    }

};

// -- Delete ----------------------------
export const DeleteUser = async({doc_id}) => {

    const query = {
        text: `DELETE FROM doctor
        WHERE doc_id = $1
        RETURNING doc_id`,

        values: [doc_id],
    }

    const {rows} = await pool.query(query);
    return rows;

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

