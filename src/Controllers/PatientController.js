import { deletePatient, findPatientEmailP, getPatients, UpdatePatient, CreatePatient, getPatientsId } from "../Models/PatientsModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {calcularEdad, CalculateAntropometria} from "../Utilities/Datefunc.js";

// traer todos los pacientes -------------------------------*
export const getAllPatient = async (req, res) => {

    const {doc_id} = req.query;

    try{
        const patients = await getPatients(doc_id);

        res.status(200).json({
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
    
    const patient_id = req.params.id;
    
    try{

        const patient = await getPatientsId(patient_id);

        if(!patient){
            return res.status(404).json({
                message: `Paciente con id ${patient_id} no encontrado`
            });
        }
        
        res.status(200).json({
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

        const patient = await deletePatient(patient_id);

        res.status(200).json({
            msg: `Paciente ${patient_id} eliminado con exito xxx`,
            patient: patient
        });

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

const user_id = req.params.id;
const update = req.body;
const { email, name_user } = update; 
  
   try{

    const Update_patient = await UpdatePatient({user_id, ...update});
     
    if(!Update_patient || !Update_patient.user_id){
    return res.status(404).json({
        msg: "Usuario no encontrado"
    })
    }

    return res.status(200).json({
    ok: true,
    msg: "Actualizado con exito",
    user: Update_patient
    });
 
   } catch (error){

    console.error("Error en UpdateDataPatient:", error);

    if (error.code === '23505' && error.detail) {
      
      let customMsg = "El nombre de usuario o el correo electrónico ya están en uso.";
      
      if (error.detail.includes('name_user')) {
                // Ahora name_user está definido
        customMsg = "El nombre de usuario ('" + name_user + "') ya está en uso. Por favor, elija otro.";

      } else if (error.detail.includes('email')) { 
                // Ahora email está definido
        customMsg = "El email proporcionado ya está registrado.";
      }

      return res.status(409).json({ 
        ok: false,
        msg: customMsg,
        errorType: "UNIQUE_VIOLATION"
      });
    }
    
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
    
    const IfexistingUser = await findPatientEmailP({email_p, name_p});
    
    console.log("xx", IfexistingUser);

    if(IfexistingUser.length > 0){
        return res.status(409).json({
            ok: false,
            msg: "El email proporcionado ya está registrado. Ingrese un email diferente por favor."
        });
    }

    //calculamos la edad a partir de la fecha de nacimiento (date_p)
    const age_p = calcularEdad(date_p);

    //calculamos el imc y grasa corporal a partir de los datos de antropometria
    const antropometriaCalculada = CalculateAntropometria(antropometria, age_p, gender_p)

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