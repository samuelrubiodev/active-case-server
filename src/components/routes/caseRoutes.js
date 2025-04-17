import express from 'express';
import { readFile } from 'fs/promises'
import dotenv from 'dotenv';
import postgres from '../api/postgres.js';
import { addCase, addImage } from '../Tables/Case.js';
import { addTimeline } from '../Tables/Timeline.js';
import { addEvidence } from '../Tables/Evidence.js';
import { addCharacter } from '../Tables/Character.js';
import Together from 'together-ai';
import { getMessage } from '../api/chatManager.js';

import {
    PROMPT_SYSTEM_GENERATION_CASE,
    PROMPT_SYSTEM_IMAGE_GENERATION
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
    const messagesGenerationCase = [
      {
        role: 'system',
        content: PROMPT_SYSTEM_GENERATION_CASE
      },
      {
        role: 'user',
        content: "Generame un un nuevo caso, el jugador se llama " + req.body.nombreJugador
      },
    ];

    const responseFormat = {
      type: 'json_schema',
      json_schema: {
        name: 'Caso',
        strict: true,
        schema: jsonSchema
      }   
    };

    const response = await getMessage(messagesGenerationCase,responseFormat);

    const responseAPI = response.choices[0].message.content;
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

    const together = new Together({apiKey: process.env.TOGETHER_API});

    const messagesImageGeneration = [
      {
        role: 'system',
        content: PROMPT_SYSTEM_IMAGE_GENERATION
      },
      {
        role: 'user',
        content: "Generate a prompt based on this case: " + JSON.stringify(json)
      },
    ];

    const responseImage = await getMessage(messagesImageGeneration, {});

    const responseCreateImage = await together.images.create({
      model: process.env.IMAGE_MODEL_FREE,
      prompt: responseImage.choices[0].message.content,
      width: 1024,
      height: 1024,
      steps: 4,
      output_format: 'png',
      response_format: 'base64'
    });

    addImage(caseID, responseCreateImage.data[0].b64_json);

    res.send(json);
  } catch (error) {
    console.error("Error generando el caso:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el nuevo caso." });
  }
});

export default router;