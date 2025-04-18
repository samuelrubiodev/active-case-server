import express from 'express';
import dotenv from 'dotenv';
import postgres from '../api/postgres.js';
import { getAll } from '../api/util.js';
import { addMessage } from '../Tables/Message.js';
import { getAllMessages } from '../Tables/Message.js';
import { isPlayerExists, isCaseExists } from '../validators/verifications.js';

dotenv.config({path: '.env.local'});

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const players = await postgres`SELECT * FROM "Players"`;
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:playerID/case', async (req, res) => {
    try {

        if (req.params.playerID == undefined || req.params.playerID == null) {
            return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud." });
        }

        if (req.params.playerID == undefined || req.params.playerID == null) {
            return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud." });
        }

        if (!(await isPlayerExists(req.params.playerID))) {
            return res.status(404).json({ error: "El jugador no existe." });
        }

        const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${req.params.playerID}`;
        
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
            WHERE "player_id" = ${req.params.playerID}`);

        if (casesWithDetails.length === 0) {
            return res.status(404).json({ error: "Este jugador no tiene casos asignados" });
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

router.post('/:playerID/case/:caseID/message', async (req, res) => {
    try {
        if (req.body == undefined || req.body == null) {
            return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud." });
        }

        const { caseID, playerID } = req.params;
        const { message, role } = req.body;

        if (!(await isPlayerExists(playerID))) {
          return res.status(404).json({ error: "El jugador no existe." });
        }

        if (!(await isCaseExists(caseID))) {
          return res.status(404).json({ error: "El caso no existe." });
        }

        if (role !== 'user' && role !== 'assistant') {
          return res.status(400).json({ error: "El rol debe ser 'user' o 'assistant'." });
        }
      
        await addMessage(caseID, playerID, message, role);
      
        return res.status(200).json({ message: "Mensaje agregado exitosamente" });
    } catch (err) {
        console.error('Error al agregar el mensaje:', err);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/:playerID/case/:caseID/message', async (req, res) => {
    const { caseID, playerID } = req.params;
    
    if (!(await isPlayerExists(playerID))) {
      return res.status(404).json({ error: "El jugador no existe." });
    }
  
    if (!(await isCaseExists(caseID))) {
      return res.status(404).json({ error: "El caso no existe." });
    }
  
    try {
      const messages = await getAllMessages(caseID, playerID);
  
      return res.json(messages);
    } catch (err) {
      console.error('Error al obtener los mensajes:', err);
      res.status(500).send('Error interno del servidor');
    }
});


router.post('/new', async (req, res) => {
    try {

        if (req.body == undefined || req.body == null) {
            return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud." });
        }

        if (req.body.playerName == undefined || req.body.playerName == null) {
            return res.status(400).json({ error: "Faltan datos en el cuerpo de la solicitud." });
        }

        const playerID = await postgres`INSERT INTO "Players" (name,state,progress) VALUES (${req.body.playerName},${'Activo'},${'SinCaso'}) returning id`;
        const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${playerID[0].id}`;

        res.json({
            player: player[0]
        });
    
    } catch (err) {
        console.error('Error al crear el jugador:', err);
        res.status(500).send('Error interno del servidor');
    }
});


export default router;