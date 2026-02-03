import { deletePatient, findPatientEmailP, getPatients, UpdatePatient, CreatePatient, getPatientsId, patiensData } from "../Models/PatientsModels.js";
import { checkIdentityConflict, existsPatient } from "../Utilities/Validator.js";
import {calcularEdad, CalculateAntropometria} from "../Utilities/Datefunc.js";

export const patients = async (req, res) => {
    
    try{

        const patients = await patiensData();

        if(patients.length === 0){
            return res.status(404).json({
                msg: 'No hay pacientes registrados en la base de datos'
            })
        }

        res.status(200).json({
            ok: true,
            patient: patients
        });

    }catch(error){

    }

}
// traer todos los pacientes por doctor-------------------------------*
export const getAllPatient = async (req, res) => {

    const {doc_id} = req.query;

    try{
        
        const patients = await getPatients(doc_id);

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

        const patient = await getPatientsId(patient_id);

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
    section_id,

    //datos de historial
    antropometria, 
    antecedentes
} = req.body;


try{
    
    const IfexistingUser = await findPatientEmailP({email_p, name_p});

    if(IfexistingUser){

        if (IfexistingUser) {
          
            const isEmailDuplicate = IfexistingUser.email === email_p;
            const isNameDuplicate = IfexistingUser.name === name_p;

            let mensajeError = "";

            if (isEmailDuplicate && isNameDuplicate) {
                mensajeError = "El email y el nombre de usuario ya están registrados.";
            } else if (isEmailDuplicate) {
                mensajeError = "El correo electrónico ya está en uso.";
            } else if (isNameDuplicate) {
                mensajeError = "El nombre de usuario ya no está disponible.";
            }

            return res.status(409).json({
                ok: false,
                msg: mensajeError,

            });
        
        }
    }   

    //calculamos la edad a partir de la fecha de nacimiento (date_p)
    const age_p = calcularEdad(date_p);

    //calculamos el imc y grasa corporal a partir de los datos de antropometria
    const antropometriaCalculada = CalculateAntropometria(antropometria, age_p, gender_p)

    console.log("antropometria calculada", antropometriaCalculada)

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
        section_id,
        antropometria: antropometriaCalculada,
        antecedentes
    };
    
    const newPatient = await CreatePatient(patientData);

    if(!newPatient){
        res.status(404).json({
            msg: `El doctor ${doc_id} no existe, asi que no se puede crear un paciente sin un doctor asociado`
        })
    }

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