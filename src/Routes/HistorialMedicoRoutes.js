import { Router, json } from "express";
import { 
    CreateAntropometriaPatient, 
    getAntropometriaData, 
    get_historialmedico, 
    get_historialById,
    create_historial 
} from "../Controllers/HistorialMedicoController.js";

const routerHistorialMedico = Router();

// Endpoint GET para obtener datos de antropometría por código de historial médico
routerHistorialMedico.get('/getAntropometria/:patient_id', getAntropometriaData); 

//Endpoint POST para crear un nuevo registro de antropometria
routerHistorialMedico.post('/createAntropometria', CreateAntropometriaPatient);

routerHistorialMedico.get('/get_historiales', get_historialmedico);

routerHistorialMedico.get('/get_historial/:patient_id', get_historialById);

routerHistorialMedico.post('/create_historial', create_historial);

export default routerHistorialMedico;