import postgres from '../api/postgres.js';

const isPlayerExists = async (playerID) => {
    const player = await postgres`SELECT * FROM "Players" WHERE "id" = ${playerID}`;
    return player.length > 0;
}

const isCaseExists = async (caseID) => {
    const caseExists = await postgres`SELECT * FROM "Cases" WHERE "id" = ${caseID}`;
    return caseExists.length > 0;
}

export {isPlayerExists, isCaseExists};