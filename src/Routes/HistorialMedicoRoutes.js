import { Router, json } from "express";
import { CreateAntropometriaPatient, getAntropometriaData, get_historialmedico, get_historialById } from "../Controllers/HistorialMedicoController.js";

const routerHistorialMedico = Router();

// Endpoint GET para obtener datos de antropometría por código de historial médico
routerHistorialMedico.get('/getAntropometria/:cod_hm', getAntropometriaData); 

//Endpoint POST para crear un nuevo registro de antropometria
routerHistorialMedico.post('/createAntropometria', CreateAntropometriaPatient);

routerHistorialMedico.get('/get_historiales', get_historialmedico);

routerHistorialMedico.get('/get_historial/:patient_id', get_historialById);

export default routerHistorialMedico;