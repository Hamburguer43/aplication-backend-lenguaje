import { deletePatient, findPatientEmailP, getPatients, UpdatePatient, CreatePatient, getPatientsId } from "../Models/PatientsModels.js";
import { checkIdentityConflict, existsPatient } from "../Utilities/Validator.js";
import {calcularEdad, CalculateAntropometria} from "../Utilities/Datefunc.js";
import pool from "../dataBase.js";

//import bd prueba
import { patientsBd, doctor } from "../Data/BaseDatosPrueba.js";

// traer todos los pacientes -------------------------------*
export const getAllPatient = async (req, res) => {

    const {doc_id} = req.query;

    try{
        
        
        //POSTGRES
        const patients = await getPatients(doc_id);
        //POSTGRES

        /*
        //PRUEBA
        const patients = patientsBd.filter(p => p.doc_id === parseInt(doc_id))
        //PRUEBA
        */

        if(patients.length === 0){
            res.status(404).json({
                msg: `no existen pacientes vinculados al doctor ${doc_id}. registrar pacientes para visualizarlos`
            })
        }

        res.status(200).json({
            ok: true,
            count: patients.length,
            patients: patients
        });

    }catch(error){
        res.status(500).json({
            message: "Error interno del servidor al listar los pacientes",
            error: error.message
        });
    }

};

//traer paciente por id ------------------------------------*
export const getPatient = async (req, res) => {
    
    const patient_id = req.params.patient_id;
    
    try{

        
        //POSTGRES
        const patient = await getPatientsId(patient_id);

        /*
        //PRUEBA
        const patient = patientsBd.find(p => p.patient_id === parseInt(patient_id));
        //PRUEBA
        */

        if(!patient){
            return res.status(404).json({
                message: `Paciente con id ${patient_id} no encontrado`
            });
        }
        
        res.status(200).json({
            ok: true,
            patient: patient
        });

    }catch(error){
        res.status(500).json({
            message: "Error interno del servidor al listar los pacientes",
            error: error.message
        });
    }

}

//eliminar paciente por id --------------------------------- *
export const deletePatientData = async (req, res) => {

    const patient_id = req.params.id;

    try{

        
        //POSTGRES
        const patient = await deletePatient(patient_id);

        if(!patient){
            return res.status(404).json({
                msg: `Paciente ${patient_id} no existe`
            })
        }

        res.status(200).json({
            msg: `Paciente ${patient_id} eliminado con exito xxx`,
            patient: patient
        });
        //POSTGRES

        /*
        //PRUEBA
        const index = patientsBd.findIndex(p => p.patient_id === parseInt(patient_id));

        if(index === -1){
            return res.status(404).json({
                ok: false,
                msg: `Paciente ${patient_id} no existe`
            });
        }

        const deletePatient = patientsBd[index];

        patientsBd.splice(index, 1);

        res.status(200).json({
            ok: true,
            msg: `Paciente ${patient_id} eliminado con exito`,
            patient: deletePatient
        });
        //PRUEBA
        */

    }catch(error) {

        if (error.status === 404) {
            return res.status(404).json({
                message: error.message 
            });
        }

        res.status(500).json({
            message: `Error interno del servidor al aliminar el paciente ${user_id}`,
            error: error.message
        });
    }

}

//actualizar paciente por id --------------------------------
export const UpdateDataPatient = async (req, res) => {

const patient_id = req.params.patient_id;
const update = req.body;
const { email_p, name_p } = update; 
  
   try{

    
    //POSTGRES
    const existingPatient = await existsPatient(patient_id);

    if (!existingPatient) {
        return res.status(404).json({
            ok: false,
            msg: `No se encontró ningún paciente con el ID: ${patient_id}`
        });
    }

    //validacion de si existe el email o nombre de usuario
    const validation = await checkIdentityConflict(email_p, name_p, patient_id);

    if (validation.length > 0) {
        const isEmailConflict = validation.some(c => c.email === email_p);
        const isNameConflict = validation.some(c => c.username === name_p);

        let message = "";
        if (isEmailConflict && isNameConflict) message = "El email y el nombre de usuario ya están registrados.";
        else if (isEmailConflict) message = "El email ya está registrado en el sistema.";
        else if (isNameConflict) message = "El nombre de usuario ya está en uso.";

        return res.status(409).json({
            ok: false,
            msg: message,
            conflicts: validation.map(c => ({ table: c.type }))
        });
    }

    const Update_patient = await UpdatePatient(patient_id, update);
     
    if(!Update_patient){
    return res.status(404).json({
        msg: `Paciente ${patient_id} no existe en la base de datos`
    })
    }

    return res.status(200).json({
    ok: true,
    msg: "Actualizado con exito",
    user: Update_patient
    });
    //POSTGRES

 
    /*
    //PRUEBA
    const index = patientsBd.findIndex(p => p.patient_id === parseInt(patient_id));

    if(index === -1){
        return res.status(404).json({
                ok: false,
                msg: `No se encontró ningún paciente con el ID: ${patient_id}`
            });
    }

    if (email_p || name_p) {
        const conflict = patientsBd.find(p => 
            (p.email_p === email_p || p.name_p === name_p) && 
            p.patient_id !== parseInt(patient_id)
        );

        if (conflict) {
            let message = "";
            const isEmailConflict = conflict.email_p === email_p;
            const isNameConflict = conflict.name_p === name_p;

            if (isEmailConflict && isNameConflict) message = "El email y el nombre de usuario ya están registrados.";
            else if (isEmailConflict) message = "El email ya está registrado en el sistema.";
            else if (isNameConflict) message = "El nombre de usuario ya está en uso.";

            return res.status(409).json({
                ok: false,
                msg: message
            });
        }
    }

    patientsBd[index] = {
        ...patientsBd[index],
        ...update,
        update_p: new Date().toISOString()
    };

    return res.status(200).json({
        ok: true,
        msg: "Paciente actualizado con éxito",
        patient: patientsBd[index]
    })
    //PRUEBA
    */

   } catch (error){

    return res.status(500).json({
            msg: "Error interno del servidor al actualizar",
            error: error.message
        });

   } 

}

