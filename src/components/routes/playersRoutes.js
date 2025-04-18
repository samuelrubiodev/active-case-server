import express from 'express';
import dotenv from 'dotenv';
import postgres from '../api/postgres.js';
import { getAll } from '../api/util.js';

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


router.post('/new', async (req, res) => {
    try {
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