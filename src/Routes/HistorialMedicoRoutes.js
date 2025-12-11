import { Router, json } from "express";
import { CreateAntropometriaPatient, getAntropometriaData } from "../Controllers/HistorialMedicoController.js";

const routerHistorialMedico = Router();

// Endpoint GET para obtener datos de antropometría por código de historial médico
routerHistorialMedico.get('/getAntropometria/:cod_hm', getAntropometriaData); 

//Endpoint POST para crear un nuevo registro de antropometria
routerHistorialMedico.post('/createAntropometria', CreateAntropometriaPatient);

export default routerHistorialMedico;