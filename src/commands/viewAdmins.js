const { SlashCommandBuilder } = require('discord.js');
const { getAdmins } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('viewadmins')
        .setDescription('View admins of server'),
    async execute (interaction) {
        const admins = await getAdmins(interaction.guildId);

        if (!admins) return await interaction.reply({
            content: '❌ Failed to view admins.',
            ephemeral: true
        });

        if (admins.length > 0) await interaction.reply(`🗒️ **${interaction.guild.name}** has ${admins.length} admins:\n\n${admins.map((adminId, index) => `- <@${adminId}>`).join('\n')}`);
        else await interaction.reply(`🗒️ **${interaction.guild.name}** has 0 admins.`);
    }
};