const { SlashCommandBuilder } = require('discord.js');
const { getAdmins, removeAdmin } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('removeadmin')
        .setDescription('Removes admin from server')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User to remove from admin')
            .setRequired(true)),
    async execute (interaction) {
        const user = interaction.options?.get('user')?.user;
        const admins = await getAdmins(interaction.guildId);

        if (!admins.find((adminId) => adminId === user.id)) return await interaction.reply({
            content: `⚠️ <@${user.id}> is not an admin.`,
            ephemeral: true
        });

        const removedAdmin = await removeAdmin(interaction.guildId, user.id);

        if (removedAdmin) await interaction.reply(`✅ Removed <@${user.id}> from admin in **${interaction.guild.name}**, now has ${admins.length - 1} admins.`)
        else await interaction.reply({
            content: `❌ Failed to remove <@${user.id}> from admin in **${interaction.guild.name}**.`,
            ephemeral: true
        });
    }
};