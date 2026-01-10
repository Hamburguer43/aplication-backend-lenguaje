import { Router, json } from "express";
import { 
    create_alimentos, 
    delete_Alimento, 
    getAllAlimentos, 
    getAllRecetas,
    delete_Receta,
    create_receta
} from "../Controllers/Alimentos_RecetasController.js";

const routerAlimentos = Router();

//-- Rutas de alimentos --------------------------------------

routerAlimentos.get('/', getAllAlimentos);

routerAlimentos.delete('/deleteAlimento/:id', delete_Alimento);

routerAlimentos.post('/createAlimento', create_alimentos);

//-- Rutas de recetas ---------------------------------------

routerAlimentos.get('/recetas', getAllRecetas);

routerAlimentos.delete('/deleteReceta/:cod_receta', delete_Receta);

routerAlimentos.post('/createReceta', create_receta);

export default routerAlimentos;