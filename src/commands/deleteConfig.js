import { SlashCommandBuilder } from 'discord.js';
import {  removeServerConfig } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('deleteconfig')
        .setDescription('Deletes server configuration'),
    async execute (interaction) {
        const removedConfig = removeServerConfig(interaction.guildId);

        if (removedConfig) await interaction.reply({
            content: '✅ Removed server configuration',
            ephemeral: true
        })
        else await interaction.reply({
            content: '❌ Failed to remove server configuration',
            ephemeral: true
        });
    }
};