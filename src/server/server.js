import express from 'express';
import caseRoutes from '../components/routes/caseRoutes.js';
import postgres from '../components/api/postgres.js';

const app = express();

app.use(express.json());
app.use('/case', caseRoutes);

// Homepage route
app.get('/', (_req, res) => {
    res.send('API is running...');
});


// GET for getting all players
app.get('/players', async (req, res) => {
    try {
        const players = await postgres`SELECT * FROM "Players"`;
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/players/:playerID', async (req, res) => {
    try {
        const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${req.params.playerID}`;
        const cases = await postgres`SELECT * FROM "Cases" WHERE "player_id" = ${req.params.playerID}`;
        
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

app.listen(3000 , () => {
    console.log('Server is running on port 3000');
});