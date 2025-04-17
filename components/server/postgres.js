import postgres from 'postgres'
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});

const sql = postgres(process.env.DATABASE_URL);

export default sql