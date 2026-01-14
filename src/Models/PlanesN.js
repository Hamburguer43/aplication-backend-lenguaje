import { text } from 'express';
import pool from '../dataBase.js';

// -- Consultas de planes --------------------------

export const getPlanDietas = async() => {

    const plan_query = {
        text: `
        SELECT * FROM plandieta
        `,
    }

    const {rows} = await pool.query(plan_query);
    return rows;

}

export const getPlanDietaById = async (patientId) => {
    
    const query = `
        SELECT 
            p.*,
            dh.dia,
            dh.hora_sugerida,
            r.nombre,
            r.cod_receta,
            r.calorias_total,
            r.proteinas_total,
            r.carbohidratos_total,
            r.grasas_total
        FROM planDieta p
        
        JOIN HorarioSemanal hs ON p.id_plan = hs.id_plan
        JOIN detalleHorario dh ON hs.cod_horario = dh.cod_horario
        JOIN Recetas r ON dh.cod_receta = r.cod_receta
        
        WHERE p.patient_id = $1 AND p.estado = 'actual'
        
        ORDER BY 
            CASE dh.dia 
                WHEN 'lunes' THEN 1 
                WHEN 'martes' THEN 2 
                WHEN 'miercoles' THEN 3 
                WHEN 'jueves' THEN 4 
                WHEN 'viernes' THEN 5 
                WHEN 'sabado' THEN 6 
                WHEN 'domingo' THEN 7 
            END, 
            dh.hora_sugerida;
    `;

    try {
        
        const res = await pool.query(query, [patientId]);
        
        if (res.rows.length === 0) return null;

        const planCompleto = {
            planNutricional: res.rows[0],
            comidasPorDia: {}
        };

        // Agrupamos las filas por día
        res.rows.forEach(fila => {
            
            if (!planCompleto.comidasPorDia[fila.dia]) {
                planCompleto.comidasPorDia[fila.dia] = [];
            }

            planCompleto.comidasPorDia[fila.dia].push({
                hora: fila.hora_sugerida,
                receta: fila.nombre,
                calorias_total: fila.calorias_total,
                proteinas_total: fila.proteinas_total,
                carbohidratos_total:fila.carbohidratos_total,
                grasas_total: fila.grasas_total, 
                id: fila.cod_receta
            });
        });

        return planCompleto;

    } catch (error) {
        console.error("Error al obtener el plan de dieta:", error);
        throw error;
    }
};

export const CreatePlanDieta = async (DataPLan) => {

    const connect = await pool.connect();

    const {
        patient_id,
        nameplan,
        objetivo,
        create_plan = new Date(),
        estado,
        horariosemanal,
        detallehorario //array de recetas (cod_receta, nombre, dia, hora)
    } = DataPLan

    try{

        await connect.query('BEGIN');

        // Si el nuevo plan es 'actual', ponemos los anteriores del paciente como 'utilizado'
        if (estado === 'actual') {
            await connect.query(
                `UPDATE plandieta SET estado = 'utilizado' 
                 WHERE patient_id = $1 AND estado = 'actual'`,
                [patient_id]
            );
        }

        // INSERT en plan dieta ----------------------------------------------------------
        const resPlan = await connect.query(
            `INSERT INTO planDieta (patient_id, nameplan, objetivo, create_plan, estado) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id_plan`,
            [patient_id, nameplan, objetivo, create_plan, estado]
        );
        const id_plan = resPlan.rows[0].id_plan

        // INSERT en horariosemanal ----------------------------------------------------------
        const resHorario = await connect.query(
            `INSERT INTO horariosemanal (nombre, id_plan) 
             VALUES ($1, $2) RETURNING cod_horario`,
            [horariosemanal.nombre, id_plan]
        );
        const cod_horario = resHorario.rows[0].cod_horario;

        // INSERT en detallehorario ----------------------------------------------------------
        for (const detalle of detallehorario) {
            await connect.query(
                `INSERT INTO detalleHorario (cod_horario, cod_receta, dia, hora_sugerida) 
                 VALUES ($1, $2, $3, $4)`,
                [cod_horario, detalle.cod_receta, detalle.dia, detalle.hora_sugerida]
            );
        }

        await connect.query('COMMIT');

    return{ success: true, id_plan };

    }catch (error) {
        await connect.query('ROLLBACK');
        console.error("Error en la transacción de creación de plan:", error);
        throw error;
    } finally {
        connect.release();
    }

}

export const UpdatePlanDieta = async (DataPlan) => {
    
    const connect = await pool.connect();
    const {
        id_plan,
        nameplan,
        objetivo,
        estado = 'actual',
        detallehorario
    } = DataPlan;

    try {
        
        await connect.query('BEGIN');

        await connect.query(
            `UPDATE plandieta SET namePlan = $1, objetivo = $2, estado = $3 
             WHERE id_plan = $4`,
            [nameplan, objetivo, estado, id_plan]
        );

        //obtenemos el codigo del horario para acceder a los detalles de ese horario
        const resHorario = await connect.query(
            `SELECT cod_horario FROM HorarioSemanal WHERE id_plan = $1`,
            [id_plan]
        );
        const cod_horario = resHorario.rows[0].cod_horario;

        //borramos todos las filas de detalle horario con ese codigo de horario para asi ingresar los valores editados
        //se hace una limpieza en pocas palabras
        await connect.query(
            `DELETE FROM detalleHorario WHERE cod_horario = $1`,
            [cod_horario]
        );

        
        for (const detalle of detallehorario) {
            await connect.query(
                `INSERT INTO detalleHorario (cod_horario, cod_receta, dia, hora_sugerida) 
                 VALUES ($1, $2, $3, $4)`,
                [cod_horario, detalle.cod_receta, detalle.dia, detalle.hora_sugerida]
            );
        }

        await connect.query('COMMIT');

        return{ success: true, id_plan };

    } catch (error) {
        await connect.query('ROLLBACK');
        console.error("Error en UpdatePlanDieta:", error);
        throw error;

    } finally {
        connect.release();
    }
};

export const DeletePlanDieta = async (id_plan) => {

    const plan_query = {
        text: `
        DELETE FROM plandieta
        WHERE id_plan = $1
        RETURNING *
        `,
        values: [id_plan]
    };

    const { rows } = await pool.query(plan_query);
    return rows[0] || null;

}