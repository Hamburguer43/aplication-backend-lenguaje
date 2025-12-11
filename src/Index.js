// Arraca el codigo backend

import app from "./App.js";
import pool from "./dataBase.js";

app.listen(3004, () => {
  console.log("Server is running on port");
});
