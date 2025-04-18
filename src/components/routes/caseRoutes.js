import express from 'express';
import { readFile } from 'fs/promises'
import dotenv from 'dotenv';
import postgres from '../api/postgres.js';
import { addCase, addImage } from '../Tables/Case.js';
import { addTimeline } from '../Tables/Timeline.js';
import { addEvidence } from '../Tables/Evidence.js';
import { addCharacter } from '../Tables/Character.js';
import { getMessage } from '../api/chatManager.js';
import { downloadImageToBuffer, getAll, createImage } from '../api/util.js';

import {
    PROMPT_SYSTEM_GENERATION_CASE
} from '../env/env.js';

dotenv.config({path: '.env.local'});

const router = express.Router();

router.post('/new', async (req, res) => {
  const fileSchema = await readFile('./caso_schema.json', 'utf-8');
  const jsonSchema = JSON.parse(fileSchema);

  const playerID = req.body.playerID;
  const isPlayerExists = await postgres`SELECT * FROM "Players" WHERE "id" = ${playerID}`;
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
    const caseID = await addCase(json, playerID);

    for (const timeline in json.Caso.cronologia) {
      await addTimeline(json, caseID, timeline);
    }
    for (const evidence in json.Caso.evidencias) {
      await addEvidence(json, caseID, evidence);
    }
    for (const character in json.Caso.personajes) { 
      await addCharacter(json, caseID, character);
    }

    const url = await createImage(json);

    const bytes = await downloadImageToBuffer(url);
    addImage(caseID, bytes);

    res.send({ message: "Caso generado exitosamente", caseID });
  } catch (error) {
    console.error("Error generando el caso:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el nuevo caso." });
  }
});

router.post('/:caseID', async (req, res) => {
  try {
      const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${req.body.playerID}`;
      const casesWithDetails = await getAll(postgres, postgres`
        SELECT 
            "id", 
            "player_id", 
            "title",
            "date_occurred", 
            "time_remaining",
            "description",
            "location",
            "explanation_case_solved",
            "difficult"
        FROM "Cases"
        WHERE "player_id" = ${req.body.playerID} AND "id" = ${req.params.caseID}`);

      if (casesWithDetails.length === 0) {
          return res.status(404).json({ error: "Caso no encontrado" });
      }

      return res.json({
          player: player[0],
          cases: casesWithDetails
      });

  } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/:id/image', async (req, res) => {
  const { id } = req.params;
  try {
    const result  = await postgres`SELECT image FROM "Cases" WHERE id = ${id}`;

    if (result.length === 0) {
      return res.status(404).send('Caso no encontrado');
    }

    res.set('Content-Type', 'image/png');
    res.send(result[0].image);
  } catch (err) {
    console.error('Error al obtener la imagen:', err);
    res.status(500).send('Error interno del servidor');
  }
});


export default router;