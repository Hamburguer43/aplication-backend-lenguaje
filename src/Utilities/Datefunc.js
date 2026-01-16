
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
    masa_muscular
} = antropometria

const estatura_m = estatura / 100;
const imc = peso / (estatura_m * estatura_m);

const sexFactor = gender_p.toLowerCase() === 'masculino' ? 1 : 0;
const grasa = ((1.20 * imc) + (0.23 * age_p) - (10.8 * sexFactor) - 5.4);

return {
    peso,
    estatura,
    circ_abdominal,
    masa_muscular,
    imc: parseFloat(imc.toFixed(2)),
    grasa: parseFloat(grasa.toFixed(2))
}

}
