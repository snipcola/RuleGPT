import { readFile, writeFile } from 'fs/promises';

export let serverConfigs;

export async function resetServerConfigs (path = 'config-servers.json') {
    try {
        await writeFile(path, JSON.stringify([]), 'utf8');
        return true;
    }
    catch { return false };
};

export async function getServerConfigs (path = 'config-servers.json') {
    const file = await readFile(path, 'utf8');

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

async function saveServerConfigs (path = 'config-servers.json') {
    try {
        await writeFile(path, JSON.stringify(serverConfigs), 'utf8');
        return true;
    }
    catch { return false };
};

serverConfigs = await getServerConfigs();

export async function getServerConfig (serverId) {
    const serverConfig = serverConfigs.find((server) => server.id === serverId);
    
    return serverConfig;
};

export async function createServerConfig (serverId) {
    const existingConfig = await getServerConfig(serverId);

    if (existingConfig) return existingConfig;
    
    serverConfigs.push({ id: serverId, rules: 'None', warnings: [] });
    await saveServerConfigs();

    return await getServerConfig(serverId);
};

export async function removeServerConfig (serverId) {
    serverConfigs = serverConfigs.filter((server) => server.id !== serverId);
    return await saveServerConfigs();
};

export async function updateServerConfig (serverId, newConfig) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    const index = serverConfigs.findIndex((server) => server.id === serverId);
    serverConfigs[index] = { ...serverConfig, ...newConfig };

    return await saveServerConfigs();
};

export async function getWarnings (serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;
    
    return serverConfig.warnings.filter((warning) => warning.userId === userId);
};

export async function resetWarnings (serverId, userId) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    return await updateServerConfig(serverId, {
        warnings: serverConfig.warnings.filter((warning) => warning.userId !== userId)
    });
};

export async function addWarning (serverId, userId, reason) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    return await updateServerConfig(serverId, {
        warnings: [...serverConfig.warnings, { userId, reason }]
    });
};

export async function removeWarning (serverId, userId, index) {
    const serverConfig = await getServerConfig(serverId);
    if (!serverConfig) return false;

    const warnings = await getWarnings(serverId, userId);
    const warning = warnings.find((_, _index) => _index === index);

    if (!warning) return false;

    return await updateServerConfig(serverId, {
        warnings: serverConfig.warnings.filter((_warning) => !(_warning.reason === warning.reason && _warning.userId === warning.userId))
    });
};