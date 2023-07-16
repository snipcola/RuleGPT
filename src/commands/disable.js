const { SlashCommandBuilder } = require('discord.js');
const { getEnabled, disable } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('Disable RuleGPT in this server'),
    async execute (interaction) {
        const enabled = await getEnabled(interaction.guildId);

        if (!enabled) return await interaction.reply({
            content: `⚠️ RuleGPT is already disabled in **${interaction.guild.name}**.`,
            ephemeral: true
        });

        const disabledRuleGPT = await disable(interaction.guildId);

        if (disabledRuleGPT) await interaction.reply(`✅ Disabled RuleGPT in **${interaction.guild.name}**.`)
        else await interaction.reply({
            content: `❌ Failed to disable RuleGPT in **${interaction.guild.name}**.`,
            ephemeral: true
        });
    }
};