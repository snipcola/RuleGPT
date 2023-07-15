// Imports
import 'colors';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

import { getConfig } from './lib/config.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

// Variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Config
const { token, clientId, apiKey } = await getConfig();

if (!token || !clientId || !apiKey) {
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
    } else console.log(commandPath + ' missing properties'.red);
};

// Events
const events = path.join(__dirname, 'events');
const eventFiles = (await readdir(events))
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const eventPath = path.join(events, file);
    const event = (await import('file:' + eventPath)).default;

    if (event && 'name' in event && 'execute' in event) {
        console.log(eventPath + ' loaded'.green);
        client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));   
    } else console.log(eventPath + ' missing properties'.red);
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