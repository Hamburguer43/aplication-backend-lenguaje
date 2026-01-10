import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import pool from './dataBase.js';
import routerUser from './Routes/userRoutes.js';
import routerPatient from './Routes/PatientRoutes.js';
import routerHistorialMedico from './Routes/HistorialMedicoRoutes.js';
import routerAlimentos from './Routes/Alimentos_RecetasRoutes.js';

const app = express();


// --- Middleware --------------------------------------------
app.use(morgan('dev')); // Muestra en el log las peticiones

app.use(express.json()); // Permite leer json

app.use(express.urlencoded({ extended: true })); // Permite leer archivos html (form)

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(cookieParser()); 

// -- Rutas ---------------------------------------------------

app.get('/', (req, res) => {
    res.send('Bienvenido al server NutriApp');
})

app.get('/db-status', async (req, res) =>{

    try{
        await pool.query('SELECT 1');
        res.status(200).json({
            message: 'conexion exitosa a la base de datos nutriApp',
            status: 'ok'
        });
    }catch (error) {
        
        console.error('Error al conectar con PostgreSQL:', error.message);
        res.status(500).json({
            message: 'Error de conexión a PostgreSQL. Revisar credenciales y que el servidor de DB esté corriendo.',
            error: error.message

        });
    }

})

// -- Ruta users ----------------------------------------------
app.use('/api/v1/users', routerUser);

// -- Ruta Patients ----------------------------------------------
app.use('/api/v1/patients', routerPatient);

// -- Ruta Historial Medico ----------------------------------------------
app.use('/api/v1/historialMedico', routerHistorialMedico);

app.use('/api/v1/alimentos', routerAlimentos);

export default app;
