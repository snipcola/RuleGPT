const { SlashCommandBuilder } = require('discord.js');
const { getAdmins, addAdmin } = require('../lib/serverConfigs.js');

module.exports = {
    cooldown: 5,
    owner: true,
    data: new SlashCommandBuilder()
        .setName('addadmin')
        .setDescription('Adds admin to server')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User to be admin')
            .setRequired(true)),
    async execute (interaction) {
        const user = interaction.options?.get('user')?.user;
        const admins = await getAdmins(interaction.guildId);

        if (admins.find((adminId) => adminId === user.id)) return await interaction.reply({
            content: `⚠️ <@${user.id}> is already an admin.`,
            ephemeral: true
        });

        const addedAdmin = await addAdmin(interaction.guildId, user.id);

        if (addedAdmin) await interaction.reply(`✅ Added <@${user.id}> as admin to **${interaction.guild.name}**, now has ${admins.length + 1} admins.`)
        else await interaction.reply({
            content: `❌ Failed to add <@${user.id}> as admin to **${interaction.guild.name}**.`,
            ephemeral: true
        });
    }
};