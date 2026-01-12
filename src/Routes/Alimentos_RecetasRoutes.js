import { Router, json } from "express";
import { 
    create_alimentos, 
    delete_Alimento, 
    getAllAlimentos, 
    getAllRecetas,
    getReceta_ById,
    delete_Receta,
    create_receta,
    update_receta
} from "../Controllers/Alimentos_RecetasController.js";

const routerAlimentos = Router();

//-- Rutas de alimentos --------------------------------------

routerAlimentos.get('/Get_alimentos', getAllAlimentos);

routerAlimentos.delete('/deleteAlimento/:id', delete_Alimento);

routerAlimentos.post('/createAlimento', create_alimentos);

//-- Rutas de recetas ---------------------------------------

routerAlimentos.get('/Get_recetas', getAllRecetas);

routerAlimentos.get('/Get_receta/:cod_receta', getReceta_ById);

routerAlimentos.delete('/deleteReceta/:cod_receta', delete_Receta);

routerAlimentos.post('/createReceta', create_receta);

routerAlimentos.put('/updateReceta/:cod_receta', update_receta);

export default routerAlimentos;