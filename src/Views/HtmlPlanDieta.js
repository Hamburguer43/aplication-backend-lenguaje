export const generatePlanHTML = (data) => {
    
    const { planNutricional, comidasPorDia } = data;

    // Función auxiliar para generar las filas de las tablas
    const renderComidas = (comidas) => comidas.map(c => `
        <tr>
            <td>${c.hora}</td>
            <td>${c.receta}</td>
            <td>${c.calorias_total} kcal</td>
            <td>${c.proteinas_total}g</td>
            <td>${c.carbohidratos_total}g</td>
            <td>${c.grasas_total}g</td>
        </tr>
    `).join('');

    // Estructura principal del documento
    
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">        
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; padding: 40px; }
            .header { border-bottom: 3px solid #2ecc71; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { color: #27ae60; margin: 0; font-size: 24px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; background: #f4f4f4; padding: 15px; border-radius: 5px; }
            .dia-contenedor { margin-bottom: 30px; page-break-inside: avoid; }
            h2 { background: #2ecc71; color: white; padding: 8px 15px; border-radius: 5px; text-transform: capitalize; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #ecf0f1; color: #2c3e50; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #bdc3c7; font-size: 13px; }
            td { padding: 10px; border: 1px solid #bdc3c7; font-size: 12px; }
            .observaciones { margin-top: 20px; padding: 15px; border-left: 5px solid #e67e22; background: #fff5e6; }
            .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #95a5a6; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${planNutricional.nameplan}</h1>
        </div>

        <div class="meta-info">
            <div>
                <p><strong>Objetivo:</strong> ${planNutricional.objetivo}</p>
                <p><strong>Fecha:</strong> ${new Date(planNutricional.create_plan).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
                <p><strong>Estado:</strong> ${planNutricional.estado}</p>
                <p><strong>Paciente ID:</strong> ${planNutricional.patient_id}</p>
            </div>
        </div>

        <div class="observaciones">
            <strong>Indicaciones del Nutricionista:</strong><br>
            ${planNutricional.observaciones.replace(/\n/g, '<br>')}
        </div>

        ${Object.keys(comidasPorDia).map(dia => `
            <div class="dia-contenedor">
                <h2>${dia}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Receta</th>
                            <th>Calorías</th>
                            <th>Proteínas</th>
                            <th>Carbohidratos</th>
                            <th>Grasas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderComidas(comidasPorDia[dia])}
                    </tbody>
                </table>
            </div>
        `).join('')}

        <div class="footer">Generado por NutriApp - Tu salud es nuestra prioridad</div>
    </body>
    </html>
    `;
};