//crear paciente --------------------------------------------- *
export const Create_Patient = async (req, res) => {

const {
    doc_id,
    name_p, 
    email_p, 
    first_name_p, 
    last_name_p,  
    gender_p, 
    date_p,
    antropometria, 
    antecedentes,
    tratamientos 
} = req.body;


try{
    
    /*
    POSTGRES
    const IfexistingUser = await findPatientEmailP({email_p, name_p});

    if(IfexistingUser.length > 0){
        return res.status(409).json({
            ok: false,
            msg: "El email proporcionado ya está registrado. Ingrese un email diferente por favor."
        });
    }
    POSTGRES
    */

    /*
    //PRUEBA
    const doctorExists = doctor.find(d => d.doc_id === parseInt(doc_id));

    if (!doctorExists) {
        return res.status(404).json({
            ok: false,
            msg: `El doctor ${doc_id} no existe. No se puede crear un paciente sin un doctor asociado.`
        });
    }

    //valida si existe un paciente con ese correo o name user
    const existingPatient = patientsBd.find(p => p.email_p === email_p || p.name_p === name_p);

    if (existingPatient) {
        return res.status(409).json({
            ok: false,
            msg: "El email o nombre de usuario ya está registrado."
        });
    }

    //valida si existe un doctor con ese correo o name user
    const existingDoctor = doctor.find(d => d.email === email_p || d.name_doc === name_p)

    if (existingDoctor) {
        return res.status(409).json({
            ok: false,
            msg: "El email o nombre de usuario ya está registrado."
        });
    }
    //PRUEBA
    */

    //calculamos la edad a partir de la fecha de nacimiento (date_p)
    const age_p = calcularEdad(date_p);

    //calculamos el imc y grasa corporal a partir de los datos de antropometria
    const antropometriaCalculada = CalculateAntropometria(antropometria, age_p, gender_p)

    //POSTGRES
    //constante donde guardamos los datos del pacientes
    const patientData = {
        doc_id,
        name_p,
        email_p,
        first_name_p,
        last_name_p,
        age_p,
        gender_p,
        date_p,
        antropometria: antropometriaCalculada,
        antecedentes,
        tratamientos
    };
    
    const newPatient = await CreatePatient(patientData);

    if(!newPatient){
        res.status(404).json({
            msg: `El doctor ${doc_id} no existe, asi que no se puede crear un paciente sin un doctor asociado`
        })
    }
    //POSTGRES

    /*
    //PRUEBA
    const newPatient = {
        patient_id: patientsBd.length + 1,
        doc_id: parseInt(doc_id),
        name_p,
        email_p,
        first_name_p,
        last_name_p,
        age_p,
        gender_p,
        date_p,
        create_p: new Date().toISOString(),
        update_p: null,

        historial: {
            antropometria: { 
                id: Date.now(), 
                ...antropometriaCalculada,
                fecha_medicion: new Date().toISOString().split('T')[0]
            },
            antecedentes: { 
                id: Date.now() + 1, 
                ...antecedentes 
            },
            tratamientos: { 
                id: Date.now() + 2, 
                ...tratamientos 
            }
        }
    }    

    patientsBd.push(newPatient);
    //PRUEBA
    */

    return res.status(201).json({
        ok: true,
        msg: "Paciente creado con exito",
        patient: newPatient
    });


} catch (error) {
        // 7. Manejo de errores
        
        if (error.code === '23505') {
            
            let customMsg = "El nombre de usuario o el correo electrónico ya están en uso.";
            
            if (error.detail.includes('name_user')) {
                customMsg = "El nombre de usuario ('" + name_user + "') ya está en uso. Por favor, elija otro.";
            
            }else if (error.detail.includes('email')) { 
                customMsg = "El email proporcionado ya está registrado.";
            }

            return res.status(409).json({
                ok: false,
                msg: customMsg,
                errorType: "UNIQUE_VIOLATION"
            });
        }
        
        console.error('Error en el controlador CreatePatient:', error);

        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor al crear el paciente."
        });
}

}