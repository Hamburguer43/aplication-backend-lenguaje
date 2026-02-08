import { Router } from "express";
import { descargarPlanPDF, descargarHistoryMPdf } from "../Controllers/PdfController.js";

const routerPdf = Router()

routerPdf.get('/Pdf_planN/:patient_id', descargarPlanPDF);

routerPdf.post('/Pdf_historyM', descargarHistoryMPdf);

export default routerPdf