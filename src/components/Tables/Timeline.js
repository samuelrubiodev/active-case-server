import postgres from '../api/postgres.js';
import { sanitizeString } from '../api/util.js';

const addTimeline = async (json, caseId, timeline) => {
    await postgres`INSERT INTO "Timeline" (case_id, date, hour, event)
    VALUES (
      ${caseId}, 
      ${new Date(json.Caso.cronologia[timeline].fecha)}, 
      ${json.Caso.cronologia[timeline].hora}, 
      ${sanitizeString(json.Caso.cronologia[timeline].evento)})`;
}

export { addTimeline };