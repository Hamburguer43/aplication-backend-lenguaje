import { 
    getAlimentos, 
    deleteAlimento, 
    createAlimento, 
    findAlimentoByname, 
    getRecetas,
    deleteReceta,
    createReceta,
    findRecetaByName
} from "../Models/Alimentos_Recetas.js";


//-- Controladores de alimentos ----------------------------

//-- Listar todos los alimentos ------------------------------
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

//-- Eliminar un alimento por id ------------------------------
export const delete_Alimento = async (req, res) => {
    
   const id = req.params.id

    try{
        
        const alimento = await deleteAlimento(id); 

        if (alimento !== null) {
        res.status(200).json({
            msg: `Alimento ${id} eliminado con exito`,
            alimento: alimento
        });
        } else {
            res.status(404).json({
                message: `Alimento con id ${id} no encontrado`
            });
        }

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

//-- Crear un nuevo alimento ------------------------------
export const create_alimentos = async (req, res) => {

const {
name_a, 
unidad_medida, 
calorias_base, 
proteinas_base, 
carbohidratos_base, 
grasas_base
} = req.body

try{
    
    const existingAlimento = await findAlimentoByname(name_a);

    if (existingAlimento) {
        return res.status(400).json({
            ok: false,
            msg: `El alimento con nombre ${name_a} ya existe.`,
        });
    }

    const newAlimento = await createAlimento(name_a, unidad_medida, calorias_base, proteinas_base, carbohidratos_base, grasas_base);

    return res.status(201).json({
        ok: true,
        msg: "Alimento creado con exito",
        alimento: newAlimento
    })

}catch (error) {
        
    return res.status(500).json({
        ok: false,
        msg: "Error interno en el servidor al crear el alimento",
        error: error.message
    });

}

}

//-- Controladores de recetas ----------------------------

export const getAllRecetas = async (req, res) => {
    
    try{
        const recetas = await getRecetas();

        res.status(200).json({
            recetas: recetas
        });
    
    }catch(error){
        res.status(500).json({
            message: "Error interno del servidor al listar las recetas",
            error: error.message
        });
    }

}

export const delete_Receta = async (req, res) => {

    const cod_receta = req.params.cod_receta;

    try{
        
        const receta = await deleteReceta(cod_receta); 

        if (receta !== null) {
        res.status(200).json({
            msg: `receta ${cod_receta} eliminado con exito`,
            receta: receta
        });
        } else {
            res.status(404).json({
                message: `receta con id ${cod_receta} no encontrado`
            });
        }

    }catch(error){
        if (error.status === 404) {
            return res.status(404).json({
                message: error.message 
            });
        }

        res.status(500).json({
            message: `Error interno del servidor al aliminar la receta: ${cod_receta}`,
            error: error.message
        });
    }

}

export const create_receta = async (req, res) => {

    const {
        nombre,
        descripcion,
        observacion,
        calorias_total,
        proteinas_total,
        carbohidratos_total,
        grasas_total,
        creado_por,
        fecha_creacion,
        detalle_receta,
    } = req.body;

    try{

        const existingReceta = await findRecetaByName(nombre);

        if (existingReceta) {
            return res.status(400).json({
                message: `La receta con nombre ${nombre} ya existe.`,
            });
        }
        
        const recetaData = {
            nombre,
            descripcion,
            observacion,
            calorias_total,
            proteinas_total,
            carbohidratos_total,
            grasas_total,
            creado_por,
            fecha_creacion,
            detalle_receta //array de alimentos
        };

        const newReceta = await createReceta(recetaData);

        return res.status(201).json({
            message: "Receta creada con exito",
            receta: newReceta
        });

    } catch (error) {
     
        res.status(500).json({
            message: "Error interno del servidor al crear la receta",
            error: error.message
        });

    }
}
