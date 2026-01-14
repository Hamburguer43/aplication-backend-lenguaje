import { 
    getPlanDietas, 
    getPlanDietaById,
    CreatePlanDieta,
    UpdatePlanDieta,
    DeletePlanDieta
} from "../Models/PlanesN.js";

export const getAllPlanes = async(req, res) => {

    try{
        const planes = await getPlanDietas();

        if(planes.length === 0){
            return res.status(404).json({
                message: "No se encontraron planes nutricionales en la base de datos"
            });
        }

        res.status(200).json({
            planes: planes
        });

    }catch(error){
        res.status(500).json({
            message: "Error interno del servidor al listar los planes nutricionales",
            error: error.message
        });
    }


}

export const getPlanPaciente = async (req, res) => {

    const patient_id = req.params.patient_id;

    try {
        
        const plan = await getPlanDietaById(patient_id);

        console.log("plan", plan);

        if (!plan) {
            return res.status(404).json({ 
                msg: "No se encontró un plan de dieta activo para este paciente." 
            });
        }

        return res.status(200).json(plan);

    } catch (error) {
        // 5. Manejo de errores del servidor
        console.error("Error en getPlanPaciente Controller:", error);
        return res.status(500).json({ 
            msg: "Hubo un error interno en el servidor al procesar la dieta." 
        });
    }
};

export const CreatePLan = async (req, res) => {

    const {DataPlan} = req.body

    if (!DataPlan) {
        return res.status(400).json({ 
            msg: "No se recibieron los datos del plan (DataPlan es requerido)." 
        });
    }

    try{

        const newPlan = await CreatePlanDieta(DataPlan);

        return res.status(201).json({
            msg: "Plan de dieta creado exitosamente",
            plan: newPlan
        });

    } catch (error) {
       
        console.error("Error en CreatePlan Controller:", error);

        
        if (error.code === '23505') {
            return res.status(409).json({ 
                msg: "Ya existe un registro similar para este horario y día." 
            });
        }

        return res.status(500).json({ 
            msg: "Error interno al crear el plan. Se han cancelado todos los cambios.",
            error: error.message 
        });
    }

}

export const UpdatePlan = async (req, res) => {

    const DataPLan = req.body

    if(!DataPLan.id_plan) {
        return res.status(400).json({
            message: "El código del plan (id_plan) es obligatorio para actualizar."
        });
    }

    try{
        
        const resUpdate = await UpdatePlanDieta(DataPLan);

        if(!resUpdate){
            return  res.status(404).json({
                message: `Plan nutricional con codigo ${DataPLan.id_plan} no existente`
            });
        }

        res.status(200).json({
            message: `Plan nutricional ${DataPLan.id_plan} actualizado con exito`,
            Plan: resUpdate
        })

    }catch(error){
        
        console.error("Error en UpdatePlan Controller:", error);
        
        return res.status(500).json({
            message: "Error interno al intentar actualizar el plan nutricional.",
            error: error.message
        });
    }

}

export const DeletePlan = async (req, res) => {

    const id_plan = req.params.id_plan;

    try{

        const planDelete = await DeletePlanDieta(id_plan);

        if(planDelete !== null){
            res.status(200).json({
            msg: `plan nutricional con codigo ${id_plan} eliminado con exito`,
            plan: planDelete
        });

        } else {
            res.status(404).json({
                message: `Plan nutricional con codigo ${id_plan} no existe o no se encontró`
            });
        }
        

    } catch(error){
        if (error.status === 404) {
            return res.status(404).json({
                message: error.message 
            });
        }

        res.status(500).json({
            message: `Error interno del servidor al aliminar el Pla nutricional: ${id_plan}`,
            error: error.message
        });
    }

}