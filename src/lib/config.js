import { readFile } from 'fs/promises';

export async function getConfig (path = 'config.json') {
    const file = await readFile(path, 'utf8');

    try { return JSON.parse(file) }
    catch { return {} };
};