import { Router, json } from "express";
import { getAllAlimentos } from "../Controllers/AlimentosController.js";

const routerAlimentos = Router();

routerAlimentos.get('/', getAllAlimentos);

export default routerAlimentos;