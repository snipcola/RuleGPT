const { readFile } = require('fs/promises');

async function getConfig (path = 'config.json') {
    const file = await readFile(path, 'utf8');

    try { return JSON.parse(file) }
    catch { return {} };
};

exports.getConfig = getConfig;