import postgres from '../api/postgres.js';
import { sanitizeString } from '../api/util.js';

const addCase = async (json, playerId) => {
    const id = await postgres`INSERT INTO "Cases" 
      (player_id, date_occurred, title, time_remaining, description, location, explanation_case_solved, difficult) 
      VALUES (
        ${playerId}, 
        ${new Date(json.Caso.fechaOcurrido)}, 
        ${sanitizeString(json.Caso.tituloCaso)}, 
        ${parseInt(json.Caso.tiempoRestante)}, 
        ${sanitizeString(json.Caso.descripcionCaso)}, 
        ${sanitizeString(json.Caso.lugar)}, 
        ${sanitizeString(json.Caso.explicacionCasoResuelto)}, 
        ${sanitizeString(json.Caso.dificultad)}) returning id`;
    
    return id[0].id;
}

const addImage = async (caseId, image) => {
  try {
    await postgres`UPDATE "Cases" SET image = ${image} WHERE id = ${caseId}`;
  } catch (error) {
    console.error('Error updating image:', error);
  }
}

export { addCase, addImage};