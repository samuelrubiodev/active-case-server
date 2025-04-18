import express from 'express';
import dotenv from 'dotenv';
import postgres from '../api/postgres.js';

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

router.get('/:playerID', async (req, res) => {
    try {
        const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${req.params.playerID}`;
        const cases = await postgres`
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
            WHERE "player_id" = ${req.params.playerID}
        `
        
        const casesWithDetails = await Promise.all(cases.map(async (caseItem) => {
            const [characters, evidences, messages, timeline] = await Promise.all([
                postgres`SELECT * FROM "Characters" WHERE "case_id" = ${caseItem.id}`,
                postgres`SELECT * FROM "Evidences" WHERE "case_id" = ${caseItem.id}`,
                postgres`SELECT * FROM "Messages" WHERE "case_id" = ${caseItem.id}`,
                postgres`SELECT * FROM "Timeline" WHERE "case_id" = ${caseItem.id}`
            ]);
            return {
                ...caseItem,
                characters,
                evidences,
                messages,
                timeline
            };
        }));


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