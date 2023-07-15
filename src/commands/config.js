const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createServerConfig } = require('../lib/serverConfigs.js');

module.exports = {
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
            .setRequired(false)
			.setValue(config.rules || '');

        const apiKey = new TextInputBuilder()
            .setCustomId('api-key')
            .setLabel('OpenAI API Key')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setValue(config.apiKey || '');

        modal.addComponents(new ActionRowBuilder().addComponents(rules), new ActionRowBuilder().addComponents(apiKey));

        await interaction.showModal(modal);
    }
};