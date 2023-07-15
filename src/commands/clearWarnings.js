import { SlashCommandBuilder } from 'discord.js';
import { resetWarnings } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Clears all warnings from user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User to warn')
            .setRequired(true)),
    async execute (interaction) {
		const user = interaction.options?.get('user')?.user;
        const clearedWarnings = await resetWarnings(interaction.guildId, user.id);

        if (clearedWarnings) await interaction.reply(`✅ Cleared all warnings from <@${user.id}>, now on 0 warnings.`)
        else await interaction.reply({
            content: `❌ Failed to clear all warnings from <@${user.id}>.`,
            ephemeral: true
        });
    }
};