import { getAlimentos, deleteAlimento, createAlimento } from "../Models/Alimentos.js";

export const getAllAlimentos = async (req, res) => {

    try{
        const alimentos = await getAlimentos();

        res.status(200).json({
            alimentos: alimentos
        });
    
    }catch(error){
        res.status(500).json({
            message: "Error interno del servidor al listar los alimentos",
            error: error.message
        });
    }

}