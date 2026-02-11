// Arraca el codigo backend

import app from "./App.js";
import pool from "./dataBase.js";

//creamos un puerto con el valor de la variable de entorno
const PORT = process.env.PORT || 3004;

app.listen(PORT, '0.0.0.0' , () => {
  console.log(`Server is running on port ${PORT}`);
});