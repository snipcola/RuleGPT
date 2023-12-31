// Requires
require('colors');

const path = require('path');
const { readdir } = require('fs/promises');

const { getConfig } = require('./lib/config.js');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

// Main
async function main () {
    // Variables
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ],
        presence: {
            activities: [{ type: ActivityType.Watching, name: 'over messages 🛡️' }]
        }
    });

    // Config
    const { token, administrators } = await getConfig();

    if (!token) {
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
        const command = require( commandPath);

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
        const event = require(eventPath);

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
    global.administrators = administrators || [];
};

// Start
main();