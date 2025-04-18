import postgres from '../api/postgres.js';
import { sanitizeString } from '../api/util.js';

const addCharacter = async (json, caseId, character) => {
    await postgres`INSERT INTO "Characters" 
        (case_id, name, role, description, genre, state_emotional,state) VALUES (
          ${caseId},
          ${sanitizeString(json.Caso.personajes[character].nombre)},
          ${sanitizeString(json.Caso.personajes[character].rol)},
          ${sanitizeString(json.Caso.personajes[character].descripcion)},
          ${sanitizeString(json.Caso.personajes[character].sexo)},
          ${sanitizeString(json.Caso.personajes[character].estado_emocional)},
          ${sanitizeString(json.Caso.personajes[character].estado)})`;

}

export {addCharacter};