import { SlashCommandBuilder } from 'discord.js';
import { getWarnings } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('viewwarnings')
        .setDescription('View warnings of user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User with warnings')
            .setRequired(true)),
    async execute (interaction) {
		const user = interaction.options?.get('user')?.user;
        const warnings = await getWarnings(interaction.guildId, user.id);

        if (!warnings) return await interaction.reply({
            content: '❌ Failed to view warnings.',
            ephemeral: true
        });

        if (warnings.length > 0) await interaction.reply(`🗒️ <@${user.id}> has ${warnings.length} warnings:\n\n${warnings.map(({ reason }, index) => `${index}. ${reason}`).join('\n')}`);
        else await interaction.reply(`🗒️ <@${user.id}> has 0 warnings.`);
    }
};