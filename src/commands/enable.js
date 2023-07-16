const { SlashCommandBuilder } = require('discord.js');
const { getEnabled, enable } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('Enable RuleGPT in this server'),
    async execute (interaction) {
        const enabled = await getEnabled(interaction.guildId);

        if (enabled) return await interaction.reply({
            content: `⚠️ RuleGPT is already enabled in **${interaction.guild.name}**.`,
            ephemeral: true
        });

        const enabledRuleGPT = await enable(interaction.guildId);

        if (enabledRuleGPT) await interaction.reply(`✅ Enabled RuleGPT in **${interaction.guild.name}**.`)
        else await interaction.reply({
            content: `❌ Failed to enable RuleGPT in **${interaction.guild.name}**.`,
            ephemeral: true
        });
    }
};