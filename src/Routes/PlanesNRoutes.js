import { Router, json } from "express";
import { 
    getAllPlanes, 
    getPlanPaciente,
    CreatePLan,
    UpdatePlan,
    DeletePlan 
} from "../Controllers/PlanesNController.js";

const routerPlanesN = Router();

routerPlanesN.get('/Get_Planes', getAllPlanes);

routerPlanesN.get('/Get_Plan/:patient_id', getPlanPaciente);

routerPlanesN.post('/Create_Plan', CreatePLan);

routerPlanesN.put('/Update_Plan', UpdatePlan);

routerPlanesN.delete('/Delete_Plan/:id_plan', DeletePlan);

export default routerPlanesN