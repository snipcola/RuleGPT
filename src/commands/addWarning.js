import { SlashCommandBuilder } from 'discord.js';
import { getWarnings, addWarning } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('addwarning')
        .setDescription('Adds warning to user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User to warn')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Reason for warning')),
    async execute (interaction) {
		const user = interaction.options?.get('user')?.user;
        const reason = interaction.options?.get('reason')?.value;
        const warnings = await getWarnings(interaction.guildId, user.id);

        const addedWarning = await addWarning(interaction.guildId, user.id, reason || 'No reason provided');

        if (addedWarning) await interaction.reply(`✅ Added warning to <@${user.id}>, now on ${warnings.length + 1} warnings.`)
        else await interaction.reply({
            content: `❌ Failed to add warning to <@${user.id}>.`,
            ephemeral: true
        });
    }
};