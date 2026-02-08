export const generatePacienteHTML = (data) => {
    const { 
        first_name_p, last_name_p, cedula_p, age_p, gender_p, grade_name, cod_hm, 
        antropometria, antecedentes 
    } = data;

    const formatValue = (val) => val === true 
        ? '<span style="color: #c2410c; font-weight: bold;">SÍ</span>' 
        : '<span style="color: #94a3b8;">No</span>';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            @page { margin: 40px; }
            body { font-family: 'Helvetica', Arial, sans-serif; color: #1e293b; line-height: 1.4; }
            
            /* Header y Fecha Slot */
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #15803d; padding-bottom: 10px; margin-bottom: 20px; }
            .fecha-slot { background: #f1f8f3; border: 1px solid #15803d; padding: 8px 15px; border-radius: 6px; text-align: center; }
            .fecha-label { font-size: 10px; font-weight: bold; color: #15803d; text-transform: uppercase; display: block; }
            .fecha-value { font-size: 14px; font-weight: bold; }

            .section-title { background: #15803d; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 20px; }
            
            /* Grid Systems */
            .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
            .grid-4col { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }
            
            .card { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #fff; }
            .label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 2px; }
            .value { font-size: 13px; font-weight: 600; color: #0f172a; }

            /* Estilo específico para lista de antecedentes en 2 columnas */
            .antecedentes-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            .ant-item { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1 style="margin: 0; color: #15803d; font-size: 22px;">Historia Médica Nutricional</h1>
                <p style="margin: 0; font-size: 14px; color: #64748b;">${first_name_p} ${last_name_p}</p>
            </div>
            <div class="fecha-slot">
                <span class="fecha-label">Fecha de Medición: ${new Date(antropometria.fecha_medicion).toLocaleDateString('es-ES')}</span>
                <span class="fecha-label">Codigo: ${cod_hm}</span>
            </div>
        </div>

        <div class="section-title">Datos Personales</div>
        <div class="grid-4col">
            <div class="card"><span class="label">Cédula</span><span class="value">${cedula_p}</span></div>
            <div class="card"><span class="label">Edad</span><span class="value">${age_p} años</span></div>
            <div class="card"><span class="label">Género</span><span class="value" style="text-transform: capitalize;">${gender_p}</span></div>
            <div class="card"><span class="label">Grado</span><span class="value">${grade_name}</span></div>
        </div>

        <div class="section-title">Evaluación Antropométrica</div>
        <div class="grid-4col">
            <div class="card"><span class="label">Peso</span><span class="value">${antropometria.peso} kg</span></div>
            <div class="card"><span class="label">Estatura</span><span class="value">${antropometria.estatura} cm</span></div>
            <div class="card"><span class="label">IMC</span><span class="value">${antropometria.imc}</span></div>
            <div class="card"><span class="label">Grasa %</span><span class="value">${antropometria.grasa}%</span></div>
        </div>
        <div class="grid-2col" style="margin-top: 10px;">
            <div class="card" style="border-left: 4px solid #15803d;">
                <span class="label">Riesgo Metabólico</span>
                <span class="value" style="font-size: 16px;">${antropometria.riesgo_metabolico}</span>
            </div>
            <div class="card">
                <span class="label">Circ. Abdominal</span>
                <span class="value">${antropometria.circ_abdominal} cm</span>
            </div>
        </div>

        <div class="section-title">Antecedentes Médicos</div>
        <div class="antecedentes-container">
            <div class="ant-item"><span class="value" style="font-size: 11px;">Cardiovascular</span> <span>${formatValue(antecedentes.cardiovascular)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Endocrinos</span> <span>${formatValue(antecedentes.endocrinos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Gastrointestinales</span> <span>${formatValue(antecedentes.gastrointestinales)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Excreción</span> <span>${formatValue(antecedentes.excrecion)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Ginecológicos</span> <span>${formatValue(antecedentes.ginecologicos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Hemato-Oncológicos</span> <span>${formatValue(antecedentes.hemato_oncologicos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Inmunológicos</span> <span>${formatValue(antecedentes.inmunologicos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Piel / Tegumentos</span> <span>${formatValue(antecedentes.piel)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Músculo-Esqueléticos</span> <span>${formatValue(antecedentes.musculo_esqueleticos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Neurológicos</span> <span>${formatValue(antecedentes.neurologicos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Psicológicos</span> <span>${formatValue(antecedentes.psicologicos)}</span></div>
            <div class="ant-item"><span class="value" style="font-size: 11px;">Respiratorios</span> <span>${formatValue(antecedentes.respiratorios)}</span></div>
        </div>

        <div class="card" style="margin-top: 15px;">
            <span class="label">Observaciones Adicionales</span>
            <p style="font-size: 12px; margin: 5px 0;">${antecedentes.otros || 'Sin observaciones registradas.'}</p>
        </div>

        <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <p style="font-size: 10px; color: #94a3b8;">Este documento es un reporte médico oficial generado por NutriApp.</p>
        </div>
    </body>
    </html>
    `;
};