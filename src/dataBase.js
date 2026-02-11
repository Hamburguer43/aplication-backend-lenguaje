import pkg  from 'pg';
const {Pool} = pkg
import { config } from "dotenv";

config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    
    //en la variable de entorno creada DATABASE_URL esta el user, password, port
    connectionString: process.env.DATABASE_URL,

    //creamos un ssl para que render permita la conexion con la base de datos
    ssl: isProduction ? {rejectUnauthorized: false}: false

})

export default pool;