// Imports
import 'colors';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

import { getConfig } from './lib/config.js';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';

// Variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Config
const { token, clientId, model } = await getConfig();

if (!token || !clientId, !model) {
    console.log('The config is invalid'.red);
    process.exit(1);
};

// Commands
client.commands = new Collection();

const commands = path.join(__dirname, 'commands');
const commandFiles = (await readdir(commands))
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const commandPath = path.join(commands, file);
    const command = (await import('file:' + commandPath)).default;

    if (command && 'data' in command && 'execute' in command) {
        console.log(commandPath + ' loaded'.green);
        client.commands.set(command.data.name, command);
    } else {
        console.log(commandPath + ' missing properties'.red);
    };
};

// Events
const events = path.join(__dirname, 'events');
const eventFiles = (await readdir(events))
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const eventPath = path.join(events, file);
    const event = (await import('file:' + eventPath)).default;

    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
};

// Cooldowns
client.cooldowns = new Collection();

// Login
try { client.login(token) }
catch {
    console.log('Token invalid or missing intents'.red);
    process.exit(1);
};

// Globals
global.client = client;