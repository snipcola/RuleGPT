import { Events, Collection, PermissionsBitField } from 'discord.js';
import { updateServerConfig } from '../lib/serverConfigs.js';

export default {
    name: Events.InteractionCreate,
    async execute (interaction) {
        if (interaction.isChatInputCommand()) {
            if (!interaction.guildId) return await interaction.reply({
                content: '⚠️ This bot does not support direct messages.',
                ephemeral: true
            });
    
            const command = interaction.client.commands.get(interaction.commandName);
        
            if (!command) return console.log(interaction.commandName + ' not found'.red);

            if (command.administrator && !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({
                content: '⚠️ This command is for administrators only.',
                ephemeral: true
            });
    
            const { cooldowns } = global.client;
    
            if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());
    
            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const amount = (command.cooldown ?? 0) * 1000;
    
            if (timestamps.has(interaction.user.id)) {
                const expiration = timestamps.get(interaction.user.id) + amount;
    
                if (now < expiration) {
                    const expired = Math.round(expiration / 1000);
    
                    return await interaction.reply({
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
        } else if (interaction.isModalSubmit()) {
            const id = interaction.customId;

            if (id === 'config') {
                const fields = interaction.fields?.fields;
                const rules = fields?.get('rules')?.value;

                if (!rules) return await interaction.reply({ content: '❌ No rules value specified', ephemeral: true });

                const updatedRules = await updateServerConfig(interaction.guildId, { rules });

                if (updatedRules) return await interaction.reply({ content: '✅ Updated configuration', ephemeral: true })
                else return await interaction.reply({ content: '❌ Failed to update configuration', ephemeral: true });
            };
        };
    }
};