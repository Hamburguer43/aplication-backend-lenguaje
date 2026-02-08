import { generatePDF } from '../Utilities/GeneratorPdf.js';
import { getPlanDietaById } from '../Models/PlanesN.js';
import { generatePlanHTML } from '../Views/HtmlPlanDieta.js';
import { generatePacienteHTML } from '../Views/HtmlHistoryM.js';

export const descargarPlanPDF = async (req, res) => {
    
    try {
        
        const patient_id = req.params.patient_id; 
        
        const data = await getPlanDietaById(patient_id);
        if (!data || !data.planNutricional) {
            return res.status(404).json({ message: "No se encontró un plan para este paciente" });
        }

        // Generamos el html -------------------------
        const htmlContent = generatePlanHTML(data);

        // Generamos el pdf ---------------------------
        const buffer = await generatePDF(htmlContent);

        const nombreArchivo = data.planNutricional.nameplan.replace(/\s+/g, '_');
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${nombreArchivo}.pdf"`,
            'Content-Length': buffer.length
        });
        res.end(buffer);

    } catch (error) {
        console.error("Error en descargarPlanPDF:", error);
        res.status(500).json({ message: "Error al generar el PDF" });
    }
};

export const descargarHistoryMPdf = async (req, res) => {

try{

    const data = req.body
    console.log(data)

    const htmlContent = generatePacienteHTML(data);
    const buffer = await generatePDF(htmlContent);
    const nombreArchivo = `${data.first_name_p}_${data.last_name_p}`.replace(/\s+/g, '_');

    res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${nombreArchivo}.pdf"`,
            'Content-Length': buffer.length
        });
    res.end(buffer);

}catch(error){
     console.error("Error en descargarHistoryMPdf:", error);
    res.status(500).json({ message: "Error al generar el PDF" });
}

}