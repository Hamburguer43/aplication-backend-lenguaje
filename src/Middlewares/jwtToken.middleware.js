import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    
    const token = req.cookies.access_token;

    if (!token) {
        // No hay token en las cookies
        return res.status(401).json({ 
            ok: false, 
            msg: 'Acceso denegado. No se proporcionó token.' 
        });
    }

    try {
        
        //verificamos que el token obtenido de las cookies tenga la key secrect
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    
        // mandamos en el req el payload del token que creamos 
        req.user = decodedPayload;

        next(); 

    } catch (error) {
        return res.status(401).json({ 
            ok: false, 
            msg: 'Token inválido o expirado.', 
            error: error.message 
        });
    }
};