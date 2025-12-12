import { Router, json } from "express";
import { create_alimentos, delete_Alimento, getAllAlimentos } from "../Controllers/AlimentosController.js";

const routerAlimentos = Router();

routerAlimentos.get('/', getAllAlimentos);

routerAlimentos.delete('/deleteAlimento/:id', delete_Alimento);

routerAlimentos.post('/createAlimento', create_alimentos);

export default routerAlimentos;