const { readFile, writeFile } = require('fs/promises');
const { readFileSync, writeFileSync } = require('fs');

async function resetServerConfigs (path = 'config-servers.json') {
    try {
        await writeFile(path, JSON.stringify([]), 'utf8');
        return true;
    }
    catch { return false };
};

function resetServerConfigsSync (path = 'config-servers.json') {
    try {
        writeFileSync(path, JSON.stringify([]), 'utf8');
        return true;
    }
    catch { return false };
};

async function getServerConfigs (path = 'config-servers.json') {
    let file;

    try { file = await readFile(path, 'utf8') }
    catch { await resetServerConfigs() };

    file = await readFile(path, 'utf8');

    try {
        const json = JSON.parse(file);

        if (!file || !Array.isArray(json)) {
            await resetServerConfigs();
            return [];
        };

        return json;
    }
    catch { return [] };
};

function getServerConfigsSync (path = 'config-servers.json') {
    let file;

    try { file = readFileSync(path, 'utf8') }
    catch { resetServerConfigsSync() };

    file = readFileSync(path, 'utf8');

    try {
        const json = JSON.parse(file);

        if (!file || !Array.isArray(json)) {
            resetServerConfigsSync();
            return [];
        };

        return json;
    }
    catch { return [] };
};

let serverConfigs = getServerConfigsSync();

async function saveServerConfigs (path = 'config-servers.json') {
    try {
        await writeFile(path, JSON.stringify(serverConfigs), 'utf8');
        return true;
    }
    catch { return false };
};

async function getServerConfig (serverId) {
    const serverConfig = serverConfigs.find((server) => server.id === serverId);
    
    return serverConfig;
};

async function createServerConfig (serverId) {
    const existingConfig = await getServerConfig(serverId);

    if (existingConfig) return existingConfig;
    
    serverConfigs.push({ id: serverId, rules: null, apiKey: null, warnings: [] });
    await saveServerConfigs();

    return await getServerConfig(serverId);
};

async function removeServerConfig (serverId) {
    serverConfigs = serverConfigs.filter((server) => server.id !== serverId);
    return await saveServerConfigs();
};

async function updateServerConfig (serverId, newConfig) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    const index = serverConfigs.findIndex((server) => server.id === serverId);
    serverConfigs[index] = { ...serverConfig, ...newConfig };

    return await saveServerConfigs();
};

async function getWarnings (serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;
    
    return serverConfig.warnings.filter((warning) => warning.userId === userId);
};

async function resetWarnings (serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    return await updateServerConfig(serverId, {
        warnings: serverConfig.warnings.filter((warning) => warning.userId !== userId)
    });
};

async function addWarning (serverId, userId, reason) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    return await updateServerConfig(serverId, {
        warnings: [...serverConfig.warnings, { userId, reason }]
    });
};

async function removeWarning (serverId, userId, index) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    const warnings = await getWarnings(serverId, userId);
    const warning = warnings.find((_, _index) => _index === index);

    if (!warning) return false;

    return await updateServerConfig(serverId, {
        warnings: serverConfig.warnings.filter((_warning) => !(_warning.reason === warning.reason && _warning.userId === warning.userId))
    });
};

exports.resetServerConfigs = resetServerConfigs;
exports.resetServerConfigsSync = resetServerConfigsSync;
exports.getServerConfigs = getServerConfigs;
exports.getServerConfigsSync = getServerConfigsSync;
exports.saveServerConfigs = saveServerConfigs;
exports.getServerConfig = getServerConfig;
exports.createServerConfig = createServerConfig;
exports.removeServerConfig = removeServerConfig;
exports.updateServerConfig = updateServerConfig;
exports.getWarnings = getWarnings;
exports.resetWarnings = resetWarnings;
exports.addWarning = addWarning;
exports.removeWarning = removeWarning;