import postgres from '../api/postgres.js';
import { sanitizeString } from '../api/util.js';

const addEvidence = async (json, caseId, evidence) => {
  await postgres`INSERT INTO "Evidences" (case_id, name, description, type, location, analysis)
    VALUES (
      ${caseId}, 
      ${sanitizeString(json.Caso.evidencias[evidence].nombre)}, 
      ${sanitizeString(json.Caso.evidencias[evidence].descripcion)}, 
      ${sanitizeString(json.Caso.evidencias[evidence].tipo)}, 
      ${sanitizeString(json.Caso.evidencias[evidence].ubicacion)},
      ${sanitizeString(json.Caso.evidencias[evidence].analisis)})`;
}

export {addEvidence};