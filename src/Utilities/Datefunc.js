
export const calcularEdad = (fechaNacimiento) => {
    
    if (!fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    //Verificacion de si el mes actual es menor al mes de nacimiento para que asi le reste un año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
};

export const CalculateAntropometria = (antropometria, age_p, gender_p) => {
    const {
        peso,
        estatura,
        circ_abdominal,
    } = antropometria;


    if (peso == null || estatura == null || age_p == null || !gender_p) {
        return { 
            peso: peso || 0, 
            estatura: estatura || 0, 
            circ_abdominal: circ_abdominal || 0,
            imc: 0, 
            grasa: 0, 
            riesgo_metabolico: "Pendiente" 
        };
    }

    const estatura_m = estatura / 100;
    const imc = peso / (estatura_m * estatura_m);

    const sexFactor = gender_p.toLowerCase() === 'masculino' ? 1 : 0;
    let grasa = ((1.20 * imc) + (0.23 * age_p) - (10.8 * sexFactor) - 5.4);
    
    if (grasa < 3) grasa = 3;

    let riesgo = "Normal";
    const esHombre = gender_p.toLowerCase() === 'masculino';

    if (circ_abdominal > 0) {
        if (esHombre) {
            if (circ_abdominal >= 102) riesgo = "Muy Alto";
            else if (circ_abdominal >= 94) riesgo = "Aumentado";
        } else {
            if (circ_abdominal >= 88) riesgo = "Muy Alto";
            else if (circ_abdominal >= 80) riesgo = "Aumentado";
        }
    }

    return {
        peso,
        estatura,
        circ_abdominal,
        imc: parseFloat(imc.toFixed(2)),
        grasa: parseFloat(grasa.toFixed(2)),
        riesgo_metabolico: riesgo
    };
};
