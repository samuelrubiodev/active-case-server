import postgres from '../api/postgres.js';

const addCase =  async (json, playerId) => {
    const id = await postgres`INSERT INTO "Cases" 
      (player_id, date_occurred, title, time_remaining, description, location, explanation_case_solved, difficult) 
      VALUES (
        ${playerId}, 
        ${new Date(json.Caso.fechaOcurrido)}, 
        ${json.Caso.tituloCaso}, 
        ${parseInt(json.Caso.tiempoRestante)}, 
        ${json.Caso.descripcionCaso}, 
        ${json.Caso.lugar}, 
        ${json.Caso.explicacionCasoResuelto}, 
        ${json.Caso.dificultad}) returning id`;
    
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