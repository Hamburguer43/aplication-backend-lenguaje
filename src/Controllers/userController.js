import { getUsers, createUsers, findUserEmail, UpdateUser, DeleteUser } from "../Models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {

    try{

        //llama al modelo
        const users = await getUsers();

        //Envia la res al cliente
        res.status(200).json({
            count: users.length,
            users: users
        });

    }catch(error) {
        res.status(500).json({
            message: "Error interno del servidor al listar doctores",
            error: error.message
        });
    }

};

export const DeleteUserData = async (req, res) => {

    const doc_id = req.params.id;

    try{

        const users = await DeleteUser({doc_id});

        res.status(200).json({
            msg: `Usuario ${doc_id} eliminado con exito`,
            users: users
        });

    }catch(error) {
        res.status(500).json({
            message: "Error interno del servidor al listar usuarios",
            error: error.message
        });
    }

}

// -- Crear usuario -------------------------------------
export const RegisterUser = async (req, res) => {

    const { 
    username_doc, 
    email, 
    password, 
    first_name, 
    last_name, 
    age, 
    gender, 
    date_doc } = req.body

    try{


        // Validacion de email ----------------------------------------

        const IfexistingUser = await findUserEmail({email});

        if(IfexistingUser.length > 0){
            return res.status(409).json({
                ok: false,
                msg: "El email proporcionado ya está registrado. Intente iniciar sesión o use otro email."
            });
        }

        // Hashear password para encriptarla
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = await createUsers({
            username_doc,
            email,
            password: hashedPassword,
            first_name,
            last_name,
            age,
            gender,
            date_doc
        });

        const userCreated = newUser[0];

        const token = jwt.sign({
            doc_id: userCreated.doc_id, 
            email: userCreated.email,
        }, 
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // guardando el token en la cookie aseguramos que solo se envie en nuestro dominio, es decir, es nuestrar peticiones. Dandole una capa de seguridad al token, evita que el cookie se envie a otro sitio

        res.cookie('access_token', token, {
            httpOnly: true, // la cookie solo se accede en el servidor
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict',
        })

        return res.status(201).json({
            ok: true,
            msg: "Doctor creado y sesión iniciada con éxito",
            user: userCreated,
        });


    }catch (error) {

        //error de postgres cuando un valor unique se repite
        if (error.code === '23505') {
            
            let customMsg = "El nombre de usuario o el correo electrónico ya están en uso.";
            
            if (error.detail.includes('username_doc')) {
                customMsg = "El nombre de usuario ('" + username_doc + "') ya está en uso. Por favor, elija otro.";
            
            }else if (error.detail.includes('email')) { 
                customMsg = "El email proporcionado ya está registrado.";
            }

            return res.status(409).json({
                ok: false,
                msg: customMsg,
                errorType: "UNIQUE_VIOLATION"
            });
        }

        res.status(500).json({
            message: "Error interno del servidor al registrar usuario",
            error: error.message
        });
    }

}

// -- Actualizar usuario --------------------------------
export const UpdateDataUser = async (req, res) => {

    const user_id = req.params.id;
    const update = req.body; //obtiene los campo a actualizar

    try{
        
        const Update_user = await UpdateUser({user_id, ...update});
        
        if(!Update_user || !Update_user.user_id){
            return res.status(404).json({
                msg: "Usuario no encontrado"
            })

        }

        return res.status(200).json({
            ok: true,
            msg: "Actualizado con exito",
            user: Update_user
        });

    } catch (error){
        return res.status(500).json({
            msg: "Error al actualizar",
            error: error.message
        })
    }
    
};

export const loginUser = async (req, res) => {

const {email, password: password_plain} = req.body;

    try{
        
        const ExistingUser = await findUserEmail({email});

        if(ExistingUser.length === 0 ) {

            return res.status(401).json({
                ok: false,
                msg: "El email no esta registrado"
            })
        }

        const user = ExistingUser[0];

        const passwordValid = await bcrypt.compare(password_plain, user.password) // si no se encuentra una igualdad al comparar seria false

        if(!passwordValid){
            return res.status(401).json({
                ok: false,
                msg: "Clave incorrecta: Verifica la contrasena"
            })
        }

        // decimos que ignora el password para que no lo muestre, pero si lo devuelve
        
        const {password: passwordHash, ...existingUser} = user;

        // Generar token jwt donde pasamos la informacion critica del user logeado

        const token = jwt.sign({ 
            doc_id: user.doc_id,
            email: user.email, 
        }, 
            process.env.JWT_SECRET, // key secret
            
            {
                expiresIn: "1h"
            }
        ); 

        // guardando el token en la cookie aseguramos que solo se envie en nuestro dominio, es decir, es nuestrar peticiones. Dandole una capa de seguridad al token, evita que el cookie se envie a otro sitio

        res.cookie('access_token', token, {
            httpOnly: true, // la cookie solo se accede en el servidor
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict',
        })

        return res.status(200).json({
            ok: true,
            msg: "Login exitoso",
            user: existingUser,
        })

    } catch (error) {
        res.status(500).json({
            message: "Error interno del servidor al buscar el usuario",
            error: error.message
        });
    }

}


