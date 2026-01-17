import { 
    CreateNewAntropometria, 
    getAntropometria ,
    getHistorialMedicos,
    getHistorialById
} from "../Models/Historial_medico.js";
import { CalculateAntropometria } from "../Utilities/Datefunc.js";


export const getAntropometriaData = async (req, res) => {

const cod_hm = req.params.cod_hm;

try {
    
    const antropometria = await getAntropometria(cod_hm);

    if (antropometria.length === 0) {
        return res.status(404).json({
            message: `No se encontraron datos de antropometría para el historial médico con código ${cod_hm}`
        });
    }

    return res.status(200).json({
        message: 'Datos de antropometría obtenidos exitosamente',
        data: antropometria
    });

}catch (error) {
    return res.status(500).json({
        message: 'Error al obtener los datos de antropometría',
        error: error.message
    });
}

}

export const CreateAntropometriaPatient = async (req, res) => {

    const { 
        peso, 
        estatura, 
        circ_abdominal, 
        masa_muscular,
        age_p,
        gender_p, 
        cod_hm 
    } = req.body;

    const antropometriaData = {
        peso,
        estatura,
        circ_abdominal,
        masa_muscular,
    }  

    if (peso === null || estatura === null || circ_abdominal === null || masa_muscular === null) {

        return res.status(400).json({
            message: 'Error de validación: Los campos no pueden enviarse vacios. Introduce valores validos',
        });

    }

    try {
        
        const antropometriaCalculada = CalculateAntropometria(antropometriaData, age_p, gender_p);
        const newAntropometria = await CreateNewAntropometria(antropometriaCalculada, cod_hm);

        return res.status(201).json({
            message: 'Registro de antropometría creado correctamente.',
            antropometria: newAntropometria
        });


    }catch (error) {

        return res.status(500).json({
            message: 'Error en el controlador al crear un nuevo registro de antropometria',
            error: error.message
        });
    
    }

}

export const get_historialmedico = async (req, res) => {

    try{

        const historial = await getHistorialMedicos();

        if(historial.length === 0){
            msg: `No se encontraron historiales medicos registrados en la base de datos`
        }

        return res.status(200).json({
        message: 'Historiales medicos obtenidos exitosamente',
        data: historial
        });


    }catch(error){
        return res.status(500).json({
            message: 'Error al consultar los datos en el servidor',
            error: error.message
        });

    }

}

export const get_historialById = async (req, res) => {

    const patient_id = req.params.patient_id;

    try{

    const historial = await getHistorialById(patient_id);

    if(historial.length === 0){
        return res.status(404).json({
            msg: `No hay historiales meidcos registrados para este paciente ${patient_id}`
        })
    }

    res.status(200).json({
        msg: `Historial medico obtenido exitosamente`,
        historial_medico: historial 
    })

    }catch(error){
        return res.status(500).json({
            message: 'Error al consultar los datos en el servidor',
            error: error.message
        });

    }

}