const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createServerConfig } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
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
            .setPlaceholder(`1. Don't swear.\n2. Don't be rude.\n3. Don't post links.`)
			.setValue(config.rules || 'None');

        const apiKey = new TextInputBuilder()
            .setCustomId('api-key')
            .setLabel('OpenAI API Key')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
            .setValue(config.apiKey || 'None');

        modal.addComponents(new ActionRowBuilder().addComponents(rules), new ActionRowBuilder().addComponents(apiKey));

        await interaction.showModal(modal);
    }
};