import express from 'express';
import caseRoutes from '../components/routes/caseRoutes.js';
import playersRoutes from '../components/routes/playersRoutes.js';

const app = express();

app.use(express.json());
app.use('/case', caseRoutes);
app.use('/players', playersRoutes);

// Homepage route
app.get('/', (_req, res) => {
    res.send('API is running...');
});

app.listen(3001,'0.0.0.0', () => {
    console.log('Server is running on port 3001');
});