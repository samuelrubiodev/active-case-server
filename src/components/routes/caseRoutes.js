import express from 'express';
import { readFile } from 'fs/promises'
import dotenv from 'dotenv';
import postgres from '../server/postgres.js';
import { addCase } from '../Tables/Case.js';
import { addTimeline } from '../Tables/Timeline.js';
import { addEvidence } from '../Tables/Evidence.js';
import { addCharacter } from '../Tables/Character.js';

import {
    PROMPT_SYSTEM_GENERATION_CASE
} from '../env/env.js';

dotenv.config({path: '.env.local'});

const router = express.Router();

router.post('/new', async (req, res) => {
  const fileSchema = await readFile('./caso_schema.json', 'utf-8');
  const jsonSchema = JSON.parse(fileSchema);

  const playerId = req.body.playerId;
  const isPlayerExists = await postgres`SELECT * FROM "Players" WHERE "id" = ${playerId}`;
  if (isPlayerExists.length === 0) {
    return res.status(404).json({ error: "El jugador no existe." });
  }

  try {
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
    const data = await response.json();
    const responseAPI = data.choices[0].message.content;
    const json = JSON.parse(responseAPI);
    const caseID = await addCase(json, playerId);

    for (const timeline in json.Caso.cronologia) {
      await addTimeline(json, caseID, timeline);
    }
    for (const evidence in json.Caso.evidencias) {
      await addEvidence(json, caseID, evidence);
    }
    for (const character in json.Caso.personajes) { 
      await addCharacter(json, caseID, character);
    }

    res.send(json);
  } catch (error) {
    console.error("Error generando el caso:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el nuevo caso." });
  }
});

export default router;