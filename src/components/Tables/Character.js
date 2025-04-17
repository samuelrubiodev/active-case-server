import postgres from '../api/postgres.js';


const addCharacter = async (json, caseId, character) => {

    await postgres`INSERT INTO "Characters" 
        (case_id, name, role, description, genre, state_emotional,state) VALUES (
          ${caseId},
          ${json.Caso.personajes[character].nombre},
          ${json.Caso.personajes[character].rol},
          ${json.Caso.personajes[character].descripcion},
          ${json.Caso.personajes[character].sexo},
          ${json.Caso.personajes[character].estado_emocional},
          ${json.Caso.personajes[character].estado})`;

}

export {addCharacter};