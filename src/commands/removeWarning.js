import { SlashCommandBuilder } from 'discord.js';
import { getWarnings, removeWarning } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('removewarning')
        .setDescription('Removes warning from user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User to warn')
            .setRequired(true))
        .addNumberOption((option) => option
            .setName('index')
            .setDescription('Index of warning')
            .setRequired(true)),
    async execute (interaction) {
		const user = interaction.options?.get('user')?.user;
        const index = interaction.options?.get('index')?.value;
        const warnings = await getWarnings(interaction.guildId, user.id);

        const removedWarning = await removeWarning(interaction.guildId, user.id, index - 1);

        if (removedWarning) await interaction.reply(`✅ Removed warning with index ${index} from <@${user.id}>, now on ${warnings.length - 1} warnings.`)
        else await interaction.reply({
            content: `❌ Failed to remove warning with index ${index} from <@${user.id}>.`,
            ephemeral: true
        });
    }
};