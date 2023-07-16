const { SlashCommandBuilder } = require('discord.js');
const { resetAdmins } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('clearadmins')
        .setDescription('Clears all admins from server'),
    async execute (interaction) {
        const clearedAdmins = await resetAdmins(interaction.guildId);

        if (clearedAdmins) await interaction.reply(`✅ Cleared all admins from **${interaction.guild.name}**, now has 0 admins.`)
        else await interaction.reply({
            content: `❌ Failed to clear all admins from **${interaction.guild.name}**.`,
            ephemeral: true
        });
    }
};