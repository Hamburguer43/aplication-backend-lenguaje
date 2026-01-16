// Apartado Doctores/ Users ------------------------------------------
export const doctor = [
    {
        doc_id: 1,
        name_doc: "admin", 
        email: "luis@doctor.com", 
        password: "123", 
        first_name: "Luis",
        last_name: "Diaz",
        age: 28,
        gender: "masculino", 
        date_doc: "1996-05-20",
        create_doc: new Date().toISOString(),
        update_doc: null
    },
    {
        doc_id: 2,
        name_doc: "ana_salud",
        email: "ana@salud.com",
        password: "456",
        first_name: "Ana",
        last_name: "Martinez",
        age: 34,
        gender: "femenino",
        date_doc: "1990-11-10",
        create_doc: new Date().toISOString(),
        update_doc: null
    }
];

// Apartado pacientes -------------------------------------------
export const patientsBd = [
    {
        patient_id: 1,
        doc_id: 1,
        name_p: "juan_perez",
        email_p: "juan@correo.com",
        first_name_p: "Juan",
        last_name_p: "Perez",
        age_p: 30,
        gender_p: "masculino",
        date_p: "1994-01-15",
        create_p: "2026-01-10T10:00:00.000Z",
        update_p: null,
        
        historial: {
            antropometria: {
                id: 101,
                peso: 75.0,        
                estatura: 170,    
                imc: 25.95,        
                grasa: 22.1,       
                circ_abdominal: 85.0,
                masa_muscular: 35.0,
                fecha_medicion: "2026-01-10"
            },
            antecedentes: {
                id: 201,
                motivo: "Control de sobrepeso",
                cardiovascular: false,
                endocrinos: true,
                gastrointestinales: true,
                otros: "Alergia a la penicilina"
            },
            tratamientos: {
                id: 301,
                medico: "Metformina 500mg",
                quirurgico: "Ninguno",
                paliativos: "Dieta hipocalórica"
            }
        }
    }
];

// Apartado recetas ------------------------------------
export const foods = [
    {
        id_alimento: 1,
        name_a: "Pechuga de Pollo",
        unidad_medida: "gr",
        calorias_100gr: 165, 
        proteinas_100gr: 31,
        carbohidratos_100gr: 0,
        grasas_100gr: 3.6
    },
    {
        id_alimento: 2,
        name_a: "Arroz Blanco Cocido",
        unidad_medida: "gr",
        calorias_100gr: 130,
        proteinas_100gr: 2.7,
        carbohidratos_100gr: 28,
        grasas_100gr: 0.3
    }
];

export const recipes = [
    {
        cod_receta: 1,
        nombre: "Pollo con Arroz Especial",
        descripcion: "Receta básica balanceada",
        observacion: "Usar pechuga de pollo",
        calorias_total: 442.50,
        proteinas_total: 49.50,
        carbohidratos_total: 42.00,
        grasas_total: 4.80,
        fecha_creacion: "2026-01-15T10:00:00Z"
    }
];

export const recipeDetails = [
    { 
        id_detalle_receta: 1, 
        cod_receta: 1, 
        id_alimento: 1, 
        cant_gr_alimento: 150 
    },
    { id_detalle_receta: 2, 
        cod_receta: 1, 
        id_alimento: 2, 
        cant_gr_alimento: 150 
    }
];