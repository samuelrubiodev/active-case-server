import postgres from '../api/postgres.js';
import { sanitizeString } from '../api/util.js';

const addMessage = async (caseID, playerID, message, role) => {
    await postgres`INSERT INTO "Messages" 
        (case_id, player_id, message, role) 
        VALUES (
            ${caseID}, 
            ${playerID},
            ${sanitizeString(message)}, 
            ${sanitizeString(role)})`;
};

const getAllMessages = async (caseID, playerID) => {
    return await postgres`SELECT * FROM "Messages" WHERE case_id = ${caseID} AND player_id = ${playerID}`;
};

export { addMessage, getAllMessages };