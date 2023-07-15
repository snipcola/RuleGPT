import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { createServerConfig } from '../lib/serverConfigs.js';

export default {
    cooldown: 5,
    administrator: true,
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Change server configuration'),
    async execute (interaction) {
		const config = await createServerConfig(interaction.guildId);

        const modal = new ModalBuilder()
			.setCustomId('config')
			.setTitle('Server Configuration');

		const rules = new TextInputBuilder()
			.setCustomId('rules')
			.setLabel('Server Rules')
			.setStyle(TextInputStyle.Paragraph)
			.setValue(config.rules || '');

        modal.addComponents(new ActionRowBuilder().addComponents(rules));

        await interaction.showModal(modal);
    }
};