import { json, Router } from "express";
import {DeleteUserData, getAllUsers, getUser_ById, loginUser, RegisterUser, UpdateDataUser } from "../Controllers/userController.js";
import { verifyToken } from "../Middlewares/jwtToken.middleware.js";

const routerUser = Router();

// Endpoint GET para traer la lista de usuarios
routerUser.get('/get_users', getAllUsers);

routerUser.get('/get_user/:doc_id', getUser_ById);

// Endopoint POST para crear un usuario
routerUser.post('/register_user', RegisterUser);

// Endopoint DELETE para eliminar un usuario
routerUser.delete('/delete_user/:doc_id', DeleteUserData);

// Endpoint PUT para actualizar usuario
routerUser.put('/update_user/:doc_id', UpdateDataUser);

// Endpoint POST para logear usuario
routerUser.post('/Login_user', loginUser);


//---------------------------------------------------------------------------

// Route protegido
routerUser.get('/profile', verifyToken, (req, res) => {
    
    //antes de ejecutar el return, pasa por el middleware y verifica si el token es correcto o si exite un token
    
    return res.status(200).json({
        ok: true,
        msg: 'Acceso concedido al sistema',
        
        userData: {
            doc_id: req.user.doc_id, // Acceso desde req.user
            email: req.user.email,
            rol: req.user.rol
        }
    });
})

// Route para cerrar sesion
routerUser.get('/logout', (req, res) => {
    
    // 1. Limpia la cookie 'access_token'
    res.clearCookie('access_token');

    return res.status(200).json({
        ok: true,
        msg: 'Sesión cerrada con éxito' 
    });
});



export default routerUser;