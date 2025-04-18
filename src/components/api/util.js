import axios from "axios";
import Together from 'together-ai';
import dotenv from 'dotenv';
import { getMessage } from '../api/chatManager.js';

import {
    PROMPT_SYSTEM_IMAGE_GENERATION
} from '../env/env.js';

dotenv.config({path: '.env.local'});

async function downloadImageToBuffer(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data, 'binary');
    return buffer;
}

async function getAll(postgres, query) {
    try {
        const cases = await postgres`${query}`;
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

        return casesWithDetails;
    
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

async function createImage(jsonData) {
    const together = new Together({apiKey: process.env.TOGETHER_API});

    const messagesImageGeneration = [
        {
            role: 'system',
            content: PROMPT_SYSTEM_IMAGE_GENERATION
        },
        {
            role: 'user',
            content: "Generate a prompt based on this case: " + JSON.stringify(jsonData)
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
        response_format: 'url'
    });

    return responseCreateImage.data[0].url;
}

function sanitizeString(str) {
    return str?.replace(/\u0000/g, '') ?? '';
}

export { downloadImageToBuffer, getAll, createImage, sanitizeString };