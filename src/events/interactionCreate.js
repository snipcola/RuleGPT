import { Events, Collection } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute (interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) return console.log(interaction.commandName + ' not found'.red);

        const { cooldowns } = global.client;

        if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const amount = (command.cooldown ?? 0) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expiration = timestamps.get(interaction.user.id) + amount;

            if (now < expiration) {
                const expired = Math.round(expiration / 1000);

                return interaction.reply({
                    content: `⌛ You are on cooldown for \`${command.data.name}\`, you can use it again <t:${expired}:R>`,
                    ephemeral: true
                });
            };
        };

        timestamps.set(interaction.user.id, now);

        setTimeout(function () {
            timestamps.delete(interaction.user.id);
        }, amount);
    
        try { await command.execute(interaction) }
        catch (error) {
            const message = {
                content: '',
                ephemeral: true
            };
    
            if (interaction.replied || interaction.deferred) await interaction.followUp(message);
            else await interaction.reply(message);
        };
    }
};