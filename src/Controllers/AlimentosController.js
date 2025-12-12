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

export const delete_Alimento = async (req, res) => {
    
   const id = req.params.id

    try{
        
        const alimento = await deleteAlimento(id); 
    
        res.status(200).json({
            msg: `Alimento ${id} eliminado con exito`,
            alimento: alimento
        });

    }catch(error){
        if (error.status === 404) {
            return res.status(404).json({
                message: error.message 
            });
        }

        res.status(500).json({
            message: `Error interno del servidor al aliminar el alimento ${id}`,
            error: error.message
        });
    }

}

export const create_alimentos = async (req, res) => {

const {
name_a, 
unidad_base, 
calorias_base, 
proteinas_base, 
carbohidratos_base, 
grasas_base
} = req.body

try{
    
    const alimentoData = {
    name_a, 
    unidad_base, 
    calorias_base, 
    proteinas_base, 
    carbohidratos_base, 
    grasas_base
    };

    const newAlimento = await createAlimento(alimentoData);

    return res.status(201).json({
        ok: true,
        msg: "Alimento creado con exito",
        alimento: newAlimento
    })

}catch (error) {
        
    return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor al crear el paciente."
    });

}

}