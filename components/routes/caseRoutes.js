import express from 'express';
import { readFile } from 'fs/promises'
import dotenv from 'dotenv';
import postgres from '../server/postgres.js';
import {
    PROMPT_SYSTEM_GENERATION_CASE
} from '../../var.js';

dotenv.config({path: '.env.local'});

const router = express.Router();

router.post('/new', async (req, res) => {
  const fileSchema = await readFile('./caso_schema.json', 'utf-8');
  const testData = await readFile('./test_case.json', 'utf-8');
  
  const jsonSchema = JSON.parse(fileSchema);

  const playerId = req.body.playerId;
  const isPlayerExists = await postgres`SELECT * FROM "Players" WHERE "id" = ${playerId}`;
  if (isPlayerExists.length === 0) {
    return res.status(404).json({ error: "El jugador no existe." });
  }

  try {
    /*
    const response = await fetch(`${process.env.OPENROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: PROMPT_SYSTEM_GENERATION_CASE
          },
          {
              role: 'user',
              content: "Generame un un nuevo caso, el jugador se llama " + req.body.nombreJugador
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'Caso',
            strict: true,
            schema: jsonSchema
          }   
        }
      })
    });
    */
    //const data = await response.json();
    //const responseAPI = data.choices[0].message.content;
    const json = JSON.parse(testData);

    const idCase = await postgres`INSERT INTO "Cases" 
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

    for (const cronology in json.Caso.cronologia) {
      await postgres`INSERT INTO "Timeline" (case_id, date, hour, event)
        VALUES (
          ${idCase[0].id}, 
          ${new Date(json.Caso.cronologia[cronology].fecha)}, 
          ${json.Caso.cronologia[cronology].hora}, 
          ${json.Caso.cronologia[cronology].evento})`;
    }

    for (const evidences in json.Caso.evidencias) {
      await postgres`INSERT INTO "Evidences" (case_id, name, description, type, location, analysis)
        VALUES (
          ${idCase[0].id}, 
          ${json.Caso.evidencias[evidences].nombre}, 
          ${json.Caso.evidencias[evidences].descripcion}, 
          ${json.Caso.evidencias[evidences].tipo}, 
          ${json.Caso.evidencias[evidences].ubicacion},
          ${json.Caso.evidencias[evidences].analisis})`;
    }

    res.send(json);
  } catch (error) {
    console.error("Error generando el caso:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el nuevo caso." });
  }
});

export default router;