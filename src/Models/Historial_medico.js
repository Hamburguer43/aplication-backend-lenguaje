import pool from "../dataBase.js";
import { text } from "express";

export const getAntropometria = async (cod_hm) => {

    const cod1 = cod_hm;

    const antropometria_query = {
        text: `SELECT * FROM antropometria 
        WHERE cod_hm = $1 
        ORDER BY fecha_medicion DESC`,

        values: [cod1]
    }

    const resAntropometria = await pool.query(antropometria_query);

    return resAntropometria.rows;

} 

export const CreateNewAntropometria = async (antropometriaCalculada, cod_hm) => {

    const {
        peso,
        estatura,
        imc,
        grasa,
        circ_abdominal,
        masa_muscular
    } = antropometriaCalculada

    const CreateAntropometria_query = {
        text: `
        INSERT INTO antropometria (cod_hm, peso, estatura, imc, grasa, circ_abdominal, masa_muscular)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
        `,

        values: [ cod_hm, peso, estatura, imc, grasa, circ_abdominal, masa_muscular],

    };

    const resNewAntropometria = await pool.query(CreateAntropometria_query);

    return resNewAntropometria.rows[0];
 
}
