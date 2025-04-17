import postgres from '../api/postgres.js';

const addEvidence = async (json, caseId, evidence) => {
    await postgres`INSERT INTO "Evidences" (case_id, name, description, type, location, analysis)
        VALUES (
          ${caseId}, 
          ${json.Caso.evidencias[evidence].nombre}, 
          ${json.Caso.evidencias[evidence].descripcion}, 
          ${json.Caso.evidencias[evidence].tipo}, 
          ${json.Caso.evidencias[evidence].ubicacion},
          ${json.Caso.evidencias[evidence].analisis})`;

}

export {addEvidence};