// Imports
import 'colors';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

import { getConfig } from './lib/config.js';
import { REST, Routes, Client, Events } from 'discord.js';

// Config
const { token } = await getConfig();

if (!token) {
    console.log('The config is invalid'.red);
    process.exit(1);
};

// Variables
const __dirname = dirname(fileURLToPath(import.meta.url));
const rest = new REST().setToken(token);

// Commands
const commands = [];

const folder = path.join(__dirname, 'commands');
const files = (await readdir(folder))
    .filter((file) => file.endsWith('.js'));

for (const file of files) {
    const commandPath = path.join(folder, file);
    const command = (await import('file:' + commandPath)).default;

    if (command && 'data' in command && 'execute' in command) {
        console.log(commandPath + ' loaded'.green);
        commands.push(command.data.toJSON());
    } else {
        console.log(commandPath + ' missing properties'.red);
    };
};

// Client
const client = new Client({ intents: [] });

client.on(Events.ClientReady, async function () {
    // Deploy
    try {
        console.log(commands.length + ' commands deploying'.yellow);
        const data = await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(data.length + ' commands deployed'.green);
        
        client.destroy();
    } catch (error) {
        console.error(error.red);
    };
});

await client.login(token);