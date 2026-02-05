import { Router, json } from "express";
import { Create_Patient, deletePatientData, getAllPatient, getPatient, UpdateDataPatient, patients, Change_state } from "../Controllers/PatientController.js";

const routerPatient = Router();

routerPatient.get('/obtenerP', patients);

//Endpoint GET para traer la lista de pacientes
routerPatient.get('/', getAllPatient);

//Endpoint GET para traer un paciente por id
routerPatient.get('/data/:patient_id', getPatient);

//Endpoint DELETE para eliminar pacientes
routerPatient.delete('/deletePatient/:id', deletePatientData);

//Endpoint PUT para actualizar campos del paciente
routerPatient.put('/updatePatient/:patient_id', UpdateDataPatient);

//Endpoint PUT para cambiar el estado del paciente ej: de "pendiente" a "inscrito"
routerPatient.put('/changeState/:patient_id', Change_state);

//Endpoint POST para crear un patient
routerPatient.post('/createPatient', Create_Patient);

export default routerPatient;