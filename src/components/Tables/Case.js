import postgres from '../server/postgres.js';

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

const getAll = async () => {

}

export { addCase};